import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, Check, RefreshCw, ChefHat, Heart } from 'lucide-react';
import { FoodItem, HealthierAlternative, NutritionalGoals } from '../types';
import { generateAlternativeForItem } from '../utils/nutritionEngine';

interface QuickSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FoodItem | null;
  goals: NutritionalGoals;
  onApplySwap: (alt: HealthierAlternative) => void;
}

export const QuickSwapModal: React.FC<QuickSwapModalProps> = ({
  isOpen,
  onClose,
  item,
  goals,
  onApplySwap,
}) => {
  const [preference, setPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedAlt, setGeneratedAlt] = useState<HealthierAlternative | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleGenerate = async (customAngle?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/suggest-single-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodItem: item,
          goals,
          preference: customAngle || preference || 'healthier nutritional swap',
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.alternative) {
          setGeneratedAlt(data.alternative);
          return;
        }
      }
      // If server returned non-OK or non-JSON, fallback immediately
      const fallbackAlt = generateAlternativeForItem(item, goals);
      setGeneratedAlt(fallbackAlt);
    } catch (err: any) {
      console.warn('Network or API issue in quick swap, using local culinary swap:', err);
      const fallbackAlt = generateAlternativeForItem(item, goals);
      setGeneratedAlt(fallbackAlt);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedAlt) {
      onApplySwap(generatedAlt);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                Find Healthier Swap for "{item.name}"
              </h3>
              <p className="text-[11px] text-stone-500">
                Customized for your {goals.goalName} goals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Food Nutrition Recap */}
        <div className="my-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
            Current Item Nutrition
          </div>
          <div className="flex flex-wrap items-center gap-2 text-stone-700">
            <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
              {item.calories} kcal
            </span>
            <span>{item.protein}g Protein</span>
            <span>•</span>
            <span>{item.carbs}g Carbs</span>
            <span>•</span>
            <span>{item.fat}g Fat</span>
            <span>•</span>
            <span>{item.sodium}mg Sodium</span>
            <span>•</span>
            <span>{item.sugar}g Sugar</span>
          </div>
        </div>

        {/* Quick Angle Options */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-semibold text-stone-700">
            What kind of alternative are you looking for?
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Highest Protein',
              'Lowest Calorie',
              'Low Sodium / DASH',
              'Plant-Based / Vegan',
              'Quick 5-Min Prep',
              'Restaurant / Drive-Thru Ordering Hack'
            ].map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => {
                  setPreference(angle);
                  handleGenerate(angle);
                }}
                disabled={loading}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 transition-colors"
              >
                {angle}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              placeholder="Or type custom request (e.g. gluten-free, sweeter, budget-friendly)..."
              className="flex-1 text-xs px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs"
            >
              {loading ? 'Finding...' : 'Generate Swap'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs mb-3">
            {error}
          </div>
        )}

        {/* Display Generated Alternative */}
        {generatedAlt && (
          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/90 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Recommended Healthier Swap
                </span>
                <div className="text-sm font-bold text-emerald-950">
                  {generatedAlt.suggestedItemName}
                </div>
                <div className="text-xs text-emerald-700">{generatedAlt.portion}</div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-emerald-950">
                  {generatedAlt.calories} kcal
                </span>
                <div className="text-[10px] text-emerald-800 font-semibold">
                  -{generatedAlt.savings.calories} kcal saved
                </div>
              </div>
            </div>

            {/* Macro bar */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-medium text-stone-700 bg-white p-2 rounded-xl border border-emerald-200/80">
              <div>
                <div className="text-stone-400 text-[9px] uppercase">Protein</div>
                <div className="font-bold text-emerald-900">{generatedAlt.protein}g</div>
              </div>
              <div>
                <div className="text-stone-400 text-[9px] uppercase">Carbs</div>
                <div className="font-bold text-emerald-900">{generatedAlt.carbs}g</div>
              </div>
              <div>
                <div className="text-stone-400 text-[9px] uppercase">Fat</div>
                <div className="font-bold text-emerald-900">{generatedAlt.fat}g</div>
              </div>
              <div>
                <div className="text-stone-400 text-[9px] uppercase">Sodium</div>
                <div className="font-bold text-emerald-900">{generatedAlt.sodium}mg</div>
              </div>
            </div>

            <div className="text-xs text-stone-700 space-y-1.5">
              <p>
                <strong className="text-emerald-950">Why: </strong>
                {generatedAlt.whyHealthier}
              </p>
              <p>
                <strong className="text-emerald-950">Craving: </strong>
                {generatedAlt.satisfiesCraving}
              </p>
              <p>
                <strong className="text-emerald-950">Tip: </strong>
                {generatedAlt.preparationOrOrderTip}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Replace in My Meal Log</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
