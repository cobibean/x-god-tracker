'use client';

import { BentoCard } from "@/components/ui/bento-grid";
import { useEffect, useState } from "react";
import { scoreStore } from "@/lib/store";
import { useMemo } from "react";

const getPast7Days = () => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
};

export function ScoreChartCard() {
    const [scores, setScores] = useState<number[]>([]);
    const labels = useMemo(() => getPast7Days(), []);

    useEffect(() => {
        const loadLocal = () => {
            const history = scoreStore.getHistory(7);
            const vals = Object.values(history).reverse();
            if (vals.length === 0) {
                setScores([0,0,0,0,0,0,0]);
            } else {
                const padded = [...Array(Math.max(0, 7 - vals.length)).fill(0), ...vals];
                setScores(padded.slice(-7));
            }
        };

        const tryFetchRemote = async () => {
            try {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 6);
                const d = (x: Date) => x.toISOString().split('T')[0];
                const res = await fetch(`/api/data/range?start=${d(start)}&end=${d(end)}`);
                if (res.ok) {
                    const json = await res.json();
                    const vals = (json.data || []).map((r: any) => Number(r.score) || 0);
                    if (Array.isArray(vals) && vals.length) {
                        setScores(vals);
                        return;
                    }
                }
            } catch {}
            // Fallback to local if remote fails
            loadLocal();
        };

        tryFetchRemote();
        window.addEventListener('storageUpdated', loadLocal);
        return () => window.removeEventListener('storageUpdated', loadLocal);
    }, []);

    const getBarColor = (score: number) => {
        if (score >= 8) return 'bg-emerald-500';
        if (score >= 6) return 'bg-yellow-500';
        if (score >= 4) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const maxScore = 10;
    const average = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return (
        <BentoCard
            name="7-Day Score History"
            className="col-span-1 row-span-1"
            background={<div/>}
            Icon={() => <div/>}
            description={`Weekly average: ${average}/10. Track your consistency over time.`}
            href="/playbook"
            cta="View Details"
        >
            <div className="h-full p-6 pt-0 flex flex-col">
                <div className="flex-1 flex items-end justify-between gap-1 mb-4 min-h-0">
                    {scores.map((score, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                            <div className="relative w-full max-w-6 bg-muted/30 rounded-sm overflow-hidden" style={{ height: '80px' }}>
                                <div 
                                    className={`absolute bottom-0 w-full rounded-sm transition-all duration-500 ease-out ${getBarColor(score)}`}
                                    style={{ height: `${(score / maxScore) * 100}%` }}
                                />
                            </div>
                            <div className="text-xs font-medium text-muted-foreground text-center">
                                {labels[i]}
                            </div>
                            <div className="text-xs font-bold text-foreground">
                                {score}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BentoCard>
    );
} 