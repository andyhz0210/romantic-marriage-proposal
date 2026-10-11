import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DiamondRingArtwork } from './RomanticArtworks';
import { CertificateModal } from './CertificateModal';
import { romanticAudio } from '../utils/audio';
import { Sparkles, Award } from 'lucide-react';
import type { VowItem } from '../types';
import { PlayfulProposalAnswers } from './PlayfulProposalAnswers';

interface ProposalStageProps {
  groomName: string;
  brideName: string;
  proposalDate: string;
  ringMessage: string;
  onAccepted: () => void;
  onResetAcceptance?: () => void;
  isAccepted: boolean;
  vows?: VowItem[];
}

export const ProposalStage: React.FC<ProposalStageProps> = ({
  groomName,
  brideName,
  proposalDate,
  ringMessage,
  onAccepted,
  onResetAcceptance,
  isAccepted,
  vows,
}) => {
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const handleOpenBox = () => {
    setIsBoxOpen(true);
    romanticAudio.playRingSparkle();
  };

  const handleAccept = () => {
    onAccepted();
    setShowCertificate(true);
    romanticAudio.playCelebrationFanfare();
  };

  return (
    <section id="proposal" className="py-16 sm:py-24 px-4 sm:px-6 relative z-10 max-w-4xl mx-auto text-center">
      {/* Background ambient ring light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="space-y-3 sm:space-y-4 mb-10 sm:mb-12">
        <div className="text-xs uppercase tracking-widest text-amber-300/80 font-cinzel">
          The Grand Moment
        </div>
        <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-tight">
          执子之手 · 终身之约
        </h2>
        <p className="text-xs sm:text-base text-rose-200/80 max-w-md mx-auto">
          {ringMessage}
        </p>
      </div>

      {/* Ring Box Interactive Display */}
      <div className="flex flex-col items-center justify-center my-8 sm:my-10 min-h-[300px] sm:min-h-[340px]">
        <AnimatePresence mode="wait">
          {!isBoxOpen ? (
            /* Closed Velvet Box */
            <motion.div
              key="closed-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleOpenBox}
              className="group relative cursor-pointer transform hover:scale-105 active:scale-98 transition-all duration-300"
            >
              <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-b from-emerald-950 via-stone-950 to-neutral-950 border-2 border-amber-500/40 p-5 sm:p-6 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(5,150,105,0.25)] relative overflow-hidden group-hover:border-amber-400">
                {/* Box Lid Ribbon */}
                <div className="absolute inset-x-0 h-1 bg-amber-400/40 top-1/2 -translate-y-1/2" />
                <div className="absolute inset-y-0 w-1 bg-amber-400/40 left-1/2 -translate-x-1/2" />

                {/* Golden Clasp */}
                <div className="relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 shadow-md flex items-center justify-center border border-amber-200">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-stone-900" />
                </div>

                <div className="relative z-10 mt-5 sm:mt-6 text-center space-y-1">
                  <div className="font-cinzel text-[11px] sm:text-xs tracking-wider text-amber-200/90 uppercase">
                    Velvet Ring Box
                  </div>
                  <div className="font-chinese-serif text-xs sm:text-sm font-semibold text-rose-100">
                    轻触开启这份心意
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Opened Velvet Box revealing Diamond Ring */
            <motion.div
              key="opened-box"
              initial={{ opacity: 0, scale: 0.88, y: 35, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(8px)' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl space-y-6 sm:space-y-8"
            >
              <DiamondRingArtwork className="w-full max-w-lg mx-auto h-64 sm:h-80 shadow-2xl" />

              {/* Proposal Question */}
              <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                <h3 className="font-chinese-serif text-2xl sm:text-4xl font-extrabold text-white tracking-wide">
                  「{brideName}，你愿意嫁给我吗？」
                </h3>
                <p className="font-chinese-serif text-xs sm:text-base text-rose-200/80">
                  愿以山河为证，岁月为媒，与你一生相伴。
                </p>
              </div>

              <PlayfulProposalAnswers onAccept={handleAccept} isAccepted={isAccepted} />

              {isAccepted && (
                <div className="pt-4">
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>查看并保存求婚纪念证书</span>
                  </button>
                </div>
              )}

              {/* Close Ring Box button (Separated with safe spacing to avoid overlap) */}
              <div className="pt-4 sm:pt-6 pb-2">
                <button
                  onClick={() => {
                    setIsBoxOpen(false);
                    onResetAcceptance?.();
                  }}
                  className="text-xs text-rose-300/50 hover:text-rose-200 transition-colors cursor-pointer"
                >
                  合上戒盒重温
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Marriage Pledge Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <CertificateModal
            key="marriage-pledge-certificate-modal"
            groomName={groomName}
            brideName={brideName}
            proposalDate={proposalDate}
            vows={vows}
            onClose={() => setShowCertificate(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
