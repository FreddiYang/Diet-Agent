export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  category: MealCategory;
  portion: string;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber: number;   // in grams
  sodium: number;  // in mg
  sugar: number;   // in grams
  healthTags?: string[];
  notes?: string;
}

export type GoalPresetType = 
  | 'weight-loss' 
  | 'muscle-gain' 
  | 'heart-health' 
  | 'blood-sugar' 
  | 'clean-eating' 
  | 'low-sodium' 
  | 'custom';

export interface NutritionalGoals {
  primaryGoal: GoalPresetType;
  goalName: string;
  targetCalories: number;
  targetProtein: number; // in grams
  targetCarbs: number;   // in grams
  targetFat: number;     // in grams
  targetFiber: number;   // in grams
  maxSodium: number;     // in mg
  maxSugar: number;      // in grams
  dietaryPreferences: string[];
  focusDescription: string;
}

export interface HealthierAlternative {
  id: string;
  originalFoodId: string;
  originalFoodName: string;
  suggestedItemName: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  whyHealthier: string;
  satisfiesCraving: string;
  preparationOrOrderTip: string;
  savings: {
    calories: number;
    sodium: number;
    sugar: number;
    fat: number;
    proteinGain: number;
    fiberGain: number;
  };
}

export interface DailyAnalysis {
  overallScore: number; // 0 - 100
  healthGrade: string;
  summary: string;
  goalAlignmentInsight: string;
  strengths: string[];
  areasOfConcern: string[];
  alternatives: HealthierAlternative[];
  dailyActionPlan: string[];
  macroTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
    sugar: number;
  };
}
