import React, { useState, useEffect } from 'react';
import { Heart, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  groomName: string;
  brideName: string;
  anniversaryDate: string;
  heroSubtitle: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  groomName,
  brideName,
  anniversaryDate,
  heroSubtitle,
}) => {
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(anniversaryDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [anniversaryDate]);

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-20 sm:pt-24 pb-14 sm:pb-16">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-7 sm:space-y-8 relative z-10">
        {/* Subtle romantic label without pill enclosure */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest text-rose-300/80 font-cinzel">
          <span>Our Love Story</span>
          <span aria-hidden="true">·</span>
          <span>Since {new Date(anniversaryDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        {/* Grand Headline */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            从初见你，<br className="sm:hidden" />
            <span className="bg-gradient-to-r from-rose-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
              到余生每一个朝夕
            </span>
          </h1>
          <p className="font-chinese-serif text-base sm:text-xl text-rose-200/80 max-w-xl mx-auto leading-relaxed italic px-2">
            "{heroSubtitle}"
          </p>
        </div>

        {/* Couple names centerpiece */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 py-1 sm:py-2">
          <span className="font-chinese-serif text-2xl sm:text-3xl font-semibold text-rose-100 tracking-wider">
            {groomName}
          </span>
          <div className="relative">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <span className="font-chinese-serif text-2xl sm:text-3xl font-semibold text-rose-100 tracking-wider">
            {brideName}
          </span>
        </div>

        {/* Live Timer Container */}
        <div className="py-5 sm:py-6 px-3.5 sm:px-8 rounded-2xl bg-stone-900/50 border border-rose-900/30 backdrop-blur-md max-w-2xl mx-auto shadow-xl">
          <div className="text-[11px] sm:text-xs uppercase tracking-widest text-rose-300/70 mb-3 sm:mb-4">
            我们相识相伴的美好时光
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-6 text-center">
            <div className="space-y-1">
              <span className="font-mono tabular-nums text-2xl sm:text-4xl font-bold text-rose-100">
                {timeTogether.days}
              </span>
              <div className="text-[10px] sm:text-xs text-rose-300/60 uppercase">天</div>
            </div>
            <div className="space-y-1">
              <span className="font-mono tabular-nums text-2xl sm:text-4xl font-bold text-rose-100">
                {String(timeTogether.hours).padStart(2, '0')}
              </span>
              <div className="text-[10px] sm:text-xs text-rose-300/60 uppercase">时</div>
            </div>
            <div className="space-y-1">
              <span className="font-mono tabular-nums text-2xl sm:text-4xl font-bold text-rose-100">
                {String(timeTogether.minutes).padStart(2, '0')}
              </span>
              <div className="text-[10px] sm:text-xs text-rose-300/60 uppercase">分</div>
            </div>
            <div className="space-y-1">
              <span className="font-mono tabular-nums text-2xl sm:text-4xl font-bold text-amber-200">
                {String(timeTogether.seconds).padStart(2, '0')}
              </span>
              <div className="text-[10px] sm:text-xs text-amber-300/60 uppercase">秒</div>
            </div>
          </div>
        </div>

        {/* Down indicator */}
        <div className="pt-6">
          <a
            href="#journey"
            className="inline-flex flex-col items-center gap-1.5 text-xs text-rose-300/70 hover:text-rose-200 transition-colors cursor-pointer group"
          >
            <span>重温我们的一路风景</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-rose-400 group-hover:text-rose-200" />
          </a>
        </div>
      </div>
    </section>
  );
};
