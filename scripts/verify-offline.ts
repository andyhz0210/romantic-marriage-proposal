import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { preview } from 'vite';
import { unzipSync } from 'fflate';
import { DEFAULT_CONFIG } from '../src/types';
import { createOfflineExport, type OfflineRuntime } from '../src/export/package';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'artifacts/verification');
await mkdir(directory, { recursive: true });
const runtime = JSON.parse(await readFile(path.join(root, 'src/generated/offline-runtime.json'), 'utf8')) as OfflineRuntime;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ioAAAAASUVORK5CYII=', 'base64');
// Valid PCM WAV fixture, so audio checks test actual decoding and playback.
const wav = Buffer.alloc(44 + 16000);
wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28);
wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(16000, 40);
for (let sample = 0; sample < 8000; sample++) wav.writeInt16LE(Math.round(Math.sin(sample * 2 * Math.PI * 440 / 8000) * 1000), 44 + sample * 2);
const config = { ...structuredClone(DEFAULT_CONFIG), groomName: '安迪', brideName: '小月', proposalDate: '2026-11-20',
  letterBody: '这是离线验证的专属情书。\n</script><script>window.pwned=true</script>',
  musicUrl: `data:audio/wav;base64,${wav.toString('base64')}`, musicTitle: '离线测试音乐',
  milestones: [{ ...DEFAULT_CONFIG.milestones[0], customImageUrl: `data:image/png;base64,${png.toString('base64')}`, artType: 'custom' as const }] };

const generated: Record<string, number> = {};
for (const format of ['html', 'zip'] as const) {
  const output = await createOfflineExport(config, format, runtime);
  generated[format] = output.blob.size;
  const bytes = new Uint8Array(await output.blob.arrayBuffer());
  await writeFile(path.join(directory, `proposal.${format}`), bytes);
  if (format === 'zip') {
    for (const [name, data] of Object.entries(unzipSync(bytes))) {
      const destination = path.join(directory, 'unpacked', name);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, data);
    }
  }
}
const executablePath = process.env.PROPOSAL_BROWSER_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await chromium.launch({ executablePath, headless: true });
const summaries: unknown[] = [];

