import { FoodItem, GoalPresetType, NutritionalGoals } from '../types';
import { INGREDIENTS_DATABASE, calculateIngredientNutrition } from './foodDatabase';

export const GOAL_PRESETS: Record<GoalPresetType, NutritionalGoals> = {
  'weight-loss': {
    primaryGoal: 'weight-loss',
    goalName: 'Weight Loss & Caloric Deficit',
    targetCalories: 1800,
    targetProtein: 135,
    targetCarbs: 160,
    targetFat: 55,
    targetFiber: 35,
    maxSodium: 2000,
    maxSugar: 25,
    dietaryPreferences: [],
    focusDescription: 'Prioritizing high satiety, lean protein volume, low caloric density, and high dietary fiber while keeping added sugars minimal.'
  },
  'muscle-gain': {
    primaryGoal: 'muscle-gain',
    goalName: 'Muscle Growth & Hypertrophy',
    targetCalories: 2600,
    targetProtein: 175,
    targetCarbs: 290,
    targetFat: 75,
    targetFiber: 32,
    maxSodium: 2400,
    maxSugar: 40,
    dietaryPreferences: [],
    focusDescription: 'Targeting a clean caloric surplus with sufficient amino acids (0.8–1g/lb) and complex carbohydrates for glycogen replenishment and recovery.'
  },
  'heart-health': {
    primaryGoal: 'heart-health',
    goalName: 'Cardiovascular & Heart Health',
    targetCalories: 1900,
    targetProtein: 105,
    targetCarbs: 220,
    targetFat: 50,
    targetFiber: 38,
    maxSodium: 1500,
    maxSugar: 24,
    dietaryPreferences: [],
    focusDescription: 'Emphasizing Mediterranean style eating: low saturated fats, low sodium (<1500mg), rich in heart-healthy monounsaturated fats and soluble fibers.'
  },
  'blood-sugar': {
    primaryGoal: 'blood-sugar',
    goalName: 'Blood Sugar & Low Glycemic',
    targetCalories: 1850,
    targetProtein: 125,
    targetCarbs: 140,
    targetFat: 68,
    targetFiber: 40,
    maxSodium: 2000,
    maxSugar: 18,
    dietaryPreferences: [],
    focusDescription: 'Minimizing glucose spikes by cutting refined starches/sugars, pairing carbohydrates with fiber and healthy fats, and moderating GI index.'
  },
  'clean-eating': {
    primaryGoal: 'clean-eating',
    goalName: 'Clean Eating & Gut Health',
    targetCalories: 2000,
    targetProtein: 115,
    targetCarbs: 220,
    targetFat: 60,
    targetFiber: 45,
    maxSodium: 1800,
    maxSugar: 20,
    dietaryPreferences: [],
    focusDescription: 'Maximizing plant biodiversity, microbiome-supporting prebiotic fibers, fermented foods, and eliminating ultra-processed ingredients.'
  },
  'low-sodium': {
    primaryGoal: 'low-sodium',
    goalName: 'DASH & Low Sodium Diet',
    targetCalories: 1900,
    targetProtein: 110,
    targetCarbs: 215,
    targetFat: 55,
    targetFiber: 36,
    maxSodium: 1400,
    maxSugar: 25,
    dietaryPreferences: [],
    focusDescription: 'Strictly limiting sodium to under 1400mg with potassium-rich whole foods, leafy greens, and uncurated spices to support healthy blood pressure.'
  },
  'custom': {
    primaryGoal: 'custom',
    goalName: 'Personalized Custom Targets',
    targetCalories: 2000,
    targetProtein: 130,
    targetCarbs: 200,
    targetFat: 60,
    targetFiber: 30,
    maxSodium: 2200,
    maxSugar: 30,
    dietaryPreferences: [],
    focusDescription: 'Custom calibrated targets based on your unique metabolic preferences.'
  }
};

// Helper to construct a FoodItem from the Ingredient Database by ID and weight in grams
function createIngredientFoodItem(
  ingredientId: string,
  weightGrams: number,
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  customUnitNote?: string
): FoodItem {
  const ing = INGREDIENTS_DATABASE.find((i) => i.id === ingredientId);
  if (!ing) {
    throw new Error(`Ingredient ${ingredientId} not found in database`);
  }
  const nut = calculateIngredientNutrition(ing, weightGrams);
  return {
    id: `sample-${ingredientId}-${Math.random().toString(36).substring(2, 7)}`,
    ingredientId: ing.id,
    name: ing.name,
    icon: ing.icon,
    category,
    weightGrams,
    portion: customUnitNote ? `${weightGrams}g (${customUnitNote})` : nut.portion,
    calories: nut.calories,
    protein: nut.protein,
    carbs: nut.carbs,
    fat: nut.fat,
    fiber: nut.fiber,
    sodium: nut.sodium,
    sugar: nut.sugar,
    healthTags: ing.healthTags,
  };
}

