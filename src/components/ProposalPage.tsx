import { useEffect, useState } from 'react';
import type { ProposalConfig } from '../types';
import { romanticAudio } from '../utils/audio';
import { PetalCanvas } from './PetalCanvas';
import { SpotlightCanvas } from './SpotlightCanvas';
import { FireworksCanvas } from './FireworksCanvas';
import { HeaderNav } from './HeaderNav';
import { HeroSection } from './HeroSection';
import { TimelineSection } from './TimelineSection';
import { LoveLetterSection } from './LoveLetterSection';
import { VowsSection } from './VowsSection';
import { ProposalStage } from './ProposalStage';

interface ProposalPageProps {
  config: ProposalConfig;
  editable?: boolean;
  onConfigChange?: (config: ProposalConfig) => void;
  onOpenSettings?: () => void;
  onOpenExport?: () => void;
}

/** The same renderer drives the editor preview and both offline exports. */
export function ProposalPage({ config, editable = false, onConfigChange, onOpenSettings, onOpenExport }: ProposalPageProps) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [spotlightEnabled, setSpotlightEnabled] = useState(config.spotlightEnabled ?? true);
  useEffect(() => { setSpotlightEnabled(config.spotlightEnabled ?? true); }, [config.spotlightEnabled]);

  useEffect(() => {
    romanticAudio.setMusicUrl(config.musicUrl || '');
    setIsMusicPlaying(romanticAudio.getIsPlaying());
    const unsubscribe = romanticAudio.subscribe(setIsMusicPlaying);
    const handleFirstInteraction = (event: Event) => {
      // The music control itself must not pause and immediately restart playback.
      if ((event.target as Element | null)?.closest?.('[data-music-control]')) return;
      if (!romanticAudio.getIsPlaying()) void romanticAudio.play();
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    return () => {
      unsubscribe();
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, [config.musicUrl]);

  return (
    <div className="min-h-screen bg-[#080509] text-[#fce7f3] selection:bg-rose-500/30 selection:text-white relative overflow-x-hidden">
      <PetalCanvas />
      <SpotlightCanvas enabled={spotlightEnabled} />
      <FireworksCanvas active={isAccepted} />
      <HeaderNav
        isPlaying={isMusicPlaying}
        onToggleMusic={() => romanticAudio.toggle()}
        onOpenSettings={onOpenSettings}
        onOpenExport={onOpenExport}
        editable={editable}
        groomName={config.groomName}
        brideName={config.brideName}
        musicTitle={config.musicTitle}
        spotlightEnabled={spotlightEnabled}
        onToggleSpotlight={() => {
          const next = !spotlightEnabled;
          setSpotlightEnabled(next);
          if (editable) onConfigChange?.({ ...config, spotlightEnabled: next });
        }}
      />
      <main className="relative z-10">
        <HeroSection groomName={config.groomName} brideName={config.brideName} anniversaryDate={config.anniversaryDate} heroSubtitle={config.heroSubtitle} />
        <TimelineSection editable={editable} initialMode={config.photoWallMode} initialSpeed={config.photoWallSpeed}
          onDisplayChange={editable ? (settings) => onConfigChange?.({ ...config, ...settings }) : undefined}
          milestones={config.milestones} onUpdateMilestones={(milestones) => onConfigChange?.({ ...config, milestones })} />
        <LoveLetterSection letterTitle={config.letterTitle} letterBody={config.letterBody} groomName={config.groomName} brideName={config.brideName} />
        <VowsSection editable={editable} vows={config.vows} brideName={config.brideName} onUpdateVows={(vows) => onConfigChange?.({ ...config, vows })} />
        <ProposalStage
          groomName={config.groomName}
          brideName={config.brideName}
          proposalDate={config.proposalDate}
          vows={config.vows}
          ringMessage={config.ringMessage}
          onAccepted={() => {
            setIsAccepted(true);
            if (!romanticAudio.getIsPlaying()) void romanticAudio.play();
          }}
          onResetAcceptance={() => setIsAccepted(false)}
          isAccepted={isAccepted}
        />
      </main>
      <footer className="border-t border-rose-950/40 py-8 px-6 text-center text-xs text-rose-300/50 space-y-2 relative z-10">
        <div className="font-cinzel tracking-widest text-[11px]">FOREVER & ALWAYS · {config.groomName} & {config.brideName}</div>
        <div>愿所有的美好与深情，都在漫长岁月里开花结果。</div>
      </footer>
    </div>
  );
}
