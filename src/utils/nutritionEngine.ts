import { FoodItem, NutritionalGoals, DailyAnalysis, HealthierAlternative } from '../types';

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

// Generate smart, clinically grounded healthier alternatives for ANY food item
export function generateAlternativeForItem(item: FoodItem, goals: NutritionalGoals): HealthierAlternative {
  const name = item.name.toLowerCase();
  const cal = Number(item.calories) || 350;
  const sod = Number(item.sodium) || 400;
  const sug = Number(item.sugar) || 10;
  const prot = Number(item.protein) || 15;
  const fat = Number(item.fat) || 15;
  const fib = Number(item.fiber) || 2;
  const carb = Number(item.carbs) || 35;

  let suggestedName = `Nutrient-Dense Lean Alternative to ${item.name}`;
  let portion = item.portion || '1 standard serving';
  let targetCal = Math.max(120, Math.round(cal * 0.55));
  let targetProt = Math.max(22, Math.round(prot * 1.25));
  let targetCarb = Math.max(15, Math.round(carb * 0.55));
  let targetFat = Math.max(5, Math.round(fat * 0.4));
  let targetFib = Math.max(5, fib + 4);
  let targetSod = Math.max(180, Math.round(sod * 0.35));
  let targetSug = Math.max(2, Math.round(sug * 0.2));
  let whyHealthier = 'Significantly cuts excess saturated fats, refined simple sugars, and sodium while supplying high-bioavailability protein and gut-supporting dietary fiber.';
  let satisfiesCraving = 'Replicates savory warmth, umami satisfaction, and rich mouthfeel without the sluggish post-meal blood sugar crashes.';
  let prepTip = 'Request grilled preparation, dressings and sauces on the side, and substitute refined starches with double steamed greens or sweet potatoes.';

  // Culinary Categories Matching
  if (name.includes('muffin') || name.includes('latte') || name.includes('pastry') || name.includes('croissant') || name.includes('scone') || name.includes('danish')) {
    suggestedName = 'Warm Cinnamon Chia-Flax Protein Bake with Unsweetened Vanilla Almond Cold Brew';
    portion = '1 protein bake + 16oz iced beverage';
    targetCal = 220;
    targetProt = 20;
    targetCarb = 22;
    targetFat = 6;
    targetFib = 8;
    targetSod = 120;
    targetSug = 4;
    whyHealthier = 'Eliminates 350+ empty calories and 40g of refined glycemic sugar, replacing them with soluble beta-glucan fibers, omega-3s, and sustained morning energy.';
    satisfiesCraving = 'Warm bakery cinnamon-vanilla sweetness paired with a creamy, velvety iced morning espresso.';
    prepTip = 'At the coffee shop: Order a Cold Brew or Americano with a splash of unsweetened almond milk and cinnamon powder, plus a high-protein egg white bite or chia bowl.';
  } else if (name.includes('bagel') || name.includes('breakfast sandwich') || (name.includes('bacon') && name.includes('egg'))) {
    suggestedName = 'Sprouted Grain Avocado & Turkey Bacon Scramble Wrap with Spinach & Sun-Dried Tomatoes';
    portion = '1 hearty whole wrap';
    targetCal = 340;
    targetProt = 32;
    targetCarb = 28;
    targetFat = 11;
    targetFib = 7;
    targetSod = 480;
    targetSug = 3;
    whyHealthier = 'Cuts 800mg sodium and half the refined glycemic starch of a dense bagel while delivering essential choline, lutein, and lean protein.';
    satisfiesCraving = 'Crispy savory turkey bacon, warm fluffy eggs, creamy rich avocado, and toasted whole-grain satisfaction.';
    prepTip = 'Use Ezekiel sprouted grain wraps or high-fiber low-carb tortillas; swap pork bacon for lean turkey bacon or smoked paprika grilled chicken.';
  } else if (name.includes('burger') || name.includes('cheeseburger') || name.includes('patty')) {
    suggestedName = 'Grilled Rosemary Turkey Burger on Sprouted Brioche with Air-Fried Sweet Potato Wedges';
    portion = '1 sandwich (5oz lean patty) + 120g wedges';
    targetCal = 470;
    targetProt = 40;
    targetCarb = 42;
    targetFat = 14;
    targetFib = 7;
    targetSod = 540;
    targetSug = 5;
    whyHealthier = 'Cuts saturated grease and processed cheese sodium by over 60% while doubling potassium and dietary fiber.';
    satisfiesCraving = 'Delivers the deep umami, juicy texture, and melted savoriness of a gourmet burger without the food coma.';
    prepTip = 'At drive-thrus: Ask for grilled chicken or lean turkey, swap mayo for mustard or avocado, and replace fries with a side salad.';
  } else if (name.includes('fry') || name.includes('fries') || name.includes('tater') || name.includes('onion ring')) {
    suggestedName = 'Air-Fried Smoked Paprika Sweet Potato & Zucchini Wedges with Greek Yogurt Herb Dip';
    portion = '1 large basket (150g)';
    targetCal = 160;
    targetProt = 6;
    targetCarb = 26;
    targetFat = 4;
    targetFib = 6;
    targetSod = 190;
    targetSug = 4;
    whyHealthier = 'Eliminates reheated commercial deep-fry seed oils and heavy sodium, replacing them with antioxidant carotenoids.';
    satisfiesCraving = 'Piping-hot, crispy exterior with tender fluffy interior and salty smoked seasonings.';
    prepTip = 'Toss cut wedges in 1 tsp olive oil with garlic powder, cumin, and sea salt; air-fry at 400°F (200°C) for 14 minutes.';
  } else if (name.includes('pizza') || name.includes('calzone') || name.includes('lasagna')) {
    suggestedName = 'Artisan Thin Cauliflower or Spelt Flatbread with Basil Marinara, Fresh Mozzarella & Grilled Chicken';
    portion = '2 large slices (thin flatbread)';
    targetCal = 390;
    targetProt = 38;
    targetCarb = 32;
    targetFat = 12;
    targetFib = 6;
    targetSod = 560;
    targetSug = 4;
    whyHealthier = 'Replaces refined bleached white dough and greasy processed pepperoni with antioxidant tomato lycopene and lean poultry.';
    satisfiesCraving = 'Gooey melted mozzarella, aromatic oregano and garlic marinara, and crisp blistered pizza crust.';
    prepTip = 'Choose thin crust or cauliflower base, ask for light cheese, double tomato sauce, and add peppers, mushrooms, and grilled chicken.';
  } else if (name.includes('soda') || name.includes('cola') || name.includes('sprite') || name.includes('pepsi') || name.includes('fanta') || name.includes('iced tea')) {
    suggestedName = 'Sparkling Citrus Berry Cooler with Fresh Mint & Prebiotic Fiber Infusion';
    portion = '16 oz iced glass';
    targetCal = 15;
    targetProt = 0;
    targetCarb = 4;
    targetFat = 0;
    targetFib = 3;
    targetSod = 15;
    targetSug = 2;
    whyHealthier = 'Saves 50–65g of pure liquid high-fructose corn syrup, protecting liver glycogen from fatty infiltration and eliminating insulin spikes.';
    satisfiesCraving = 'High-carbonation refreshing fizz, bright tangy sweetness, and crisp cold thirst-quenching bubbles.';
    prepTip = 'Keep canned flavored sparkling waters (Spindrift, LaCroix, or Olipop) cold; add fresh lime wedges or crushed mint.';
  } else if (name.includes('chip') || name.includes('nacho') || name.includes('dorito') || name.includes('pretzel') || name.includes('cracker')) {
    suggestedName = 'Air-Popped Sea Salt & Nutritional Yeast Popcorn or Crispy Spiced Roasted Chickpeas';
    portion = '1 large bowl (3.5 cups popcorn or 80g chickpeas)';
    targetCal = 150;
    targetProt = 9;
    targetCarb = 22;
    targetFat = 3;
    targetFib = 7;
    targetSod = 190;
    targetSug = 1;
    whyHealthier = 'Provides 4x the volume and 3x the fiber with 75% less sodium and zero trans fats.';
    satisfiesCraving = 'Loud, crunchy, salty, and savory snacking satisfaction that lasts through an entire movie or study session.';
    prepTip = 'Air-pop kernels, mist with extra virgin olive oil, and toss with garlic powder, smoked paprika, and savory nutritional yeast.';
  } else if (name.includes('sub') || name.includes('sandwich') || name.includes('panini') || name.includes('wrap')) {
    suggestedName = 'Carved Herb Roasted Turkey Breast on Sprouted Multigrain with Avocado, Tomato & Spicy Dijon';
    portion = '1 6-inch sub or full wrap';
    targetCal = 380;
    targetProt = 36;
    targetCarb = 36;
    targetFat = 11;
    targetFib = 8;
    targetSod = 590;
    targetSug = 4;
    whyHealthier = 'Swaps processed high-nitrate cold cuts and oil-heavy mayonnaise for clean roasted poultry and heart-protective monounsaturated fats.';
    satisfiesCraving = 'Crisp fresh lettuce crunch, peppery dijon kick, tender savory meat, and toasted hearty grain bite.';
    prepTip = 'At deli counters: Request whole grain or lettuce wrap, ask for double carved turkey/chicken, and substitute oil/mayo with avocado or vinegar & mustard.';
  } else if (name.includes('chicken') && (name.includes('fried') || name.includes('nugget') || name.includes('tender') || name.includes('wing'))) {
    suggestedName = 'Crispy Oven-Baked Panko Herb Chicken Breast Strips with Greek Yogurt Honey-Mustard';
    portion = '6 large strips (180g)';
    targetCal = 320;
    targetProt = 42;
    targetCarb = 16;
    targetFat = 9;
    targetFib = 2;
    targetSod = 420;
    targetSug = 3;
    whyHealthier = 'Saves 350+ calories and cuts saturated grease by 70% by substituting deep frying with high-heat convection baking.';
    satisfiesCraving = 'Golden shattering crunchy crust on the outside with juicy, tender chicken inside and creamy tangy dip.';
    prepTip = 'Dip raw chicken breast strips in whisked egg white, dredge in whole wheat panko with garlic herb seasonings, bake at 425°F for 16 mins.';
  } else if (name.includes('pasta') || name.includes('spaghetti') || name.includes('alfredo') || name.includes('macaroni') || name.includes('noodle')) {
    suggestedName = 'High-Protein Chickpea Penne with Slow-Simmered Tomato Basil Marinara & Lean Turkey Meatballs';
    portion = '1 generous bowl (1.5 cups)';
    targetCal = 420;
    targetProt = 38;
    targetCarb = 46;
    targetFat = 10;
    targetFib = 12;
    targetSod = 490;
    targetSug = 5;
    whyHealthier = 'Doubles protein and triples dietary fiber compared to semolina pasta, preventing postprandial glucose surges.';
    satisfiesCraving = 'Comforting, hearty al-dente pasta texture draped in warm, rich garlic-herb Italian sauce.';
    prepTip = 'Use Banza chickpea or Barilla Red Lentil pasta; mix 50/50 with sautéed zucchini ribbons or mushrooms for maximum volume.';
  } else if (name.includes('ice cream') || name.includes('sundae') || name.includes('gelato') || name.includes('cookie') || name.includes('cake') || name.includes('donut')) {
    suggestedName = 'Whipped Frozen Greek Yogurt Parfait with Wild Berries, Raw Cacao Nibs & Warm Almond Butter';
    portion = '1 large dessert bowl';
    targetCal = 210;
    targetProt = 20;
    targetCarb = 22;
    targetFat = 6;
    targetFib = 6;
    targetSod = 80;
    targetSug = 10;
    whyHealthier = 'Provides 20g of muscle-repairing casein and probiotic live cultures while cutting processed syrups and trans fats by 80%.';
    satisfiesCraving = 'Velvety, cold, thick creaminess with decadent chocolate crunches and naturally sweet berry bursts.';
    prepTip = 'Blend 1 frozen banana with 1 cup cold 0% plain Greek yogurt, vanilla extract, and a pinch of cinnamon for instant soft-serve.';
  }

  // Calculate actual savings
  const calSavings = Math.max(0, cal - targetCal);
  const sodSavings = Math.max(0, sod - targetSod);
  const sugSavings = Math.max(0, sug - targetSug);
  const fatSavings = Math.max(0, fat - targetFat);
  const protGain = Math.max(0, targetProt - prot);
  const fibGain = Math.max(0, targetFib - fib);

  return {
    id: `smart-swap-${item.id}-${Date.now()}`,
    originalFoodId: item.id,
    originalFoodName: item.name,
    suggestedItemName: suggestedName,
    portion,
    calories: targetCal,
    protein: targetProt,
    carbs: targetCarb,
    fat: targetFat,
    fiber: targetFib,
    sodium: targetSod,
    sugar: targetSug,
    whyHealthier,
    satisfiesCraving,
    preparationOrOrderTip: prepTip,
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
  const needsSwaps = isCalOver || isSodiumOver || isSugarOver || isFatOver || isFiberUnder || itemsWithImpact.some((i) => i.score > 20);

  if (needsSwaps && items.length > 0) {
    // Pick top 2 to 4 items that contribute most to the excess
    const topPicks = itemsWithImpact.slice(0, Math.min(items.length, 3));
    for (const { item } of topPicks) {
      alternatives.push(generateAlternativeForItem(item, goals));
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

  const totalCalSaved = alternatives.reduce((acc, a) => acc + a.savings.calories, 0);
  const totalSodSaved = alternatives.reduce((acc, a) => acc + a.savings.sodium, 0);

  const summary = `Daily intake totals ${totals.calories} kcal with ${totals.protein}g protein, ${totals.sodium}mg sodium, and ${totals.sugar}g sugar. ${
    alternatives.length > 0
      ? `Identified ${alternatives.length} strategic healthier swaps to eliminate excess ${isCalOver ? 'calories' : ''}${isSodiumOver ? ', sodium' : ''}${isSugarOver ? ', sugar' : ''} and recover up to ${totalCalSaved} kcal and ${totalSodSaved}mg sodium.`
      : 'Your daily food intake displays good nutritional alignment with your goal.'
  }`;

  return {
    overallScore: score,
    healthGrade: grade,
    summary,
    goalAlignmentInsight: `Evaluated against your "${goals.goalName}" target: ${goals.focusDescription}`,
    strengths: strengths.length > 0 ? strengths : ['Daily meals and macronutrients logged systematically.'],
    areasOfConcern: areasOfConcern.length > 0 ? areasOfConcern : ['No critical nutritional flags detected. Maintain this dietary consistency.'],
    alternatives,
    dailyActionPlan: [
      alternatives.length > 0
        ? `Adopt the swap for "${alternatives[0].originalFoodName}" to immediately save ${alternatives[0].savings.calories} kcal and cut excess sodium.`
        : 'Continue meeting your dietary fiber and hydration targets.',
      'Drink at least 2.5L of water and add leafy greens or chia seeds to buffer glucose absorption.',
      'Prioritize lean whole-food protein at lunch to curb evening sugar cravings.'
    ],
    macroTotals: totals,
  };
}
