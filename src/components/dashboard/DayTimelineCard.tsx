'use client';

import { useMemo, useState } from 'react';
import { useConfigType } from '@/lib/config-context';
import { RhythmBlock } from '@/lib/config-schemas';
import { BentoCard } from '@/components/ui/bento-grid';
import { GripVertical } from 'lucide-react';

type ScheduledItem = {
  id: string;
  blockId: string;
  startHour: number; // 0-23
};

const STORAGE_KEY = 'xgod-day-timeline-v1';

export function DayTimelineCard() {
  const rhythm = useConfigType('rhythm');
  const [items, setItems] = useState<ScheduledItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [openHour, setOpenHour] = useState<number | null>(null);

  const hours = useMemo(()=>Array.from({length: 14}, (_,i)=> i+6),[]); // 6am-7pm
  const blocks = useMemo(()=> (rhythm.blocks||[])
    .filter(b=> b && typeof b.id === 'string' && b.name && b.emoji)
    .sort((a,b)=> (a.order??0)-(b.order??0))
  , [rhythm.blocks]);

  const save = (next: ScheduledItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const schedule = (block: RhythmBlock, hour: number) => {
    const entry: ScheduledItem = { id: `sched_${Date.now()}`, blockId: block.id, startHour: hour };
    save([...items, entry]);
    setOpenHour(null);
  };

  const remove = (id: string) => save(items.filter(i=>i.id!==id));

  const getBlock = (id: string) => blocks.find(b=>b.id===id);

  return (
    <BentoCard
      name="Day Timeline"
      className="col-span-1 row-span-1"
      background={<div/>}
      Icon={() => <div/>}
      description="Roughly plan your day by placing blocks on hours."
      href="#"
      cta=""
    >
      <div className="p-4 space-y-4" onClick={() => setOpenHour(null)}>
        {/* Block palette */}
        <div className="flex gap-2 overflow-x-auto">
          {blocks.map(b=> (
            <div key={b.id} className="px-2 py-1 text-xs rounded border border-border bg-muted text-muted-foreground flex items-center gap-1">
              <span className="text-base">{b.emoji}</span>
              <span className="font-medium">{b.name}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 gap-2">
          {hours.map(h=> (
            <div key={h} className="relative flex items-center gap-3 p-2 rounded border border-border" onClick={(e)=>e.stopPropagation()}>
              <div className="w-14 text-xs text-muted-foreground">{`${h}:00`}</div>
              <div className="flex-1 flex gap-2 flex-wrap">
                {items.filter(i=>i.startHour===h).map(it=>{
                  const b = getBlock(it.blockId);
                  if (!b) return null;
                  return (
                    <div key={it.id} className="px-2 py-1 text-xs rounded border border-border bg-card flex items-center gap-2">
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                      <span className="text-base">{b.emoji}</span>
                      <span className="font-medium">{b.name}</span>
                      <button onClick={()=>remove(it.id)} className="text-muted-foreground hover:text-destructive text-[10px]">remove</button>
                    </div>
                  );
                })}
              </div>
              {/* Quick schedule dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenHour(openHour === h ? null : h)}
                  className="text-xs px-2 py-1 border border-border rounded bg-muted text-muted-foreground"
                >
                  + add
                </button>
                {openHour === h && (
                <div className="absolute right-0 mt-1 z-20 bg-card border border-border rounded shadow-lg p-2 max-h-48 overflow-auto">
                  {blocks.length === 0 && (
                    <div className="text-xs text-muted-foreground">No blocks configured</div>
                  )}
                  {blocks.map(b=> (
                    <button
                      key={b.id}
                      onClick={()=>schedule(b,h)}
                      className="w-full text-left text-xs px-2 py-1 rounded hover:bg-accent flex items-center gap-2"
                    >
                      <span className="text-base">{b.emoji}</span>
                      <span>{b.name}</span>
                    </button>
                  ))}
                </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">Tip: Use the timer above to run the next scheduled block.</div>
      </div>
    </BentoCard>
  );
}

export default DayTimelineCard;


