import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { DEFAULT_CONFIG, type ProposalConfig } from './types';
import { ProposalPage } from './components/ProposalPage';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { loadDraft, saveDraft } from './utils/drafts';

export default function App() {
  const [config, setConfig] = useState<ProposalConfig>(DEFAULT_CONFIG);
  const [ready, setReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [storageError, setStorageError] = useState('');
  const revision = useRef(0);

  useEffect(() => {
    let alive = true;
    loadDraft().then((saved) => {
      if (!alive || !saved) return;
      if (!Array.isArray(saved.milestones) || !Array.isArray(saved.vows)) throw new Error('Invalid draft');
      const loaded = { ...DEFAULT_CONFIG, ...saved };
      setConfig(loaded);
      return saveDraft(loaded);
    }).catch(() => {
      if (alive) setStorageError('无法读取或保存本地草稿。当前仍可制作和导出，请在离开页面前下载成品。');
    }).finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const handleSaveConfig = (next: ProposalConfig) => {
    setConfig(next);
    const current = ++revision.current;
    saveDraft(next).then(() => {
      if (current === revision.current) setStorageError('');
    }).catch(() => {
      if (current === revision.current) setStorageError('本地草稿保存失败（存储空间不足或浏览器限制）。请先导出成品，避免刷新后丢失内容。');
    });
  };

  if (!ready) return <div className="min-h-screen bg-[#080509] text-rose-200 flex items-center justify-center">正在读取你的求婚草稿…</div>;
  return <>
    <ProposalPage config={config} editable onConfigChange={handleSaveConfig} onOpenSettings={() => setShowSettings(true)} onOpenExport={() => setShowExport(true)} />
    {storageError && <div role="alert" className="fixed bottom-4 left-4 right-4 z-40 rounded-xl bg-amber-950 border border-amber-600 p-4 text-sm text-amber-100">{storageError}</div>}
    <AnimatePresence>
      {showSettings && <SettingsModal key="settings" config={config} onSave={handleSaveConfig} onClose={() => setShowSettings(false)} />}
      {showExport && <ExportModal key="export" config={config} onClose={() => setShowExport(false)} />}
    </AnimatePresence>
  </>;
}