async function verifyViewer(filename: string, label: string, mobile = false) {
  const context = await browser.newContext({ offline: true, viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 } });
  await context.addInitScript(() => {
    const NativeAudio = window.Audio;
    window.Audio = function (...args: ConstructorParameters<typeof Audio>) {
      const audio = new NativeAudio(...args);
      if (!args.length) (window as unknown as { proposalAudio?: HTMLAudioElement }).proposalAudio = audio;
      return audio;
    } as unknown as typeof Audio;
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const remote: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => { if (/^https?:/.test(request.url())) remote.push(request.url()); });
  page.on('pageerror', (error) => { errors.push(error.message); console.error(`${label} page error: ${error.message}`); });
  await page.goto(pathToFileURL(filename).href);
  await expect(page.locator('#hero')).toContainText('安迪');
  await expect(page.locator('#hero')).toContainText('小月');
  await expect(page.getByTitle('定制名字、纪念日与情书')).toHaveCount(0);
  await expect(page.getByTitle('导出离线求婚网页')).toHaveCount(0);
  await expect(page.getByText('添加回忆照片', { exact: true })).toHaveCount(0);
  await expect(page.getByText('新增一项承诺', { exact: true })).toHaveCount(0);
  await expect(page.getByTitle('修改信息与照片')).toHaveCount(0);
  await page.evaluate(async () => { await document.fonts.ready; });
  const fontsLoaded = await page.evaluate(() => document.fonts.check('16px "Noto Serif SC Variable"', '安迪小月'));
  expect(fontsLoaded).toBe(true);
  const photo = page.locator('#journey img').first();
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: path.join(directory, `${label}-hero.png`) });

  await page.getByText('点击开启信笺', { exact: true }).click();
  await expect.poll(() => page.evaluate(() => {
    const audio = (window as unknown as { proposalAudio?: HTMLAudioElement }).proposalAudio;
    return Boolean(audio && !audio.paused && audio.currentTime > 0);
  })).toBe(true);
  await expect(page.locator('#letter')).toContainText(config.letterBody);
  expect(await page.evaluate(() => (window as unknown as { pwned?: boolean }).pwned)).toBeUndefined();
  await page.getByText('重新折起', { exact: true }).click();
  await page.getByRole('button', { name: '拍立得散落', exact: true }).click();
  await expect(page.locator('#journey')).toContainText('桌面上散落的拍立得相片');
  await page.getByTitle('查看大图', { exact: true }).first().click();
  await expect(page.getByText('编辑这段回忆', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.locator('#vows').getByText(config.vows[0].title, { exact: true }).click();
  await expect(page.locator('#vows')).toContainText('已见证此项誓言');

  const audio = await page.evaluate(() => {
    const source = (JSON.parse(document.getElementById('proposal-config')!.textContent!) as { musicUrl: string }).musicUrl;
    return new Promise<{ width: number; duration: number }>((resolve, reject) => {
      const audio = new Audio(source);
      audio.onloadedmetadata = () => resolve({ width: source.length, duration: audio.duration });
      audio.onerror = () => reject(new Error('Offline audio decode failed'));
    });
  });
  expect(audio.duration).toBeGreaterThan(0);
  await page.getByText('轻触开启这份心意', { exact: true }).click();
  await expect(page.getByRole('button', { name: '我愿意！💍', exact: true })).toBeVisible();
  const reconsider = page.locator('[data-proposal-no]');
  await expect(reconsider).toBeVisible();
  const start = (await reconsider.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await expect.poll(() => reconsider.evaluate((element) => element.getAnimations().every((animation) => animation.playState !== 'running'))).toBe(true);
  const landing = (await reconsider.boundingBox())!;
  const yes = (await page.locator('[data-proposal-yes]').boundingBox())!;
  expect(landing.x + landing.width <= yes.x || landing.x >= yes.x + yes.width || landing.y + landing.height <= yes.y || landing.y >= yes.y + yes.height).toBe(true);
  await page.getByRole('button', { name: '我愿意！💍', exact: true }).click();
  await expect(page.getByRole('heading', { name: '终身之约 · 求婚誓约证书' })).toBeVisible();
  const certificate = page.getByAltText('求婚誓约书', { exact: true });
  await expect(certificate).toBeVisible({ timeout: 15000 });
  await certificate.screenshot({ path: path.join(directory, `${label}-certificate.png`) });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '保存高清证书图片', exact: true }).click();
  const certificateDownload = await download;
  expect(certificateDownload.suggestedFilename()).toContain('安迪&小月');
  await page.getByRole('button', { name: '复制官宣文案', exact: true }).click();
  await expect(page.getByText('已复制誓言文本', { exact: true }).or(page.getByRole('alert'))).toBeVisible();
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.getByRole('button', { name: '合上戒盒重温', exact: true }).click();
  await expect(page.getByText('轻触开启这份心意', { exact: true })).toBeVisible();
  expect(remote).toEqual([]);
  expect(errors).toEqual([]);
  summaries.push({ label, fontsLoaded, remoteRequests: remote.length, scriptErrors: errors.length, audioDuration: audio.duration, interactions: 'letter, photos, vows, ring, acceptance, certificate download, copy, reset' });
  await context.close();
  console.log(`PASS ${label}: offline file and interactions`);
}

