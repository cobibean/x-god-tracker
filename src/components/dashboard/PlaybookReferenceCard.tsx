'use client';

import { BentoCard } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import Link from "next/link";

const playbookSections = [
    { title: 'Daily Checklist', emoji: '✅', description: 'Core tasks' },
    { title: 'Operating Rhythm', emoji: '⏰', description: 'Time blocks' },
    { title: 'Scoring System', emoji: '📊', description: 'Track progress' },
    { title: 'DM Templates', emoji: '💬', description: 'Value messages' },
];

export function PlaybookReferenceCard() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <BentoCard
            name="Playbook Reference"
            className={`col-span-1 transition-all duration-300 ${isExpanded ? 'row-span-2' : 'row-span-1'}`}
            background={<div/>}
            Icon={() => <div/>}
            description="Quick access to your complete distribution playbook and strategy guides."
            href="/playbook"
            cta="Read Full Playbook"
        >
            <div className="h-full p-6 pt-0 flex flex-col">
                {/* Always visible header with expand/collapse button */}
                <div className="flex items-center justify-between mb-4">
                    <Button
                        onClick={() => setIsExpanded(!isExpanded)}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <span className="text-sm font-medium">
                            {isExpanded ? 'Hide Sections' : 'Show Sections'}
                        </span>
                        {isExpanded ? (
                            <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Expandable content */}
                {isExpanded && (
                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {playbookSections.map((section, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                                <div className="text-2xl">{section.emoji}</div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-foreground">
                                        {section.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {section.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Always visible footer */}
                <div className={`${isExpanded ? 'mt-4 pt-4 border-t border-border' : 'flex-1 flex items-center justify-center'}`}>
                    <Button asChild className="w-full" variant="outline">
                        <Link href="/playbook">
                            Open Full Playbook →
                        </Link>
                    </Button>
                </div>
            </div>
        </BentoCard>
    );
} 