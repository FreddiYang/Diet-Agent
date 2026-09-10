import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Flame, Heart, ChefHat, CheckCircle2, RefreshCw } from 'lucide-react';
import { HealthierAlternative, FoodItem } from '../types';

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
    setAppliedSwapIds(prev => ({ ...prev, [alt.id]: true }));
  };

  if (alternatives.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">
          No Urgent Food Swaps Required!
        </h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
          Your current food log displays great nutritional discipline with whole ingredients, lean proteins, and controlled sodium/sugar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Recommended Healthier Alternatives</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {alternatives.length} {alternatives.length === 1 ? 'smart swap' : 'smart swaps'}
            </span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Crafted to satisfy identical cravings while cutting excess calories, sodium, and refined sugar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alternatives.map((alt) => {
          const originalItem = items.find((i) => i.id === alt.originalFoodId);
          const isApplied = appliedSwapIds[alt.id];

          return (
            <div
              key={alt.id}
              className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs overflow-hidden ${
                isApplied
                  ? 'border-emerald-500/70 bg-emerald-50/20 ring-1 ring-emerald-500/30'
                  : 'border-stone-200/90 hover:border-emerald-300'
              }`}
            >
              {/* Top Banner: Original vs Swap Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 line-through decoration-rose-500 decoration-2">
                    {alt.originalFoodName}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    {alt.suggestedItemName}
                  </span>
                </div>

                {/* 1-Click Apply Swap Button */}
                <button
                  type="button"
                  onClick={() => handleApply(alt)}
                  disabled={isApplied}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-auto ${
                    isApplied
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Swap Applied!</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Apply This Swap</span>
                    </>
                  )}
                </button>
              </div>

              {/* Side-by-Side Nutrition Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                {/* Original Item Box */}
                <div className="bg-stone-50/80 rounded-xl p-3.5 border border-stone-200/70">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-stone-600 uppercase tracking-wider text-[11px]">
                      Current Food Item
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {originalItem?.portion || alt.portion}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-stone-900 mb-2">
                    {alt.originalFoodName}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px] text-stone-600 text-center font-medium">
                    <div className="bg-white p-1 rounded border border-stone-200">
                      <div className="text-stone-400 text-[9px] uppercase">Calories</div>
                      <div className="font-bold text-stone-900">{originalItem?.calories ?? alt.calories + alt.savings.calories}</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-stone-200">
                      <div className="text-stone-400 text-[9px] uppercase">Protein</div>
                      <div className="font-bold text-stone-900">{originalItem?.protein ?? alt.protein}g</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-stone-200">
                      <div className="text-stone-400 text-[9px] uppercase">Carbs</div>
                      <div className="font-bold text-stone-900">{originalItem?.carbs ?? alt.carbs}g</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-stone-200">
                      <div className="text-stone-400 text-[9px] uppercase">Fat</div>
                      <div className="font-bold text-stone-900">{originalItem?.fat ?? alt.fat + alt.savings.fat}g</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-stone-200">
                      <div className="text-stone-400 text-[9px] uppercase">Sodium</div>
                      <div className="font-bold text-stone-900">{originalItem?.sodium ?? alt.sodium + alt.savings.sodium}mg</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-stone-200">
                      <div className="text-stone-400 text-[9px] uppercase">Sugar</div>
                      <div className="font-bold text-stone-900">{originalItem?.sugar ?? alt.sugar + alt.savings.sugar}g</div>
                    </div>
                  </div>
                </div>

                {/* Healthier Alternative Box */}
                <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-200/80">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Healthier Alternative
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {alt.portion}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-emerald-950 mb-2">
                    {alt.suggestedItemName}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px] text-emerald-900 text-center font-medium">
                    <div className="bg-white p-1 rounded border border-emerald-200">
                      <div className="text-emerald-700 text-[9px] uppercase">Calories</div>
                      <div className="font-bold text-emerald-950">{alt.calories}</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-emerald-200">
                      <div className="text-emerald-700 text-[9px] uppercase">Protein</div>
                      <div className="font-bold text-emerald-950">{alt.protein}g</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-emerald-200">
                      <div className="text-emerald-700 text-[9px] uppercase">Carbs</div>
                      <div className="font-bold text-emerald-950">{alt.carbs}g</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-emerald-200">
                      <div className="text-emerald-700 text-[9px] uppercase">Fat</div>
                      <div className="font-bold text-emerald-950">{alt.fat}g</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-emerald-200">
                      <div className="text-emerald-700 text-[9px] uppercase">Sodium</div>
                      <div className="font-bold text-emerald-950">{alt.sodium}mg</div>
                    </div>
                    <div className="bg-white p-1 rounded border border-emerald-200">
                      <div className="text-emerald-700 text-[9px] uppercase">Sugar</div>
                      <div className="font-bold text-emerald-950">{alt.sugar}g</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Savings Highlights Pill Bar */}
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs mb-3">
                <span className="font-bold text-stone-700">Net Impact:</span>
                {alt.savings.calories > 0 && (
                  <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800">
                    -{alt.savings.calories} kcal saved
                  </span>
                )}
                {alt.savings.sodium > 0 && (
                  <span className="px-2 py-0.5 rounded-md font-bold bg-blue-100 text-blue-800">
                    -{alt.savings.sodium} mg sodium
                  </span>
                )}
                {alt.savings.sugar > 0 && (
                  <span className="px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800">
                    -{alt.savings.sugar} g added sugar
                  </span>
                )}
                {alt.savings.proteinGain > 0 && (
                  <span className="px-2 py-0.5 rounded-md font-bold bg-rose-100 text-rose-800">
                    +{alt.savings.proteinGain} g protein
                  </span>
                )}
                {alt.savings.fiberGain > 0 && (
                  <span className="px-2 py-0.5 rounded-md font-bold bg-teal-100 text-teal-800">
                    +{alt.savings.fiberGain} g dietary fiber
                  </span>
                )}
              </div>

              {/* Sensory, Clinical, and Ordering Hack */}
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-start gap-2">
                  <Heart className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-stone-900 font-semibold">Why it's healthier: </strong>
                    <span>{alt.whyHealthier}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-stone-900 font-semibold">Craving & Taste Satisfaction: </strong>
                    <span>{alt.satisfiesCraving}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ChefHat className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-stone-900 font-semibold">Easy Prep or Ordering Hack: </strong>
                    <span>{alt.preparationOrOrderTip}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
