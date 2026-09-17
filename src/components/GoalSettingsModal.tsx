import React, { useState } from 'react';
import { X, Target, Check, Info, ShieldCheck, Heart, Dumbbell, Activity, Sparkles } from 'lucide-react';
import { GoalPresetType, NutritionalGoals } from '../types';
import { GOAL_PRESETS } from '../data/presets';
import { formatNum } from '../utils/formatters';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: NutritionalGoals;
  onSaveGoal: (goal: NutritionalGoals) => void;
}

const PRESET_ICONS: Record<GoalPresetType, React.ReactNode> = {
  'weight-loss': <Activity className="w-4 h-4 text-rose-600" />,
  'muscle-gain': <Dumbbell className="w-4 h-4 text-blue-600" />,
  'heart-health': <Heart className="w-4 h-4 text-emerald-600" />,
  'blood-sugar': <Activity className="w-4 h-4 text-amber-600" />,
  'clean-eating': <Sparkles className="w-4 h-4 text-teal-600" />,
  'low-sodium': <ShieldCheck className="w-4 h-4 text-indigo-600" />,
  'custom': <Target className="w-4 h-4 text-stone-600" />,
};

const COMMON_DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Dairy-Free',
  'Gluten-Free',
  'Pescatarian',
  'Nut-Free',
  'Low Carb / Keto',
  'Mediterranean'
];

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onSaveGoal,
}) => {
  const [selectedType, setSelectedType] = useState<GoalPresetType>(currentGoal.primaryGoal);
  const [formData, setFormData] = useState<NutritionalGoals>({ ...currentGoal });

  if (!isOpen) return null;

  const handleSelectPreset = (type: GoalPresetType) => {
    setSelectedType(type);
    const preset = GOAL_PRESETS[type];
    setFormData({
      ...preset,
      dietaryPreferences: formData.dietaryPreferences, // retain user preferences
    });
  };

  const handleTogglePreference = (pref: string) => {
    const exists = formData.dietaryPreferences.includes(pref);
    const updated = exists
      ? formData.dietaryPreferences.filter(p => p !== pref)
      : [...formData.dietaryPreferences, pref];
    setFormData({ ...formData, dietaryPreferences: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoal(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="goal-settings-modal"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Configure Nutritional Goals</h2>
              <p className="text-xs text-stone-500">
                Healthier alternatives will be calibrated to your exact targets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Preset Selection Buttons */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Select Primary Goal Framework
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(GOAL_PRESETS) as GoalPresetType[]).map((type) => {
                const preset = GOAL_PRESETS[type];
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelectPreset(type)}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 bg-white'
                    }`}
                  >
                    <div className="mt-0.5">{PRESET_ICONS[type]}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-stone-900 truncate">
                        {preset.goalName}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {formatNum(preset.targetCalories)} kcal
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{formData.focusDescription}</span>
            </p>
          </div>

          {/* Macro Budget Sliders / Inputs */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
              Daily Nutritional Targets & Ceilings
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  value={formData.targetCalories}
                  onChange={(e) => setFormData({ ...formData, targetCalories: Number(e.target.value) })}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="800"
                  max="5000"
                  step="50"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={formData.targetProtein}
                  onChange={(e) => setFormData({ ...formData, targetProtein: Number(e.target.value) })}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="20"
                  max="350"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={formData.targetCarbs}
                  onChange={(e) => setFormData({ ...formData, targetCarbs: Number(e.target.value) })}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="10"
                  max="600"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Fats (g)
                </label>
                <input
                  type="number"
                  value={formData.targetFat}
                  onChange={(e) => setFormData({ ...formData, targetFat: Number(e.target.value) })}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="10"
                  max="200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Min Fiber (g)
                </label>
                <input
                  type="number"
                  value={formData.targetFiber}
                  onChange={(e) => setFormData({ ...formData, targetFiber: Number(e.target.value) })}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="5"
                  max="80"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Max Sodium (mg)
                </label>
                <input
                  type="number"
                  value={formData.maxSodium}
                  onChange={(e) => setFormData({ ...formData, maxSodium: Number(e.target.value) })}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="500"
                  max="6000"
                  step="100"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Max Sugar (g)
                </label>
                <input
                  type="number"
                  value={formData.maxSugar}
                  onChange={(e) => setFormData({ ...formData, maxSugar: Number(e.target.value) })}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="5"
                  max="120"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dietary Preferences Chips */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Dietary Restrictions & Preferences (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_DIETARY_PREFERENCES.map((pref) => {
                const isActive = formData.dietaryPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => handleTogglePreference(pref)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3" />}
                    <span>{pref}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              Save Goals & Update Swaps
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
