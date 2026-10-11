/**
 * Romantic Audio Engine
 * Plays the iconic proposal song "Beautiful in White" (or custom URL)
 * with graceful fallback to synthesized acoustic music box and sparkling sound effects.
 */

export const DEFAULT_MUSIC_URL =
  'https://pub-31b15ba2520047e495dc5861af6e228b.r2.dev/music/Shane%20Filan%20-%20Beautiful%20in%20White.m4a';

class RomanticAudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private musicUrl: string = '';
  private synthIntervalId: number | null = null;
  private noteIndex: number = 0;
  private masterGain: GainNode | null = null;
  private onStateChangeListeners: Set<(playing: boolean) => void> = new Set();

  constructor() {
    this.initAudioElement();
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return;
    try {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.preload = 'none';

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        this.notifyState();
      });

      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notifyState();
      });

      this.audioElement.addEventListener('error', () => {
        // Fallback to synth if external file encounters network error
        if (this.isPlaying) {
          this.startSynth();
        }
      });
    } catch {
      // Audio element not supported
    }
  }

  public subscribe(listener: (playing: boolean) => void) {
    this.onStateChangeListeners.add(listener);
    return () => this.onStateChangeListeners.delete(listener);
  }

  private notifyState() {
    this.onStateChangeListeners.forEach((l) => l(this.isPlaying));
  }

  public setMusicUrl(url: string) {
    if (this.musicUrl === url) return;
    this.musicUrl = url;
    const wasPlaying = this.isPlaying;
    this.stopSynth();
    if (this.audioElement) {
      this.audioElement.pause();
      if (url) this.audioElement.src = url;
      else this.audioElement.removeAttribute('src');
      this.audioElement.load();
      if (wasPlaying) {
        void this.play();
      }
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play(): Promise<void> {
    this.isPlaying = true;
    this.notifyState();

    if (this.audioElement && this.musicUrl) {
      return this.audioElement.play().catch((err) => {
        // Autoplay policy or network issue
        console.warn('Audio play restricted or failed, falling back to synth chime:', err);
        if (this.isPlaying) this.startSynth();
      });
    } else {
      this.startSynth();
      return Promise.resolve();
    }
  }

  public pause() {
    this.isPlaying = false;
    this.notifyState();

    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynth();
  }

  // --- Web Audio Fallback & Sound Effects ---

  private initWebAudio() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private startSynth() {
    this.initWebAudio();
    if (!this.ctx || !this.masterGain) return;
    if (this.synthIntervalId) clearInterval(this.synthIntervalId);

    const melody = [
      293.66, 369.99, 440.0, 587.33,
      220.0, 277.18, 329.63, 440.0,
      246.94, 293.66, 369.99, 493.88,
      185.0, 220.0, 277.18, 369.99,
      196.0, 246.94, 293.66, 392.0,
      293.66, 369.99, 440.0, 587.33,
    ];

    this.synthIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const freq = melody[this.noteIndex % melody.length];
      this.noteIndex++;

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.16, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.5);
    }, 480);
  }

  private stopSynth() {
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }

  // Ring box opening sparkle chime
  public playRingSparkle() {
    this.initWebAudio();
    if (!this.ctx || !this.masterGain) return;

    const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + i * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.9);
    });
  }

  // Joyful celebration fanfare when "我愿意" is pressed
  public playCelebrationFanfare() {
    this.initWebAudio();
    if (!this.ctx || !this.masterGain) return;

    const chords = [
      { f: 587.33, t: 0.0 },
      { f: 739.99, t: 0.12 },
      { f: 880.0, t: 0.24 },
      { f: 1174.66, t: 0.36 },
      { f: 1479.98, t: 0.5 },
      { f: 1760.0, t: 0.65 },
    ];

    chords.forEach(({ f, t }) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.3);
    });
  }
}

export const romanticAudio = new RomanticAudioEngine();
