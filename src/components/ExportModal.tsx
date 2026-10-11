import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileCode2, FolderArchive, X, Check, LoaderCircle } from 'lucide-react';
import type { ProposalConfig } from '../types';
import { createOfflineExport, downloadBlob, type ExportFormat, type OfflineRuntime } from '../export/package';
import runtimeUrl from '../generated/offline-runtime.json?url';

export function ExportModal({ config, onClose }: { config: ProposalConfig; onClose: () => void }) {
  const [format, setFormat] = useState<ExportFormat>('html');
  const [includeMusic, setIncludeMusic] = useState(Boolean(config.musicUrl));
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const close = () => { controller.current?.abort(); onClose(); };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { controller.current?.abort(); onClose(); } };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); controller.current?.abort(); };
  }, [onClose]);

  const handleExport = async () => {
    const operation = new AbortController();
    controller.current = operation;
    setBusy(true); setError(''); setResult(null);
    setProgress('正在准备离线展示模板…');
    try {
      const response = await fetch(runtimeUrl, { signal: operation.signal });
      if (!response.ok) throw new Error('无法加载离线模板，请刷新制作工具后重试。');
      const runtime = await response.json() as OfflineRuntime;
      const file = await createOfflineExport(config, format, runtime, { includeMusic, signal: operation.signal, onProgress: setProgress });
      operation.signal.throwIfAborted();
      setResult(file);
      downloadBlob(file.blob, file.filename);
    } catch (failure) {
      if (!operation.signal.aborted) setError(failure instanceof Error ? failure.message : '导出失败，请重试。');
    } finally { if (!operation.signal.aborted) setBusy(false); }
  };

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6">
    <motion.div role="dialog" aria-modal="true" aria-labelledby="export-title" initial={{ y: 20, scale: 0.96 }} animate={{ y: 0, scale: 1 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-rose-900/50 bg-stone-900 p-5 sm:p-7 shadow-2xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div><h2 id="export-title" className="text-xl text-white font-chinese-serif font-bold">带走你们的终身之约</h2><p className="mt-2 text-xs text-stone-400 leading-relaxed">当前已保存的内容将生成独立成品。无需 Node.js，无需联网，保留观看交互。</p></div>
        <button onClick={close} aria-label="关闭导出" className="p-2 text-stone-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {([{ value: 'html', title: '单文件 HTML', description: '内容、照片、音乐与字体装进一个文件，方便保存与传递。', Icon: FileCode2 },
          { value: 'zip', title: '离线项目包 ZIP', description: '资源分开存放，完整解压后打开 index.html。适合较多素材。', Icon: FolderArchive }] as const).map(({ value, title, description, Icon }) => <button key={value} disabled={busy} aria-pressed={format === value} onClick={() => { setFormat(value); setResult(null); setError(''); }} className={`text-left rounded-xl border p-4 cursor-pointer transition-colors ${format === value ? 'border-rose-500 bg-rose-950/40' : 'border-stone-700 bg-stone-950/40 hover:border-rose-800'}`}>
          <Icon className="w-6 h-6 text-rose-300 mb-3" /><div className="text-sm text-white font-semibold">{title}</div><p className="text-xs text-stone-400 mt-2 leading-relaxed">{description}</p>
        </button>)}
      </div>
      <label className="flex items-start gap-3 mt-5 text-sm text-stone-200 cursor-pointer"><input type="checkbox" checked={includeMusic} disabled={busy || !config.musicUrl} onChange={(event) => { setIncludeMusic(event.target.checked); setResult(null); setError(''); }} className="mt-1 accent-rose-500" /><span>打包背景歌曲<span className="block text-xs text-stone-400 mt-1">外部链接需先下载成功；不勾选时使用内置音乐盒，保留戒盒和庆祝音效。</span></span></label>
      <div className="mt-5 rounded-xl bg-stone-950/60 p-3 text-xs text-stone-400 leading-relaxed space-y-1">
        <p>四种原有字体也会随成品携带。基础 HTML 约 9 MB，ZIP 约 6 MB，照片和歌曲另计。</p>
        <p>音乐需点击后播放。手机聊天软件的附件预览可能无法运行交互，请使用浏览器打开。</p>
        <p>ZIP 是可直接观看的成品包，含使用说明，不包含开发源码。</p>
      </div>
      {busy && <p role="status" aria-live="polite" className="mt-4 flex items-center gap-2 text-sm text-rose-200"><LoaderCircle className="w-4 h-4 animate-spin" />{progress}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}
      {result && <div role="status" className="mt-4 text-sm text-emerald-300"><p className="flex items-center gap-2"><Check className="w-4 h-4" />已生成并开始下载 · {(result.blob.size / 1024 / 1024).toFixed(1)} MB</p><button onClick={() => downloadBlob(result.blob, result.filename)} className="mt-2 underline cursor-pointer">重新下载 {result.filename}</button></div>}
      <div className="mt-6 flex justify-end gap-3"><button onClick={close} className="rounded-xl bg-stone-800 px-4 py-2.5 text-sm text-stone-300 cursor-pointer">{busy ? '取消导出' : '关闭'}</button><button onClick={handleExport} disabled={busy} className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-5 py-2.5 text-sm text-white font-medium cursor-pointer"><Download className="w-4 h-4" />{busy ? '正在导出…' : '生成并下载'}</button></div>
    </motion.div>
  </motion.div>;
}
