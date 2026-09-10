import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Coffee, Sun, Sunset, Cookie, ChevronRight, HelpCircle, ArrowRightLeft } from 'lucide-react';
import { FoodItem, MealCategory } from '../types';

interface FoodLogSectionProps {
  items: FoodItem[];
  onAddItem: (item: FoodItem) => void;
  onDeleteItem: (id: string) => void;
  onRequestSwap: (item: FoodItem) => void;
  onParseFoodText: (text: string, category: MealCategory) => Promise<void>;
  isParsing: boolean;
}

const CATEGORIES: { key: MealCategory; label: string; icon: React.ReactNode; defaultTime: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: <Coffee className="w-4 h-4 text-amber-600" />, defaultTime: 'Morning' },
  { key: 'lunch', label: 'Lunch', icon: <Sun className="w-4 h-4 text-emerald-600" />, defaultTime: 'Midday' },
  { key: 'dinner', label: 'Dinner', icon: <Sunset className="w-4 h-4 text-indigo-600" />, defaultTime: 'Evening' },
  { key: 'snack', label: 'Snacks & Beverages', icon: <Cookie className="w-4 h-4 text-rose-600" />, defaultTime: 'Throughout Day' },
];

export const FoodLogSection: React.FC<FoodLogSectionProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onRequestSwap,
  onParseFoodText,
  isParsing,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<MealCategory>('lunch');
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    category: 'lunch' as MealCategory,
    portion: '1 serving',
    calories: 350,
    protein: 20,
    carbs: 40,
    fat: 12,
    fiber: 3,
    sodium: 450,
    sugar: 6,
  });

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    await onParseFoodText(quickInput.trim(), activeCategory);
    setQuickInput('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name.trim()) return;

    onAddItem({
      id: `food-${Date.now()}`,
      name: manualForm.name.trim(),
      category: manualForm.category,
      portion: manualForm.portion.trim() || '1 serving',
      calories: Number(manualForm.calories) || 0,
      protein: Number(manualForm.protein) || 0,
      carbs: Number(manualForm.carbs) || 0,
      fat: Number(manualForm.fat) || 0,
      fiber: Number(manualForm.fiber) || 0,
      sodium: Number(manualForm.sodium) || 0,
      sugar: Number(manualForm.sugar) || 0,
      healthTags: ['Manual Entry'],
    });

    setManualForm({
      name: '',
      category: 'lunch',
      portion: '1 serving',
      calories: 350,
      protein: 20,
      carbs: 40,
      fat: 12,
      fiber: 3,
      sodium: 450,
      sugar: 6,
    });
    setShowManualModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Quick Natural Food Logging Box */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <span>Log Food Consumption</span>
              <span className="text-[11px] font-normal text-stone-500 hidden sm:inline">
                • Natural language AI parser
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              Type naturally (e.g. <span className="text-stone-700 italic">"Grilled chicken Caesar salad with croutons"</span> or <span className="text-stone-700 italic">"2 glazed donuts with mocha latte"</span>)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 self-start sm:self-auto hover:underline"
          >
            + Manual Macro Entry
          </button>
        </div>

        <form onSubmit={handleQuickSubmit} className="space-y-3">
          {/* Meal Slot Switcher */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 rounded-xl max-w-fit">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === cat.key
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Input & Action Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={`What did you have for ${CATEGORIES.find(c => c.key === activeCategory)?.label.toLowerCase()}?`}
                disabled={isParsing}
                className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 hover:bg-white focus:bg-white text-stone-900 text-xs sm:text-sm font-medium rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all placeholder:text-stone-400"
              />
              <Sparkles className="w-4 h-4 text-emerald-600 absolute right-3.5 top-3 pointer-events-none opacity-80" />
            </div>

            <button
              id="submit-food-button"
              type="submit"
              disabled={isParsing || !quickInput.trim()}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isParsing ? 'Estimating...' : 'Add Food'}</span>
            </button>
          </div>
        </form>

        {/* Quick Suggestions Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
          <span className="font-semibold text-stone-600">Quick ideas:</span>
          {[
            'Oatmeal with blueberries and honey',
            'Turkey avocado wrap with iced green tea',
            'Double cheeseburger and large fries',
            'Greek yogurt with walnuts and chia',
            'Pepperoni pizza slices with soda'
          ].map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => {
                setQuickInput(idea);
              }}
              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Meal List */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const categoryItems = items.filter((i) => i.category === cat.key);
          const categoryCalories = categoryItems.reduce((sum, i) => sum + i.calories, 0);

          return (
            <div
              key={cat.key}
              className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-stone-100">
                    {cat.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 leading-tight">
                      {cat.label}
                    </h4>
                    <span className="text-[11px] text-stone-400">{cat.defaultTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full">
                    {categoryCalories} kcal
                  </span>
                </div>
              </div>

              {/* Items List */}
              {categoryItems.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-stone-400">
                    No items logged for {cat.label.toLowerCase()} yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-stone-900">
                            {item.name}
                          </span>
                          <span className="text-xs text-stone-400 font-medium">
                            • {item.portion}
                          </span>
                          {item.healthTags?.map((tag) => (
                            <span
                              key={tag}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                tag.toLowerCase().includes('high') || tag.toLowerCase().includes('processed')
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Nutrition pill badges */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 mt-1.5 font-medium">
                          <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                            {item.calories} kcal
                          </span>
                          <span><strong className="text-rose-600 font-semibold">{item.protein}g</strong> Protein</span>
                          <span><strong className="text-amber-600 font-semibold">{item.carbs}g</strong> Carbs</span>
                          <span><strong className="text-blue-600 font-semibold">{item.fat}g</strong> Fat</span>
                          <span><strong className="text-emerald-600 font-semibold">{item.fiber}g</strong> Fiber</span>
                          {item.sodium > 0 && <span><strong>{item.sodium}mg</strong> Sodium</span>}
                          {item.sugar > 0 && <span><strong>{item.sugar}g</strong> Sugar</span>}
                        </div>
                      </div>

                      {/* Actions: Request Swap & Delete */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onRequestSwap(item)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
                          title="Generate a healthier alternative for this specific item"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Find Swap</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item from log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Add Food Manually
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter known nutritional facts for precise food tracking.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Food Name
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="e.g. Grilled Chicken Breast"
                    className="w-full text-xs font-medium px-3 py-2 bg-stone-50 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Meal Timing
                  </label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value as MealCategory })}
                    className="w-full text-xs font-medium px-2.5 py-2 bg-stone-50 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snacks & Drinks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Portion Size
                  </label>
                  <input
                    type="text"
                    value={manualForm.portion}
                    onChange={(e) => setManualForm({ ...manualForm, portion: e.target.value })}
                    placeholder="e.g. 150g or 1 cup"
                    className="w-full text-xs font-medium px-3 py-2 bg-stone-50 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Nutrition numbers */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Calories</label>
                  <input
                    type="number"
                    value={manualForm.calories}
                    onChange={(e) => setManualForm({ ...manualForm, calories: Number(e.target.value) })}
                    className="w-full text-xs font-semibold px-2 py-1 bg-white rounded border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Protein (g)</label>
                  <input
                    type="number"
                    value={manualForm.protein}
                    onChange={(e) => setManualForm({ ...manualForm, protein: Number(e.target.value) })}
                    className="w-full text-xs font-semibold px-2 py-1 bg-white rounded border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Carbs (g)</label>
                  <input
                    type="number"
                    value={manualForm.carbs}
                    onChange={(e) => setManualForm({ ...manualForm, carbs: Number(e.target.value) })}
                    className="w-full text-xs font-semibold px-2 py-1 bg-white rounded border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Fat (g)</label>
                  <input
                    type="number"
                    value={manualForm.fat}
                    onChange={(e) => setManualForm({ ...manualForm, fat: Number(e.target.value) })}
                    className="w-full text-xs font-semibold px-2 py-1 bg-white rounded border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Fiber (g)</label>
                  <input
                    type="number"
                    value={manualForm.fiber}
                    onChange={(e) => setManualForm({ ...manualForm, fiber: Number(e.target.value) })}
                    className="w-full text-xs font-semibold px-2 py-1 bg-white rounded border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Sodium (mg)</label>
                  <input
                    type="number"
                    value={manualForm.sodium}
                    onChange={(e) => setManualForm({ ...manualForm, sodium: Number(e.target.value) })}
                    className="w-full text-xs font-semibold px-2 py-1 bg-white rounded border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">Sugar (g)</label>
                  <input
                    type="number"
                    value={manualForm.sugar}
                    onChange={(e) => setManualForm({ ...manualForm, sugar: Number(e.target.value) })}
                    className="w-full text-xs font-semibold px-2 py-1 bg-white rounded border border-stone-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
