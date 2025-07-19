'use client';

import { BentoCard } from "@/components/ui/bento-grid";
import { useEffect, useState } from "react";

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
    const labels = getPast7Days();

    useEffect(() => {
        // Mock data for now - in the future, load from localStorage history
        setScores([5, 7, 8, 6, 9, 7, 10]);
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