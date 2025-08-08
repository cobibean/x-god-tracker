'use client';

import { useEffect, useState } from 'react';
import { scoreStore } from '@/lib/store';

function getWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7; // 1..7
  if (day !== 1) d.setUTCDate(d.getUTCDate() - day + 1);
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const dayStr = d.getUTCDate().toString().padStart(2, '0');
  return `${y}-${m}-${dayStr}`; // Monday start
}

export function WeeklyRecapModal() {
  const [open, setOpen] = useState(false);

  const [average, setAverage] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      const wk = getWeekKey();
      const dismissed = localStorage.getItem('xgod-recap-dismissed-week');
      if (dismissed !== wk) setOpen(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const history = scoreStore.getHistory(7);
      const scores = Object.values(history);
      const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0) / scores.length) : 0;
      const max = scores.length ? Math.max(...scores) : 0;
      setAverage(avg);
      setBest(max);
    } catch {}
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem('xgod-recap-dismissed-week', getWeekKey());
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl">
        <div className="mb-3 text-lg font-bold text-card-foreground">Weekly Recap</div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>
            7‑day average score: <span className="font-semibold text-card-foreground">{average}/10</span>
          </div>
          <div>
            Best day: <span className="font-semibold text-card-foreground">{best}/10</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={dismiss} className="px-3 py-1.5 rounded border border-border bg-muted text-muted-foreground hover:bg-accent text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

export default WeeklyRecapModal;


