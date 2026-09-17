import React from 'react';
import { Flame, Beef, Wheat, Droplets, Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { FoodItem, NutritionalGoals } from '../types';
import { calculateTotals } from '../utils/nutritionEngine';
import { formatNum, roundToTwo, sub2 } from '../utils/formatters';

interface DailySummaryBarProps {
  items: FoodItem[];
  goals: NutritionalGoals;
}

export const DailySummaryBar: React.FC<DailySummaryBarProps> = ({ items, goals }) => {
  const totals = calculateTotals(items);

  const calPct = goals.targetCalories > 0 ? Math.min(100, Math.round((totals.calories / goals.targetCalories) * 100)) : 0;
  const proteinPct = goals.targetProtein > 0 ? Math.min(100, Math.round((totals.protein / goals.targetProtein) * 100)) : 0;
  const carbsPct = goals.targetCarbs > 0 ? Math.min(100, Math.round((totals.carbs / goals.targetCarbs) * 100)) : 0;
  const fatPct = goals.targetFat > 0 ? Math.min(100, Math.round((totals.fat / goals.targetFat) * 100)) : 0;
  const fiberPct = goals.targetFiber > 0 ? Math.min(100, Math.round((totals.fiber / goals.targetFiber) * 100)) : 0;

  const isSodiumExcess = goals.maxSodium > 0 && totals.sodium > goals.maxSodium;
  const isSugarExcess = goals.maxSugar > 0 && totals.sugar > goals.maxSugar;
  const calDiff = sub2(totals.calories, goals.targetCalories);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Daily Macro & Calorie Breakdown
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
              {items.length} logged {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time consumption tracking calibrated against your <span className="font-semibold text-stone-700">{goals.goalName}</span> targets.
          </p>
        </div>

        {/* Calorie Pill Status */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="text-right">
            <div className="text-xs text-stone-500 font-medium">Daily Energy Intake</div>
            <div className="text-base font-extrabold text-stone-900">
              {formatNum(totals.calories)} <span className="text-xs font-normal text-stone-400">/ {formatNum(goals.targetCalories)} kcal</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
            calDiff > 200
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : calDiff < -300
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {calDiff > 0 ? `+${formatNum(calDiff)} kcal over` : `${formatNum(Math.abs(calDiff))} kcal remaining`}
          </div>
        </div>
      </div>

      {/* Grid of Key Macro Meters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 pt-4">
        {/* Protein */}
        <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <Beef className="w-3.5 h-3.5 text-rose-600" />
              Protein
            </span>
            <span className="text-[11px] font-bold text-stone-500">{proteinPct}%</span>
          </div>
          <div className="text-lg font-bold text-stone-900 leading-tight">
            {formatNum(totals.protein)}g <span className="text-xs font-normal text-stone-400">/ {formatNum(goals.targetProtein)}g</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${proteinPct}%` }}
            />
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <Wheat className="w-3.5 h-3.5 text-amber-600" />
              Carbs
            </span>
            <span className="text-[11px] font-bold text-stone-500">{carbsPct}%</span>
          </div>
          <div className="text-lg font-bold text-stone-900 leading-tight">
            {formatNum(totals.carbs)}g <span className="text-xs font-normal text-stone-400">/ {formatNum(goals.targetCarbs)}g</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${carbsPct}%` }}
            />
          </div>
        </div>

        {/* Fats */}
        <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              Total Fats
            </span>
            <span className="text-[11px] font-bold text-stone-500">{fatPct}%</span>
          </div>
          <div className="text-lg font-bold text-stone-900 leading-tight">
            {formatNum(totals.fat)}g <span className="text-xs font-normal text-stone-400">/ {formatNum(goals.targetFat)}g</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${fatPct}%` }}
            />
          </div>
        </div>

        {/* Dietary Fiber */}
        <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Fiber
            </span>
            <span className="text-[11px] font-bold text-stone-500">{fiberPct}%</span>
          </div>
          <div className="text-lg font-bold text-stone-900 leading-tight">
            {formatNum(totals.fiber)}g <span className="text-xs font-normal text-stone-400">/ {formatNum(goals.targetFiber)}g min</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                totals.fiber >= goals.targetFiber ? 'bg-emerald-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${fiberPct}%` }}
            />
          </div>
        </div>

        {/* Sodium */}
        <div className={`rounded-xl p-3 border transition-colors ${
          isSodiumExcess 
            ? 'bg-rose-50/60 border-rose-200' 
            : 'bg-stone-50/80 border-stone-200/60'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              Sodium
            </span>
            {isSodiumExcess ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                High
              </span>
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div className="text-lg font-bold text-stone-900 leading-tight">
            {formatNum(totals.sodium)} <span className="text-xs font-normal text-stone-500">/ {formatNum(goals.maxSodium)} mg</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {isSodiumExcess ? `${formatNum(sub2(totals.sodium, goals.maxSodium))}mg over ceiling` : 'Within safe target'}
          </div>
        </div>

        {/* Added Sugar */}
        <div className={`rounded-xl p-3 border transition-colors ${
          isSugarExcess 
            ? 'bg-rose-50/60 border-rose-200' 
            : 'bg-stone-50/80 border-stone-200/60'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              Added Sugar
            </span>
            {isSugarExcess ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                Excess
              </span>
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div className="text-lg font-bold text-stone-900 leading-tight">
            {formatNum(totals.sugar)}g <span className="text-xs font-normal text-stone-500">/ {formatNum(goals.maxSugar)}g max</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {isSugarExcess ? `${formatNum(sub2(totals.sugar, goals.maxSugar))}g over limit` : 'Moderate levels'}
          </div>
        </div>
      </div>
    </div>
  );
};
