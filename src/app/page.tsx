import { DailyChecklistCard } from "@/components/dashboard/DailyChecklistCard";
import { OperatingRhythmCard } from "@/components/dashboard/OperatingRhythmCard";
import { ActionLoggerCard } from "@/components/dashboard/ActionLoggerCard";
import { DailyScoreCard } from "@/components/dashboard/DailyScoreCard";
import { PlaybookReferenceCard } from "@/components/dashboard/PlaybookReferenceCard";
import { ScoreChartCard } from "@/components/dashboard/ScoreChartCard";
import { TodaysPlanCard } from "@/components/dashboard/TodaysPlanCard";
import { WeeklyRecapModal } from "@/components/dashboard/WeeklyRecapModal";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            X God Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Your daily execution dashboard for building distribution relationships
          </p>
        </div>
        
        {/* Admin Link */}
        <Link 
          href="/admin"
          className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Admin Panel</span>
        </Link>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 auto-rows-min">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Today's Plan + Checklist */}
          <TodaysPlanCard />
          <DailyChecklistCard />
          
          {/* Two column sub-grid for smaller cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DailyScoreCard />
            <PlaybookReferenceCard />
          </div>
        </div>

        {/* Right Column - Secondary Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operating Rhythm */}
          <OperatingRhythmCard />
          
          {/* Action Logger */}
          <ActionLoggerCard />
          
          {/* Score Chart */}
          <ScoreChartCard />
        </div>
      </div>
      {/* Weekly Recap */}
      <WeeklyRecapModal />
    </div>
  );
} 