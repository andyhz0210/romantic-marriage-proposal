import type { ProposalConfig } from '../types';

const LEGACY_KEY = 'romantic_proposal_config_v1';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('romantic-proposal', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadDraft(): Promise<ProposalConfig | null> {
  const db = await openDatabase();
  try {
    const saved = await new Promise<ProposalConfig | undefined>((resolve, reject) => {
      const request = db.transaction('drafts', 'readonly').objectStore('drafts').get('current');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (saved) return saved;
    const legacy = localStorage.getItem(LEGACY_KEY);
    return legacy ? JSON.parse(legacy) : null;
  } finally { db.close(); }
}

let pending: Promise<void> = Promise.resolve();
export function saveDraft(config: ProposalConfig): Promise<void> {
  const snapshot = structuredClone(config);
  const next = pending.catch(() => {}).then(async () => {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('drafts', 'readwrite');
        transaction.objectStore('drafts').put(snapshot, 'current');
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      try { localStorage.removeItem(LEGACY_KEY); } catch { /* IndexedDB is already saved. */ }
    } finally { db.close(); }
  });
  pending = next;
  return next;
}
