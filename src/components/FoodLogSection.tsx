import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Coffee, Sun, Sunset, Cookie, 
  RefreshCw, X, Utensils, ChevronDown, ChevronUp, Check, 
  Scale, SlidersHorizontal, Sparkles 
} from 'lucide-react';
import { FoodItem, MealCategory, Ingredient, IngredientAisle } from '../types';
import { INGREDIENTS_DATABASE, calculateIngredientNutrition } from '../data/foodDatabase';
import { formatNum, roundToTwo } from '../utils/formatters';

interface FoodLogSectionProps {
  items: FoodItem[];
  onAddItem: (item: FoodItem) => void;
  onUpdateItem?: (updatedItem: FoodItem) => void;
  onDeleteItem: (id: string) => void;
  onRequestSwap: (item: FoodItem) => void;
  onParseFoodText: (text: string, category: MealCategory) => Promise<void>;
  isParsing: boolean;
}

const AISLE_TABS: { key: IngredientAisle | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All Staples', icon: '✨' },
  { key: 'grains', label: 'Grains & Breads', icon: '🍞' },
  { key: 'proteins', label: 'Proteins & Meats', icon: '🍗' },
  { key: 'dairy', label: 'Dairy & Milks', icon: '🥛' },
  { key: 'produce', label: 'Produce & Fruits', icon: '🍌' },
  { key: 'veggies', label: 'Veggies & Greens', icon: '🥦' },
  { key: 'fats-oils', label: 'Fats & Spreads', icon: '🥑' },
  { key: 'beverages', label: 'Beverages', icon: '☕' },
  { key: 'snacks-condiments', label: 'Snacks & Sweets', icon: '🍿' },
];

const MEAL_TABS: { key: MealCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: <Coffee className="w-3.5 h-3.5 text-amber-600" /> },
  { key: 'lunch', label: 'Lunch', icon: <Sun className="w-3.5 h-3.5 text-emerald-600" /> },
  { key: 'dinner', label: 'Dinner', icon: <Sunset className="w-3.5 h-3.5 text-indigo-600" /> },
  { key: 'snack', label: 'Snacks & Drinks', icon: <Cookie className="w-3.5 h-3.5 text-rose-600" /> },
];

