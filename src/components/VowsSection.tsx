import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VowItem } from '../types';
import {
  Heart,
  Utensils,
  Shield,
  Smile,
  Infinity,
  Check,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Gift,
  Star,
  Home,
  Sparkles,
} from 'lucide-react';

interface VowsSectionProps {
  editable?: boolean;
  vows: VowItem[];
  brideName: string;
  onUpdateVows: (newVows: VowItem[]) => void;
}

export const VowsSection: React.FC<VowsSectionProps> = ({
  editable = true,
  vows,
  brideName,
  onUpdateVows,
}) => {
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const [editingVow, setEditingVow] = useState<VowItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state for Add/Edit
  const [formVow, setFormVow] = useState<VowItem>({
    id: '',
    title: '',
    description: '',
    iconName: 'heart',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingVow || isAddingNew) {
          setEditingVow(null);
          setIsAddingNew(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingVow, isAddingNew]);

  const toggleAcknowledge = (id: string, e: React.MouseEvent) => {
    // Only toggle acknowledge if not clicking an action button
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    setAcknowledged((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenAdd = () => {
    const newId = 'vow_' + Date.now();
    setFormVow({
      id: newId,
      title: '新的甜蜜承诺',
      description: '写下你愿意为她坚守一生的具体承诺...',
      iconName: 'heart',
    });
    setIsAddingNew(true);
    setEditingVow(null);
  };

  const handleOpenEdit = (vow: VowItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormVow({ ...vow });
    setEditingVow(vow);
    setIsAddingNew(false);
  };

  const handleDeleteVow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (vows.length <= 1) {
      alert('至少保留一条真心承诺哦~');
      return;
    }
    const confirmed = window.confirm('确定要删除这条承诺吗？');
    if (confirmed) {
      const updated = vows.filter((v) => v.id !== id);
      onUpdateVows(updated);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingNew) {
      const updated = [...vows, formVow];
      onUpdateVows(updated);
    } else {
      const updated = vows.map((v) => (v.id === formVow.id ? formVow : v));
      onUpdateVows(updated);
    }
    setIsAddingNew(false);
    setEditingVow(null);
  };

  const getIcon = (iconName: VowItem['iconName']) => {
    switch (iconName) {
      case 'utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-sky-400" />;
      case 'smile':
        return <Smile className="w-5 h-5 text-rose-400" />;
      case 'infinity':
        return <Infinity className="w-5 h-5 text-purple-400" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-emerald-400" />;
      case 'star':
        return <Star className="w-5 h-5 text-yellow-400" />;
      case 'home':
        return <Home className="w-5 h-5 text-cyan-400" />;
      case 'heart':
      default:
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />;
    }
  };

  const iconOptions: Array<{ name: VowItem['iconName']; label: string }> = [
    { name: 'heart', label: '真心情感' },
    { name: 'utensils', label: '三餐温热' },
    { name: 'shield', label: '风雨守护' },
    { name: 'smile', label: '快乐笑容' },
    { name: 'infinity', label: '一生相守' },
    { name: 'gift', label: '惊喜心意' },
    { name: 'star', label: '浪漫梦想' },
    { name: 'home', label: '温馨港湾' },
  ];

  return (
    <section id="vows" className="py-16 sm:py-24 px-4 sm:px-6 relative z-10 max-w-6xl mx-auto">
      {/* Header section with Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-12 sm:mb-16">
        <div className="text-center sm:text-left space-y-2">
          <div className="text-xs uppercase tracking-widest text-rose-300/70 font-cinzel flex items-center justify-center sm:justify-start gap-2">
            <span>Sacred Promises</span>
            <span aria-hidden="true">·</span>
            <span>共 {vows.length} 项誓约</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white tracking-tight">
            爱的契约 · 给{brideName}的真心承诺
          </h2>
          <p className="text-xs sm:text-sm text-rose-200/70 max-w-lg">
            不是一时的甜言蜜语，而是用漫长岁月一点一滴去践行的诺言。
          </p>
        </div>

        {/* Add Vow button in header */}
        {editable && <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-950/40 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新增一项承诺</span>
        </button>}
      </div>

      {/* Grid of Vow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {vows.map((vow, index) => {
          const isDone = !!acknowledged[vow.id];
          return (
            <div
              key={vow.id}
              onClick={(e) => toggleAcknowledge(vow.id, e)}
              className={`group relative p-4.5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                isDone
                  ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
                  : 'bg-stone-900/60 border-stone-800/80 hover:border-rose-900/50'
              }`}
            >
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-stone-800/80 border border-stone-700/50 flex items-center justify-center">
                    {getIcon(vow.iconName)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-rose-400/80">
                      承诺 0{index + 1}
                    </span>

                    {/* Quick Edit & Delete Actions */}
                    {editable && <div className="flex items-center gap-1 opacity-90 sm:opacity-70 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEdit(vow, e)}
                        title="编辑此承诺"
                        className="p-1.5 sm:p-1 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteVow(vow.id, e)}
                        title="删除此承诺"
                        className="p-1.5 sm:p-1 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>}
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="font-chinese-serif text-base sm:text-lg font-bold text-rose-100 group-hover:text-amber-200 transition-colors">
                    {vow.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300/80 leading-relaxed font-sans">
                    {vow.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-800/60 flex items-center justify-between text-xs">
                <span className={isDone ? 'text-rose-300 font-medium' : 'text-stone-500'}>
                  {isDone ? '已见证此项誓言 ♥' : '点击签收此项承诺'}
                </span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'border-stone-600 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Card Placeholder */}
        {editable && <div
          onClick={handleOpenAdd}
          className="p-6 rounded-2xl border border-dashed border-stone-800 hover:border-rose-600/60 bg-stone-950/40 hover:bg-rose-950/20 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700/60 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="font-chinese-serif text-sm font-bold text-rose-200">
              添加一条新承诺
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              写下属于你们的独家约定
            </div>
          </div>
        </div>}
      </div>

      {/* Add / Edit Vow Modal */}
      <AnimatePresence>
        {editable && (editingVow || isAddingNew) && (
          <motion.div
            key="vow-modal-backdrop"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              setEditingVow(null);
              setIsAddingNew(false);
            }}
            style={{
              background: 'radial-gradient(circle at center, rgba(225, 29, 72, 0.12) 0%, rgba(12, 6, 14, 0.70) 100%)',
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 cursor-pointer overflow-y-auto"
          >
            <motion.div
              key="vow-modal-panel"
              initial={{ opacity: 0, scale: 0.88, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.88, y: 22, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-stone-900 border border-rose-900/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto cursor-default backdrop-blur-xl max-h-[92vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <h3 className="font-chinese-serif text-lg font-bold text-white">
                    {isAddingNew ? '新增爱情承诺' : '编辑承诺内容'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setEditingVow(null);
                    setIsAddingNew(false);
                  }}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs text-left">
                {/* Title */}
                <div>
                  <label className="block text-stone-300 font-medium mb-1.5">
                    承诺主题 / 标题
                  </label>
                  <input
                    type="text"
                    required
                    value={formVow.title}
                    onChange={(e) =>
                      setFormVow((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="例如：永远倾听与理解、下班顺路接你回家"
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500 text-sm"
                  />
                </div>

                {/* Icon selector */}
                <div>
                  <label className="block text-stone-300 font-medium mb-1.5">
                    承诺象征图标
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() =>
                          setFormVow((p) => ({ ...p, iconName: opt.name }))
                        }
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          formVow.iconName === opt.name
                            ? 'bg-rose-950/70 border-rose-500 text-rose-100 shadow-md'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        {getIcon(opt.name)}
                        <span className="text-[10px]">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-stone-300 font-medium mb-1.5">
                    详细承诺誓词
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formVow.description}
                    onChange={(e) =>
                      setFormVow((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="写下你愿意在余生日常中为她践行的诺言细节..."
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-rose-500 leading-relaxed font-sans text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                  {!isAddingNew ? (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteVow(formVow.id, e)}
                      className="flex items-center gap-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>删除此承诺</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVow(null);
                        setIsAddingNew(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>保存承诺</span>
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
