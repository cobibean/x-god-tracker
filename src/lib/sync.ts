import { checklistStore, actionStore, scoreStore } from '@/lib/store';

const getToday = () => new Date().toISOString().split('T')[0];

export function collectLocal() {
  return {
    date: getToday(),
    checklist: checklistStore.get(),
    actions: actionStore.get(),
    score: scoreStore.getTodayScore(),
  };
}

export async function syncToday() {
  try {
    const payload = collectLocal();
    await fetch('/api/data/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore
  }
}

export function registerAutoSync() {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { syncToday(); }, 1000);
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storageUpdated', debounced);
    // periodic sync
    setInterval(syncToday, 5 * 60 * 1000);
  }
}


