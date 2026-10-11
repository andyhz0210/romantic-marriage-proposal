import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { unzipSync, strFromU8 } from 'fflate';
import { DEFAULT_CONFIG } from '../src/types';
import { createOfflineExport, serializeConfig, validateConfig } from '../src/export/package';
import { parseDataUrl, resolveMedia, toDataUrl } from '../src/export/media';

const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ioAAAAASUVORK5CYII=';
const audio = 'data:audio/wav;base64,UklGRgAAAABXQVZF';
const runtime = { js: 'window.viewerStarted=true;', css: 'body{color:pink}@font-face{font-family:test;src:url("data:font/woff2;base64,YWJj")}', notices: 'Test font license' };
const config = () => ({ ...structuredClone(DEFAULT_CONFIG), groomName: '小明', brideName: '小雨', musicUrl: audio, milestones: [{ ...DEFAULT_CONFIG.milestones[0], artType: 'custom' as const, customImageUrl: image }] });

test('HTML safely embeds personalized text and all media with no external entry files', async () => {
  const input = config();
  input.letterBody = '</script><script>window.pwned=true</script>\n<&"♥';
  input.groomName = '<名字>&';
  const original = structuredClone(input);
  const output = await createOfflineExport(input, 'html', runtime);
  const html = await output.blob.text();
  assert.ok(html.includes('data:image/png;base64,'));
  assert.ok(html.includes('data:audio/wav;base64,'));
  assert.ok(html.includes('data:font/woff2;base64,'));
  assert.ok(html.includes('&lt;名字&gt;&amp;'));
  assert.ok(!html.includes('<script>window.pwned'));
  assert.ok(!/<script[^>]+src=|<link[^>]+href=/.test(html));
  const json = /id="proposal-config">([\s\S]*?)<\/script>/.exec(html)![1];
  assert.deepEqual(JSON.parse(json), input);
  assert.deepEqual(input, original);
  assert.equal(output.blob.type, 'text/html;charset=utf-8');
  assert.ok(output.filename.endsWith('.html'));
});

test('ZIP contains relative site resources, independent media and font licenses', async () => {
  const output = await createOfflineExport(config(), 'zip', runtime);
  const files = unzipSync(new Uint8Array(await output.blob.arrayBuffer()));
  for (const name of ['index.html', 'assets/app.js', 'assets/style.css', '使用说明.txt', 'assets/fonts/LICENSE.txt']) assert.ok(files[name], name);
  assert.ok(files['assets/photos/1.png']);
  assert.ok(files['assets/music/2.wav']);
  assert.equal(strFromU8(files['assets/fonts/1.woff2']), 'abc');
  assert.ok(strFromU8(files['assets/style.css']).includes('url("fonts/1.woff2")'));
  const html = strFromU8(files['index.html']);
  assert.ok(html.includes('src="assets/app.js"'));
  assert.ok(html.includes('href="assets/style.css"'));
  assert.ok(html.includes('assets/photos/1.png'));
  assert.ok(!html.includes('data:image/'));
  assert.ok(!html.includes('data:audio/'));
  assert.ok(!html.includes('https://'));
});

test('explicit music opt-out uses the internal music box and avoids remote fetches', async () => {
  const input = config();
  input.musicUrl = 'https://example.invalid/song.mp3';
  const output = await createOfflineExport(input, 'html', runtime, { includeMusic: false });
  const html = await output.blob.text();
  assert.ok(html.includes('"musicUrl":""'));
  assert.ok(html.includes('轻柔音乐盒'));
  assert.ok(!html.includes('example.invalid'));
});

test('reused photos share one ZIP asset', async () => {
  const input = config();
  input.milestones.push({ ...input.milestones[0], id: 'second' });
  const output = await createOfflineExport(input, 'zip', runtime);
  const files = unzipSync(new Uint8Array(await output.blob.arrayBuffer()));
  assert.equal(Object.keys(files).filter((name) => name.startsWith('assets/photos/')).length, 1);
});

test('rejects empty names, invalid dates, missing custom photos and unsupported MIME types', async () => {
  assert.throws(() => validateConfig({ ...config(), brideName: '  ' }), /双方姓名/);
  assert.throws(() => validateConfig({ ...config(), proposalDate: '2026-02-30' }), /求婚日期/);
  assert.throws(() => validateConfig({ ...config(), anniversaryDate: 'bad' }), /纪念日/);
  assert.throws(() => validateConfig({ ...config(), anniversaryDate: '2026-02-30T12:00' }), /纪念日/);
  const input = config();
  input.milestones[0].customImageUrl = '';
  await assert.rejects(() => createOfflineExport(input, 'html', runtime), /缺少照片/);
  await assert.rejects(() => resolveMedia('data:text/html;base64,PHNjcmlwdD4=', 'image'), /格式不支持/);
  await assert.rejects(() => resolveMedia('javascript:alert(1)', 'image'), /HTTP/);
  assert.throws(() => parseDataUrl('data:image/png;base64,!bad!'), /素材格式/);
});

test('serializes closing-script, Unicode and line separators without changing data', () => {
  const input = { ...config(), letterBody: '</SCRIPT>中文\u2028\u2029 & "' };
  const json = serializeConfig(input);
  assert.ok(!json.includes('<'));
  assert.deepEqual(JSON.parse(json), input);
});

test('round trips large binary data without stack overflow', () => {
  const asset = { mime: 'audio/wav', bytes: Uint8Array.from({ length: 100000 }, (_, i) => i % 256) };
  assert.deepEqual(parseDataUrl(toDataUrl(asset)), asset);
});

test('remote media failures stop export instead of silently dropping assets', async () => {
  const server = createServer((_request, response) => { response.writeHead(404); response.end(); });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address() as { port: number };
    const input = { ...config(), musicUrl: `http://127.0.0.1:${address.port}/missing.mp3` };
    await assert.rejects(() => createOfflineExport(input, 'html', runtime), /音乐链接无法打包/);
  } finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
});

test('successful remote media is embedded, with a progress report', async () => {
  const server = createServer((_request, response) => { response.writeHead(200, { 'Content-Type': 'audio/wav' }); response.end(Buffer.from('RIFF')); });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address() as { port: number };
    const messages: string[] = [];
    const output = await createOfflineExport({ ...config(), musicUrl: `http://127.0.0.1:${address.port}/song.wav` }, 'html', runtime, { onProgress: (message) => messages.push(message) });
    assert.ok((await output.blob.text()).includes('data:audio/wav;base64,UklGRg=='));
    assert.ok(messages.some((message) => message.includes('背景歌曲')));
  } finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
});

test('an aborted operation produces no file', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(() => createOfflineExport(config(), 'zip', runtime, { signal: controller.signal }), { name: 'AbortError' });
});

test('cancellation interrupts a media download that is already in progress', async () => {
  let started!: () => void;
  const requested = new Promise<void>((resolve) => { started = resolve; });
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'audio/wav' });
    response.write('RIFF');
    started();
    // Keep the body open until the caller cancels the operation.
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address() as { port: number };
    const controller = new AbortController();
    const pending = assert.rejects(() => createOfflineExport({ ...config(), musicUrl: `http://127.0.0.1:${address.port}/song.wav` }, 'html', runtime, { signal: controller.signal }), { name: 'AbortError' });
    await requested;
    controller.abort();
    await pending;
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
