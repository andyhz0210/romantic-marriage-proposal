import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Milestone, ProposalConfig } from '../types';
import { preparePhoto } from '../export/media';
import { SunsetBeachArtwork, StarryNightArtwork, CozyCafeArtwork, RoseBouquetArtwork } from './RomanticArtworks';
import {
  MapPin,
  Calendar,
  Image as ImageIcon,
  Plus,
  Edit3,
  Trash2,
  X,
  Play,
  Pause,
  Maximize2,
  Save,
  Sparkles,
  Film,
  Layers,
} from 'lucide-react';

interface TimelineSectionProps {
  editable?: boolean;
  initialMode?: 'stream' | 'polaroid';
  initialSpeed?: 'normal' | 'slow' | 'fast';
  onDisplayChange?: (settings: Pick<ProposalConfig, 'photoWallMode' | 'photoWallSpeed'>) => void;
  milestones: Milestone[];
  onUpdateMilestones: (newMilestones: Milestone[]) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  editable = true,
  initialMode = 'stream',
  initialSpeed = 'normal',
  onDisplayChange,
  milestones,
  onUpdateMilestones,
}) => {
  // Display Mode: 'stream' (水平流动画卷), 'polaroid' (拍立得散落风)
  const [wallMode, setWallModeState] = useState<'stream' | 'polaroid'>(initialMode);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeedState] = useState<'normal' | 'slow' | 'fast'>(initialSpeed);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoRequest = useRef(0);
  useEffect(() => { setWallModeState(initialMode); setSpeedState(initialSpeed); }, [initialMode, initialSpeed]);
  const setWallMode = (value: 'stream' | 'polaroid') => {
    setWallModeState(value);
    onDisplayChange?.({ photoWallMode: value, photoWallSpeed: speed });
  };
  const setSpeed = (value: 'normal' | 'slow' | 'fast') => {
    setSpeedState(value);
    onDisplayChange?.({ photoWallMode: wallMode, photoWallSpeed: value });
  };
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Dynamic aspect ratio map measured from loaded images
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});

  // Form state for Add / Edit
  const [formMilestone, setFormMilestone] = useState<Milestone>({
    id: '',
    title: '',
    date: '',
    location: '',
    description: '',
    artType: 'roses',
    aspect: 'portrait',
    tilt: 'none',
  });

  // Handle ESC key to smoothly close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedMilestone) setSelectedMilestone(null);
        if (editingMilestone || isAddingNew) {
          setEditingMilestone(null);
          setIsAddingNew(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMilestone, editingMilestone, isAddingNew]);

  // Open Edit Modal
  const handleOpenEdit = (m: Milestone, e: React.MouseEvent) => {
    photoRequest.current++;
    setPhotoUploading(false);
    e.stopPropagation();
    setFormMilestone({ ...m });
    setIsAddingNew(false);
    setEditingMilestone(m);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    photoRequest.current++;
    setPhotoUploading(false);
    const newId = 'm_' + Date.now();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    setFormMilestone({
      id: newId,
      title: '新的心动瞬间',
      date: todayStr,
      location: '我们相约的地点',
      description: '记录下这个独一无二的美好时刻...',
      artType: 'beach',
      aspect: 'landscape',
      aspectRatio: 1.45,
      tilt: 'none',
    });
    setIsAddingNew(true);
    setEditingMilestone(null);
  };

  // Save Add / Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (photoUploading) return;
    if (isAddingNew) {
      const updated = [...milestones, formMilestone];
      onUpdateMilestones(updated);
    } else {
      const updated = milestones.map((m) =>
        m.id === formMilestone.id ? formMilestone : m
      );
      onUpdateMilestones(updated);
    }
    setEditingMilestone(null);
    setIsAddingNew(false);
  };

  // Delete Milestone
  const handleDeleteMilestone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (milestones.length <= 1) {
      alert('至少保留一段美好回忆哦~');
      return;
    }
    const confirmed = window.confirm('确定要删除这段美好回忆卡片吗？');
    if (confirmed) {
      const updated = milestones.filter((m) => m.id !== id);
      onUpdateMilestones(updated);
      if (selectedMilestone?.id === id) setSelectedMilestone(null);
    }
  };

  // Auto-detect natural image dimensions on load to guarantee zero distortion
  const handleImageNaturalLoad = (id: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const ratio = Number((img.naturalWidth / img.naturalHeight).toFixed(3));
      setImageRatios((prev) => {
        if (prev[id] === ratio) return prev;
        return { ...prev, [id]: ratio };
      });
    }
  };

  // Upload Photo File with real-time natural dimension measurement
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const request = ++photoRequest.current;
    setPhotoUploading(true);
    try {
      const { url, ratio } = await preparePhoto(file);
      if (request !== photoRequest.current) return;
      setImageRatios((previous) => ({ ...previous, [formMilestone.id]: ratio }));
      setFormMilestone((previous) => ({ ...previous, customImageUrl: url, artType: 'custom', aspectRatio: ratio, aspect: ratio > 1.25 ? 'landscape' : ratio < 0.88 ? 'portrait' : 'square' }));
    } catch (error) { if (request === photoRequest.current) alert(error instanceof Error ? error.message : '图片无法读取，请选择 JPEG、PNG 或 WebP 图片。'); }
    finally { if (request === photoRequest.current) setPhotoUploading(false); e.target.value = ''; }
  };

  // Calculate proportional card dimensions strictly matching the photo's aspect ratio without stretching
  const getProportionalDimensions = (m: Milestone, idx: number) => {
    let ratio = imageRatios[m.id] || m.aspectRatio;
    if (!ratio) {
      if (m.aspect === 'landscape') ratio = 1.45;
      else if (m.aspect === 'portrait') ratio = 0.78;
      else if (m.aspect === 'square') ratio = 1.0;
      else {
        if (m.artType === 'beach') ratio = 1.5;
        else if (m.artType === 'cafe') ratio = 1.35;
        else if (m.artType === 'stars') ratio = 1.0;
        else if (m.artType === 'roses') ratio = 0.82;
        else {
          const defaultRatios = [1.35, 1.45, 1.0, 0.82];
          ratio = defaultRatios[idx % defaultRatios.length];
        }
      }
    }

    // Stream Mode:
    // Base photo display height: 230px
    // Width adapts proportionally: photoWidth = 230 * ratio (clamped between 200px and 410px)
    const streamPhotoHeight = 230;
    const streamPhotoWidth = Math.round(Math.min(Math.max(streamPhotoHeight * ratio, 200), 410));
    const streamCardWidth = streamPhotoWidth + 30; // accounts for p-3.5 padding

    // Polaroid Mode:
    // Base photo display width: 250px
    // Photo height adapts: photoHeight = 250 / ratio (clamped between 180px and 330px)
    const polaroidPhotoWidth = 250;
    const polaroidPhotoHeight = Math.round(Math.min(Math.max(polaroidPhotoWidth / ratio, 180), 330));
    const polaroidCardWidth = polaroidPhotoWidth + 32; // accounts for white frame padding

    return {
      ratio,
      streamPhotoHeight,
      streamPhotoWidth,
      streamCardWidth,
      polaroidPhotoWidth,
      polaroidPhotoHeight,
      polaroidCardWidth,
    };
  };

  // Render artwork or uploaded photo faithfully without stretching
  const renderArtwork = (m: Milestone, heightPx: number, widthPx?: number) => {
    if (m.customImageUrl) {
      return (
        <img
          src={m.customImageUrl}
          alt={m.title}
          referrerPolicy="no-referrer"
          onLoad={(e) => handleImageNaturalLoad(m.id, e)}
          style={{
            height: `${heightPx}px`,
            width: widthPx ? `${widthPx}px` : '100%',
          }}
          className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
        />
      );
    }

    const containerStyle = {
      height: `${heightPx}px`,
      width: widthPx ? `${widthPx}px` : '100%',
    };

    switch (m.artType) {
      case 'beach':
        return (
          <div style={containerStyle} className="overflow-hidden rounded-xl">
            <SunsetBeachArtwork className="w-full h-full" />
          </div>
        );
      case 'stars':
        return (
          <div style={containerStyle} className="overflow-hidden rounded-xl">
            <StarryNightArtwork className="w-full h-full" />
          </div>
        );
      case 'cafe':
        return (
          <div style={containerStyle} className="overflow-hidden rounded-xl">
            <CozyCafeArtwork className="w-full h-full" />
          </div>
        );
      case 'roses':
      default:
        return (
          <div style={containerStyle} className="overflow-hidden rounded-xl">
            <RoseBouquetArtwork className="w-full h-full" />
          </div>
        );
    }
  };

  // Marquee duration based on speed
  const getMarqueeDuration = () => {
    if (speed === 'slow') return '75s';
    if (speed === 'fast') return '30s';
    return '48s';
  };

  // Duplicate milestones to create seamless infinite loop for stream mode
  const displayMilestones = [...milestones, ...milestones];

  // Polaroid Scatter pre-configured tilt angles strictly between -5.5deg and +5.5deg
  const polaroidTilts = [-4.5, 3.6, -2.4, 5.2, -5.0, 2.8, -3.8, 4.2];

  return (
    <section id="journey" className="py-24 relative z-20 overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[380px] bg-rose-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <div className="max-w-6xl mx-auto px-6 mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-rose-300/80 font-cinzel flex items-center gap-2">
            <span>Infinite Memory Stream</span>
            <span aria-hidden="true">·</span>
            <span>共 {milestones.length} 帧美好岁月</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white tracking-tight">
            独家记忆 · 流光照片墙
          </h2>
          <p className="text-xs sm:text-sm text-rose-200/70 max-w-lg">
            相片随比例自适应呈现不畸变，支持切换流光画卷与桌面拍立得双重风格，随时记录心动。
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Display Mode Switcher */}
          <div className="flex items-center p-1 rounded-full bg-stone-900/90 border border-rose-900/40 text-xs shadow-lg">
            <button
              onClick={() => setWallMode('stream')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all ${
                wallMode === 'stream'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white font-medium shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>流光画卷</span>
            </button>
            <button
              onClick={() => setWallMode('polaroid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all ${
                wallMode === 'polaroid'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white font-medium shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>拍立得散落</span>
            </button>
          </div>

          {/* Stream-specific Controls (Pause/Play & Speed) */}
          {wallMode === 'stream' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                title={isPaused ? '继续流动' : '暂停流动'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-stone-900/80 hover:bg-stone-800 border border-rose-900/40 text-rose-200 cursor-pointer transition-colors"
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>继续流动</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-rose-400" />
                    <span>暂停</span>
                  </>
                )}
              </button>

              <div className="flex items-center p-0.5 rounded-full bg-stone-900/80 border border-stone-800 text-[11px]">
                <button
                  onClick={() => setSpeed('slow')}
                  className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    speed === 'slow' ? 'bg-rose-950 text-rose-200 font-medium' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  慢
                </button>
                <button
                  onClick={() => setSpeed('normal')}
                  className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    speed === 'normal' ? 'bg-rose-950 text-rose-200 font-medium' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  正常
                </button>
                <button
                  onClick={() => setSpeed('fast')}
                  className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    speed === 'fast' ? 'bg-rose-950 text-rose-200 font-medium' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  快
                </button>
              </div>
            </div>
          )}

          {/* Add New Memory Button */}
          {editable && <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-950/40 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加回忆照片</span>
          </button>}
        </div>
      </div>

      {/* ========================================================
          MODE 1: 水平流动画卷 (Horizontal Continuous Stream)
          Each card dynamically sizes to match the photo's true aspect ratio
          ======================================================== */}
      {wallMode === 'stream' && (
        <div className="relative w-full overflow-hidden py-8 select-none">
          {/* Edge gradient fades */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080509] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080509] to-transparent z-10 pointer-events-none" />

          <div
            className={`animate-marquee-infinite flex items-center gap-6 sm:gap-7 ${
              isPaused ? 'marquee-paused' : ''
            }`}
            style={{ animationDuration: getMarqueeDuration() }}
          >
            {displayMilestones.map((milestone, idx) => {
              const dims = getProportionalDimensions(milestone, idx);
              const tiltClass = idx % 3 === 0 ? '-rotate-1' : idx % 3 === 1 ? 'rotate-1' : 'rotate-0';
              return (
                <div
                  key={`stream_${milestone.id}_${idx}`}
                  onClick={() => setSelectedMilestone(milestone)}
                  style={{ width: `${dims.streamCardWidth}px`, maxWidth: '86vw' }}
                  className={`group relative shrink-0 ${tiltClass} hover:rotate-0 hover:scale-105 active:scale-102 hover:z-30 transition-all duration-300 cursor-pointer`}
                >
                  <div className="rounded-2xl bg-gradient-to-b from-stone-900/90 to-stone-950/95 border border-rose-900/35 hover:border-rose-500/60 p-3 sm:p-4 shadow-xl hover:shadow-2xl hover:shadow-rose-950/60 transition-all flex flex-col justify-between backdrop-blur-sm">
                    {/* Visual Photo Slot with true ratio and zero distortion */}
                    <div
                      className="relative overflow-hidden rounded-xl bg-stone-900/50 flex items-center justify-center max-w-full"
                      style={{
                        width: `${dims.streamPhotoWidth}px`,
                        height: `${dims.streamPhotoHeight}px`,
                      }}
                    >
                      {renderArtwork(milestone, dims.streamPhotoHeight, dims.streamPhotoWidth)}

                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMilestone(milestone);
                          }}
                          title="查看大图"
                          className="p-2 rounded-full bg-stone-800/90 text-stone-200 hover:text-white hover:bg-stone-700 cursor-pointer"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        {editable && <button
                          onClick={(e) => handleOpenEdit(milestone, e)}
                          title="修改信息与照片"
                          className="p-2 rounded-full bg-rose-600/90 text-white hover:bg-rose-500 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>}
                        {editable && <button
                          onClick={(e) => handleDeleteMilestone(milestone.id, e)}
                          title="删除此块"
                          className="p-2 rounded-full bg-stone-800/90 text-stone-300 hover:text-rose-400 hover:bg-stone-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>}
                      </div>
                    </div>

                    {/* Metadata & Title */}
                    <div className="pt-3.5 pb-1 space-y-1.5 text-left">
                      <div className="flex items-center justify-between text-[11px] text-rose-300/80 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-rose-400" />
                          {milestone.date}
                        </span>
                        {milestone.location && (
                          <span className="flex items-center gap-1 text-stone-400 truncate max-w-[130px]">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            {milestone.location}
                          </span>
                        )}
                      </div>

                      <h3 className="font-chinese-serif text-base font-bold text-rose-100 group-hover:text-amber-200 transition-colors line-clamp-1">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-stone-300/80 leading-relaxed font-sans line-clamp-2">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: 拍立得散落风 (Polaroid Scatter on Table)
          Photos with white borders, random tilts (-6deg to 6deg),
          natural slight overlap, auto-straighten & pop on hover!
          ======================================================== */}
      {wallMode === 'polaroid' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-950/40 border border-amber-800/30 text-xs text-amber-200/90 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>桌面上散落的拍立得相片 · 鼠标悬停自动摆正浮起并高亮</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-7 pb-10">
            {milestones.map((milestone, idx) => {
              const dims = getProportionalDimensions(milestone, idx);
              const tiltAngle = polaroidTilts[idx % polaroidTilts.length];

              return (
                <div
                  key={`polaroid_${milestone.id}`}
                  onClick={() => setSelectedMilestone(milestone)}
                  style={{
                    width: `${dims.polaroidCardWidth}px`,
                    maxWidth: '88vw',
                    transform: `rotate(${tiltAngle}deg)`,
                  }}
                  className="group relative shrink-0 -mx-1 sm:-mx-2.5 my-2 bg-[#fdfbf7] text-stone-800 p-3 sm:p-3.5 pb-6 sm:pb-7 rounded-sm shadow-xl shadow-black/45 border border-stone-200/80 hover:!rotate-0 hover:scale-108 active:!rotate-0 active:scale-104 hover:z-40 active:z-40 hover:shadow-2xl hover:shadow-rose-950/70 transition-all duration-300 ease-out cursor-pointer"
                >
                  {/* Decorative Washi Tape on top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-amber-100/75 border border-amber-300/40 -rotate-1 shadow-xs pointer-events-none" />

                  {/* Photo Slot (Adapts to true aspect ratio) */}
                  <div
                    className="relative overflow-hidden rounded-xs bg-stone-100 shadow-inner flex items-center justify-center max-w-full"
                    style={{
                      width: `${dims.polaroidPhotoWidth}px`,
                      height: `${dims.polaroidPhotoHeight}px`,
                    }}
                  >
                    {renderArtwork(milestone, dims.polaroidPhotoHeight, dims.polaroidPhotoWidth)}

                    {/* Hover Quick Action Buttons */}
                    <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMilestone(milestone);
                        }}
                        title="查看大图"
                        className="p-2 rounded-full bg-stone-800/90 text-stone-200 hover:text-white hover:bg-stone-700 cursor-pointer"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      {editable && <button
                        onClick={(e) => handleOpenEdit(milestone, e)}
                        title="修改信息与照片"
                        className="p-2 rounded-full bg-rose-600/90 text-white hover:bg-rose-500 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>}
                      {editable && <button
                        onClick={(e) => handleDeleteMilestone(milestone.id, e)}
                        title="删除此块"
                        className="p-2 rounded-full bg-stone-800/90 text-stone-300 hover:text-rose-400 hover:bg-stone-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>}
                    </div>
                  </div>

                  {/* Handwritten Polaroid Bottom Caption */}
                  <div className="pt-3 text-left space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                      <span>{milestone.date}</span>
                      {milestone.location && (
                        <span className="truncate max-w-[120px] font-sans text-stone-400">
                          {milestone.location}
                        </span>
                      )}
                    </div>
                    <div className="font-chinese-serif text-sm font-bold text-stone-900 line-clamp-1 flex items-center justify-between">
                      <span>{milestone.title}</span>
                      <span className="text-rose-500 font-serif text-xs">♥</span>
                    </div>
                    <p className="text-[11px] text-stone-600 font-sans line-clamp-2 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          LIGHTBOX / DETAIL VIEW MODAL
          NO heavy black curtain backdrop: uses romantic frosted glass veil
          NO black background mat behind the photo: photo renders purely
          Top header completely separates Close button so photo NEVER overlaps!
          ======================================================== */}
      <AnimatePresence>
        {selectedMilestone && !editingMilestone && !isAddingNew && (
          <motion.div
            key="timeline-lightbox-backdrop"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setSelectedMilestone(null)}
            style={{
              background: 'radial-gradient(circle at center, rgba(225, 29, 72, 0.12) 0%, rgba(12, 6, 14, 0.70) 100%)',
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 cursor-pointer overflow-y-auto"
          >
            {/* Screen Top-Right Floating Close Button (Desktop & tablet) */}
            <button
              onClick={() => setSelectedMilestone(null)}
              className="hidden sm:flex fixed top-5 right-5 sm:top-7 sm:right-7 z-50 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-rose-500/30 shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-200 hover:scale-110"
              title="关闭相片 (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              key="timeline-lightbox-panel"
              initial={{ opacity: 0, scale: 0.88, y: 28, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.88, y: 20, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-stone-900/95 border border-rose-900/40 rounded-3xl shadow-2xl p-4 sm:p-7 space-y-3.5 sm:space-y-4 my-auto cursor-default backdrop-blur-xl max-h-[92vh] overflow-y-auto flex flex-col"
            >
              {/* Dedicated Top Header Bar:
                  Guarantees clean distance between Close button and the Photo below */}
              <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-rose-900/30">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-rose-300 font-mono">
                  <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-200">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    {selectedMilestone.date}
                  </span>
                  {selectedMilestone.location && (
                    <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-stone-800/70 border border-stone-700/40 text-stone-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {selectedMilestone.location}
                    </span>
                  )}
                </div>

                {/* Panel Close button (Safely isolated in header bar) */}
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="p-1.5 sm:p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700/50 cursor-pointer transition-colors"
                  title="关闭 (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Photo Stage (True Aspect Ratio, No stretch, NO black curtain background!) */}
              <div className="w-full flex items-center justify-center my-1.5 sm:my-2">
                {selectedMilestone.customImageUrl ? (
                  <img
                    src={selectedMilestone.customImageUrl}
                    alt={selectedMilestone.title}
                    onLoad={(e) => handleImageNaturalLoad(selectedMilestone.id, e)}
                    className="max-h-[42vh] sm:max-h-[52vh] max-w-full w-auto h-auto object-contain rounded-2xl shadow-2xl border border-rose-500/25 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full max-h-[42vh] sm:max-h-[52vh] rounded-2xl overflow-hidden shadow-2xl border border-rose-500/20">
                    {renderArtwork(selectedMilestone, 260)}
                  </div>
                )}
              </div>

              {/* Story Title & Description */}
              <div className="space-y-2 text-left pt-1">
                <h3 className="font-chinese-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <span>{selectedMilestone.title}</span>
                  <span className="text-rose-400 font-serif text-base">♥</span>
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-wrap max-h-36 overflow-y-auto pr-1">
                  {selectedMilestone.description}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-rose-900/30">
                {editable && <button
                  onClick={(e) => handleOpenEdit(selectedMilestone, e)}
                  className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-medium cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>编辑这段回忆</span>
                </button>}
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-900 to-amber-900 text-rose-100 hover:brightness-110 border border-rose-700/40 cursor-pointer transition-all shadow-md"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          ADD / EDIT MEMORY MODAL
          ======================================================== */}
      <AnimatePresence>
        {editable && (editingMilestone || isAddingNew) && (
          <motion.div
            key="timeline-edit-backdrop"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              setEditingMilestone(null);
              setIsAddingNew(false);
            }}
            style={{
              background: 'radial-gradient(circle at center, rgba(225, 29, 72, 0.12) 0%, rgba(12, 6, 14, 0.70) 100%)',
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              key="timeline-edit-panel"
              initial={{ opacity: 0, scale: 0.88, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.88, y: 22, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl max-h-[92vh] bg-stone-900 border border-rose-900/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto cursor-default backdrop-blur-xl"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <h3 className="font-chinese-serif text-lg font-bold text-white">
                    {isAddingNew ? '添加新回忆卡片' : '编辑回忆卡片内容'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setEditingMilestone(null);
                    setIsAddingNew(false);
                  }}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4 text-xs text-left">
                {/* Photo Upload / Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-stone-300 font-medium">
                      回忆照片
                    </label>
                    {formMilestone.aspectRatio && (
                      <span className="text-[10px] text-amber-300/80 font-mono bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                        {formMilestone.aspectRatio > 1.25 ? '横版风景比例' : formMilestone.aspectRatio < 0.88 ? '竖版人像比例' : '方形标准比例'} ({formMilestone.aspectRatio})
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {/* Photo Preview Box with proportional fit */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-stone-950/60 border border-rose-900/30 flex items-center justify-center p-1">
                      {formMilestone.customImageUrl ? (
                        <img
                          src={formMilestone.customImageUrl}
                          alt="预览照片"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full">
                          {renderArtwork(formMilestone, 170)}
                        </div>
                      )}
                    </div>

                    {/* Upload button or preset picker */}
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/40 text-rose-200 cursor-pointer transition-colors">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>上传真实照片（支持任意比例）</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={photoUploading}
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>

                      <div className="flex items-center gap-1.5 text-stone-400">
                        <span className="text-[11px]">或选插画预设：</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormMilestone((p) => ({
                              ...p,
                              artType: 'beach',
                              customImageUrl: undefined,
                              aspectRatio: 1.5,
                              aspect: 'landscape',
                            }))
                          }
                          className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
                            formMilestone.artType === 'beach' && !formMilestone.customImageUrl
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          落日海滩
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormMilestone((p) => ({
                              ...p,
                              artType: 'stars',
                              customImageUrl: undefined,
                              aspectRatio: 1.0,
                              aspect: 'square',
                            }))
                          }
                          className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
                            formMilestone.artType === 'stars' && !formMilestone.customImageUrl
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          星夜漫步
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormMilestone((p) => ({
                              ...p,
                              artType: 'cafe',
                              customImageUrl: undefined,
                              aspectRatio: 1.35,
                              aspect: 'landscape',
                            }))
                          }
                          className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
                            formMilestone.artType === 'cafe' && !formMilestone.customImageUrl
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          街角咖啡
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormMilestone((p) => ({
                              ...p,
                              artType: 'roses',
                              customImageUrl: undefined,
                              aspectRatio: 0.82,
                              aspect: 'portrait',
                            }))
                          }
                          className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
                            formMilestone.artType === 'roses' && !formMilestone.customImageUrl
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          浪漫花束
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-medium mb-1.5">
                      主题 / 标题
                    </label>
                    <input
                      type="text"
                      required
                      value={formMilestone.title}
                      onChange={(e) =>
                        setFormMilestone((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="例如：初见 · 心动的开始"
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-medium mb-1.5">
                      纪念日期
                    </label>
                    <input
                      type="text"
                      required
                      value={formMilestone.date}
                      onChange={(e) =>
                        setFormMilestone((p) => ({ ...p, date: e.target.value }))
                      }
                      placeholder="例如：2023.05.20"
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-stone-300 font-medium mb-1.5">
                    定位 / 地点
                  </label>
                  <input
                    type="text"
                    value={formMilestone.location || ''}
                    onChange={(e) =>
                      setFormMilestone((p) => ({ ...p, location: e.target.value }))
                    }
                    placeholder="例如：滨海金沙湾、梧桐街角咖啡馆"
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-stone-300 font-medium mb-1.5">
                    详细回忆与心动故事
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formMilestone.description}
                    onChange={(e) =>
                      setFormMilestone((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="写下你们当时的感动、细节与甜蜜对话..."
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
                  />
                </div>

                {photoUploading && <p role="status" className="text-rose-300">正在读取和压缩照片，请稍候…</p>}
                {/* Form Actions */}
                <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                  {!isAddingNew ? (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteMilestone(formMilestone.id, e)}
                      className="flex items-center gap-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>删除此卡片</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMilestone(null);
                        setIsAddingNew(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={photoUploading}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>保存回忆</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
