import React from 'react';
import { Volume2, VolumeX, SlidersHorizontal, Sparkles, Download } from 'lucide-react';

interface HeaderNavProps {
  isPlaying: boolean;
  onToggleMusic: () => void;
  onOpenSettings?: () => void;
  onOpenExport?: () => void;
  editable?: boolean;
  groomName: string;
  brideName: string;
  musicTitle?: string;
  spotlightEnabled: boolean;
  onToggleSpotlight: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  isPlaying,
  onToggleMusic,
  onOpenSettings,
  onOpenExport,
  editable = true,
  groomName,
  brideName,
  musicTitle,
  spotlightEnabled,
  onToggleSpotlight,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-stone-950/85 border-b border-rose-900/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {/* Zone 1: Brand wordmark */}
        <a
          href="#hero"
          className="font-cinzel text-sm sm:text-base tracking-wider sm:tracking-widest text-rose-200 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2"
        >
          <span className="text-rose-500 font-bold">♥</span>
          <span className="truncate max-w-[130px] sm:max-w-none">{groomName} & {brideName}</span>
        </a>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-rose-200/70">
          <a
            href="#journey"
            className="hover:text-rose-100 transition-colors whitespace-nowrap shrink-0"
          >
            浪漫时光
          </a>
          <a
            href="#letter"
            className="hover:text-rose-100 transition-colors whitespace-nowrap shrink-0"
          >
            手写情书
          </a>
          <a
            href="#vows"
            className="hover:text-rose-100 transition-colors whitespace-nowrap shrink-0"
          >
            爱的承诺
          </a>
          <a
            href="#proposal"
            className="text-rose-300 font-semibold hover:text-rose-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>💍</span>
            <span>求婚时刻</span>
          </a>
        </nav>

        {/* Zone 3: Interactive controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleMusic}
            data-music-control
            title={isPlaying ? '暂停背景音乐' : '播放《Beautiful in White》'}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs rounded-full bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/40 text-rose-200 transition-all cursor-pointer whitespace-nowrap shrink-0 max-w-[160px] sm:max-w-[210px]"
          >
            {isPlaying ? (
              <>
                {/* Dancing Equalizer Bars */}
                <div className="flex items-end gap-0.5 h-3.5 w-3.5 shrink-0">
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-2" style={{ animationDuration: '0.6s' }} />
                  <span className="w-0.5 bg-rose-300 rounded-full animate-bounce h-3.5" style={{ animationDuration: '0.4s', animationDelay: '0.2s' }} />
                  <span className="w-0.5 bg-amber-300 rounded-full animate-bounce h-2" style={{ animationDuration: '0.5s', animationDelay: '0.1s' }} />
                </div>
                <span className="truncate hidden sm:inline">{musicTitle || 'Beautiful in White'}</span>
                <span className="sm:hidden text-[11px]">音乐中</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate hidden sm:inline">播放音乐</span>
                <span className="sm:hidden text-[11px]">伴奏</span>
              </>
            )}
          </button>

          <button
            onClick={onToggleSpotlight}
            title={spotlightEnabled ? '关闭星河探照灯' : '开启星河探照灯'}
            className={`flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs rounded-full border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              spotlightEnabled
                ? 'bg-amber-950/60 hover:bg-amber-900/60 border-amber-600/40 text-amber-200'
                : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-400'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${spotlightEnabled ? 'text-amber-300 animate-pulse' : 'text-stone-500'}`} />
            <span className="hidden lg:inline">{spotlightEnabled ? '探照灯: 开启' : '探照灯: 关闭'}</span>
          </button>

          {editable && <button
            onClick={onOpenSettings}
            title="定制名字、纪念日与情书"
            className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs rounded-full bg-stone-900/80 hover:bg-stone-800 border border-rose-800/30 text-rose-200/90 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">定制内容</span>
          </button>}
          {editable && <button onClick={onOpenExport} title="导出离线求婚网页" className="flex items-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white p-2 sm:px-3 sm:py-1.5 text-xs cursor-pointer shrink-0">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">导出</span>
          </button>}
        </div>
      </div>
    </header>
  );
};
