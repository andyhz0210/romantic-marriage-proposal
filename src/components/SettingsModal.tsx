import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ProposalConfig, DEFAULT_CONFIG } from '../types';
import { X, Save, RotateCcw } from 'lucide-react';
import { readFileAsDataUrl } from '../export/media';

interface SettingsModalProps {
  config: ProposalConfig;
  onSave: (newConfig: ProposalConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<ProposalConfig>({ ...config });
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleMusicUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError('');
    if (file.size > 30 * 1024 * 1024) { setUploadError('音乐超过 30 MB，请压缩后上传。'); return; }
    setUploading(true);
    try {
      let data = await readFileAsDataUrl(file);
      if (data.startsWith('data:application/octet-stream') || data.startsWith('data:;')) {
        const mime = /\.m4a$/i.test(file.name) ? 'audio/mp4' : /\.mp3$/i.test(file.name) ? 'audio/mpeg' : /\.wav$/i.test(file.name) ? 'audio/wav' : '';
        if (!mime) throw new Error('请选择 MP3、M4A 或 WAV 音乐。');
        data = data.replace(/^data:[^;]*/, `data:${mime}`);
      }
      if (!data.startsWith('data:audio/')) throw new Error('请选择有效的音频文件。');
      setForm((previous) => ({ ...previous, musicUrl: data, musicTitle: file.name.replace(/\.[^.]+$/, '') }));
    } catch (error) { setUploadError(error instanceof Error ? error.message : '音乐读取失败。'); }
    finally { setUploading(false); event.target.value = ''; }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleChange = (field: keyof ProposalConfig, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_CONFIG });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    onSave(form);
    onClose();
  };

  return (
    <motion.div
      key="settings-backdrop"
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'radial-gradient(circle at center, rgba(225, 29, 72, 0.12) 0%, rgba(12, 6, 14, 0.70) 100%)',
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 cursor-pointer overflow-y-auto"
    >
      <motion.div
        key="settings-panel"
        initial={{ opacity: 0, scale: 0.88, y: 32, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.88, y: 24, filter: 'blur(8px)' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] bg-stone-900 border border-rose-900/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default backdrop-blur-xl"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-chinese-serif text-base sm:text-lg font-bold text-white">
              定制我们的专属求婚故事
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-400">
              设置双方名字、相遇日期与专属情书，内容会自动保存在本设备中。
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-left text-xs">
          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-stone-300 font-medium mb-1.5">
                男方姓名 / 昵称
              </label>
              <input
                type="text"
                value={form.groomName}
                onChange={(e) => handleChange('groomName', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-medium mb-1.5">
                女方姓名 / 昵称
              </label>
              <input
                type="text"
                value={form.brideName}
                onChange={(e) => handleChange('brideName', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500 text-sm"
              />
            </div>
          </div>

          {/* Anniversary Date */}
          <div>
            <label className="block text-stone-300 font-medium mb-1.5">
              相遇 / 相恋纪念日（用于主页实时天数计时器）
            </label>
            <input
              type="datetime-local"
              value={form.anniversaryDate.slice(0, 16)}
              onChange={(e) => handleChange('anniversaryDate', e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-stone-300 font-medium mb-1.5">求婚日期（用于纪念证书）</label>
            <input aria-label="求婚日期" type="date" value={form.proposalDate} onChange={(event) => handleChange('proposalDate', event.target.value)} required className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 font-mono" />
          </div>
          <div>
            <label className="block text-stone-300 font-medium mb-1.5">
              主页爱情物语 / 标语
            </label>
            <input
              type="text"
              value={form.heroSubtitle}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Ring Box Message */}
          <div>
            <label className="block text-stone-300 font-medium mb-1.5">
              戒盒寄语
            </label>
            <input
              type="text"
              value={form.ringMessage}
              onChange={(e) => handleChange('ringMessage', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Background Music URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 font-medium mb-1.5">
                背景音乐歌曲名称
              </label>
              <input
                type="text"
                value={form.musicTitle || ''}
                onChange={(e) => handleChange('musicTitle', e.target.value)}
                placeholder="Shane Filan - Beautiful in White"
                className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-medium mb-1.5">
                背景音乐音频地址 (URL)
              </label>
              <input
                type="url"
                value={form.musicUrl?.startsWith('data:') ? '' : form.musicUrl || ''}
                onChange={(e) => handleChange('musicUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Love Letter Title & Content */}
          <div className="space-y-2 rounded-xl bg-stone-950/50 p-3">
            <label className="block text-stone-300 font-medium">上传本地音乐（离线导出推荐，最大 30 MB）</label>
            <input aria-label="上传本地音乐" type="file" accept="audio/*,.mp3,.m4a,.wav" onChange={handleMusicUpload} disabled={uploading} className="w-full text-xs text-stone-400 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-950 file:p-2 file:text-rose-200" />
            {uploading && <p role="status" className="text-rose-300">正在读取音乐…</p>}
            {form.musicUrl?.startsWith('data:') && <p className="text-emerald-300">已载入本地音乐：{form.musicTitle}</p>}
            <button type="button" onClick={() => setForm((previous) => ({ ...previous, musicUrl: '', musicTitle: '轻柔音乐盒' }))} className="text-rose-300 underline cursor-pointer">改用内置音乐盒</button>
            {uploadError && <p role="alert" className="text-red-300">{uploadError}</p>}
          </div>
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div>
              <label className="block text-stone-300 font-medium mb-1.5">
                情书标题
              </label>
              <input
                type="text"
                value={form.letterTitle}
                onChange={(e) => handleChange('letterTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-medium mb-1.5">
                手写情书全文
              </label>
              <textarea
                rows={6}
                value={form.letterBody}
                onChange={(e) => handleChange('letterBody', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢复默认文案</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存定制</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
