'use client';

import { useEffect, useMemo, useState } from 'react';
import { useConfigType } from '@/lib/config-context';
// import { ChecklistTask } from '@/lib/config-schemas';
import { BentoCard } from '@/components/ui/bento-grid';
import { Plus, CalendarDays, CopyPlus } from 'lucide-react';

type Template = {
  id: string;
  name: string;
  taskIds: string[];
};

const TEMPLATES_KEY = 'xgod-templates-v1';
const TODAY_TEMPLATE_KEY = 'xgod-today-template';

export function TodaysPlanCard() {
  const checklist = useConfigType('checklist');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [todayTemplateId, setTodayTemplateId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [adhoc, setAdhoc] = useState<{id:string;text:string}[]>([]);

  const enabledTasks = useMemo(() => checklist.tasks.filter(t => t.enabled).sort((a,b)=>a.order-b.order), [checklist.tasks]);

  // Load templates and today selection
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TEMPLATES_KEY);
      if (saved) setTemplates(JSON.parse(saved));
      const today = localStorage.getItem(TODAY_TEMPLATE_KEY);
      if (today) setTodayTemplateId(today);
      const adh = localStorage.getItem('xgod-adhoc-tasks');
      if (adh) setAdhoc(JSON.parse(adh));
    } catch {}
    const onUpdate = () => {
      try {
        const adh = localStorage.getItem('xgod-adhoc-tasks');
        setAdhoc(adh ? JSON.parse(adh) : []);
      } catch {}
    };
    window.addEventListener('storageUpdated', onUpdate);
    return () => window.removeEventListener('storageUpdated', onUpdate);
  }, []);

  const saveTemplates = (next: Template[]) => {
    setTemplates(next);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  };

  const applyTemplate = (id: string) => {
    setTodayTemplateId(id);
    localStorage.setItem(TODAY_TEMPLATE_KEY, id);
    // No destructive changes; ChecklistCard filters by enabled, so we rely on mental focus + optional future filter
    window.dispatchEvent(new Event('storageUpdated'));
  };

  const createTemplateFromCurrent = () => {
    const name = prompt('Template name? (e.g., Outreach Day)');
    if (!name) return;
    const taskIds = enabledTasks.map(t => t.id);
    const next: Template = { id: `tpl_${Date.now()}`, name, taskIds };
    saveTemplates([...(templates||[]), next]);
  };

  const addAdHocTaskForToday = () => {
    const text = newTaskText.trim();
    if (!text) return;
    // Store ad-hoc tasks in localStorage and picked up by ChecklistCard is out of scope; display locally as reminder
    const key = 'xgod-adhoc-tasks';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...current, { id: `adhoc_${Date.now()}`, text }]))
    setNewTaskText('');
    window.dispatchEvent(new Event('storageUpdated'));
  };

  const removeAdhoc = (id: string) => {
    const key = 'xgod-adhoc-tasks';
    const current: {id:string;text:string}[] = JSON.parse(localStorage.getItem(key) || '[]');
    const next = current.filter(t => t.id !== id);
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event('storageUpdated'));
  };

  return (
    <BentoCard
      name={"Today\'s Plan"}
      className="col-span-1 row-span-1"
      background={<div/>}
      Icon={() => <div/>}
      description="Switch modes, add ad‑hoc tasks, and save your setup as a template."
      href="#"
      cta=""
    >
      <div className="p-4 space-y-4">
        {/* Template Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={createTemplateFromCurrent}
            className="px-2 py-1 text-xs bg-primary/10 text-primary rounded border border-primary/20 hover:bg-primary/20 flex items-center gap-1"
          >
            <CopyPlus className="w-3 h-3" /> Save as Template
          </button>
          {templates.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl.id)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${todayTemplateId===tpl.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-accent'}`}
            >
              {tpl.name}
            </button>
          ))}
        </div>

        {/* Quick Ad‑hoc Task */}
        <div className="flex items-center gap-2">
          <input
            value={newTaskText}
            onChange={e=>setNewTaskText(e.target.value)}
            placeholder="Add ad‑hoc task for today"
            className="flex-1 px-2 py-1 text-sm rounded border border-border bg-background"
          />
          <button onClick={addAdHocTaskForToday} className="px-2 py-1 text-xs bg-muted text-muted-foreground border border-border rounded hover:bg-accent flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        {/* Ad‑hoc Task List */}
        {adhoc.length > 0 && (
          <div className="space-y-2">
            {adhoc.map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm border border-border rounded px-2 py-1">
                <span className="truncate mr-2">{t.text}</span>
                <button onClick={() => removeAdhoc(t.id)} className="text-xs text-muted-foreground hover:text-destructive">remove</button>
              </div>
            ))}
          </div>
        )}

        {/* Hint */}
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <CalendarDays className="w-3 h-3" />
          Use templates to switch your day fast. We&apos;ll add filtering and scheduling next.
        </div>
      </div>
    </BentoCard>
  );
}

export default TodaysPlanCard;


