import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { VowItem } from '../types';
import { motion } from 'motion/react';
import { Download, Copy, Check, Printer, X, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CertificateModalProps {
  groomName: string;
  brideName: string;
  proposalDate: string;
  vows?: VowItem[];
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  groomName,
  brideName,
  proposalDate,
  vows,
  onClose,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copyError, setCopyError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formattedDate = new Date(proposalDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pledgeText =
    '今日以天地日月为鉴，星河璀璨为凭。我愿执你之手，共担风雨，共享荣光。朝夕相对，岁岁相安，此诺一生，至死不渝。';

  // Generate crisp 2x Retina PNG certificate using HTML5 Canvas
  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
    await document.fonts.load('32px "Noto Serif SC Variable"', `${groomName}${brideName}终身之约求婚誓约书执子之手与子偕老`);
    await document.fonts.ready;
    if (cancelled) return;
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-resolution canvas dimensions (1200 x 1500 for crisp 300DPI feel)
    const w = 1200;
    const h = 1500;
    canvas.width = w;
    canvas.height = h;

    // Background - Warm antique ivory parchment
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#fdfbf7');
    bgGrad.addColorStop(0.5, '#fbf8f0');
    bgGrad.addColorStop(1, '#f5efdf');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle decorative textured border
    ctx.save();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(52, 52, w - 104, h - 104);

    // Corner decorative flourishes
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawCorner(52, 52, 0);
    drawCorner(w - 52, 52, Math.PI / 2);
    drawCorner(w - 52, h - 52, Math.PI);
    drawCorner(52, h - 52, -Math.PI / 2);
    ctx.restore();

    // Top Header Badge
    ctx.textAlign = 'center';
    ctx.fillStyle = '#92400e';
    ctx.font = '600 24px "Cinzel Variable", Georgia, serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('CERTIFICATE OF ETERNAL LOVE', w / 2, 140);

    // Main Certificate Title
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 56px "Noto Serif SC Variable", "Playfair Display Variable", Georgia, serif';
    ctx.fillText('终 身 之 约 · 求 婚 誓 约 书', w / 2, 220);

    // Decorative divider line
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 200, 260);
    ctx.lineTo(w / 2 + 200, 260);
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = '28px serif';
    ctx.fillText('♥', w / 2, 268);

    // Couple Section Box
    ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(140, 320, w - 280, 220, 20);
    ctx.fill();
    ctx.stroke();

    // Groom info
    ctx.fillStyle = '#78350f';
    ctx.font = '400 24px "Noto Serif SC Variable", serif';
    ctx.fillText('求 婚 人 (Groom)', 320, 385);
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 48px "Noto Serif SC Variable", serif';
    ctx.fillText(groomName, 320, 460);

    // Heart between
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 44px serif';
    ctx.fillText('♥', w / 2, 440);

    // Bride info
    ctx.fillStyle = '#78350f';
    ctx.font = '400 24px "Noto Serif SC Variable", serif';
    ctx.fillText('应 允 人 (Bride)', w - 320, 385);
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 48px "Noto Serif SC Variable", serif';
    ctx.fillText(brideName, w - 320, 460);

    // Section Intro
    ctx.fillStyle = '#44403c';
    ctx.font = 'italic 28px "Noto Serif SC Variable", serif';
    ctx.fillText('「执子之手，与子偕老；死生契阔，与子成说」', w / 2, 610);

    // Vows / Pledge prose text (wrapped lines)
    ctx.fillStyle = '#292524';
    ctx.font = '400 32px "Noto Serif SC Variable", serif';
    const lines = [
      '今日以天地日月为鉴，星河璀璨为凭。',
      '我愿执你之手，共担风雨，共享荣光。',
      '朝夕相对，岁岁相安，此诺一生，至死不渝。',
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, 700 + i * 58);
    });

    // 5 Promises mini-grid
    const vowsMini = (vows?.map((vow) => vow.title) || ['永远倾听与理解', '四季三餐的温热', '风雨兼程的守护', '守护纯真的笑容', '执手一生的忠诚']).slice(0, 6);
    ctx.fillStyle = '#78350f';
    ctx.font = '22px "Noto Serif SC Variable", serif';
    vowsMini.forEach((title, index) => {
      const rowCount = Math.min(3, vowsMini.length - Math.floor(index / 3) * 3);
      const x = w / 2 + (index % 3 - (rowCount - 1) / 2) * 310;
      ctx.fillText(`◈ ${title}`, x, 905 + Math.floor(index / 3) * 42, 285);
    });
    if (vows && vows.length > 6) ctx.fillText(`共 ${vows.length} 项真心承诺`, w / 2, 992);

    // Wax Seal Stamp (Deep Crimson with Gold text)
    const sealX = w / 2;
    const sealY = 1100;
    const sealRadius = 85;

    // Seal Outer Rosette Ring
    ctx.save();
    ctx.fillStyle = '#9f1239';
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealRadius - 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealRadius - 16, 0, Math.PI * 2);
    ctx.stroke();

    // Seal Chinese Calligraphy
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 30px "Noto Serif SC Variable", serif';
    ctx.fillText('白 首', sealX, sealY - 12);
    ctx.fillText('之 约', sealX, sealY + 28);
    ctx.restore();

    // Date & Serial code
    ctx.fillStyle = '#57534e';
    ctx.font = '24px "Noto Serif SC Variable", serif';
    ctx.fillText(`誓约缔结日期：${formattedDate}`, w / 2, 1260);

    const serial = `NO. FOREVER-${proposalDate.replace(/[^0-9]/g, '') || '20261010'}-5201314`;
    ctx.fillStyle = '#a8a29e';
    ctx.font = '18px monospace';
    ctx.fillText(serial, w / 2, 1310);

    // Convert to Image URL
    try {
      const data = canvas.toDataURL('image/png', 1.0);
      setImageUrl(data);
    } catch (err) {
      console.error('Failed to export canvas image:', err);
    } finally {
      setIsGenerating(false);
    }
    };
    void generate().catch(() => { if (!cancelled) setIsGenerating(false); });
    return () => { cancelled = true; };
  }, [groomName, brideName, proposalDate, formattedDate, vows]);

  // Handle Download Image Action
  const handleDownloadImage = () => {
    if (!imageUrl) return;

    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `${groomName}&${brideName}-求婚誓约证书.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      // If direct download triggered popup block, open in new tab or prompt
      window.open(imageUrl, '_blank');
    }
  };

  // Handle Copy Text Announcement
  const handleCopyText = async () => {
    const textToCopy = `💍【终身之约 · 求婚誓约书】\n\n求婚人：${groomName} ♥ 应允人：${brideName}\n日期：${formattedDate}\n\n誓言：\n"${pledgeText}"\n\n以爱之名，冠你指间；一生相伴，一世相随！❤️`;
    setCopyError('');
    try {
      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.cssText = 'position:fixed;opacity:0;left:0;top:0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        textarea.remove();
        if (!success) throw new Error('Copy unavailable');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { setCopyError('此浏览器不允许复制，可先保存证书图片。'); }
  };

  // Handle Print Action with safety catch
  const handlePrint = () => {
    if (!imageUrl) return;
    try {
      const frame = document.createElement('iframe');
      frame.style.cssText = 'position:fixed;width:0;height:0;border:0';
      document.body.appendChild(frame);
      const doc = frame.contentDocument!;
      doc.open();
      doc.write('<!doctype html><html><head><title>求婚誓约证书</title><style>@page{size:A4 portrait;margin:10mm}body{margin:0;text-align:center}img{max-width:100%;max-height:270mm}</style></head><body></body></html>');
      doc.close();
      const image = doc.createElement('img');
      image.onload = () => {
        try { frame.contentWindow!.focus(); frame.contentWindow!.print(); }
        catch { handleDownloadImage(); }
      };
      image.src = imageUrl;
      doc.body.appendChild(image);
      frame.contentWindow!.addEventListener('afterprint', () => frame.remove(), { once: true });
      setTimeout(() => frame.remove(), 60000);
    } catch {
      // In sandbox if print is blocked, fallback to image download
      handleDownloadImage();
    }
  };

  return createPortal(
    <motion.div
      key="cert-backdrop"
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClose}
      style={{
        background: 'radial-gradient(circle at center, rgba(225, 29, 72, 0.12) 0%, rgba(12, 6, 14, 0.70) 100%)',
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
    >
      <motion.div
        key="cert-panel"
        role="dialog"
        aria-modal="true"
        aria-label="求婚誓约证书"
        initial={{ opacity: 0, scale: 0.88, y: 32, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.88, y: 22, filter: 'blur(8px)' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-stone-900 border border-amber-600/30 rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto my-auto cursor-default backdrop-blur-xl"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-chinese-serif text-base sm:text-lg font-bold text-white">
                终身之约 · 求婚誓约证书
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-400">
                高清纪念卡片已为您实时渲染生成
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-stone-400 hover:text-white rounded-full bg-stone-800 hover:bg-stone-700 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Preview Card */}
        <div className="flex-1 py-3 sm:py-4 flex flex-col items-center">
          {isGenerating ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-serif">正在精心绘制高清证书卡片...</p>
            </div>
          ) : imageUrl ? (
            <div className="w-full max-w-md space-y-3 text-center">
              <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-700/40 bg-stone-950">
                <img
                  src={imageUrl}
                  alt="求婚誓约书"
                  className="w-full h-auto object-contain transition-transform duration-300"
                />
              </div>

              {/* Mobile saving tip */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-amber-200/80 font-medium bg-amber-950/40 border border-amber-800/30 py-1.5 px-3 rounded-full">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>手机端可长按图片直接存至相册，或点下方保存</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-400 py-10">证书生成中...</div>
          )}
        </div>

        {copyError && <p role="alert" className="text-xs text-amber-200 py-2">{copyError}</p>}
        {/* Action Controls Toolbar */}
        <div className="pt-3 sm:pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer transition-all active:scale-98"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">已复制誓言文本</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>复制官宣文案</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-stone-400" />
              <span>打印纸质版</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 text-xs font-medium rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer active:scale-98"
            >
              关闭
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={!imageUrl}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-900/30 cursor-pointer transition-all disabled:opacity-50 active:scale-98"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已保存到下载</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>保存高清证书图片</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>, document.body
  );
};
