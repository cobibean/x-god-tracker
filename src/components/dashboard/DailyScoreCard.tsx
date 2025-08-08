'use client';

import { BentoCard } from "@/components/ui/bento-grid";
import { useEffect, useState } from "react";
import { scoreStore } from "@/lib/store";
import { useConfigType } from "@/lib/config-context";
//
import { Celebration } from "./Celebration";

// Compute score with weights from scoring config
function useScoring() {
  const scoring = useConfigType('scoring');
  return scoring;
}

export function DailyScoreCard() {
    const [score, setScore] = useState(0);
    const scoring = useScoring();

    useEffect(() => {
        const handleStorageChange = () => {
            // Derive a simple 0-10 score using central scoreStore for now
            // Future: apply scoring.rules weights to a richer calculation
            const s = scoreStore.getTodayScore();
            // Normalize to 0-10 if needed; current scoreStore already aims at 10-scale
            setScore(Math.max(0, Math.min(10, Math.round(s))));
        };

        // Listen for custom event
        window.addEventListener('storageUpdated', handleStorageChange);
        
        // Initial calculation
        handleStorageChange();

        return () => {
            window.removeEventListener('storageUpdated', handleStorageChange);
        };
    }, []);

    const getScoreColor = (s: number) => {
        const { thresholds } = scoring;
        if (s >= thresholds.excellent) return 'text-emerald-500';
        if (s >= thresholds.good) return 'text-yellow-500';
        if (s >= thresholds.okay) return 'text-orange-500';
        return 'text-red-500';
    };

    const getProgressPercentage = (score: number) => (score / 10) * 100;

    return (
        <BentoCard
            name="Daily Micro Score"
            className="col-span-1 row-span-1"
            background={<div/>}
            Icon={() => <div/>}
            description={`Track your execution. ${score >= scoring.thresholds.excellent ? scoring.messages.excellent : score >= scoring.thresholds.good ? scoring.messages.good : score >= scoring.thresholds.okay ? scoring.messages.okay : scoring.messages.poor}`}
            href="/playbook"
            cta="Learn More"
        >
            <div className="flex h-full flex-col items-center justify-center p-6 pt-0">
                <Celebration trigger={score >= scoring.thresholds.excellent} />
                <div className="relative mb-4">
                    <div className={`text-7xl font-bold tracking-tight ${getScoreColor(score)} transition-colors`}>
                        {score}
                    </div>
                    <div className="text-2xl font-medium text-muted-foreground absolute -right-8 top-4">
                        /10
                    </div>
                </div>
                
                <div className="w-full max-w-32">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ease-out ${
                                score >= 8 ? 'bg-emerald-500' :
                                score >= 6 ? 'bg-yellow-500' :
                                score >= 4 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${getProgressPercentage(score)}%` }}
                        />
                    </div>
                </div>
            </div>
        </BentoCard>
    );
} 