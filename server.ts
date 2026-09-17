import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy/safe initialization for Gemini
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper: Calculate total macros from food items
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

// Fallback rule-based nutrition analyzer in case Gemini key is missing or quota is reached
function generateRuleBasedAnalysis(items: any[], goals: any) {
  const totals = calculateMacroTotals(items);
  const areasOfConcern: string[] = [];
  const strengths: string[] = [];
  const alternatives: any[] = [];

  // Calorie check
  const calRatio = goals.targetCalories > 0 ? totals.calories / goals.targetCalories : 1;
  if (calRatio > 1.15) {
    areasOfConcern.push(`Total daily intake (${totals.calories} kcal) exceeds your ${goals.goalName} target by ${Math.round(totals.calories - goals.targetCalories)} kcal.`);
  } else if (calRatio < 0.8 && totals.calories > 0) {
    areasOfConcern.push(`Calorie intake is significantly below your goal target (${totals.calories} vs ${goals.targetCalories} kcal). Ensure you are fueling adequately.`);
  } else if (totals.calories > 0) {
    strengths.push(`Caloric intake (${totals.calories} kcal) is tightly aligned with your target budget (${goals.targetCalories} kcal).`);
  }

  // Protein check
  if (totals.protein >= goals.targetProtein * 0.9) {
    strengths.push(`Excellent protein intake (${totals.protein}g / ${goals.targetProtein}g target), supporting muscle retention and high satiety.`);
  } else {
    areasOfConcern.push(`Protein deficit detected (${totals.protein}g vs ${goals.targetProtein}g target). Consider prioritizing lean poultry, egg whites, Greek yogurt, or legumes.`);
  }

  // Fiber check
  if (totals.fiber >= goals.targetFiber * 0.85) {
    strengths.push(`Great dietary fiber level (${totals.fiber}g / ${goals.targetFiber}g target), promoting stable blood glucose and healthy gut microbiome.`);
  } else {
    areasOfConcern.push(`Low dietary fiber (${totals.fiber}g vs ${goals.targetFiber}g target). Increasing chia seeds, legumes, berries, and vegetables will boost satiety.`);
  }

  // Sodium check
  if (goals.maxSodium > 0 && totals.sodium > goals.maxSodium) {
    areasOfConcern.push(`Sodium level (${totals.sodium}mg) exceeds your threshold of ${goals.maxSodium}mg by ${totals.sodium - goals.maxSodium}mg, which may promote fluid retention.`);
  } else if (totals.sodium > 0) {
    strengths.push(`Sodium control is well managed (${totals.sodium}mg within ${goals.maxSodium}mg ceiling).`);
  }

  // Added Sugar check
  if (goals.maxSugar > 0 && totals.sugar > goals.maxSugar) {
    areasOfConcern.push(`Added sugar consumption (${totals.sugar}g) exceeds your recommended cap of ${goals.maxSugar}g, driving insulin spikes.`);
  }

  // Identify high-impact items for swaps only if exceeding daily limits
  const isOverDailyLimit =
    (goals.targetCalories > 0 && totals.calories > goals.targetCalories) ||
    (goals.maxSodium > 0 && totals.sodium > goals.maxSodium) ||
    (goals.maxSugar > 0 && totals.sugar > goals.maxSugar);

  if (isOverDailyLimit) {
    let simCalories = totals.calories;
    let simSodium = totals.sodium;
    let simSugar = totals.sugar;

    for (const item of items) {
      // If already brought right below all daily limits, stop immediately!
      const calSatisfied = goals.targetCalories <= 0 || simCalories <= goals.targetCalories;
      const sodiumSatisfied = goals.maxSodium <= 0 || simSodium <= goals.maxSodium;
      const sugarSatisfied = goals.maxSugar <= 0 || simSugar <= goals.maxSugar;
      if (calSatisfied && sodiumSatisfied && sugarSatisfied) {
        break;
      }

      const nameLower = (item.name || '').toLowerCase();
      let alt: any = null;

      if (nameLower.includes('burger') || nameLower.includes('cheeseburger') || nameLower.includes('fries') || nameLower.includes('patty')) {
        alt = {
          id: `swap-${item.id}`,
          originalFoodId: item.id,
          originalFoodName: item.name,
          suggestedItemName: 'Grilled Herb Chicken & Sweet Potato',
          icon: '🍠',
          portion: '6oz breast + 1 sweet potato',
          calories: 420,
          protein: 44,
          carbs: 38,
          fat: 8,
          fiber: 6,
          sodium: 380,
          sugar: 6,
          whyHealthier: 'Cuts saturated fats and processed sodium with lean poultry.',
          satisfiesCraving: 'Juicy savory meal with natural caramelized sweet potato.',
          preparationOrOrderTip: 'Available directly from your Graphic Food catalog.',
          savings: {
            calories: Math.max(0, item.calories - 420),
            sodium: Math.max(0, item.sodium - 380),
            sugar: Math.max(0, item.sugar - 6),
            fat: Math.max(0, item.fat - 8),
            proteinGain: Math.max(0, 44 - item.protein),
            fiberGain: Math.max(0, 6 - item.fiber),
          }
        };
      } else if (nameLower.includes('cola') || nameLower.includes('soda') || nameLower.includes('latte') || nameLower.includes('macchiato')) {
        alt = {
          id: `swap-${item.id}`,
          originalFoodId: item.id,
          originalFoodName: item.name,
          suggestedItemName: 'Sparkling Water with Fresh Lime',
          icon: '🫧',
          portion: '16 oz iced glass',
          calories: 5,
          protein: 0,
          carbs: 1,
          fat: 0,
          fiber: 0,
          sodium: 10,
          sugar: 0,
          whyHealthier: 'Completely eliminates empty liquid sugars and insulin spikes.',
          satisfiesCraving: 'Crisp, cold effervescence with natural citrus twist.',
          preparationOrOrderTip: 'Available directly from your Graphic Food catalog.',
          savings: {
            calories: Math.max(0, item.calories - 5),
            sodium: Math.max(0, item.sodium - 10),
            sugar: Math.max(0, item.sugar - 0),
            fat: Math.max(0, item.fat - 0),
            proteinGain: 0,
            fiberGain: 0,
          }
        };
      } else if (nameLower.includes('pizza') || nameLower.includes('lasagna') || nameLower.includes('calzone')) {
        alt = {
          id: `swap-${item.id}`,
          originalFoodId: item.id,
          originalFoodName: item.name,
          suggestedItemName: 'Thin Crust Margherita & Chicken',
          icon: '🍕',
          portion: '2 slices',
          calories: 390,
          protein: 36,
          carbs: 36,
          fat: 12,
          fiber: 5,
          sodium: 540,
          sugar: 4,
          whyHealthier: 'Thin crust with lean chicken reduces excess starch and sodium.',
          satisfiesCraving: 'Hot bubbly mozzarella and aromatic tomato sauce.',
          preparationOrOrderTip: 'Available directly from your Graphic Food catalog.',
          savings: {
            calories: Math.max(0, item.calories - 390),
            sodium: Math.max(0, item.sodium - 540),
            sugar: Math.max(0, item.sugar - 4),
            fat: Math.max(0, item.fat - 12),
            proteinGain: Math.max(0, 36 - item.protein),
            fiberGain: Math.max(0, 5 - item.fiber),
          }
        };
      } else if (nameLower.includes('chip') || nameLower.includes('nacho') || nameLower.includes('pretzel')) {
        alt = {
          id: `swap-${item.id}`,
          originalFoodId: item.id,
          originalFoodName: item.name,
          suggestedItemName: 'Air-Popped Sea Salt Popcorn',
          icon: '🍿',
          portion: '3 cups popped',
          calories: 110,
          protein: 3,
          carbs: 22,
          fat: 1.5,
          fiber: 4,
          sodium: 140,
          sugar: 0,
          whyHealthier: 'Whole grain crunch with 80% less fat and low sodium.',
          satisfiesCraving: 'Warm, airy, salty crunch with zero trans fats.',
          preparationOrOrderTip: 'Available directly from your Graphic Food catalog.',
          savings: {
            calories: Math.max(0, item.calories - 110),
            sodium: Math.max(0, item.sodium - 140),
            sugar: Math.max(0, item.sugar - 0),
            fat: Math.max(0, item.fat - 1.5),
            proteinGain: Math.max(0, 3 - item.protein),
            fiberGain: Math.max(0, 4 - item.fiber),
          }
        };
      } else if (nameLower.includes('sub') || nameLower.includes('sandwich') || nameLower.includes('bagel')) {
        alt = {
          id: `swap-${item.id}`,
          originalFoodId: item.id,
          originalFoodName: item.name,
          suggestedItemName: 'Roast Turkey on Sprouted Multigrain',
          icon: '🥪',
          portion: '1 sandwich',
          calories: 360,
          protein: 34,
          carbs: 34,
          fat: 9,
          fiber: 7,
          sodium: 520,
          sugar: 3,
          whyHealthier: 'Lean roasted turkey with sprouted whole grains and high fiber.',
          satisfiesCraving: 'Hearty deli layers with crisp lettuce and mustard.',
          preparationOrOrderTip: 'Available directly from your Graphic Food catalog.',
          savings: {
            calories: Math.max(0, item.calories - 360),
            sodium: Math.max(0, item.sodium - 520),
            sugar: Math.max(0, item.sugar - 3),
            fat: Math.max(0, item.fat - 9),
            proteinGain: Math.max(0, 34 - item.protein),
            fiberGain: Math.max(0, 7 - item.fiber),
          }
        };
      }

      if (alt) {
        alternatives.push(alt);
        simCalories -= alt.savings.calories;
        simSodium -= alt.savings.sodium;
        simSugar -= alt.savings.sugar;

        // If limits now satisfied or we reached 2 swaps, break
        if (
          (goals.targetCalories <= 0 || simCalories <= goals.targetCalories) &&
          (goals.maxSodium <= 0 || simSodium <= goals.maxSodium) &&
          (goals.maxSugar <= 0 || simSugar <= goals.maxSugar)
        ) {
          break;
        }

        if (alternatives.length >= 2) {
          break;
        }
      }
    }
  }

  // Calculate score (0 - 100)
  let score = 82;
  if (areasOfConcern.length > 0) {
    score -= areasOfConcern.length * 10;
  }
  if (strengths.length > 0) {
    score += strengths.length * 4;
  }
  score = Math.max(25, Math.min(98, score));

  let grade = 'B';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B+';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else grade = 'Needs Improvement';

  return {
    overallScore: score,
    healthGrade: grade,
    summary: `Daily intake totals ${totals.calories} kcal with ${totals.protein}g protein and ${totals.fiber}g fiber. ${
      alternatives.length > 0
        ? `Identified ${alternatives.length} strategic food swaps that could save you ${alternatives.reduce((s, a) => s + a.savings.calories, 0)} kcal and ${alternatives.reduce((s, a) => s + a.savings.sodium, 0)}mg sodium.`
        : 'Your meals show strong nutritional discipline.'
    }`,
    goalAlignmentInsight: `Evaluated against your "${goals.goalName}" target: ${goals.focusDescription}`,
    strengths: strengths.length > 0 ? strengths : ['Nutritional intake tracked thoroughly across daily periods.'],
    areasOfConcern: areasOfConcern.length > 0 ? areasOfConcern : ['No major nutritional flags detected. Maintain this balanced pattern.'],
    alternatives,
    dailyActionPlan: [
      alternatives.length > 0 ? `Apply the recommended swap for "${alternatives[0].originalFoodName}" to immediately recover caloric and micronutrient balance.` : 'Maintain your current hydration and whole-food intake balance.',
      'Aim for a minimum of 30g of dietary fiber and 2.5L of water daily to sustain metabolic rate.',
      'Front-load lean protein in your first two meals to curb evening snacking triggers.'
    ],
    macroTotals: totals,
  };
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// 2. Parse natural language food entry into structured items
app.post('/api/parse-food', async (req, res) => {
  try {
    const { text, category } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback parser: Basic estimation if no Gemini key
      const fallbackItem = {
        id: 'food-' + Date.now(),
        name: text.trim(),
        category: category || 'lunch',
        portion: '1 standard serving',
        calories: 380,
        protein: 18,
        carbs: 42,
        fat: 14,
        fiber: 4,
        sodium: 480,
        sugar: 6,
        healthTags: ['Self-Logged'],
      };
      return res.json({ items: [fallbackItem] });
    }

    const prompt = `Analyze this food description and break it down into realistic nutritional food items: "${text}".
Meal category suggestion: "${category || 'auto-detect'}".
Estimate realistic portion, calories, protein (g), carbs (g), fat (g), fiber (g), sodium (mg), sugar (g), and 2-3 concise health tags (e.g. "Lean Protein", "High Sodium", "Ultra-Processed", "Whole Grain", "High Sugar", "Nutrient Dense").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert clinical nutritional database and dietitian. Return only valid JSON adhering to the schema. Make accurate, realistic calorie and macro estimates.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Descriptive name of the food item' },
              category: { 
                type: Type.STRING, 
                description: 'One of breakfast, lunch, dinner, snack' 
              },
              portion: { type: Type.STRING, description: 'Standard portion size (e.g. 1 medium bowl, 1 slice, 200g)' },
              calories: { type: Type.INTEGER, description: 'Total estimated calories' },
              protein: { type: Type.INTEGER, description: 'Protein in grams' },
              carbs: { type: Type.INTEGER, description: 'Total carbohydrates in grams' },
              fat: { type: Type.INTEGER, description: 'Total fat in grams' },
              fiber: { type: Type.INTEGER, description: 'Dietary fiber in grams' },
              sodium: { type: Type.INTEGER, description: 'Sodium in milligrams' },
              sugar: { type: Type.INTEGER, description: 'Sugar in grams' },
              healthTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Nutritional tags'
              }
            },
            required: ['name', 'category', 'portion', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'sugar']
          }
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    const items = parsed.map((item: any, idx: number) => ({
      id: `parsed-${Date.now()}-${idx}`,
      name: item.name,
      category: ['breakfast', 'lunch', 'dinner', 'snack'].includes(item.category?.toLowerCase()) 
        ? item.category.toLowerCase() 
        : (category || 'lunch'),
      portion: item.portion || '1 serving',
      calories: Math.max(0, Number(item.calories) || 0),
      protein: Math.max(0, Number(item.protein) || 0),
      carbs: Math.max(0, Number(item.carbs) || 0),
      fat: Math.max(0, Number(item.fat) || 0),
      fiber: Math.max(0, Number(item.fiber) || 0),
      sodium: Math.max(0, Number(item.sodium) || 0),
      sugar: Math.max(0, Number(item.sugar) || 0),
      healthTags: Array.isArray(item.healthTags) ? item.healthTags : [],
    }));

    return res.json({ items });
  } catch (error: any) {
    console.error('Error parsing food entry:', error);
    // Safe fallback on error
    return res.json({
      items: [
        {
          id: 'food-' + Date.now(),
          name: req.body.text || 'Meal item',
          category: req.body.category || 'lunch',
          portion: '1 standard portion',
          calories: 420,
          protein: 20,
          carbs: 45,
          fat: 16,
          fiber: 4,
          sodium: 520,
          sugar: 8,
          healthTags: ['Logged'],
        }
      ]
    });
  }
});

// 3. Full daily consumption analysis & healthier alternatives engine
app.post('/api/analyze-consumption', async (req, res) => {
  try {
    const { items, goals, dietaryPreferences } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one logged food item' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.log('Gemini API key not configured, using smart nutritional fallback rules.');
      const fallbackAnalysis = generateRuleBasedAnalysis(items, goals);
      return res.json(fallbackAnalysis);
    }

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
Dietary Restrictions / Preferences: ${(dietaryPreferences || []).join(', ') || 'None'}
Goal Focus: ${goals?.focusDescription || 'Nutritional optimization'}

DAILY FOOD ITEMS CONSUMED:
${JSON.stringify(items, null, 2)}

TASK:
1. Provide an objective Health Score (0-100) and Health Grade ('A', 'B+', 'B', 'C', 'Needs Improvement').
2. Write a concise, evidence-based executive summary evaluating their progress against their specific goal.
3. List 2-4 key nutritional strengths.
4. List 2-4 key nutritional areas of concern (e.g. sodium spikes, refined sugars, missing fiber, protein distribution).
5. Suggest 1 to 4 concrete, delicious, and realistic HEALTHIER ALTERNATIVES for the most problematic/suboptimal items in their day.
   - For EACH alternative:
     - Match it directly to the exact 'originalFoodId' and 'originalFoodName' from the list above!
     - 'suggestedItemName': specific, mouthwatering healthier swap (e.g. "Air-Fried Crispy Turkey Burger on Sprouted Brioche with Baked Sweet Potato Wedges").
     - Accurate macros for the swap (calories, protein, carbs, fat, fiber, sodium, sugar).
     - 'whyHealthier': clinical reasoning (e.g. "Replaces trans-fats and 900mg sodium with heart-healthy monounsaturated fats and 6g prebiotic fiber").
     - 'satisfiesCraving': psychological explanation of how it satisfies the same sensory cravings (texture, warmth, crunch, umami, sweetness) without deprivation.
     - 'preparationOrOrderTip': real-world hack (how to order it at a drive-thru / restaurant, or prep it at home in 5 minutes).
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
            overallScore: { type: Type.INTEGER, description: 'Overall health score 0 to 100' },
            healthGrade: { type: Type.STRING, description: 'Grade like A, B+, B, C, Needs Improvement' },
            summary: { type: Type.STRING, description: 'Executive summary' },
            goalAlignmentInsight: { type: Type.STRING, description: 'Direct evaluation against the user goal' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Nutritional strengths'
            },
            areasOfConcern: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Nutritional red flags or areas of improvement'
            },
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
                    required: ['calories', 'sodium', 'sugar', 'fat', 'proteinGain', 'fiberGain']
                  }
                },
                required: [
                  'originalFoodId', 'originalFoodName', 'suggestedItemName', 'portion',
                  'calories', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'sugar',
                  'whyHealthier', 'satisfiesCraving', 'preparationOrOrderTip', 'savings'
                ]
              }
            },
            dailyActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['overallScore', 'healthGrade', 'summary', 'goalAlignmentInsight', 'strengths', 'areasOfConcern', 'alternatives', 'dailyActionPlan']
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const macroTotals = calculateMacroTotals(items);

    const result = {
      overallScore: Math.min(100, Math.max(10, parsed.overallScore || 75)),
      healthGrade: parsed.healthGrade || 'B',
      summary: parsed.summary || 'Analysis complete.',
      goalAlignmentInsight: parsed.goalAlignmentInsight || '',
      strengths: parsed.strengths || [],
      areasOfConcern: parsed.areasOfConcern || [],
      alternatives: (parsed.alternatives || []).map((alt: any, idx: number) => ({
        ...alt,
        id: alt.id || `alt-${idx}-${Date.now()}`,
      })),
      dailyActionPlan: parsed.dailyActionPlan || [],
      macroTotals,
    };

    return res.json(result);
  } catch (err: any) {
    console.error('Error during Gemini food analysis:', err);
    // Graceful fallback to rule-based analysis
    const fallback = generateRuleBasedAnalysis(req.body.items || [], req.body.goals || {});
    return res.json(fallback);
  }
});

// 4. On-demand alternative generator for any specific food item
app.post('/api/suggest-single-swap', async (req, res) => {
  try {
    const { foodItem, goals, preference } = req.body;
    if (!foodItem) {
      return res.status(400).json({ error: 'Food item is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        alternative: {
          id: `single-swap-${Date.now()}`,
          originalFoodId: foodItem.id,
          originalFoodName: foodItem.name,
          suggestedItemName: `Healthy Whole Food Alternative to ${foodItem.name}`,
          portion: foodItem.portion || '1 serving',
          calories: Math.round(foodItem.calories * 0.6),
          protein: Math.round(foodItem.protein * 1.3),
          carbs: Math.round(foodItem.carbs * 0.6),
          fat: Math.round(foodItem.fat * 0.5),
          fiber: Math.max(4, foodItem.fiber * 2),
          sodium: Math.round(foodItem.sodium * 0.4),
          sugar: Math.round(foodItem.sugar * 0.3),
          whyHealthier: 'Optimized for whole ingredients, higher satiety, and reduced sodium/sugar.',
          satisfiesCraving: 'Maintains familiar taste profile with superior nutritional density.',
          preparationOrOrderTip: 'Swap processed dressings for extra virgin olive oil, herbs, and lemon.',
          savings: {
            calories: Math.round(foodItem.calories * 0.4),
            sodium: Math.round(foodItem.sodium * 0.6),
            sugar: Math.round(foodItem.sugar * 0.7),
            fat: Math.round(foodItem.fat * 0.5),
            proteinGain: Math.round(foodItem.protein * 0.3),
            fiberGain: 4,
          }
        }
      });
    }

    const prompt = `Provide the single best, tastiest, and most practical healthier alternative to this food item:
Item: "${foodItem.name}" (${foodItem.portion}, ${foodItem.calories} kcal, ${foodItem.protein}g protein, ${foodItem.carbs}g carbs, ${foodItem.fat}g fat, ${foodItem.sodium}mg sodium, ${foodItem.sugar}g sugar).
User's Nutritional Goal: "${goals?.goalName || 'Weight loss & health'}"
Specific preference or angle: "${preference || 'healthier swap'}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
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
              required: ['calories', 'sodium', 'sugar', 'fat', 'proteinGain', 'fiberGain']
            }
          },
          required: [
            'suggestedItemName', 'portion', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'sugar',
            'whyHealthier', 'satisfiesCraving', 'preparationOrOrderTip', 'savings'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      alternative: {
        id: `single-swap-${Date.now()}`,
        originalFoodId: foodItem.id,
        originalFoodName: foodItem.name,
        ...parsed,
      }
    });
  } catch (error) {
    console.error('Error suggesting single swap:', error);
    return res.status(500).json({ error: 'Failed to suggest swap' });
  }
});

// Vite middleware & Static asset handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food Consumption & Nutritional Alternatives server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
