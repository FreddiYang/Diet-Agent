import React from 'react';
import { CheckCircle2, AlertTriangle, TrendingUp, Sparkles, Award, ListChecks } from 'lucide-react';
import { DailyAnalysis, NutritionalGoals } from '../types';

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
      <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center shadow-xs">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 animate-pulse mb-3">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-stone-900">
          Auditing Daily Food Consumption...
        </h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
          Evaluating glycemic index, macro ratios, saturated fats, sodium load, and matching with healthier culinary swaps.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center shadow-xs">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 text-stone-500 mb-3">
          <Award className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">
          Ready to Analyze Your Daily Nutrition
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
          Click below to evaluate your meals against your <strong className="text-stone-800">{goals.goalName}</strong> goal and discover personalized healthier swaps.
        </p>
        <button
          onClick={onRefreshAnalysis}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          Run Consumption Analysis
        </button>
      </div>
    );
  }

  const score = analysis.overallScore;
  const scoreColor =
    score >= 85 ? 'text-emerald-600' : score >= 70 ? 'text-teal-600' : score >= 55 ? 'text-amber-600' : 'text-rose-600';
  const scoreBg =
    score >= 85 ? 'bg-emerald-50' : score >= 70 ? 'bg-teal-50' : score >= 55 ? 'bg-amber-50' : 'bg-rose-50';

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header with Score Ring and Executive Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div className="flex items-start gap-3.5">
          {/* Health Index Score Badge */}
          <div className={`w-16 h-16 rounded-2xl ${scoreBg} border border-stone-200 flex flex-col items-center justify-center shrink-0`}>
            <span className={`text-2xl font-extrabold ${scoreColor} leading-none`}>
              {analysis.overallScore}
            </span>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">
              Grade {analysis.healthGrade}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                Daily Nutritional Audit
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Goal: {goals.goalName}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed max-w-2xl">
              {analysis.summary}
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshAnalysis}
          className="self-start sm:self-center px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors shrink-0"
        >
          Re-Analyze
        </button>
      </div>

      {/* Goal Alignment Insight Banner */}
      {analysis.goalAlignmentInsight && (
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5 text-xs text-stone-700">
          <TrendingUp className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
          <div>
            <strong className="font-semibold text-stone-900">Goal Alignment Focus: </strong>
            <span>{analysis.goalAlignmentInsight}</span>
          </div>
        </div>
      )}

      {/* Strengths and Concerns Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-200/60">
          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Nutritional Strengths</span>
          </h4>
          <ul className="space-y-2 text-xs text-stone-700">
            {analysis.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas of Concern */}
        <div className="bg-rose-50/40 rounded-xl p-4 border border-rose-200/60">
          <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Areas of Nutritional Concern</span>
          </h4>
          <ul className="space-y-2 text-xs text-stone-700">
            {analysis.areasOfConcern.map((c, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Daily Tactical Action Plan */}
      {analysis.dailyActionPlan && analysis.dailyActionPlan.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <ListChecks className="w-4 h-4 text-emerald-700" />
            <span>Recommended Tactical Adjustments</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {analysis.dailyActionPlan.map((action, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs text-stone-700 flex items-start gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="leading-snug">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