export const FoodLogSection: React.FC<FoodLogSectionProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onRequestSwap,
  onParseFoodText,
  isParsing,
}) => {
  const [selectedAisle, setSelectedAisle] = useState<IngredientAisle | 'all'>('all');
  const [activeMealCategory, setActiveMealCategory] = useState<MealCategory>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Selected ingredient for the weight-adjust popover/drawer
  const [customizingIngredient, setCustomizingIngredient] = useState<Ingredient | null>(null);
  const [customWeightGrams, setCustomWeightGrams] = useState<number>(50);
  const [customMealTarget, setCustomMealTarget] = useState<MealCategory>('breakfast');

  // Custom ingredient text entry modal toggle
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');

  // Filter ingredients by aisle & search query
  const filteredIngredients = useMemo(() => {
    return INGREDIENTS_DATABASE.filter((ing) => {
      const matchesAisle = selectedAisle === 'all' || ing.aisle === selectedAisle;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        ing.name.toLowerCase().includes(q) ||
        ing.suggestedUnit.toLowerCase().includes(q) ||
        ing.healthTags?.some((t) => t.toLowerCase().includes(q));
      return matchesAisle && matchesSearch;
    });
  }, [selectedAisle, searchQuery]);

  // Initial visible count before expanding
  const INITIAL_VISIBLE_COUNT = 8;
  const isSearching = searchQuery.trim().length > 0;
  const displayedIngredients = isCatalogExpanded || isSearching
    ? filteredIngredients
    : filteredIngredients.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = filteredIngredients.length - displayedIngredients.length;

  // 1-Tap Quick Add with suggested portion
  const handleQuickAdd = (ing: Ingredient, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const weight = ing.suggestedGrams;
    const nutrition = calculateIngredientNutrition(ing, weight);

    onAddItem({
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ingredientId: ing.id,
      name: ing.name,
      icon: ing.icon,
      category: activeMealCategory,
      weightGrams: weight,
      portion: nutrition.portion,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      sodium: nutrition.sodium,
      sugar: nutrition.sugar,
      healthTags: ing.healthTags,
    });

    setRecentlyAddedId(ing.id);
    setTimeout(() => setRecentlyAddedId(null), 1200);
  };

  // Open weight customization modal
  const handleOpenCustomizer = (ing: Ingredient) => {
    setCustomizingIngredient(ing);
    setCustomWeightGrams(ing.suggestedGrams);
    setCustomMealTarget(activeMealCategory);
  };

  // Confirm adding customized weight
  const handleConfirmCustomizedAdd = () => {
    if (!customizingIngredient) return;
    const weight = Math.max(1, customWeightGrams);
    const nutrition = calculateIngredientNutrition(customizingIngredient, weight);

    onAddItem({
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ingredientId: customizingIngredient.id,
      name: customizingIngredient.name,
      icon: customizingIngredient.icon,
      category: customMealTarget,
      weightGrams: weight,
      portion: nutrition.portion,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      sodium: nutrition.sodium,
      sugar: nutrition.sugar,
      healthTags: customizingIngredient.healthTags,
    });

    setRecentlyAddedId(customizingIngredient.id);
    setTimeout(() => setRecentlyAddedId(null), 1200);
    setCustomizingIngredient(null);
  };

  // Quick weight adjuster for an already logged item
  const handleAdjustLoggedWeight = (item: FoodItem, delta: number) => {
    if (!onUpdateItem) return;
    const currentWeight = item.weightGrams || 50;
    const newWeight = Math.max(5, currentWeight + delta);
    
    // If we have the ingredient in database, recalculate dynamically
    const ing = item.ingredientId ? INGREDIENTS_DATABASE.find((i) => i.id === item.ingredientId) : undefined;
    if (ing) {
      const nut = calculateIngredientNutrition(ing, newWeight);
      onUpdateItem({
        ...item,
        weightGrams: newWeight,
        portion: nut.portion,
        calories: nut.calories,
        protein: nut.protein,
        carbs: nut.carbs,
        fat: nut.fat,
        fiber: nut.fiber,
        sodium: nut.sodium,
        sugar: nut.sugar,
      });
    } else {
      const factor = newWeight / currentWeight;
      onUpdateItem({
        ...item,
        weightGrams: roundToTwo(newWeight),
        portion: `${formatNum(newWeight)}g`,
        calories: roundToTwo(item.calories * factor),
        protein: roundToTwo(item.protein * factor),
        carbs: roundToTwo(item.carbs * factor),
        fat: roundToTwo(item.fat * factor),
        fiber: roundToTwo(item.fiber * factor),
        sodium: roundToTwo(item.sodium * factor),
        sugar: roundToTwo(item.sugar * factor),
      });
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    await onParseFoodText(customText.trim(), activeMealCategory);
    setCustomText('');
    setShowCustomInput(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Graphic Ingredient Selection Catalog */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
        {/* Header with Search & Meal Selection */}
        <div className="flex flex-col gap-3.5 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 flex-wrap">
                <span>Select Ingredients</span>
                <span className="text-xs font-normal text-stone-500">
                  • Tap to adjust weight in grams or 1-tap quick add
                </span>
                {!isSearching && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full ml-1">
                    {isCatalogExpanded ? `All ${filteredIngredients.length} staples` : `Top ${displayedIngredients.length} staples`}
                  </span>
                )}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ingredient (egg, bread, oats)..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-stone-50 hover:bg-stone-100/80 focus:bg-white text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all placeholder:text-stone-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Custom Input Toggle */}
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shrink-0"
              >
                {showCustomInput ? 'Close Custom' : '+ Custom'}
              </button>
            </div>
          </div>

          {/* Target Meal Selector: Where are ingredients being added? */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-50 rounded-xl border border-stone-200/70">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider pl-1.5 shrink-0">
              Adding to:
            </span>
            <div className="flex flex-wrap gap-1">
              {MEAL_TABS.map((meal) => (
                <button
                  key={meal.key}
                  type="button"
                  onClick={() => setActiveMealCategory(meal.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeMealCategory === meal.key
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200/60 border border-stone-200/80'
                  }`}
                >
                  {meal.icon}
                  <span>{meal.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Quick-Entry Form (collapsible) */}
        {showCustomInput && (
          <form onSubmit={handleCustomSubmit} className="mb-4 p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
            <div className="text-xs text-stone-600">
              Type any ingredient or brand with estimated amount (e.g., <span className="font-semibold text-stone-800">"150g grilled chicken"</span> or <span className="font-semibold text-stone-800">"2 eggs and 1 banana"</span>):
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. 50g sourdough bread, 1 cup almond milk..."
                className="flex-1 px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                disabled={isParsing || !customText.trim()}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs shrink-0"
              >
                {isParsing ? 'Adding...' : 'Add to Log'}
              </button>
            </div>
          </form>
        )}

        {/* Aisle Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {AISLE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSelectedAisle(tab.key);
                setIsCatalogExpanded(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedAisle === tab.key
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Graphic Ingredient Labels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-2.5">
          {displayedIngredients.map((ing) => {
            const suggestedNutrition = calculateIngredientNutrition(ing, ing.suggestedGrams);
            const isJustAdded = recentlyAddedId === ing.id;

            return (
              <div
                key={ing.id}
                onClick={() => handleOpenCustomizer(ing)}
                className={`group relative flex flex-col justify-between p-3 rounded-xl border bg-stone-50/50 hover:bg-white transition-all text-left min-h-[145px] cursor-pointer ${
                  isJustAdded
                    ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                    : 'border-stone-200/80 hover:border-emerald-400 hover:shadow-xs'
                }`}
              >
                {/* Top Row: Icon & Quick Add Button */}
                <div className="flex items-start justify-between gap-1.5">
                  <span className="text-3xl group-hover:scale-110 transition-transform select-none">
                    {ing.icon}
                  </span>
                  
                  {/* 1-Tap Quick Add Button */}
                  <button
                    type="button"
                    title={`1-Tap Add ${formatNum(ing.suggestedGrams)}g to ${activeMealCategory}`}
                    onClick={(e) => handleQuickAdd(ing, e)}
                    className="p-1.5 rounded-lg bg-white hover:bg-emerald-600 hover:text-white border border-stone-200 text-emerald-800 shadow-2xs transition-colors shrink-0"
                  >
                    {isJustAdded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Name & Suggested Amount */}
                <div className="my-1.5">
                  <p className="text-xs font-bold text-stone-800 line-clamp-2 leading-snug group-hover:text-emerald-950" title={ing.name}>
                    {ing.name}
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Suggested: <span className="font-semibold text-stone-700">{formatNum(ing.suggestedGrams)}g</span> ({ing.suggestedUnit})
                  </p>
                </div>

                {/* Nutrition Badge & Custom Weight Cue */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100/90 text-[10px]">
                  <span className="font-bold text-stone-700 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                    {formatNum(suggestedNutrition.calories)} kcal
                  </span>
                  <span className="text-stone-400 font-medium group-hover:text-emerald-700 flex items-center gap-0.5">
                    <Scale className="w-2.5 h-2.5" />
                    <span>Adjust g</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hidden List Expandable Button */}
        {!isSearching && filteredIngredients.length > INITIAL_VISIBLE_COUNT && (
          <div className="mt-3.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsCatalogExpanded(!isCatalogExpanded)}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200/80 bg-stone-50/80 hover:bg-stone-100 active:bg-stone-200/70 text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center justify-center gap-2 transition-all shadow-2xs group"
            >
              {isCatalogExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 text-stone-500 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Show Fewer Items (Collapse to Top {INITIAL_VISIBLE_COUNT} Staples)</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 text-emerald-700 group-hover:translate-y-0.5 transition-transform" />
                  <span>
                    Explore More Ingredients ({hiddenCount} more in {AISLE_TABS.find((t) => t.key === selectedAisle)?.label})
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {filteredIngredients.length === 0 && (
          <div className="py-8 text-center text-xs text-stone-400">
            No ingredients found matching "{searchQuery}". Try searching for staples like "egg", "oats", "bread", or "salmon".
          </div>
        )}
      </div>

      {/* 2. Weight Customization Modal / Drawer */}
      {customizingIngredient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl select-none">{customizingIngredient.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 leading-tight">
                    {customizingIngredient.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Standard suggestion: {formatNum(customizingIngredient.suggestedGrams)}g ({customizingIngredient.suggestedUnit})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingIngredient(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Weight Controller */}
            <div className="my-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Ingredient Weight (Grams):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomWeightGrams((prev) => Math.max(5, prev - 10))}
                    className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    -10
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={customWeightGrams}
                      onChange={(e) => setCustomWeightGrams(Number(e.target.value) || 0)}
                      className="w-full text-center text-lg font-bold py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-stone-400">
                      grams
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomWeightGrams((prev) => prev + 10)}
                    className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    +10
                  </button>
                </div>

                {/* Quick Multiplier Buttons */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[
                    { label: '0.5x', grams: roundToTwo(customizingIngredient.suggestedGrams * 0.5) },
                    { label: '1x (suggested)', grams: customizingIngredient.suggestedGrams },
                    { label: '1.5x', grams: roundToTwo(customizingIngredient.suggestedGrams * 1.5) },
                    { label: '2x', grams: roundToTwo(customizingIngredient.suggestedGrams * 2) },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCustomWeightGrams(preset.grams)}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                        customWeightGrams === preset.grams
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Live Nutrition Preview */}
              {(() => {
                const liveNutrition = calculateIngredientNutrition(customizingIngredient, Math.max(1, customWeightGrams));
                return (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600">Calculated Nutrition:</span>
                      <span className="text-sm font-extrabold text-emerald-950">
                        {formatNum(liveNutrition.calories)} kcal
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center text-[11px] font-semibold bg-white p-2 rounded-lg border border-stone-200/70">
                      <div>
                        <div className="text-stone-400 text-[9px] uppercase">Protein</div>
                        <div className="text-emerald-900">{formatNum(liveNutrition.protein)}g</div>
                      </div>
                      <div>
                        <div className="text-stone-400 text-[9px] uppercase">Carbs</div>
                        <div className="text-stone-700">{formatNum(liveNutrition.carbs)}g</div>
                      </div>
                      <div>
                        <div className="text-stone-400 text-[9px] uppercase">Fat</div>
                        <div className="text-stone-700">{formatNum(liveNutrition.fat)}g</div>
                      </div>
                      <div>
                        <div className="text-stone-400 text-[9px] uppercase">Fiber</div>
                        <div className="text-emerald-800">{formatNum(liveNutrition.fiber)}g</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Meal Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Add to Meal:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {MEAL_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setCustomMealTarget(tab.key)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                        customMealTarget === tab.key
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {tab.icon}
                      <span className="truncate w-full text-center text-[10px]">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCustomizingIngredient(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCustomizedAdd}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {formatNum(customWeightGrams)}g to Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Today's Logged Ingredients by Meal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <span>Today's Logged Ingredients</span>
            <span className="text-xs font-normal text-stone-500">
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </h3>
          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
            Total: {formatNum(roundToTwo(items.reduce((acc, i) => acc + (Number(i.calories) || 0), 0)))} kcal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {MEAL_TABS.map((sec) => {
            const secItems = items.filter((i) => i.category === sec.key);
            const secCalories = secItems.reduce((acc, i) => acc + (Number(i.calories) || 0), 0);

            return (
              <div
                key={sec.key}
                className="bg-white rounded-2xl border border-stone-200/90 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-stone-100">
                        {sec.icon}
                      </div>
                      <span className="text-xs font-bold text-stone-900">
                        {sec.label}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                      {formatNum(roundToTwo(secCalories))} kcal
                    </span>
                  </div>

                  {secItems.length === 0 ? (
                    <div className="py-6 text-center text-xs text-stone-400">
                      No ingredients logged yet for {sec.label.toLowerCase()}
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                      {secItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-50/70 hover:bg-stone-50 border border-stone-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-lg select-none shrink-0">
                              {item.icon || '🥗'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-stone-900 truncate">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-stone-500 flex-wrap">
                                <span className="font-bold text-stone-700 bg-white px-1.5 py-0.2 rounded border border-stone-200">
                                  {item.weightGrams ? `${formatNum(item.weightGrams)}g` : item.portion}
                                </span>
                                <span>•</span>
                                <span className="font-semibold text-stone-700">{formatNum(item.calories)} kcal</span>
                                <span>•</span>
                                <span>{formatNum(item.protein)}g P</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Weight Adjuster & Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {onUpdateItem && (
                              <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  title="Decrease weight by 10g"
                                  onClick={() => handleAdjustLoggedWeight(item, -10)}
                                  className="px-1 text-[10px] font-bold text-stone-500 hover:text-stone-900"
                                >
                                  -
                                </button>
                                <span className="text-[10px] font-semibold text-stone-600 px-1 border-x border-stone-100">
                                  {formatNum(item.weightGrams || 50)}g
                                </span>
                                <button
                                  type="button"
                                  title="Increase weight by 10g"
                                  onClick={() => handleAdjustLoggedWeight(item, 10)}
                                  className="px-1 text-[10px] font-bold text-stone-500 hover:text-stone-900"
                                >
                                  +
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => onRequestSwap(item)}
                              title="Find healthier swap from ingredient database"
                              className="px-2 py-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              <span>Swap</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item.id)}
                              title="Remove item"
                              className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
