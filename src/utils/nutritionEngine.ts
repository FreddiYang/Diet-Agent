import { FoodItem, NutritionalGoals, DailyAnalysis, HealthierAlternative, Ingredient } from '../types';
import { INGREDIENTS_DATABASE, calculateIngredientNutrition } from '../data/foodDatabase';
import { roundToTwo, formatNum } from './formatters';

export function calculateTotals(items: FoodItem[]) {
  const raw = items.reduce(
    (acc, item) => ({
      calories: acc.calories + (Number(item.calories) || 0),
      protein: acc.protein + (Number(item.protein) || 0),
      carbs: acc.carbs + (Number(item.carbs) || 0),
      fat: acc.fat + (Number(item.fat) || 0),
      fiber: acc.fiber + (Number(item.fiber) || 0),
      sodium: acc.sodium + (Number(item.sodium) || 0),
      sugar: acc.sugar + (Number(item.sugar) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 }
  );

  return {
    calories: roundToTwo(raw.calories),
    protein: roundToTwo(raw.protein),
    carbs: roundToTwo(raw.carbs),
    fat: roundToTwo(raw.fat),
    fiber: roundToTwo(raw.fiber),
    sodium: roundToTwo(raw.sodium),
    sugar: roundToTwo(raw.sugar),
  };
}

// Helper to look up an ingredient by ID or name
function findDatabaseIngredient(predicate: (i: Ingredient) => boolean): Ingredient | undefined {
  return INGREDIENTS_DATABASE.find(predicate);
}

// Generate smart healthier alternatives selected directly from the Ingredient Database
export function generateAlternativeForItem(item: FoodItem, goals: NutritionalGoals): HealthierAlternative | null {
  const name = (item.name || '').toLowerCase();
  const weight = item.weightGrams || 50;

  // 1. Direct ingredientId match
  let targetIngredient: Ingredient | undefined;
  let targetWeight = weight;
  let whyHealthier = '';

  if (item.ingredientId) {
    const directIng = INGREDIENTS_DATABASE.find((i) => i.id === item.ingredientId);
    if (directIng && directIng.swapAlternativeId) {
      targetIngredient = INGREDIENTS_DATABASE.find((i) => i.id === directIng.swapAlternativeId);
      if (directIng.swapReason) {
        whyHealthier = directIng.swapReason;
      }
    }
  }

  // 2. Keyword matching directly into Ingredient Database
  if (!targetIngredient) {
    if (name.includes('bacon')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-turkey-bacon');
      targetWeight = weight;
      whyHealthier = 'Turkey bacon cuts saturated fat and calorie load significantly.';
    } else if (name.includes('white bread') || name.includes('sandwich bread') || name.includes('bagel')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-whole-wheat-bread');
      targetWeight = weight;
      whyHealthier = '100% Whole Wheat preserves the grain germ and bran for steady glucose and higher fiber.';
    } else if (name.includes('mayo') || name.includes('mayonnaise')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-avocado-oil-mayo');
      targetWeight = weight;
      whyHealthier = 'Avocado oil mayo halves the calories and replaces seed oils with monounsaturates.';
    } else if (name.includes('butter') || name.includes('margarine')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-extra-virgin-olive-oil');
      targetWeight = weight;
      whyHealthier = 'Extra virgin olive oil provides cardioprotective polyphenols without dairy saturated fats.';
    } else if (name.includes('fry') || name.includes('fries') || name.includes('tater')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-sweet-potato');
      targetWeight = Math.max(weight, 130);
      whyHealthier = 'Baked sweet potato removes deep-fry trans fats and is loaded with beta-carotene.';
    } else if (name.includes('cola') || name.includes('soda') || name.includes('sweetened')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-sparkling-water');
      targetWeight = weight;
      whyHealthier = 'Sparkling mineral water completely eliminates added high-fructose corn syrup.';
    } else if (name.includes('sugar') || name.includes('syrup')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-stevia');
      targetWeight = 2;
      whyHealthier = 'Stevia leaf extract delivers sweetness with 0 calories and 0 glycemic impact.';
    } else if (name.includes('chip') || name.includes('crisp')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-popcorn-airpopped');
      targetWeight = weight;
      whyHealthier = 'Air-popped popcorn is 100% whole grain volume crunch with 70% less fat.';
    } else if (name.includes('beef') || name.includes('patty') || name.includes('burger')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-ground-turkey-937');
      targetWeight = weight;
      whyHealthier = 'Lean 93/7 ground poultry cuts fat by more than half while packing clean amino acids.';
    } else if (name.includes('cheddar') || (name.includes('cheese') && !name.includes('cottage'))) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-part-skim-mozzarella');
      targetWeight = weight;
      whyHealthier = 'Part-skim mozzarella reduces saturated fat and sodium while increasing protein density.';
    } else if (name.includes('milk') && !name.includes('almond') && !name.includes('soy')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-almond-milk-unsweetened');
      targetWeight = weight;
      whyHealthier = 'Unsweetened almond milk slashes calories by 75% for coffees, shakes, and cereals.';
    } else if (name.includes('pasta') || name.includes('spaghetti') || name.includes('noodle')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-quinoa');
      targetWeight = weight;
      whyHealthier = 'Quinoa supplies complete plant proteins and prevents rapid postprandial glucose spikes.';
    } else if (name.includes('white rice')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-brown-rice');
      targetWeight = weight;
      whyHealthier = 'Cooked brown rice delivers 4x higher fiber and complex B-vitamins.';
    } else if (name.includes('pepperoni') || name.includes('salami') || name.includes('sausage')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-deli-turkey');
      targetWeight = Math.max(weight, 60);
      whyHealthier = 'Lean deli turkey eliminates cured nitrates and cuts sodium drastically.';
    } else if (name.includes('chocolate') && !name.includes('dark')) {
      targetIngredient = findDatabaseIngredient((i) => i.id === 'ing-dark-chocolate-85');
      targetWeight = 25;
      whyHealthier = '85% Dark cacao cuts sugar by 75% while providing rich magnesium and antioxidants.';
    }
  }

  if (!targetIngredient) {
    // If no candidate, pick a clean baseline staple from the database that beats the current item
    const cleanStaples = INGREDIENTS_DATABASE.filter((i) => !i.isUnhealthyOrComfort);
    targetIngredient = cleanStaples.find((i) => i.aisle === 'produce' || i.aisle === 'proteins') || cleanStaples[0];
    targetWeight = targetIngredient.suggestedGrams;
    whyHealthier = `Wholesome ${targetIngredient.name.toLowerCase()} delivers dense nutrients with minimal processed additives.`;
  }

  const swapNut = calculateIngredientNutrition(targetIngredient, targetWeight);

  const calSavings = Math.max(0, roundToTwo(Number(item.calories || 0) - swapNut.calories));
  const sodSavings = Math.max(0, roundToTwo(Number(item.sodium || 0) - swapNut.sodium));
  const sugSavings = Math.max(0, roundToTwo(Number(item.sugar || 0) - swapNut.sugar));
  const fatSavings = Math.max(0, roundToTwo(Number(item.fat || 0) - swapNut.fat));
  const protGain = Math.max(0, roundToTwo(swapNut.protein - Number(item.protein || 0)));
  const fibGain = Math.max(0, roundToTwo(swapNut.fiber - Number(item.fiber || 0)));

  return {
    id: `swap-${item.id}-${targetIngredient.id}`,
    originalFoodId: item.id,
    originalFoodName: `${item.name} (${item.portion || `${weight}g`})`,
    suggestedItemName: `${targetIngredient.name} (${swapNut.portion})`,
    icon: targetIngredient.icon,
    portion: swapNut.portion,
    calories: swapNut.calories,
    protein: swapNut.protein,
    carbs: swapNut.carbs,
    fat: swapNut.fat,
    fiber: swapNut.fiber,
    sodium: swapNut.sodium,
    sugar: swapNut.sugar,
    whyHealthier: whyHealthier || `Saves ${formatNum(calSavings)} kcal, ${formatNum(sodSavings)}mg sodium with whole-ingredient nutrition.`,
    satisfiesCraving: `Replaces ${item.name} with authentic, clean ${targetIngredient.name} from your pantry staples.`,
    preparationOrOrderTip: `Swap in your log or kitchen recipe to immediately rebalance your daily macros.`,
    savings: {
      calories: calSavings,
      sodium: sodSavings,
      sugar: sugSavings,
      fat: fatSavings,
      proteinGain: protGain,
      fiberGain: fibGain,
    },
  };
}

// Complete local clinical analysis engine
export function analyzeConsumptionLocally(items: FoodItem[], goals: NutritionalGoals): DailyAnalysis {
  const totals = calculateTotals(items);
  const areasOfConcern: string[] = [];
  const strengths: string[] = [];

  const calExcess = roundToTwo(totals.calories - goals.targetCalories);
  const isCalOver = goals.targetCalories > 0 && calExcess > 80;
  const isCalDeficitHigh = goals.targetCalories > 0 && calExcess < -400;
  const isSodiumOver = goals.maxSodium > 0 && totals.sodium > goals.maxSodium;
  const isSugarOver = goals.maxSugar > 0 && totals.sugar > goals.maxSugar;
  const isFatOver = goals.targetFat > 0 && totals.fat > goals.targetFat * 1.15;
  const isProteinUnder = goals.targetProtein > 0 && totals.protein < goals.targetProtein * 0.85;
  const isFiberUnder = goals.targetFiber > 0 && totals.fiber < goals.targetFiber * 0.85;

  // Caloric evaluation
  if (isCalOver) {
    areasOfConcern.push(`Caloric intake (${formatNum(totals.calories)} kcal) exceeds your daily budget of ${formatNum(goals.targetCalories)} kcal by +${formatNum(calExcess)} kcal.`);
  } else if (isCalDeficitHigh && totals.calories > 0) {
    areasOfConcern.push(`Caloric intake (${formatNum(totals.calories)} kcal) is below your ${formatNum(goals.targetCalories)} kcal target. Ensure adequate fueling to avoid metabolic slowdown.`);
  } else if (totals.calories > 0) {
    strengths.push(`Calorie intake (${formatNum(totals.calories)} kcal) is strictly aligned with your target (${formatNum(goals.targetCalories)} kcal).`);
  }

  // Macronutrient evaluation
  if (totals.protein >= goals.targetProtein * 0.9) {
    strengths.push(`Protein target achieved (${formatNum(totals.protein)}g / ${formatNum(goals.targetProtein)}g), supporting muscle retention and high satiety.`);
  } else if (isProteinUnder) {
    areasOfConcern.push(`Protein deficit detected (${formatNum(totals.protein)}g vs ${formatNum(goals.targetProtein)}g goal). Prioritize lean poultry, egg whites, Greek yogurt, or legumes.`);
  }

  if (totals.fiber >= goals.targetFiber * 0.9) {
    strengths.push(`Excellent dietary fiber level (${formatNum(totals.fiber)}g / ${formatNum(goals.targetFiber)}g), stabilizing glycemic curve and supporting gut microbiome.`);
  } else if (isFiberUnder) {
    areasOfConcern.push(`Dietary fiber is low (${formatNum(totals.fiber)}g vs ${formatNum(goals.targetFiber)}g goal). Adding chia seeds, berries, and vegetables will reduce glucose spikes.`);
  }

  if (isSodiumOver) {
    areasOfConcern.push(`Sodium level (${formatNum(totals.sodium)}mg) exceeds your threshold of ${formatNum(goals.maxSodium)}mg by ${formatNum(totals.sodium - goals.maxSodium)}mg, risking blood pressure elevation.`);
  } else if (totals.sodium > 0) {
    strengths.push(`Sodium consumption (${formatNum(totals.sodium)}mg) is well-controlled under your ${formatNum(goals.maxSodium)}mg threshold.`);
  }

  if (isSugarOver) {
    areasOfConcern.push(`Added sugar (${formatNum(totals.sugar)}g) exceeds your recommended cap of ${formatNum(goals.maxSugar)}g by +${formatNum(totals.sugar - goals.maxSugar)}g, driving reactive hypoglycemia.`);
  } else if (totals.sugar > 0) {
    strengths.push(`Added sugars (${formatNum(totals.sugar)}g) remain comfortably within your healthy ceiling.`);
  }

  if (isFatOver) {
    areasOfConcern.push(`Total fat intake (${formatNum(totals.fat)}g) exceeds your target of ${formatNum(goals.targetFat)}g. Look out for hidden seed oils and processed saturated fats.`);
  }

  // Rank items by nutritional concern/density to identify swap targets
  const itemsWithImpact = items.map((item) => {
    let score = 0;
    const itemCal = Number(item.calories) || 0;
    const itemSod = Number(item.sodium) || 0;
    const itemSug = Number(item.sugar) || 0;
    const itemFat = Number(item.fat) || 0;

    // Check if item corresponds to an unhealthier ingredient
    if (item.ingredientId) {
      const ing = INGREDIENTS_DATABASE.find((i) => i.id === item.ingredientId);
      if (ing?.isUnhealthyOrComfort) score += 60;
    }

    const nameLower = (item.name || '').toLowerCase();
    if (
      nameLower.includes('bacon') ||
      nameLower.includes('fries') ||
      nameLower.includes('cola') ||
      nameLower.includes('chips') ||
      nameLower.includes('sugar') ||
      nameLower.includes('mayo')
    ) {
      score += 50;
    }

    if (itemCal > 250) score += (itemCal - 200) * 0.2;
    if (itemSod > 400) score += (itemSod - 350) * 0.15;
    if (itemSug > 12) score += (itemSug - 10) * 3;
    if (itemFat > 15) score += (itemFat - 12) * 2;

    return { item, score };
  });

  // Sort descending by highest impact
  itemsWithImpact.sort((a, b) => b.score - a.score);

  const alternatives: HealthierAlternative[] = [];
  const targetCalories = goals.targetCalories || 2000;
  const isOverCalorieLimit = totals.calories > targetCalories;

  // CRITICAL USER REQUIREMENT:
  // Once the swap reaches a relatively good amount just below the total calories, stop swapping immediately!
  // If current calories are already at or below target, do not suggest calorie-reducing swaps.
  if (items.length > 0 && isOverCalorieLimit) {
    let simCalories = totals.calories;

    for (const { item } of itemsWithImpact) {
      // If already at or just below target calories, STOP!
      if (simCalories <= targetCalories) {
        break;
      }

      const alt = generateAlternativeForItem(item, goals);
      if (alt && alt.savings.calories > 0) {
        alternatives.push(alt);
        simCalories -= alt.savings.calories;

        // As soon as the swap reaches a relatively good amount just below the total calories, STOP swapping!
        if (simCalories <= targetCalories) {
          break;
        }
      }
    }
  }

  // Calculate overall Health Score (0 - 100)
  let score = 85;
  if (isCalOver) score -= Math.min(25, Math.round(calExcess / 45));
  if (isSodiumOver) score -= Math.min(22, Math.round((totals.sodium - goals.maxSodium) / 110));
  if (isSugarOver) score -= Math.min(22, Math.round((totals.sugar - goals.maxSugar) / 4.5));
  if (isProteinUnder) score -= 8;
  if (isFiberUnder) score -= 8;
  if (strengths.length > 0) score += strengths.length * 3;
  score = Math.max(25, Math.min(98, score));

  let grade = 'B';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B+';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else grade = 'Needs Improvement';

  const totalSavedCalories = alternatives.reduce((acc, a) => acc + a.savings.calories, 0);
  const projectedCalories = roundToTwo(totals.calories - totalSavedCalories);

  const summary = alternatives.length > 0
    ? `Identified ${alternatives.length} whole-ingredient swap${alternatives.length > 1 ? 's' : ''} to bring your daily total to ${formatNum(projectedCalories)} kcal, comfortably just below your ${formatNum(targetCalories)} kcal target.`
    : totals.calories > 0 && totals.calories <= targetCalories
    ? `Your daily intake (${formatNum(totals.calories)} kcal) is already within your ${formatNum(targetCalories)} kcal target. No further calorie reduction needed.`
    : `All clear! Your daily ingredient totals are within your healthy target range.`;

  return {
    overallScore: score,
    healthGrade: grade,
    summary,
    goalAlignmentInsight: `Target: ${goals.goalName} (${goals.targetCalories} kcal)`,
    strengths: strengths.length > 0 ? strengths.slice(0, 2) : ['Nutritional ingredients logged.'],
    areasOfConcern: areasOfConcern.length > 0 ? areasOfConcern.slice(0, 2) : ['No critical flags detected.'],
    alternatives,
    dailyActionPlan: alternatives.length > 0
      ? alternatives.map((a) => `Swap "${a.originalFoodName}" to save ${a.savings.calories} kcal and align with your target.`)
      : ['Maintain your healthy whole-ingredient balance and stay hydrated.'],
    macroTotals: totals,
  };
}
