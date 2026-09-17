import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Coffee, Sun, Sunset, Cookie, RefreshCw, X, Utensils, ChevronDown, ChevronUp } from 'lucide-react';
import { FoodItem, MealCategory } from '../types';
import { GRAPHIC_FOOD_DATABASE, GraphicFoodItem } from '../data/foodDatabase';

interface FoodLogSectionProps {
  items: FoodItem[];
  onAddItem: (item: FoodItem) => void;
  onDeleteItem: (id: string) => void;
  onRequestSwap: (item: FoodItem) => void;
  onParseFoodText: (text: string, category: MealCategory) => Promise<void>;
  isParsing: boolean;
}

const CATEGORY_TABS: { key: MealCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All Foods', icon: <Utensils className="w-4 h-4" /> },
  { key: 'breakfast', label: 'Breakfast', icon: <Coffee className="w-4 h-4 text-amber-600" /> },
  { key: 'lunch', label: 'Lunch', icon: <Sun className="w-4 h-4 text-emerald-600" /> },
  { key: 'dinner', label: 'Dinner', icon: <Sunset className="w-4 h-4 text-indigo-600" /> },
  { key: 'snack', label: 'Snacks & Drinks', icon: <Cookie className="w-4 h-4 text-rose-600" /> },
];

export const FoodLogSection: React.FC<FoodLogSectionProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onRequestSwap,
  onParseFoodText,
  isParsing,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MealCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customCategory, setCustomCategory] = useState<MealCategory>('lunch');
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);

  // Filter food database based on selected category & search query
  const filteredFoods = useMemo(() => {
    return GRAPHIC_FOOD_DATABASE.filter((food) => {
      const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // When searching, show all matches; when not searching, show a brief list of top 8 staples unless expanded
  const INITIAL_VISIBLE_COUNT = 8;
  const isSearching = searchQuery.trim().length > 0;
  const displayedFoods = (isCatalogExpanded || isSearching)
    ? filteredFoods
    : filteredFoods.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = filteredFoods.length - displayedFoods.length;

  // Quick 1-tap add from graphic database
  const handleAddGraphicFood = (food: GraphicFoodItem) => {
    onAddItem({
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: food.name,
      category: food.category,
      portion: food.portion,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sodium: food.sodium,
      sugar: food.sugar,
      icon: food.icon,
      healthTags: [food.tag],
    });
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    await onParseFoodText(customText.trim(), customCategory);
    setCustomText('');
    setShowCustomInput(false);
  };

  // Group logged items by category
  const mealSections: { key: MealCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'breakfast', label: 'Breakfast', icon: <Coffee className="w-4 h-4 text-amber-600" /> },
    { key: 'lunch', label: 'Lunch', icon: <Sun className="w-4 h-4 text-emerald-600" /> },
    { key: 'dinner', label: 'Dinner', icon: <Sunset className="w-4 h-4 text-indigo-600" /> },
    { key: 'snack', label: 'Snacks & Drinks', icon: <Cookie className="w-4 h-4 text-rose-600" /> },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Graphic Food Selection Catalog */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 flex-wrap">
              <span>Select Foods</span>
              <span className="text-xs font-normal text-stone-500">
                • Tap any item to add to your daily log
              </span>
              {!isSearching && (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full ml-1">
                  {isCatalogExpanded ? `All ${filteredFoods.length} items shown` : `Top ${displayedFoods.length} staples`}
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food or brand..."
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

        {/* Custom Quick-Entry Form (collapsible) */}
        {showCustomInput && (
          <form onSubmit={handleCustomSubmit} className="mb-4 p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
            <div className="flex flex-wrap gap-1.5 text-xs font-medium">
              <span className="text-stone-500 py-1 mr-1">Meal:</span>
              {mealSections.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCustomCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    customCategory === cat.key
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-white text-stone-600 hover:bg-stone-200/60 border border-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type custom food name (e.g. In-N-Out Double-Double)..."
                className="flex-1 px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                disabled={isParsing || !customText.trim()}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs shrink-0"
              >
                {isParsing ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 rounded-xl mb-4 max-w-fit">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSelectedCategory(tab.key);
                setIsCatalogExpanded(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === tab.key
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Graphic Food Labels Grid: Brief List Initially, Expandable by Button */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-2.5">
          {displayedFoods.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => handleAddGraphicFood(food)}
              className="group relative flex flex-col items-center justify-between p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-emerald-400 hover:shadow-xs active:scale-[0.98] transition-all text-center min-h-[135px]"
            >
              {/* Food Graphic Emoji */}
              <div className="text-3xl sm:text-3xl my-1 group-hover:scale-110 transition-transform select-none">
                {food.icon}
              </div>

              {/* Food Name */}
              <div className="w-full">
                <p className="text-xs font-bold text-stone-800 line-clamp-2 leading-snug group-hover:text-emerald-900" title={food.name}>
                  {food.name}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-[10px] font-semibold text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                    {food.calories} kcal
                  </span>
                </div>
              </div>

              {/* Tap to Add hover indicator */}
              <div className="mt-2 text-[10px] font-bold text-emerald-700 opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </div>
            </button>
          ))}
        </div>

        {/* Hidden List Expandable Button */}
        {!isSearching && filteredFoods.length > INITIAL_VISIBLE_COUNT && (
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
                    Explore More Foods ({hiddenCount} more in {CATEGORY_TABS.find((t) => t.key === selectedCategory)?.label})
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {filteredFoods.length === 0 && (
          <div className="py-8 text-center text-xs text-stone-400">
            No foods found matching "{searchQuery}". Try a different keyword or use "+ Custom".
          </div>
        )}
      </div>

      {/* 2. Current Food Log by Meal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-stone-900">
            Today's Logged Meals ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h3>
          <span className="text-xs font-semibold text-stone-500">
            Total: {items.reduce((acc, i) => acc + i.calories, 0)} kcal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {mealSections.map((sec) => {
            const secItems = items.filter((i) => i.category === sec.key);
            const secCalories = secItems.reduce((acc, i) => acc + i.calories, 0);

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
                      {secCalories} kcal
                    </span>
                  </div>

                  {secItems.length === 0 ? (
                    <div className="py-5 text-center text-xs text-stone-400">
                      No items logged yet
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {secItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-50/70 hover:bg-stone-50 border border-stone-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg select-none shrink-0">
                              {item.icon || '🍽️'}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-stone-900 truncate">
                                {item.name}
                              </p>
                              <span className="text-[10px] text-stone-400">
                                {item.portion} • {item.calories} kcal
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onRequestSwap(item)}
                              title="Find healthier swap"
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
