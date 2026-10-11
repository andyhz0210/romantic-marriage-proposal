import { strToU8, zip } from 'fflate';
import type { ProposalConfig } from '../types';
import { extensionFor, parseDataUrl, resolveMedia, toDataUrl } from './media';

export type ExportFormat = 'html' | 'zip';
export interface OfflineRuntime { js: string; css: string; notices?: string }
export interface ExportOptions { includeMusic?: boolean; signal?: AbortSignal; onProgress?: (message: string) => void }

export function validateConfig(config: ProposalConfig): void {
  if (!config.groomName.trim() || !config.brideName.trim()) throw new Error('请先填写双方姓名。');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(config.anniversaryDate) || !Number.isFinite(new Date(config.anniversaryDate).getTime())) throw new Error('请填写有效的相恋纪念日。');
  const anniversary = new Date(config.anniversaryDate);
  if (anniversary.getDate() !== Number(config.anniversaryDate.slice(8, 10)) || anniversary.getMonth() + 1 !== Number(config.anniversaryDate.slice(5, 7))) throw new Error('请填写有效的相恋纪念日。');
  const date = new Date(`${config.proposalDate}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(config.proposalDate) || !Number.isFinite(date.getTime()) || date.getDate() !== Number(config.proposalDate.slice(-2))) throw new Error('请填写有效的求婚日期。');
  if (!Array.isArray(config.milestones) || !Array.isArray(config.vows)) throw new Error('回忆或誓言配置无效。');
}

export function serializeConfig(config: ProposalConfig): string {
  // HTML parsers recognize closing script tags even inside application/json blocks.
  return JSON.stringify(config).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function documentHtml(config: ProposalConfig, styles: string, script: string): string {
  return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(`${config.groomName} & ${config.brideName} · 终身之约`)}</title>${styles}</head><body><div id="root"></div><noscript>请使用支持 JavaScript 的浏览器打开这份求婚网页。</noscript><script type="application/json" id="proposal-config">${serializeConfig(config)}</script>${script}</body></html>`;
}

function archive(files: Record<string, Uint8Array>, signal?: AbortSignal): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const cancel = zip(files, { level: 6 }, (error, data) => {
      signal?.removeEventListener('abort', abort);
      if (error) reject(error); else resolve(data);
    });
    function abort() { cancel(); reject(signal?.reason ?? new DOMException('已取消', 'AbortError')); }
    signal?.addEventListener('abort', abort, { once: true });
  });
}

export async function createOfflineExport(config: ProposalConfig, format: ExportFormat, runtime: OfflineRuntime, options: ExportOptions = {}): Promise<{ blob: Blob; filename: string }> {
  validateConfig(config);
  options.signal?.throwIfAborted();
  if (!runtime.js || !runtime.css) throw new Error('离线展示模板未生成，请重新构建制作工具。');
  const output: ProposalConfig = structuredClone(config);
  const files: Record<string, Uint8Array> = {};
  const resolved = new Map<string, string>();
  let index = 0;
  const addMedia = async (url: string, kind: 'image' | 'audio', label: string) => {
    if (resolved.has(url)) return resolved.get(url)!;
    options.onProgress?.(`正在打包${label}…`);
    const asset = await resolveMedia(url, kind, options.signal);
    options.signal?.throwIfAborted();
    const name = `assets/${kind === 'image' ? 'photos' : 'music'}/${++index}.${extensionFor(asset.mime)}`;
    const value = format === 'html' ? toDataUrl(asset) : name;
    if (format === 'zip') files[name] = asset.bytes;
    resolved.set(url, value);
    return value;
  };
  for (const milestone of output.milestones) {
    if (milestone.artType === 'custom' && !milestone.customImageUrl) throw new Error(`回忆「${milestone.title}」缺少照片，请重新上传。`);
    if (milestone.customImageUrl) milestone.customImageUrl = await addMedia(milestone.customImageUrl, 'image', `照片「${milestone.title}」`);
  }
  if (options.includeMusic !== false && output.musicUrl) {
    output.musicUrl = await addMedia(output.musicUrl, 'audio', '背景歌曲');
  } else {
    output.musicUrl = '';
    output.musicTitle = '轻柔音乐盒';
  }
  options.signal?.throwIfAborted();
  const basename = `${config.groomName}&${config.brideName}-求婚网页`.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 100);
  options.onProgress?.('正在生成离线文件…');
  if (format === 'html') {
    const html = `<!-- Bundled font licenses\n${(runtime.notices || '').replace(/-->/g, '-- >')}\n-->\n` + documentHtml(output, `<style>${runtime.css.replace(/<\/style/gi, '<\\/style')}</style>`, `<script>${runtime.js.replace(/<\/script/gi, '<\\/script')}</script>`);
    return { blob: new Blob([html], { type: 'text/html;charset=utf-8' }), filename: `${basename}.html` };
  }
  let fontIndex = 0;
  const css = runtime.css.replace(/url\(["']?(data:[^"')]+)["']?\)/g, (match, url: string) => {
    const asset = parseDataUrl(url);
    const name = `fonts/${++fontIndex}.${extensionFor(asset.mime)}`;
    files[`assets/${name}`] = asset.bytes;
    return `url("${name}")`;
  });
  files['index.html'] = strToU8(documentHtml(output, '<link rel="stylesheet" href="assets/style.css">', '<script src="assets/app.js"></script>'));
  files['assets/app.js'] = strToU8(runtime.js);
  files['assets/style.css'] = strToU8(css);
  if (runtime.notices) files['assets/fonts/LICENSE.txt'] = strToU8(runtime.notices);
  files['使用说明.txt'] = strToU8('请先完整解压本文件夹，再用现代浏览器打开 index.html。\n不需要安装 Node.js，不需要联网。请保留 assets 文件夹和 index.html 的相对位置。\n音乐需要点击页面或播放按钮后才能开始。手机聊天软件的附件预览可能不支持交互，请在浏览器中打开。\n本成品包不包含编辑器或开发源码；修改内容请回到制作工具重新导出。\n');
  options.onProgress?.('正在压缩成品包…');
  const bytes = await archive(files, options.signal);
  options.signal?.throwIfAborted();
  return { blob: new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), filename: `${basename}.zip` };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
