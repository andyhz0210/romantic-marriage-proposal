import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, RotateCcw } from 'lucide-react';

interface LoveLetterSectionProps {
  letterTitle: string;
  letterBody: string;
  groomName: string;
  brideName: string;
}

export const LoveLetterSection: React.FC<LoveLetterSectionProps> = ({
  letterTitle,
  letterBody,
  groomName,
  brideName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="letter" className="py-16 sm:py-24 px-4 sm:px-6 relative z-10 max-w-4xl mx-auto">
      <div className="text-center space-y-3 mb-12 sm:mb-16">
        <div className="text-xs uppercase tracking-widest text-rose-300/70 font-cinzel">
          Words From The Heart
        </div>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white tracking-tight">
          纸短情长 · 一封手写信
        </h2>
        <p className="text-xs sm:text-base text-rose-200/70 max-w-md mx-auto">
          千言万语，唯愿与你执手共度余生。
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Envelope Closed State */
          <motion.div
            key="closed-envelope"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <div
              onClick={() => setIsOpen(true)}
              className="group relative w-full max-w-lg cursor-pointer transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
            >
              {/* Envelope Body */}
              <div className="relative h-60 sm:h-72 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-rose-900/40 p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden group-hover:border-rose-500/50">
                {/* Envelope flap lines */}
                <div className="absolute top-0 left-0 right-0 h-28 sm:h-32 border-b border-rose-900/40 transform -skew-y-3 origin-top-left pointer-events-none" />
                <div className="absolute top-0 right-0 left-0 h-28 sm:h-32 border-b border-rose-900/40 transform skew-y-3 origin-top-right pointer-events-none" />

                {/* Red Wax Seal Badge */}
                <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 border-2 border-rose-400/40 shadow-lg flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform">
                  <span className="text-amber-200 text-lg sm:text-xl font-serif">♥</span>
                </div>

                <div className="relative z-10 mt-5 sm:mt-6 space-y-1">
                  <div className="font-chinese-serif text-base sm:text-lg font-bold text-rose-100">
                    致：{brideName}
                  </div>
                  <div className="text-[11px] sm:text-xs text-rose-300/60 font-mono">
                    封存着关于未来的全部真心
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-200/90 font-medium group-hover:text-amber-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>点击开启信笺</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Letter Opened State with 3D unfold and refold */
          <motion.div
            key="opened-letter"
            initial={{ opacity: 0, scale: 0.88, rotateX: -40, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, rotateX: -35, y: 20 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'top center', perspective: 1200 }}
            className="relative max-w-2xl mx-auto rounded-3xl bg-[#fdfbf7] text-[#292524] p-5 sm:p-12 shadow-2xl border-2 border-amber-800/30 shadow-[0_20px_60px_rgba(244,63,94,0.15)]"
          >
            {/* Inner hairline border */}
            <div className="absolute inset-2.5 sm:inset-3 border border-amber-700/20 rounded-2xl pointer-events-none" />

            {/* Decorative antique stamps */}
            <div className="relative z-10 flex items-center justify-between border-b border-amber-900/15 pb-3.5 sm:pb-4 mb-5 sm:mb-6 text-xs text-stone-500 font-serif">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Mail className="w-4 h-4 text-rose-700" />
                <span className="font-cinzel tracking-wider text-amber-900/80 font-semibold text-[11px] sm:text-xs">
                  LOVE PLEDGE · 独家私语
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 px-2 py-1 rounded-lg bg-stone-200/50 hover:bg-stone-200 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重新折起</span>
              </button>
            </div>

            {/* Letter Title */}
            <h3 className="font-chinese-serif text-xl sm:text-3xl font-bold text-stone-900 mb-5 sm:mb-6 text-center">
              {letterTitle}
            </h3>

            {/* Letter Prose */}
            <div className="font-chinese-serif text-sm sm:text-base text-stone-800 leading-relaxed sm:leading-loose space-y-3.5 sm:space-y-4 whitespace-pre-wrap">
              {letterBody}
            </div>

            {/* Signature */}
            <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-amber-900/10 flex flex-col items-end text-right">
              <div className="text-xs text-stone-500 font-serif mb-1">永远爱你的</div>
              <div className="font-chinese-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-wider">
                {groomName}
              </div>
              <div className="text-[11px] sm:text-xs text-stone-400 font-mono mt-1">
                {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
