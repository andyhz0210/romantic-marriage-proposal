import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { getRunawayAnimation, getRunawayPosition, type RunawayBounds, type RunawayPosition } from '../utils/runaway';

const messages = ['我再想想...', '真的不考虑一下嘛？🥺', '工资卡全部上交！💳', '家务活我全包了！🧹', '吵架我先认错！🤝', '每天做你爱吃的！🍲', '房产证写你的名字！🏠', '求求你了，嫁给我吧~ 💍', '逃不掉啦，快点我愿意！❤️'];

export function PlayfulProposalAnswers({ onAccept, isAccepted }: { onAccept: () => void; isAccepted: boolean }) {
  const arena = useRef<HTMLDivElement>(null);
  const yesButton = useRef<HTMLButtonElement>(null);
  const noButton = useRef<HTMLButtonElement>(null);
  const bounds = useRef<RunawayBounds | null>(null);
  const currentPosition = useRef<RunawayPosition | undefined>(undefined);
  const flight = useRef<Animation | null>(null);
  const [moving, setMoving] = useState(false);
  const [position, setPosition] = useState<RunawayPosition | null>(null);
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    const container = arena.current;
    const yes = yesButton.current;
    const no = noButton.current;
    if (!container || !yes || !no) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      flight.current?.cancel();
      flight.current = null;
      setMoving(false);
      bounds.current = { width: container.clientWidth, height: container.clientHeight, yesWidth: yes.offsetWidth * 1.35, yesHeight: yes.offsetHeight * 1.35, noWidth: no.offsetWidth, noHeight: no.offsetHeight };
      const next = getRunawayPosition(bounds.current);
      currentPosition.current = next;
      setPosition(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(yes);
    observer.observe(no);
    void document.fonts.ready.then(measure);
    return () => { alive = false; observer.disconnect(); flight.current?.cancel(); flight.current = null; };
  }, [isAccepted]);

  const jump = (event: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!bounds.current || !arena.current || !noButton.current || flight.current?.playState === 'running') return;
    const rect = arena.current.getBoundingClientRect();
    // The opening animation scales the parent; convert the pointer into local coordinates.
    const pointer = event.clientX || event.clientY ? { x: (event.clientX - rect.left) * arena.current.clientWidth / rect.width, y: (event.clientY - rect.top) * arena.current.clientHeight / rect.height } : undefined;
    const next = getRunawayPosition(bounds.current, currentPosition.current, pointer);
    const start = currentPosition.current;
    if (start && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const animation = noButton.current.animate(getRunawayAnimation(bounds.current, start, next), { duration: 380, easing: 'cubic-bezier(0.3, 0.02, 0.16, 1)' });
      flight.current = animation;
      setMoving(true);
      animation.onfinish = () => { if (flight.current === animation) { flight.current = null; setMoving(false); } };
    }
    currentPosition.current = next;
    setPosition(next);
    setCount((value) => value + 1);
  };

  return <div ref={arena} data-proposal-arena className="relative w-full h-[320px]">
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-max">
      <button ref={yesButton} data-proposal-yes onClick={onAccept} style={{ transform: `scale(${Math.min(1.35, 1 + count * 0.06)})` }} className="relative z-20 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-chinese-serif font-bold text-base sm:text-xl shadow-[0_0_35px_rgba(244,63,94,0.6)] hover:shadow-[0_0_50px_rgba(244,63,94,0.9)] active:brightness-110 transition-all cursor-pointer flex items-center gap-2 select-none whitespace-nowrap">
        <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" /><span>我愿意！💍</span>
      </button>
    </div>
    {!isAccepted && <button ref={noButton} data-proposal-no
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') jump(event); }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        // Keep touch release/click on this button even while it flies over the yes button.
        event.currentTarget.setPointerCapture(event.pointerId);
        jump(event);
      }}
      onClick={(event) => { event.stopPropagation(); if (event.detail === 0) jump(event); }}
      style={{ left: 0, top: 0, transform: `translate(${position?.x ?? 12}px, ${position?.y ?? 12}px)`, width: 'min(220px, calc(100% - 24px))', height: 64, visibility: position ? 'visible' : 'hidden', willChange: 'transform', zIndex: moving ? 30 : 10 }}
      className="absolute z-10 px-4 py-2 rounded-full bg-stone-900/95 text-stone-200 text-xs sm:text-sm font-medium border border-rose-900/40 hover:border-rose-500/50 hover:bg-stone-800 transition-colors cursor-pointer shadow-lg select-none touch-manipulation flex items-center justify-center">
      <motion.span key={count} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>{messages[count % messages.length]}</motion.span>
    </button>}
  </div>;
}