export const SAMPLE_DAYS: { name: string; description: string; goal: GoalPresetType; items: FoodItem[] }[] = [
  {
    name: 'High Sodium & Sugar Takeout Staples',
    description: 'Composed of real ingredients: deli bagel, bacon, french fries, ground chuck, mayo, and soda ready for smart healthy swaps.',
    goal: 'weight-loss',
    items: [
      createIngredientFoodItem('ing-white-bagel', 85, 'breakfast', '1 deli bagel'),
      createIngredientFoodItem('ing-pork-bacon', 30, 'breakfast', '2 strips'),
      createIngredientFoodItem('ing-cheddar-cheese', 28, 'breakfast', '1 slice'),
      createIngredientFoodItem('ing-white-sugar', 24, 'breakfast', '2 tbsp in coffee'),
      createIngredientFoodItem('ing-whole-milk', 240, 'breakfast', '1 cup'),
      createIngredientFoodItem('ing-brewed-coffee', 240, 'breakfast', '1 cup'),

      createIngredientFoodItem('ing-white-bread', 70, 'lunch', '2 slices bun'),
      createIngredientFoodItem('ing-ground-beef-8020', 120, 'lunch', '1 burger patty'),
      createIngredientFoodItem('ing-mayonnaise', 15, 'lunch', '1 tbsp spread'),
      createIngredientFoodItem('ing-french-fries', 100, 'lunch', '1 medium order'),
      createIngredientFoodItem('ing-regular-cola', 355, 'lunch', '1 can (12 oz)'),

      createIngredientFoodItem('ing-potato-chips', 28, 'snack', '1 small bag'),
      createIngredientFoodItem('ing-milk-chocolate', 40, 'snack', '1 candy bar'),

      createIngredientFoodItem('ing-white-bread', 70, 'dinner', '2 slices thick toast'),
      createIngredientFoodItem('ing-pepperoni', 35, 'dinner', '10 slices'),
      createIngredientFoodItem('ing-cheddar-cheese', 50, 'dinner', 'shredded topping'),
    ]
  },
  {
    name: 'Convenience Staples & Refined Carbs',
    description: 'White bread, sandwich cuts, sweetened iced tea, and butter with lower protein and fiber ratios.',
    goal: 'blood-sugar',
    items: [
      createIngredientFoodItem('ing-white-bread', 70, 'breakfast', '2 slices toast'),
      createIngredientFoodItem('ing-unsalted-butter', 14, 'breakfast', '1 tbsp'),
      createIngredientFoodItem('ing-white-sugar', 12, 'breakfast', '1 tbsp in coffee'),
      createIngredientFoodItem('ing-brewed-coffee', 240, 'breakfast', '1 cup'),

      createIngredientFoodItem('ing-white-bread', 70, 'lunch', '2 slices bread'),
      createIngredientFoodItem('ing-deli-turkey', 60, 'lunch', '3 slices'),
      createIngredientFoodItem('ing-mayonnaise', 15, 'lunch', '1 tbsp'),
      createIngredientFoodItem('ing-potato-chips', 28, 'lunch', '1 small bag'),
      createIngredientFoodItem('ing-sweetened-iced-tea', 355, 'lunch', '1 bottle'),

      createIngredientFoodItem('ing-milk-chocolate', 40, 'snack', '1 treat'),

      createIngredientFoodItem('ing-white-pasta', 140, 'dinner', '1 cup cooked'),
      createIngredientFoodItem('ing-ground-beef-8020', 120, 'dinner', '4 oz beef'),
      createIngredientFoodItem('ing-cheddar-cheese', 28, 'dinner', '1 slice melted'),
    ]
  },
  {
    name: 'Balanced Clean Whole-Ingredient Day',
    description: 'Whole wheat bread, eggs, banana, chicken, brown rice, broccoli, olive oil, Greek yogurt, berries, and salmon.',
    goal: 'clean-eating',
    items: [
      createIngredientFoodItem('ing-whole-wheat-bread', 35, 'breakfast', '1 slice'),
      createIngredientFoodItem('ing-large-egg', 100, 'breakfast', '2 eggs'),
      createIngredientFoodItem('ing-banana', 118, 'breakfast', '1 medium banana'),
      createIngredientFoodItem('ing-brewed-coffee', 240, 'breakfast', '1 cup black'),

      createIngredientFoodItem('ing-chicken-breast', 140, 'lunch', '1 fillet'),
      createIngredientFoodItem('ing-brown-rice', 150, 'lunch', '1 cup cooked'),
      createIngredientFoodItem('ing-broccoli-florets', 85, 'lunch', '1 cup steamed'),
      createIngredientFoodItem('ing-extra-virgin-olive-oil', 14, 'lunch', '1 tbsp dressing'),

      createIngredientFoodItem('ing-greek-yogurt-0', 150, 'snack', '1 tub nonfat'),
      createIngredientFoodItem('ing-blueberries', 80, 'snack', '1/2 cup fresh'),
      createIngredientFoodItem('ing-raw-almonds', 28, 'snack', '1 oz nuts'),

      createIngredientFoodItem('ing-atlantic-salmon', 140, 'dinner', '1 fillet'),
      createIngredientFoodItem('ing-sweet-potato', 130, 'dinner', '1 medium baked'),
      createIngredientFoodItem('ing-asparagus-spears', 90, 'dinner', '6 spears'),
      createIngredientFoodItem('ing-extra-virgin-olive-oil', 10, 'dinner', 'drizzled on greens'),
    ]
  }
];
