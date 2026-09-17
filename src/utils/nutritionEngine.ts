import { FoodItem, NutritionalGoals, DailyAnalysis, HealthierAlternative } from '../types';
import { GRAPHIC_FOOD_DATABASE, GraphicFoodItem } from '../data/foodDatabase';

export function calculateTotals(items: FoodItem[]) {
  return items.reduce(
    (acc, item) => ({
      calories: Math.round(acc.calories + (Number(item.calories) || 0)),
      protein: Math.round(acc.protein + (Number(item.protein) || 0)),
      carbs: Math.round(acc.carbs + (Number(item.carbs) || 0)),
      fat: Math.round(acc.fat + (Number(item.fat) || 0)),
      fiber: Math.round(acc.fiber + (Number(item.fiber) || 0)),
      sodium: Math.round(acc.sodium + (Number(item.sodium) || 0)),
      sugar: Math.round(acc.sugar + (Number(item.sugar) || 0)),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 }
  );
}

// Helper to look up a graphic food by name snippet or id
function findGraphicFood(predicate: (f: GraphicFoodItem) => boolean): GraphicFoodItem | undefined {
  return GRAPHIC_FOOD_DATABASE.find(predicate);
}

// Generate smart healthier alternatives selected directly from the graphic foods list
export function generateAlternativeForItem(item: FoodItem, goals: NutritionalGoals): HealthierAlternative {
  const name = (item.name || '').toLowerCase();
  const cal = Number(item.calories) || 350;
  const sod = Number(item.sodium) || 400;
  const sug = Number(item.sugar) || 10;
  const prot = Number(item.protein) || 15;
  const fat = Number(item.fat) || 15;
  const fib = Number(item.fiber) || 2;

  // Candidates from graphic food database that are clean/healthy (not comfort)
  const healthyFoods = GRAPHIC_FOOD_DATABASE.filter((f) => !f.isComfort);

  let chosen: GraphicFoodItem | undefined;

  // 1. Specific Keyword Matching to exact Graphic Foods
  if (name.includes('pizza') || name.includes('calzone')) {
    chosen = findGraphicFood((f) => f.name.includes('Thin Crust Margherita') || f.name.includes('Salmon'));
  } else if (name.includes('burger') || name.includes('patty') || name.includes('cheeseburger')) {
    chosen = findGraphicFood((f) => f.name.includes('Grilled Herb Chicken') || f.name.includes('Roast Turkey') || f.name.includes('Caesar Salad'));
  } else if (name.includes('fry') || name.includes('fries') || name.includes('tater') || name.includes('onion ring')) {
    chosen = findGraphicFood((f) => f.name.includes('Popcorn') || f.name.includes('Edamame') || f.name.includes('Carrots'));
  } else if (name.includes('bagel') || name.includes('bacon') || name.includes('sausage burrito')) {
    chosen = findGraphicFood((f) => f.name.includes('Avocado & Poached Egg') || f.name.includes('Egg White Bites'));
  } else if (name.includes('pancake') || name.includes('waffle') || name.includes('muffin') || name.includes('croissant') || name.includes('cinnamon roll')) {
    chosen = findGraphicFood((f) => f.name.includes('Greek Yogurt Parfait') || f.name.includes('Oatmeal with Berries'));
  } else if (name.includes('soda') || name.includes('cola') || name.includes('punch') || name.includes('juice') || name.includes('sprite')) {
    chosen = findGraphicFood((f) => f.name.includes('Sparkling Water') || f.name.includes('Matcha') || f.name.includes('Coconut Water'));
  } else if (name.includes('coffee') || name.includes('frappe') || name.includes('macchiato') || name.includes('latte')) {
    chosen = findGraphicFood((f) => f.name.includes('Cold Brew') || f.name.includes('Protein Shake'));
  } else if (name.includes('chip') || name.includes('queso') || name.includes('nacho') || name.includes('pretzel')) {
    chosen = findGraphicFood((f) => f.name.includes('Popcorn') || f.name.includes('Carrots & Creamy Hummus') || f.name.includes('Edamame'));
  } else if (name.includes('donut') || name.includes('cupcake') || name.includes('chocolate') || name.includes('candy') || name.includes('cookie')) {
    chosen = findGraphicFood((f) => f.name.includes('Crisp Apple with Almond') || f.name.includes('Blueberries & Walnuts'));
  } else if (name.includes('sub') || name.includes('sandwich') || name.includes('cold cut') || name.includes('wrap')) {
    chosen = findGraphicFood((f) => f.name.includes('Roast Turkey on Sprouted') || f.name.includes('Turkey Avocado Bacon Wrap'));
  } else if (name.includes('chicken') && (name.includes('fried') || name.includes('strip') || name.includes('tender') || name.includes('nugget') || name.includes('wing'))) {
    chosen = findGraphicFood((f) => f.name.includes('Air-Fried Herb Chicken') || f.name.includes('Grilled Herb Chicken'));
  } else if (name.includes('pasta') || name.includes('alfredo') || name.includes('macaroni') || name.includes('spaghetti')) {
    chosen = findGraphicFood((f) => f.name.includes('Chickpea Penne') || f.name.includes('Garlic Shrimp over Zucchini'));
  } else if (name.includes('rib') || name.includes('steak') || name.includes('bbq') || name.includes('meat')) {
    chosen = findGraphicFood((f) => f.name.includes('Grilled Sirloin Steak') || f.name.includes('Baked Lemon Salmon') || f.name.includes('Flank Steak'));
  } else if (name.includes('taco') || name.includes('burrito')) {
    chosen = findGraphicFood((f) => f.name.includes('Grilled Fish Tacos') || f.name.includes('Flank Steak Fajitas'));
  } else if (name.includes('curry') || name.includes('tikka')) {
    chosen = findGraphicFood((f) => f.name.includes('Lentil Coconut Curry') || f.name.includes('Lentil Veggie Soup'));
  }

  // 2. Fallback: pick best matching healthy food in the same meal category
  if (!chosen) {
    const sameCat = healthyFoods.filter((f) => f.category === item.category);
    if (sameCat.length > 0) {
      // Pick item with highest calorie difference or lowest calories
      chosen = sameCat.reduce((best, cur) => (cur.calories < best.calories ? cur : best), sameCat[0]);
    } else {
      chosen = healthyFoods[0];
    }
  }

  const calSavings = Math.max(0, cal - chosen.calories);
  const sodSavings = Math.max(0, sod - chosen.sodium);
  const sugSavings = Math.max(0, sug - chosen.sugar);
  const fatSavings = Math.max(0, fat - chosen.fat);
  const protGain = Math.max(0, chosen.protein - prot);
  const fibGain = Math.max(0, chosen.fiber - fib);

  return {
    id: `swap-${item.id}-${chosen.id}`,
    originalFoodId: item.id,
    originalFoodName: item.name,
    suggestedItemName: chosen.name,
    icon: chosen.icon,
    portion: chosen.portion,
    calories: chosen.calories,
    protein: chosen.protein,
    carbs: chosen.carbs,
    fat: chosen.fat,
    fiber: chosen.fiber,
    sodium: chosen.sodium,
    sugar: chosen.sugar,
    whyHealthier: calSavings > 0 ? `Saves ${calSavings} kcal and ${sodSavings}mg sodium.` : `Higher fiber and lean nutrition.`,
    satisfiesCraving: `Matches craving with wholesome ${chosen.tag.toLowerCase()} ingredients.`,
    preparationOrOrderTip: `Available directly in your Graphic Food catalog on the left.`,
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

  const calExcess = totals.calories - goals.targetCalories;
  const isCalOver = goals.targetCalories > 0 && calExcess > 80;
  const isCalDeficitHigh = goals.targetCalories > 0 && calExcess < -400;
  const isSodiumOver = goals.maxSodium > 0 && totals.sodium > goals.maxSodium;
  const isSugarOver = goals.maxSugar > 0 && totals.sugar > goals.maxSugar;
  const isFatOver = goals.targetFat > 0 && totals.fat > goals.targetFat * 1.15;
  const isProteinUnder = goals.targetProtein > 0 && totals.protein < goals.targetProtein * 0.85;
  const isFiberUnder = goals.targetFiber > 0 && totals.fiber < goals.targetFiber * 0.85;

  // Caloric evaluation
  if (isCalOver) {
    areasOfConcern.push(`Caloric intake (${totals.calories} kcal) exceeds your daily budget of ${goals.targetCalories} kcal by +${calExcess} kcal.`);
  } else if (isCalDeficitHigh && totals.calories > 0) {
    areasOfConcern.push(`Caloric intake (${totals.calories} kcal) is substantially below your ${goals.targetCalories} kcal target. Ensure adequate fueling to avoid metabolic slowdown.`);
  } else if (totals.calories > 0) {
    strengths.push(`Calorie intake (${totals.calories} kcal) is strictly aligned with your target (${goals.targetCalories} kcal).`);
  }

  // Macronutrient evaluation
  if (totals.protein >= goals.targetProtein * 0.9) {
    strengths.push(`Protein target achieved (${totals.protein}g / ${goals.targetProtein}g), supporting muscle retention and metabolic thermogenesis.`);
  } else if (isProteinUnder) {
    areasOfConcern.push(`Protein deficit detected (${totals.protein}g vs ${goals.targetProtein}g goal). Prioritize lean poultry, egg whites, Greek yogurt, or legumes.`);
  }

  if (totals.fiber >= goals.targetFiber * 0.9) {
    strengths.push(`Excellent dietary fiber level (${totals.fiber}g / ${goals.targetFiber}g), stabilizing glycemic curve and supporting gut microbiome.`);
  } else if (isFiberUnder) {
    areasOfConcern.push(`Dietary fiber is low (${totals.fiber}g vs ${goals.targetFiber}g goal). Adding chia seeds, berries, and vegetables will reduce glucose spikes.`);
  }

  if (isSodiumOver) {
    areasOfConcern.push(`Sodium level (${totals.sodium}mg) exceeds your threshold of ${goals.maxSodium}mg by ${totals.sodium - goals.maxSodium}mg, risking blood pressure elevation.`);
  } else if (totals.sodium > 0) {
    strengths.push(`Sodium consumption (${totals.sodium}mg) is well-controlled under your ${goals.maxSodium}mg threshold.`);
  }

  if (isSugarOver) {
    areasOfConcern.push(`Added sugar (${totals.sugar}g) exceeds your recommended cap of ${goals.maxSugar}g by +${totals.sugar - goals.maxSugar}g, driving reactive hypoglycemia.`);
  } else if (totals.sugar > 0) {
    strengths.push(`Added sugars (${totals.sugar}g) remain comfortably within your healthy ceiling.`);
  }

  if (isFatOver) {
    areasOfConcern.push(`Total fat intake (${totals.fat}g) exceeds your target of ${goals.targetFat}g. Look out for hidden seed oils and processed saturated fats.`);
  }

  // Rank items by nutritional concern/density
  const itemsWithImpact = items.map((item) => {
    let score = 0;
    const itemCal = Number(item.calories) || 0;
    const itemSod = Number(item.sodium) || 0;
    const itemSug = Number(item.sugar) || 0;
    const itemFat = Number(item.fat) || 0;

    // Weight by calories
    if (itemCal > 450) score += (itemCal - 400) * 0.3;
    // Weight by sodium
    if (itemSod > 700) score += (itemSod - 600) * 0.2;
    // Weight by sugar
    if (itemSug > 18) score += (itemSug - 15) * 3.5;
    // Weight by fat
    if (itemFat > 25) score += (itemFat - 20) * 2;

    // Tag check
    if (item.healthTags?.some((t) => t.toLowerCase().includes('high') || t.toLowerCase().includes('processed'))) {
      score += 30;
    }
    return { item, score };
  });

  // Sort descending by highest impact
  itemsWithImpact.sort((a, b) => b.score - a.score);

  const alternatives: HealthierAlternative[] = [];
  const isOverDailyLimit =
    (goals.targetCalories > 0 && totals.calories > goals.targetCalories) ||
    (goals.maxSodium > 0 && totals.sodium > goals.maxSodium) ||
    (goals.maxSugar > 0 && totals.sugar > goals.maxSugar);

  // Only generate swaps if exceeding daily intake limit
  if (isOverDailyLimit && items.length > 0) {
    let simCalories = totals.calories;
    let simSodium = totals.sodium;
    let simSugar = totals.sugar;

    for (const { item } of itemsWithImpact) {
      // Check if simulated intake has reached right below all daily limits
      const calSatisfied = goals.targetCalories <= 0 || simCalories <= goals.targetCalories;
      const sodiumSatisfied = goals.maxSodium <= 0 || simSodium <= goals.maxSodium;
      const sugarSatisfied = goals.maxSugar <= 0 || simSugar <= goals.maxSugar;

      if (calSatisfied && sodiumSatisfied && sugarSatisfied) {
        break; // Stop iterations once within limit!
      }

      const alt = generateAlternativeForItem(item, goals);
      alternatives.push(alt);

      simCalories -= alt.savings.calories;
      simSodium -= alt.savings.sodium;
      simSugar -= alt.savings.sugar;

      // If this single swap brings intake right below limits, stop immediately!
      if (
        (goals.targetCalories <= 0 || simCalories <= goals.targetCalories) &&
        (goals.maxSodium <= 0 || simSodium <= goals.maxSodium) &&
        (goals.maxSugar <= 0 || simSugar <= goals.maxSugar)
      ) {
        break;
      }

      // Hard cap at 2 swaps maximum to keep interactions simple and minimal
      if (alternatives.length >= 2) {
        break;
      }
    }
  }

  // Calculate overall Health Score (0 - 100)
  let score = 84;
  if (isCalOver) score -= Math.min(25, Math.round(calExcess / 45));
  if (isSodiumOver) score -= Math.min(22, Math.round((totals.sodium - goals.maxSodium) / 110));
  if (isSugarOver) score -= Math.min(22, Math.round((totals.sugar - goals.maxSugar) / 4.5));
  if (isProteinUnder) score -= 8;
  if (isFiberUnder) score -= 8;
  if (strengths.length > 0) score += strengths.length * 3;
  score = Math.max(25, Math.min(97, score));

  let grade = 'B';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B+';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else grade = 'Needs Improvement';

  const summary = alternatives.length > 0
    ? `Recommended ${alternatives.length} smart swap${alternatives.length > 1 ? 's' : ''} to bring your daily totals right below your target limit.`
    : `All clear! Your daily intake is currently below your target limit.`;

  return {
    overallScore: score,
    healthGrade: grade,
    summary,
    goalAlignmentInsight: `Target: ${goals.goalName} (${goals.targetCalories} kcal)`,
    strengths: strengths.length > 0 ? strengths.slice(0, 2) : ['Nutritional intake logged.'],
    areasOfConcern: areasOfConcern.length > 0 ? areasOfConcern.slice(0, 2) : ['No critical flags detected.'],
    alternatives,
    dailyActionPlan: alternatives.length > 0
      ? [`Swap "${alternatives[0].originalFoodName}" to save ${alternatives[0].savings.calories} kcal.`]
      : ['Maintain your current whole-food balance and stay hydrated.'],
    macroTotals: totals,
  };
}
