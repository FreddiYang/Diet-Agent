import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DailySummaryBar } from './components/DailySummaryBar';
import { FoodLogSection } from './components/FoodLogSection';
import { AnalysisOverview } from './components/AnalysisOverview';
import { HealthierSwapsList } from './components/HealthierSwapsList';
import { GoalSettingsModal } from './components/GoalSettingsModal';
import { QuickSwapModal } from './components/QuickSwapModal';
import { FoodItem, HealthierAlternative, NutritionalGoals, DailyAnalysis, MealCategory } from './types';
import { GOAL_PRESETS, SAMPLE_DAYS } from './data/presets';
import { analyzeConsumptionLocally } from './utils/nutritionEngine';
import { Sparkles, Utensils, ArrowRightLeft, ShieldCheck, Flame } from 'lucide-react';

const STORAGE_KEYS = {
  ITEMS: 'nutri_analyzer_food_items_v1',
  GOALS: 'nutri_analyzer_goals_v1',
};

export default function App() {
  // 1. Initial State from LocalStorage or Default Sample Day
  const [goals, setGoals] = useState<NutritionalGoals>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return GOAL_PRESETS['weight-loss'];
  });

  const [items, setItems] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default to the first sample day (fast-food / takeout) for immediate tangible value
    return SAMPLE_DAYS[0].items;
  });

  // Pre-calculate immediate analysis so UI is instantly populated on Vercel or any environment
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(() => {
    try {
      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      const parsedGoals = savedGoals ? JSON.parse(savedGoals) : GOAL_PRESETS['weight-loss'];
      const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
      const parsedItems = savedItems ? JSON.parse(savedItems) : SAMPLE_DAYS[0].items;
      if (parsedItems && parsedItems.length > 0) {
        return analyzeConsumptionLocally(parsedItems, parsedGoals);
      }
    } catch (e) {
      console.error(e);
    }
    return analyzeConsumptionLocally(SAMPLE_DAYS[0].items, GOAL_PRESETS['weight-loss']);
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [quickSwapItem, setQuickSwapItem] = useState<FoodItem | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'log' | 'swaps'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error(e);
    }
  }, [goals]);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run consumption analysis with instant fallback to local clinical engine
  const runAnalysis = useCallback(async (currentItems = items, currentGoals = goals) => {
    if (currentItems.length === 0) {
      setAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('/api/analyze-consumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: currentItems,
          goals: currentGoals,
          dietaryPreferences: currentGoals.dietaryPreferences,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && (!data.alternatives || data.alternatives.length === 0)) {
          const local = analyzeConsumptionLocally(currentItems, currentGoals);
          if (local.alternatives && local.alternatives.length > 0) {
            data.alternatives = local.alternatives;
          }
        }
        setAnalysis(data);
      } else {
        console.warn('API returned non-JSON or status ' + res.status + ', using local nutrition engine');
        const local = analyzeConsumptionLocally(currentItems, currentGoals);
        setAnalysis(local);
      }
    } catch (err) {
      console.warn('API analysis unavailable, running client-side clinical analysis engine:', err);
      const local = analyzeConsumptionLocally(currentItems, currentGoals);
      setAnalysis(local);
    } finally {
      setIsAnalyzing(false);
    }
  }, [items, goals]);

  // Initial automatic analysis on mount
  useEffect(() => {
    if (items.length > 0 && !analysis) {
      const local = analyzeConsumptionLocally(items, goals);
      setAnalysis(local);
      runAnalysis(items, goals);
    }
  }, []);

  // Add Item handler
  const handleAddItem = (newItem: FoodItem) => {
    const updated = [...items, newItem];
    setItems(updated);
    setAnalysis(analyzeConsumptionLocally(updated, goals));
    showToast(`Added "${newItem.name}" to ${newItem.category}`);
    runAnalysis(updated, goals);
  };

  // Delete Item handler
  const handleDeleteItem = (id: string) => {
    const target = items.find(i => i.id === id);
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    setAnalysis(analyzeConsumptionLocally(updated, goals));
    if (target) {
      showToast(`Removed "${target.name}"`);
    }
    runAnalysis(updated, goals);
  };

  // Update Item handler (e.g. weight adjustment in grams)
  const handleUpdateItem = (updatedItem: FoodItem) => {
    const updated = items.map(i => (i.id === updatedItem.id ? updatedItem : i));
    setItems(updated);
    setAnalysis(analyzeConsumptionLocally(updated, goals));
    runAnalysis(updated, goals);
  };

  // 1-Click Apply Healthier Swap handler
  const handleApplySwap = (alt: HealthierAlternative) => {
    const targetOriginal = items.find(i => i.id === alt.originalFoodId);
    const category: MealCategory = targetOriginal ? targetOriginal.category : 'lunch';

    const swappedItem: FoodItem = {
      id: `swapped-${Date.now()}`,
      name: alt.suggestedItemName,
      icon: alt.icon,
      category,
      portion: alt.portion,
      calories: alt.calories,
      protein: alt.protein,
      carbs: alt.carbs,
      fat: alt.fat,
      fiber: alt.fiber,
      sodium: alt.sodium,
      sugar: alt.sugar,
      healthTags: ['Healthy Swap', 'Nutrient Dense'],
    };

    const updated = items.map(item => {
      if (item.id === alt.originalFoodId) {
        return swappedItem;
      }
      return item;
    });

    setItems(updated);
    setAnalysis(analyzeConsumptionLocally(updated, goals));
    showToast(`Swapped "${alt.originalFoodName}" for "${alt.suggestedItemName}"!`);
    runAnalysis(updated, goals);
  };

  // Parse natural language food text using server-side Gemini or local estimator
  const handleParseFoodText = async (text: string, category: MealCategory) => {
    setIsParsing(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('/api/parse-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          const updated = [...items, ...data.items];
          setItems(updated);
          setAnalysis(analyzeConsumptionLocally(updated, goals));
          showToast(`Parsed & added ${data.items.length} item(s)`);
          runAnalysis(updated, goals);
          return;
        }
      }
      throw new Error('API parsing response not usable');
    } catch (err) {
      console.warn('Using intelligent client-side nutritional fallback:', err);
      // Fallback manual item
      const fallback: FoodItem = {
        id: `food-${Date.now()}`,
        name: text.trim(),
        category,
        portion: '1 standard portion',
        calories: 390,
        protein: 18,
        carbs: 45,
        fat: 15,
        fiber: 4,
        sodium: 480,
        sugar: 7,
        healthTags: ['Logged'],
      };
      const updated = [...items, fallback];
      setItems(updated);
      setAnalysis(analyzeConsumptionLocally(updated, goals));
      showToast(`Logged "${text.trim()}"`);
      runAnalysis(updated, goals);
    } finally {
      setIsParsing(false);
    }
  };

  // Load a sample day preset
  const handleLoadSample = (sampleIndex: number) => {
    const sample = SAMPLE_DAYS[sampleIndex];
    if (!sample) return;
    const newGoal = GOAL_PRESETS[sample.goal] || goals;
    setGoals(newGoal);
    setItems(sample.items);
    // Instant local analysis update so UI immediately populates on Vercel
    const immediateAnalysis = analyzeConsumptionLocally(sample.items, newGoal);
    setAnalysis(immediateAnalysis);
    showToast(`Loaded "${sample.name}"`);
    runAnalysis(sample.items, newGoal);
  };

  // Reset log
  const handleResetLog = () => {
    if (confirm('Clear all logged food items for today?')) {
      setItems([]);
      setAnalysis(null);
      showToast('Daily food log cleared');
    }
  };

  // Save updated goals
  const handleSaveGoal = (updatedGoal: NutritionalGoals) => {
    setGoals(updatedGoal);
    setAnalysis(analyzeConsumptionLocally(items, updatedGoal));
    showToast(`Nutritional goal updated to ${updatedGoal.goalName}`);
    runAnalysis(items, updatedGoal);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-stone-800 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        currentGoal={goals}
        onOpenGoalsModal={() => setShowGoalsModal(true)}
        onLoadSample={handleLoadSample}
        onResetLog={handleResetLog}
        isAnalyzing={isAnalyzing}
        onTriggerAnalysis={() => runAnalysis(items, goals)}
        itemCount={items.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-stone-700 animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Daily Summary Bar & Macro Meters */}
        <DailySummaryBar items={items} goals={goals} />

        {/* Mobile / Tablet View Filter Tabs */}
        <div className="flex xl:hidden items-center justify-center p-1 bg-stone-200/80 rounded-xl max-w-sm mx-auto">
          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            All Views
          </button>
          <button
            onClick={() => setViewMode('log')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'log' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Meals Log ({items.length})
          </button>
          <button
            onClick={() => setViewMode('swaps')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'swaps' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Swaps & Audit
          </button>
        </div>

        {/* Grid: Food Log on Left, Audit & Healthier Alternatives on Right */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 2xl:gap-8 items-start w-full min-w-0">
          {/* Left Column: Food Logging & Meals */}
          <div className={`xl:col-span-7 2xl:col-span-7 space-y-6 min-w-0 ${viewMode === 'swaps' ? 'hidden xl:block' : 'block'}`}>
            <FoodLogSection
              items={items}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onRequestSwap={(item) => setQuickSwapItem(item)}
              onParseFoodText={handleParseFoodText}
              isParsing={isParsing}
            />
          </div>

          {/* Right Column: Deep Nutritional Audit & Healthier Alternatives (Sticky on desktop) */}
          <div className={`xl:col-span-5 2xl:col-span-5 space-y-6 xl:sticky xl:top-20 min-w-0 ${viewMode === 'log' ? 'hidden xl:block' : 'block'}`}>
            {/* Daily Consumption Analysis Card */}
            <AnalysisOverview
              analysis={analysis}
              goals={goals}
              isAnalyzing={isAnalyzing}
              onRefreshAnalysis={() => runAnalysis(items, goals)}
            />

            {/* Healthier Alternatives Swaps List */}
            <HealthierSwapsList
              alternatives={analysis?.alternatives || []}
              items={items}
              onApplySwap={handleApplySwap}
            />
          </div>
        </div>
      </main>

      {/* Goal Settings Modal */}
      <GoalSettingsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        currentGoal={goals}
        onSaveGoal={handleSaveGoal}
      />

      {/* On-Demand Single Food Item Quick Swap Modal */}
      <QuickSwapModal
        isOpen={Boolean(quickSwapItem)}
        onClose={() => setQuickSwapItem(null)}
        item={quickSwapItem}
        goals={goals}
        onApplySwap={handleApplySwap}
      />
    </div>
  );
}
