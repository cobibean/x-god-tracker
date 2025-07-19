'use client';

import { BentoCard } from "@/components/ui/bento-grid";
import { useEffect, useState } from "react";

// This would eventually be moved to a central store/context
const calculateScore = (checked: Record<string, boolean>, actions: Record<string, number>) => {
    let score = 0;
    if (checked.warmup) score += 1;
    if (checked.anchor) score += 1;
    if (checked.velocity) score += 1;
    if (actions.newEngagersLogged > 0) score += 1;
    if (actions.sequencesProgressed > 0) score += 1;
    if (actions.peopleAdvanced > 0) score += 1;
    if (actions.valueDmsSent >= 5) score += 2;
    if (actions.newLeadsAdded >= 5) score += 2;
    return score;
}

export function DailyScoreCard() {
    const [score, setScore] = useState(0);

    useEffect(() => {
        const handleStorageChange = () => {
            const checklistState = JSON.parse(localStorage.getItem('dailyChecklistState') || '{}');
            const actionState = JSON.parse(localStorage.getItem('actionLoggerState') || '{}');
            setScore(calculateScore(checklistState, actionState));
        };

        // Listen for custom event
        window.addEventListener('storageUpdated', handleStorageChange);
        
        // Initial calculation
        handleStorageChange();

        return () => {
            window.removeEventListener('storageUpdated', handleStorageChange);
        };
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-emerald-500';
        if (score >= 6) return 'text-yellow-500';
        if (score >= 4) return 'text-orange-500';
        return 'text-red-500';
    };

    const getProgressPercentage = (score: number) => (score / 10) * 100;

    return (
        <BentoCard
            name="Daily Micro Score"
            className="col-span-1 row-span-1"
            background={<div/>}
            Icon={() => <div/>}
            description={`Track your execution. ${score >= 8 ? 'Excellent!' : score >= 6 ? 'Good progress' : score >= 4 ? 'Keep pushing' : 'Let\'s improve'}`}
            href="/playbook"
            cta="Learn More"
        >
            <div className="flex h-full flex-col items-center justify-center p-6 pt-0">
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