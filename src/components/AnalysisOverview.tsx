import React from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { DailyAnalysis, NutritionalGoals } from '../types';
import { formatNum, sub2 } from '../utils/formatters';

interface AnalysisOverviewProps {
  analysis: DailyAnalysis | null;
  goals: NutritionalGoals;
  isAnalyzing: boolean;
  onRefreshAnalysis: () => void;
}

export const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({
  analysis,
  goals,
  isAnalyzing,
  onRefreshAnalysis,
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 text-center shadow-xs">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 animate-pulse mb-2">
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-stone-700">Updating Nutritional Audit...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-5 text-center shadow-xs">
        <p className="text-xs text-stone-500 mb-2">
          Audit not generated yet for <strong className="text-stone-700">{goals.goalName}</strong>.
        </p>
        <button
          onClick={onRefreshAnalysis}
          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          Run Audit
        </button>
      </div>
    );
  }

  const totals = analysis.macroTotals;
  const isOverCal = goals.targetCalories > 0 && totals.calories > goals.targetCalories;
  const isOverSodium = goals.maxSodium > 0 && totals.sodium > goals.maxSodium;
  const isOverSugar = goals.maxSugar > 0 && totals.sugar > goals.maxSugar;
  const hasSwaps = analysis.alternatives && analysis.alternatives.length > 0;

  const score = analysis.overallScore;
  const scoreColor =
    score >= 85
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : score >= 70
      ? 'text-teal-700 bg-teal-50 border-teal-200'
      : score >= 55
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* 1. Ultra-Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          {/* Compact Score Badge */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${scoreColor}`}>
            <span className="text-base font-black leading-none">{analysis.overallScore}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Grade {analysis.healthGrade}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900">Daily Nutritional Audit</h3>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                {goals.goalName}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {!isOverCal && !isOverSodium && !isOverSugar
                ? 'All clear! Your daily intake is currently below your target limit.'
                : isOverCal
                ? `${formatNum(sub2(totals.calories, goals.targetCalories))} kcal over daily target limit.`
                : 'Intake exceeds sodium or sugar limits.'}
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshAnalysis}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Re-Analyze</span>
        </button>
      </div>

      {/* 2. Instant-Glance 4 Macro Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Calories */}
        <div
          className={`p-2.5 rounded-xl border text-center ${
            isOverCal ? 'bg-amber-50/50 border-amber-200' : 'bg-stone-50 border-stone-200/70'
          }`}
        >
          <div className="text-[10px] font-bold uppercase text-stone-400">Calories</div>
          <div className="text-sm font-bold text-stone-900">
            {formatNum(totals.calories)}{' '}
            <span className="text-[11px] font-normal text-stone-500">
              / {formatNum(goals.targetCalories)}
            </span>
          </div>
          <div className="text-[10px] font-bold mt-0.5">
            {isOverCal ? (
              <span className="text-amber-700">+{formatNum(sub2(totals.calories, goals.targetCalories))} over</span>
            ) : (
              <span className="text-emerald-700">✓ In Target</span>
            )}
          </div>
        </div>

        {/* Protein */}
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
          <div className="text-[10px] font-bold uppercase text-stone-400">Protein</div>
          <div className="text-sm font-bold text-stone-900">
            {formatNum(totals.protein)}g{' '}
            <span className="text-[11px] font-normal text-stone-500">
              / {formatNum(goals.targetProtein)}g
            </span>
          </div>
          <div className="text-[10px] font-bold mt-0.5">
            {totals.protein >= goals.targetProtein ? (
              <span className="text-emerald-700">✓ Goal Met</span>
            ) : (
              <span className="text-stone-500">{formatNum(sub2(goals.targetProtein, totals.protein))}g to goal</span>
            )}
          </div>
        </div>

        {/* Sodium */}
        <div
          className={`p-2.5 rounded-xl border text-center ${
            isOverSodium ? 'bg-rose-50/50 border-rose-200' : 'bg-stone-50 border-stone-200/70'
          }`}
        >
          <div className="text-[10px] font-bold uppercase text-stone-400">Sodium</div>
          <div className="text-sm font-bold text-stone-900">
            {formatNum(totals.sodium)}mg{' '}
            <span className="text-[11px] font-normal text-stone-500">
              / {formatNum(goals.maxSodium)}mg
            </span>
          </div>
          <div className="text-[10px] font-bold mt-0.5">
            {isOverSodium ? (
              <span className="text-rose-700">⚠️ Limit Exceeded</span>
            ) : (
              <span className="text-emerald-700">✓ Controlled</span>
            )}
          </div>
        </div>

        {/* Sugar */}
        <div
          className={`p-2.5 rounded-xl border text-center ${
            isOverSugar ? 'bg-amber-50/50 border-amber-200' : 'bg-stone-50 border-stone-200/70'
          }`}
        >
          <div className="text-[10px] font-bold uppercase text-stone-400">Sugar</div>
          <div className="text-sm font-bold text-stone-900">
            {formatNum(totals.sugar)}g{' '}
            <span className="text-[11px] font-normal text-stone-500">
              / {formatNum(goals.maxSugar)}g
            </span>
          </div>
          <div className="text-[10px] font-bold mt-0.5">
            {isOverSugar ? (
              <span className="text-amber-700">⚠️ Limit Exceeded</span>
            ) : (
              <span className="text-emerald-700">✓ Controlled</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Single-line Key Status Pill if Swaps Exist */}
      {hasSwaps && (
        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              {analysis.alternatives.length === 1
                ? '1 smart swap recommended below to bring your daily total below your target limit.'
                : `${analysis.alternatives.length} smart swaps recommended below to bring your daily total below your target limit.`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
