'use client';

import { useEffect, useState } from 'react';
import { scoreStore } from '@/lib/store';

function dateKey(d: Date) { return d.toISOString().split('T')[0]; }

export function StreakBadge() {
  const [todayKey, setTodayKey] = useState(dateKey(new Date()));
  const [streak, setStreak] = useState(0);

  const compute = () => {
    const history = scoreStore.getHistory();
    let s = 0;
    const d = new Date();
    // walk back until a day is missing
    while (true) {
      const key = dateKey(d);
      if (history[key] && history[key] > 0) { s += 1; } else { break; }
      d.setDate(d.getDate() - 1);
    }
    setStreak(s);
    const next = dateKey(new Date());
    if (next !== todayKey) setTodayKey(next);
  };

  useEffect(() => {
    compute();
    const onUp = () => compute();
    window.addEventListener('storageUpdated', onUp);
    return () => window.removeEventListener('storageUpdated', onUp);
    // compute uses stable functions and local state; safe to ignore exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (streak <= 0) return null;
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-xs">
      <span>🔥</span>
      <span className="font-medium">{streak} day{streak>1?'s':''} streak</span>
    </div>
  );
}

export default StreakBadge;


