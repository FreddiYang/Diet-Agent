import React from 'react';
import { Sparkles, Utensils, SlidersHorizontal, RefreshCw, BookmarkCheck } from 'lucide-react';
import { GoalPresetType, NutritionalGoals } from '../types';
import { SAMPLE_DAYS } from '../data/presets';

interface NavbarProps {
  currentGoal: NutritionalGoals;
  onOpenGoalsModal: () => void;
  onLoadSample: (sampleIndex: number) => void;
  onResetLog: () => void;
  isAnalyzing: boolean;
  onTriggerAnalysis: () => void;
  itemCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentGoal,
  onOpenGoalsModal,
  onLoadSample,
  onResetLog,
  isAnalyzing,
  onTriggerAnalysis,
  itemCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-900 tracking-tight leading-none">
                Food & Nutrition Analyzer
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Smart Swaps
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Daily Consumption Audit & Healthy Alternatives
            </p>
          </div>
        </div>

        {/* Goal Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Goal Quick Switcher */}
          <button
            id="open-goals-button"
            onClick={onOpenGoalsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200 transition-colors"
            title="Adjust Nutritional Goals & Macro Targets"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline text-stone-500">Goal:</span>
            <span className="font-semibold text-emerald-800 max-w-[140px] truncate">{currentGoal.goalName}</span>
          </button>

          {/* Sample Preset Selector */}
          <div className="relative group">
            <button
              id="presets-menu-button"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent transition-colors"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Load Sample Day</span>
            </button>
            <div className="absolute right-0 mt-1 w-64 p-2 bg-white rounded-xl shadow-lg border border-stone-200 hidden group-hover:block z-40">
              <p className="px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Try Example Logs
              </p>
              {SAMPLE_DAYS.map((sample, idx) => (
                <button
                  key={sample.name}
                  onClick={() => onLoadSample(idx)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50 text-xs text-stone-700 hover:text-emerald-900 transition-colors block"
                >
                  <div className="font-medium">{sample.name}</div>
                  <div className="text-[11px] text-stone-400 line-clamp-1">{sample.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            id="reset-log-button"
            onClick={onResetLog}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            title="Clear current food log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Primary Analyze CTA */}
          <button
            id="run-analysis-button"
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing || itemCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Nutrition'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