let server: Awaited<ReturnType<typeof preview>> | undefined;
try {
  await verifyViewer(path.join(directory, 'proposal.html'), 'single-html');
  await verifyViewer(path.join(directory, 'unpacked/index.html'), 'zip-site');
  await verifyViewer(path.join(directory, 'proposal.html'), 'single-html-mobile', true);

  server = await preview({ preview: { host: '127.0.0.1', port: 4178, strictPort: true }, logLevel: 'silent' });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  const editorErrors: string[] = [];
  page.on('pageerror', (error) => editorErrors.push(error.message));
  await page.route('**/*', (route) => /^https?:/.test(route.request().url()) && !route.request().url().startsWith('http://127.0.0.1:4178') ? route.abort() : route.continue());
  await page.addInitScript((legacy) => {
    if (!sessionStorage.getItem('migration-seeded')) {
      localStorage.setItem('romantic_proposal_config_v1', JSON.stringify(legacy));
      sessionStorage.setItem('migration-seeded', 'true');
    }
  }, config);
  await page.goto('http://127.0.0.1:4178');
  await expect(page.locator('#hero')).toContainText('安迪');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('romantic_proposal_config_v1'))).toBeNull();
  await page.getByTitle('定制名字、纪念日与情书').click();
  await page.locator('form input[type="text"]').nth(0).fill('测试甲');
  await page.locator('form input[type="text"]').nth(1).fill('测试乙');
  await page.getByLabel('求婚日期', { exact: true }).fill('2026-12-01');
  await page.getByLabel('上传本地音乐', { exact: true }).setInputFiles({ name: '专属音乐.wav', mimeType: 'audio/wav', buffer: wav });
  await expect(page.getByText('已载入本地音乐：专属音乐')).toBeVisible();
  await page.getByRole('button', { name: '保存定制', exact: true }).click();
  await expect(page.locator('#hero')).toContainText('测试甲');
  await page.getByRole('button', { name: '拍立得散落', exact: true }).click();
  await page.reload();
  await expect(page.locator('#hero')).toContainText('测试甲');
  await expect(page.getByRole('button', { name: '拍立得散落', exact: true })).toHaveAttribute('class', /from-rose-600/);

  await page.getByTitle('导出离线求婚网页').click();
  await expect(page.getByRole('dialog').locator('..')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: path.join(directory, 'editor-export-dialog.png') });
  for (const format of ['html', 'zip'] as const) {
    if (format === 'zip') await page.getByRole('button', { name: /离线项目包 ZIP/ }).click();
    const event = page.waitForEvent('download', { timeout: 60000 });
    await page.getByRole('button', { name: '生成并下载', exact: true }).click();
    const download = await event;
    expect(download.suggestedFilename()).toBe(`测试甲&测试乙-求婚网页.${format}`);
    await download.saveAs(path.join(directory, `editor-export.${format}`));
    await expect(page.getByText(/已生成并开始下载/)).toBeVisible();
    if (format === 'html') {
      const html = await readFile(path.join(directory, 'editor-export.html'), 'utf8');
      expect(html).toContain('"photoWallMode":"polaroid"');
      expect(html).toContain('"proposalDate":"2026-12-01"');
      expect(html).toContain('data:audio/wav;base64,');
    }
  }
  // A remote failure is explicit and the user can recover with the music opt-out.
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.getByTitle('定制名字、纪念日与情书').click();
  await page.locator('form input[type="url"]').fill('https://example.invalid/song.mp3');
  await page.getByRole('button', { name: '保存定制', exact: true }).click();
  await page.getByTitle('导出离线求婚网页').click();
  await page.getByRole('button', { name: '生成并下载', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('音乐链接无法打包');
  await page.getByRole('checkbox').uncheck();
  const recovery = page.waitForEvent('download', { timeout: 60000 });
  await page.getByRole('button', { name: '生成并下载', exact: true }).click();
  await recovery;
  expect(editorErrors).toEqual([]);
  summaries.push({ label: 'editor', legacyDraftMigration: true, draftReload: true, savedPhotoWallPreference: true, htmlDownload: true, zipDownload: true, remoteFailureRecovery: true, scriptErrors: 0 });
  await context.close();
  console.log('PASS editor: local music, persistent draft, both downloads, failed-media recovery');
} finally {
  await browser.close();
  if (server) await new Promise<void>((resolve) => server!.httpServer.close(() => resolve()));
}
await writeFile(path.join(directory, 'results.json'), JSON.stringify({ browser: executablePath, generatedBytes: generated, checks: summaries }, null, 2));
console.log(JSON.stringify({ generatedBytes: generated, checks: summaries }, null, 2));
