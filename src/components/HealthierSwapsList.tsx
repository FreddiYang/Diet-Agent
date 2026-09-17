import React, { useState } from 'react';
import { Sparkles, ArrowDown, Check, RefreshCw, Heart } from 'lucide-react';
import { HealthierAlternative, FoodItem } from '../types';
import { formatNum, roundToTwo } from '../utils/formatters';

interface HealthierSwapsListProps {
  alternatives: HealthierAlternative[];
  items: FoodItem[];
  onApplySwap: (alt: HealthierAlternative) => void;
  isApplying?: boolean;
}

export const HealthierSwapsList: React.FC<HealthierSwapsListProps> = ({
  alternatives,
  items,
  onApplySwap,
}) => {
  const [appliedSwapIds, setAppliedSwapIds] = useState<Record<string, boolean>>({});

  const handleApply = (alt: HealthierAlternative) => {
    onApplySwap(alt);
    setAppliedSwapIds((prev) => ({ ...prev, [alt.id]: true }));
  };

  if (alternatives.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 text-center shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
          <Check className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-stone-900">No Food Swaps Required</h4>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-0.5">
          Your daily food log is already at or below your target calories. No further calorie-reducing swaps are needed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <h3 className="text-sm font-bold text-stone-900 truncate">Recommended Healthier Swaps</h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
            {alternatives.length} {alternatives.length === 1 ? 'smart swap' : 'smart swaps'}
          </span>
        </div>
        <span className="text-[11px] text-stone-400 hidden sm:inline shrink-0">
          Calibrated to Target Calories
        </span>
      </div>

      <div className="space-y-3 w-full min-w-0">
        {alternatives.map((alt) => {
          const originalItem = items.find((i) => i.id === alt.originalFoodId);
          const isApplied = appliedSwapIds[alt.id];
          const originalIcon = originalItem?.icon || '🍽️';
          const swapIcon = alt.icon || '🥗';

          return (
            <div
              key={alt.id}
              className={`bg-white rounded-2xl border p-3.5 sm:p-4 shadow-xs transition-all duration-200 w-full min-w-0 overflow-hidden ${
                isApplied
                  ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500/30'
                  : 'border-stone-200/90 hover:border-emerald-300'
              }`}
            >
              {/* Graphic Comparison: Stacked layout with clear flow */}
              <div className="flex flex-col gap-2 w-full min-w-0">
                {/* 1. Original Food Label */}
                <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 w-full min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-2xl shadow-2xs shrink-0 select-none">
                      {originalIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Current Food
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-stone-800 truncate" title={alt.originalFoodName}>
                        {alt.originalFoodName}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        <span className="font-semibold text-stone-700">
                          {formatNum(roundToTwo(originalItem?.calories ?? (alt.calories + alt.savings.calories)))} kcal
                        </span>
                        {originalItem?.portion ? ` · ${originalItem.portion}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-400 bg-stone-100/80 px-2 py-0.5 rounded-md shrink-0">
                    Logged
                  </span>
                </div>

                {/* 2. Transition / Savings Indicator */}
                <div className="flex items-center justify-between px-1.5 py-0.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Swap with healthier choice</span>
                  </div>
                  {alt.savings.calories > 0 && (
                    <span className="font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[10px]">
                      Saves {formatNum(alt.savings.calories)} kcal
                    </span>
                  )}
                </div>

                {/* 3. Suggested Swap Food Label (From Catalog) & 1-Click Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/90 w-full min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-2xl shadow-2xs shrink-0 select-none">
                      {swapIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          Healthy Swap
                        </span>
                        {alt.savings.sodium > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-700">
                            · -{formatNum(alt.savings.sodium)}mg sodium
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-950 truncate" title={alt.suggestedItemName}>
                        {alt.suggestedItemName}
                      </div>
                      <div className="text-[11px] text-emerald-800 truncate">
                        <span className="font-semibold">{formatNum(alt.calories)} kcal</span> · {alt.portion}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Apply Button */}
                  <button
                    type="button"
                    onClick={() => handleApply(alt)}
                    disabled={isApplied}
                    className={`w-full sm:w-auto px-3.5 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs shrink-0 ${
                      isApplied
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Swapped!</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Apply Swap</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Simple 1-liner Info */}
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-start gap-1.5 text-[11px] text-stone-500 leading-snug">
                <Heart className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{alt.whyHealthier}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

