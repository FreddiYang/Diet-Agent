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

  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
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

  // Run consumption analysis
  const runAnalysis = useCallback(async (currentItems = items, currentGoals = goals) => {
    if (currentItems.length === 0) {
      setAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-consumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: currentItems,
          goals: currentGoals,
          dietaryPreferences: currentGoals.dietaryPreferences,
        }),
      });

      if (!res.ok) throw new Error('Analysis request failed');
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to run food consumption analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [items, goals]);

  // Initial automatic analysis on mount
  useEffect(() => {
    if (items.length > 0 && !analysis) {
      runAnalysis(items, goals);
    }
  }, []);

  // Add Item handler
  const handleAddItem = (newItem: FoodItem) => {
    const updated = [...items, newItem];
    setItems(updated);
    showToast(`Added "${newItem.name}" to ${newItem.category}`);
    runAnalysis(updated, goals);
  };

  // Delete Item handler
  const handleDeleteItem = (id: string) => {
    const target = items.find(i => i.id === id);
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    if (target) {
      showToast(`Removed "${target.name}"`);
    }
    runAnalysis(updated, goals);
  };

  // 1-Click Apply Healthier Swap handler
  const handleApplySwap = (alt: HealthierAlternative) => {
    const targetOriginal = items.find(i => i.id === alt.originalFoodId);
    const category: MealCategory = targetOriginal ? targetOriginal.category : 'lunch';

    const swappedItem: FoodItem = {
      id: `swapped-${Date.now()}`,
      name: alt.suggestedItemName,
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
    showToast(`Swapped "${alt.originalFoodName}" for "${alt.suggestedItemName}"!`);
    runAnalysis(updated, goals);
  };

  // Parse natural language food text using server-side Gemini
  const handleParseFoodText = async (text: string, category: MealCategory) => {
    setIsParsing(true);
    try {
      const res = await fetch('/api/parse-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category }),
      });

      if (!res.ok) throw new Error('Parsing failed');
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        const updated = [...items, ...data.items];
        setItems(updated);
        showToast(`Parsed & added ${data.items.length} item(s)`);
        runAnalysis(updated, goals);
      }
    } catch (err) {
      console.error(err);
      // Fallback manual item
      const fallback: FoodItem = {
        id: `food-${Date.now()}`,
        name: text,
        category,
        portion: '1 serving',
        calories: 380,
        protein: 16,
        carbs: 45,
        fat: 14,
        fiber: 4,
        sodium: 480,
        sugar: 8,
        healthTags: ['Self-Logged'],
      };
      const updated = [...items, fallback];
      setItems(updated);
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Daily Summary Bar & Macro Meters */}
        <DailySummaryBar items={items} goals={goals} />

        {/* Mobile View Filter Tabs */}
        <div className="flex lg:hidden items-center justify-center p-1 bg-stone-200/80 rounded-xl max-w-sm mx-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Food Logging & Meals */}
          <div className={`lg:col-span-6 space-y-6 ${viewMode === 'swaps' ? 'hidden lg:block' : 'block'}`}>
            <FoodLogSection
              items={items}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onRequestSwap={(item) => setQuickSwapItem(item)}
              onParseFoodText={handleParseFoodText}
              isParsing={isParsing}
            />
          </div>

          {/* Right Column: Deep Nutritional Audit & Healthier Alternatives */}
          <div className={`lg:col-span-6 space-y-6 ${viewMode === 'log' ? 'hidden lg:block' : 'block'}`}>
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
