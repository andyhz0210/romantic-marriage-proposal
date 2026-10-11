export interface MediaAsset { bytes: Uint8Array; mime: string }

export function parseDataUrl(url: string): MediaAsset {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(url);
  if (!match) throw new Error('素材格式无效，请重新上传图片或音乐。');
  const binary = atob(match[2].replace(/\s/g, ''));
  return { mime: match[1].toLowerCase(), bytes: Uint8Array.from(binary, (char) => char.charCodeAt(0)) };
}

export function toDataUrl(asset: MediaAsset): string {
  let binary = '';
  for (let offset = 0; offset < asset.bytes.length; offset += 32768) {
    binary += String.fromCharCode(...asset.bytes.subarray(offset, offset + 32768));
  }
  return `data:${asset.mime};base64,${btoa(binary)}`;
}

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const audioTypes = new Set(['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/flac', 'audio/aac']);

export async function resolveMedia(url: string, kind: 'image' | 'audio', signal?: AbortSignal): Promise<MediaAsset> {
  signal?.throwIfAborted();
  let asset: MediaAsset;
  if (url.startsWith('data:')) {
    asset = parseDataUrl(url);
  } else {
    const parsed = new URL(url, typeof location === 'undefined' ? 'https://localhost/' : location.href);
    if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('请使用上传的素材或 HTTP(S) 链接。');
    const request = new AbortController();
    const abort = () => request.abort(signal?.reason);
    signal?.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(() => request.abort(new DOMException('素材下载超时', 'TimeoutError')), 45000);
    try {
      const response = await fetch(parsed.href, { signal: request.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const inferred = kind === 'audio' && /\.m4a$/i.test(parsed.pathname) ? 'audio/mp4'
        : kind === 'audio' && /\.mp3$/i.test(parsed.pathname) ? 'audio/mpeg'
        : kind === 'audio' && /\.wav$/i.test(parsed.pathname) ? 'audio/wav'
        : kind === 'image' && /\.jpe?g$/i.test(parsed.pathname) ? 'image/jpeg'
        : kind === 'image' && /\.png$/i.test(parsed.pathname) ? 'image/png' : '';
      const mime = blob.type.split(';')[0].toLowerCase();
      asset = { bytes: new Uint8Array(await blob.arrayBuffer()), mime: (mime === 'application/octet-stream' || !mime) ? inferred : mime };
    } catch (error) {
      signal?.throwIfAborted();
      throw new Error(`${kind === 'audio' ? '音乐' : '图片'}链接无法打包（网络、跨域或超时）。请下载后本地上传${kind === 'audio' ? '，或取消打包背景歌曲' : ''}。`, { cause: error });
    } finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); }
  }
  if (!(kind === 'image' ? imageTypes : audioTypes).has(asset.mime)) {
    throw new Error(`${kind === 'image' ? '图片' : '音乐'}格式不支持：${asset.mime || '未知'}。请重新上传常见格式。`);
  }
  if (!asset.bytes.length) throw new Error('素材为空，请重新上传。');
  if (asset.bytes.length > 40 * 1024 * 1024) throw new Error('单个素材超过 40 MB，请压缩后重新上传。');
  return asset;
}

export function extensionFor(mime: string): string {
  return ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif',
    'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/m4a': 'm4a', 'audio/aac': 'aac',
    'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/ogg': 'ogg', 'audio/webm': 'webm', 'audio/flac': 'flac', 'font/woff2': 'woff2', 'font/woff': 'woff' } as Record<string, string>)[mime] || 'bin';
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('文件读取失败，请重新选择。'));
    reader.readAsDataURL(file);
  });
}

export async function preparePhoto(file: File): Promise<{ url: string; ratio: number }> {
  if (file.size > 20 * 1024 * 1024) throw new Error('图片超过 20 MB，请先缩小后上传。');
  const url = await readFileAsDataUrl(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  const ratio = Number((img.naturalWidth / img.naturalHeight).toFixed(3));
  // Retain animated GIFs. Other images are resized to a useful display resolution.
  if (file.type === 'image/gif') return { url, ratio };
  const scale = Math.min(1, 1920 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const compressed = canvas.toDataURL('image/webp', 0.88);
  return { url: compressed.length < url.length ? compressed : url, ratio };
}
