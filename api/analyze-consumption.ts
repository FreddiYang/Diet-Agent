import { GoogleGenAI, Type } from '@google/genai';

function calculateMacroTotals(items: any[]) {
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

function generateRuleBasedAnalysis(items: any[], goals: any) {
  const totals = calculateMacroTotals(items);
  const areasOfConcern: string[] = [];
  const strengths: string[] = [];
  const alternatives: any[] = [];

  const calExcess = totals.calories - (goals?.targetCalories || 2000);
  const isCalOver = goals?.targetCalories > 0 && calExcess > 80;
  const isSodiumOver = goals?.maxSodium > 0 && totals.sodium > goals.maxSodium;
  const isSugarOver = goals?.maxSugar > 0 && totals.sugar > goals.maxSugar;
  const isFatOver = goals?.targetFat > 0 && totals.fat > goals.targetFat * 1.15;
  const isProteinUnder = goals?.targetProtein > 0 && totals.protein < goals.targetProtein * 0.85;
  const isFiberUnder = goals?.targetFiber > 0 && totals.fiber < goals.targetFiber * 0.85;

  if (isCalOver) {
    areasOfConcern.push(`Caloric intake (${totals.calories} kcal) exceeds your daily target of ${goals.targetCalories} kcal by +${calExcess} kcal.`);
  } else if (totals.calories > 0) {
    strengths.push(`Calorie intake (${totals.calories} kcal) is aligned with your target (${goals.targetCalories} kcal).`);
  }

  if (totals.protein >= (goals?.targetProtein || 100) * 0.9) {
    strengths.push(`Strong protein foundation (${totals.protein}g / ${goals.targetProtein}g), preserving lean metabolic mass.`);
  } else if (isProteinUnder) {
    areasOfConcern.push(`Protein intake is low (${totals.protein}g vs ${goals.targetProtein}g). Increase lean poultry, Greek yogurt, or legumes.`);
  }

  if (totals.fiber >= (goals?.targetFiber || 25) * 0.9) {
    strengths.push(`Excellent dietary fiber (${totals.fiber}g), keeping blood glucose steady and aiding microbiome motility.`);
  } else if (isFiberUnder) {
    areasOfConcern.push(`Fiber deficiency detected (${totals.fiber}g vs ${goals.targetFiber}g). Add chia seeds, leafy greens, or avocado.`);
  }

  if (isSodiumOver) {
    areasOfConcern.push(`Sodium consumption (${totals.sodium}mg) exceeds your ceiling of ${goals.maxSodium}mg by ${totals.sodium - goals.maxSodium}mg.`);
  } else if (totals.sodium > 0) {
    strengths.push(`Sodium level is well controlled (${totals.sodium}mg within ${goals.maxSodium}mg).`);
  }

  if (isSugarOver) {
    areasOfConcern.push(`Added sugars (${totals.sugar}g) exceed your cap of ${goals.maxSugar}g by +${totals.sugar - goals.maxSugar}g, elevating glycemic stress.`);
  }

  for (const item of items) {
    const name = (item.name || '').toLowerCase();
    const itemCal = Number(item.calories) || 300;
    const itemSod = Number(item.sodium) || 400;
    const itemSug = Number(item.sugar) || 10;
    const itemProt = Number(item.protein) || 10;
    const itemFat = Number(item.fat) || 12;
    const itemFib = Number(item.fiber) || 2;

    if (name.includes('muffin') || name.includes('latte') || name.includes('pastry') || name.includes('croissant')) {
      alternatives.push({
        id: `swap-${item.id}`,
        originalFoodId: item.id,
        originalFoodName: item.name,
        suggestedItemName: 'Warm Chia-Flax Cinnamon Protein Bake with Unsweetened Vanilla Almond Cold Brew',
        portion: '1 protein bake + 16oz iced beverage',
        calories: 220,
        protein: 20,
        carbs: 22,
        fat: 6,
        fiber: 8,
        sodium: 120,
        sugar: 4,
        whyHealthier: 'Cuts 350+ empty calories and 35g of refined sugars while delivering 8g of prebiotic fiber and 20g sustained protein.',
        satisfiesCraving: 'Rich bakery cinnamon-vanilla warmth combined with a velvety, refreshing morning cold brew.',
        preparationOrOrderTip: 'At coffee shops: Ask for cold brew or iced Americano with unsweetened almond milk and a cinnamon sprinkle.',
        savings: {
          calories: Math.max(0, itemCal - 220),
          sodium: Math.max(0, itemSod - 120),
          sugar: Math.max(0, itemSug - 4),
          fat: Math.max(0, itemFat - 6),
          proteinGain: Math.max(0, 20 - itemProt),
          fiberGain: Math.max(0, 8 - itemFib),
        },
      });
    } else if (name.includes('burger') || name.includes('cheeseburger') || name.includes('fries')) {
      alternatives.push({
        id: `swap-${item.id}`,
        originalFoodId: item.id,
        originalFoodName: item.name,
        suggestedItemName: 'Grilled Rosemary Turkey Burger on Sprouted Brioche with Air-Fried Sweet Potato Wedges',
        portion: '1 sandwich + 120g wedges',
        calories: 470,
        protein: 40,
        carbs: 42,
        fat: 14,
        fiber: 7,
        sodium: 540,
        sugar: 5,
        whyHealthier: 'Slices saturated fat and deep-fry sodium in half while delivering antioxidant carotenoids and slow-digesting complex carbs.',
        satisfiesCraving: 'Deep savory grilled umami, juicy texture, and crispy salty potato crunch without sluggish lethargy.',
        preparationOrOrderTip: 'Ask for grilled turkey or chicken, avocado instead of mayo, and sweet potato wedges or side greens.',
        savings: {
          calories: Math.max(0, itemCal - 470),
          sodium: Math.max(0, itemSod - 540),
          sugar: Math.max(0, itemSug - 5),
          fat: Math.max(0, itemFat - 14),
          proteinGain: Math.max(0, 40 - itemProt),
          fiberGain: Math.max(0, 7 - itemFib),
        },
      });
    } else if (name.includes('pizza') || name.includes('lasagna')) {
      alternatives.push({
        id: `swap-${item.id}`,
        originalFoodId: item.id,
        originalFoodName: item.name,
        suggestedItemName: 'Thin Spelt Flatbread with Basil San Marzano Marinara, Fresh Mozzarella & Grilled Chicken',
        portion: '2 large slices (thin flatbread)',
        calories: 390,
        protein: 38,
        carbs: 32,
        fat: 12,
        fiber: 6,
        sodium: 560,
        sugar: 4,
        whyHealthier: 'Replaces processed cured meats and heavy dough with antioxidant lycopene, lean poultry, and slow-burning whole grain.',
        satisfiesCraving: 'Melty bubbly mozzarella, aromatic oregano garlic sauce, and crisp blistered pizza crust.',
        preparationOrOrderTip: 'Order thin crust, double marinara sauce, light cheese, and top with grilled chicken breast and peppers.',
        savings: {
          calories: Math.max(0, itemCal - 390),
          sodium: Math.max(0, itemSod - 560),
          sugar: Math.max(0, itemSug - 4),
          fat: Math.max(0, itemFat - 12),
          proteinGain: Math.max(0, 38 - itemProt),
          fiberGain: Math.max(0, 6 - itemFib),
        },
      });
    } else if (name.includes('soda') || name.includes('cola') || name.includes('tea')) {
      alternatives.push({
        id: `swap-${item.id}`,
        originalFoodId: item.id,
        originalFoodName: item.name,
        suggestedItemName: 'Sparkling Citrus Berry Cooler with Fresh Mint & Prebiotic Fiber',
        portion: '16 oz iced glass',
        calories: 15,
        protein: 0,
        carbs: 4,
        fat: 0,
        fiber: 3,
        sodium: 15,
        sugar: 2,
        whyHealthier: 'Eliminates 50g+ pure liquid high-fructose corn syrup, protecting liver health and keeping blood sugar flat.',
        satisfiesCraving: 'High-carbonation crisp bubbles, bright citrus tang, and cold thirst-quenching satisfaction.',
        preparationOrOrderTip: 'Substitute with unsweetened berry sparkling water infused with fresh lemon or mint.',
        savings: {
          calories: Math.max(0, itemCal - 15),
          sodium: Math.max(0, itemSod - 15),
          sugar: Math.max(0, itemSug - 2),
          fat: Math.max(0, itemFat),
          proteinGain: 0,
          fiberGain: 3,
        },
      });
    }
  }

  // If no specific keyword matched but limits are exceeded, provide generic high-impact swap for highest calorie item
  if (alternatives.length === 0 && items.length > 0 && (isCalOver || isSodiumOver || isSugarOver)) {
    const sorted = [...items].sort((a, b) => (Number(b.calories) || 0) - (Number(a.calories) || 0));
    const worst = sorted[0];
    alternatives.push({
      id: `swap-${worst.id}`,
      originalFoodId: worst.id,
      originalFoodName: worst.name,
      suggestedItemName: `Lean High-Protein Nutrient-Dense Swap for ${worst.name}`,
      portion: '1 balanced plate',
      calories: Math.max(200, Math.round((Number(worst.calories) || 500) * 0.55)),
      protein: 35,
      carbs: 25,
      fat: 10,
      fiber: 7,
      sodium: 420,
      sugar: 4,
      whyHealthier: 'Slices caloric density, cuts excess sodium and sugars, and adds high-satiety clean protein and fiber.',
      satisfiesCraving: 'Rich texture, savory seasonings, and comforting volume without inflammatory after-effects.',
      preparationOrOrderTip: 'Focus on grilled whole foods, dressings on the side, and swapping starches for steamed vegetables.',
      savings: {
        calories: Math.max(0, (Number(worst.calories) || 500) - 280),
        sodium: Math.max(0, (Number(worst.sodium) || 600) - 420),
        sugar: Math.max(0, (Number(worst.sugar) || 12) - 4),
        fat: Math.max(0, (Number(worst.fat) || 20) - 10),
        proteinGain: Math.max(0, 35 - (Number(worst.protein) || 15)),
        fiberGain: Math.max(0, 7 - (Number(worst.fiber) || 2)),
      },
    });
  }

  let score = 84;
  if (isCalOver) score -= Math.min(25, Math.round(calExcess / 45));
  if (isSodiumOver) score -= Math.min(22, Math.round((totals.sodium - goals.maxSodium) / 110));
  if (isSugarOver) score -= Math.min(22, Math.round((totals.sugar - goals.maxSugar) / 4.5));
  if (isProteinUnder) score -= 8;
  if (isFiberUnder) score -= 8;
  score = Math.max(25, Math.min(96, score));

  let grade = 'B';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B+';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else grade = 'Needs Improvement';

  return {
    overallScore: score,
    healthGrade: grade,
    summary: `Daily intake totals ${totals.calories} kcal with ${totals.protein}g protein, ${totals.sodium}mg sodium, and ${totals.sugar}g sugar. ${
      alternatives.length > 0 ? `Identified ${alternatives.length} targeted healthier food swaps to optimize your nutrition.` : 'Daily log shows good nutritional alignment.'
    }`,
    goalAlignmentInsight: `Evaluated against your "${goals?.goalName || 'Nutrition'}" target: ${goals?.focusDescription || 'Nutritional optimization'}`,
    strengths: strengths.length > 0 ? strengths : ['Systematic tracking of meals and macronutrients logged.'],
    areasOfConcern: areasOfConcern.length > 0 ? areasOfConcern : ['No critical nutritional alarms detected.'],
    alternatives,
    dailyActionPlan: [
      alternatives.length > 0 ? `Adopt the swap for "${alternatives[0].originalFoodName}" to immediately recover calories and reduce sodium.` : 'Continue meeting your fiber and hydration goals.',
      'Drink 2.5L water and pair carbohydrates with leafy greens or chia seeds.',
      'Prioritize lean protein at midday to curb evening cravings.'
    ],
    macroTotals: totals,
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, goals, dietaryPreferences } = req.body || {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one logged food item' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const fallback = generateRuleBasedAnalysis(items, goals);
      return res.status(200).json(fallback);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `You are an elite clinical dietitian and functional nutrition coach.
Analyze the user's daily food consumption against their specified nutritional goals:
USER GOAL:
Name: ${goals?.goalName || 'Balanced Nutrition'}
Primary Goal: ${goals?.primaryGoal || 'healthy'}
Target Calories: ${goals?.targetCalories || 2000} kcal
Target Protein: ${goals?.targetProtein || 120} g
Target Carbs: ${goals?.targetCarbs || 220} g
Target Fat: ${goals?.targetFat || 65} g
Target Fiber: ${goals?.targetFiber || 30} g
Max Sodium: ${goals?.maxSodium || 2300} mg
Max Sugar: ${goals?.maxSugar || 30} g
Dietary Restrictions: ${(dietaryPreferences || []).join(', ') || 'None'}
Goal Focus: ${goals?.focusDescription || 'Nutritional optimization'}

DAILY FOOD ITEMS CONSUMED:
${JSON.stringify(items, null, 2)}

TASK:
1. Provide an objective Health Score (0-100) and Health Grade ('A', 'B+', 'B', 'C', 'Needs Improvement').
2. Write a concise, evidence-based executive summary evaluating their progress against their specific goal.
3. List 2-4 key nutritional strengths.
4. List 2-4 key nutritional areas of concern.
5. Suggest 1 to 4 concrete, delicious, and realistic HEALTHIER ALTERNATIVES for the most problematic/suboptimal items in their day.
   - For EACH alternative:
     - Match it directly to the exact 'originalFoodId' and 'originalFoodName' from the list!
     - 'suggestedItemName': specific healthier swap.
     - Accurate macros for the swap (calories, protein, carbs, fat, fiber, sodium, sugar).
     - 'whyHealthier': clinical reasoning.
     - 'satisfiesCraving': psychological explanation of how it satisfies cravings without deprivation.
     - 'preparationOrOrderTip': real-world hack (how to order it at restaurants, or prep at home).
     - 'savings': exact calculation of saved calories, sodium, sugar, fat, and gains in protein/fiber.
6. Provide a 3-step daily tactical action plan for tomorrow.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a board-certified clinical nutritionist and culinary expert. Produce precise, scientific, empathetic, and actionable JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            healthGrade: { type: Type.STRING },
            summary: { type: Type.STRING },
            goalAlignmentInsight: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasOfConcern: { type: Type.ARRAY, items: { type: Type.STRING } },
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  originalFoodId: { type: Type.STRING },
                  originalFoodName: { type: Type.STRING },
                  suggestedItemName: { type: Type.STRING },
                  portion: { type: Type.STRING },
                  calories: { type: Type.INTEGER },
                  protein: { type: Type.INTEGER },
                  carbs: { type: Type.INTEGER },
                  fat: { type: Type.INTEGER },
                  fiber: { type: Type.INTEGER },
                  sodium: { type: Type.INTEGER },
                  sugar: { type: Type.INTEGER },
                  whyHealthier: { type: Type.STRING },
                  satisfiesCraving: { type: Type.STRING },
                  preparationOrOrderTip: { type: Type.STRING },
                  savings: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.INTEGER },
                      sodium: { type: Type.INTEGER },
                      sugar: { type: Type.INTEGER },
                      fat: { type: Type.INTEGER },
                      proteinGain: { type: Type.INTEGER },
                      fiberGain: { type: Type.INTEGER },
                    },
                    required: ['calories', 'sodium', 'sugar', 'fat', 'proteinGain', 'fiberGain'],
                  },
                },
                required: ['originalFoodId', 'originalFoodName', 'suggestedItemName', 'portion', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'sugar', 'whyHealthier', 'satisfiesCraving', 'preparationOrOrderTip', 'savings'],
              },
            },
            dailyActionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['overallScore', 'healthGrade', 'summary', 'goalAlignmentInsight', 'strengths', 'areasOfConcern', 'alternatives', 'dailyActionPlan'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const totals = calculateMacroTotals(items);
    parsed.macroTotals = totals;
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Vercel API error in analyze-consumption:', err);
    const fallback = generateRuleBasedAnalysis(req.body?.items || [], req.body?.goals || {});
    return res.status(200).json(fallback);
  }
}
