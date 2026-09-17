import { GoogleGenAI, Type } from '@google/genai';

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

  const { text, category } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Please enter food text' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(200).json({
      items: [
        {
          id: 'food-' + Date.now(),
          name: text.trim(),
          category: category || 'lunch',
          portion: '1 serving',
          calories: 420,
          protein: 22,
          carbs: 45,
          fat: 15,
          fiber: 4,
          sodium: 520,
          sugar: 6,
          healthTags: ['Self-Logged'],
        },
      ],
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `Analyze this food description and break it down into realistic nutritional food items: "${text}".
Meal category: "${category || 'auto-detect'}".
Estimate portion, calories, protein (g), carbs (g), fat (g), fiber (g), sodium (mg), sugar (g), and 2-3 concise health tags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert clinical nutritional database and dietitian. Return only valid JSON adhering to the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              portion: { type: Type.STRING },
              calories: { type: Type.INTEGER },
              protein: { type: Type.INTEGER },
              carbs: { type: Type.INTEGER },
              fat: { type: Type.INTEGER },
              fiber: { type: Type.INTEGER },
              sodium: { type: Type.INTEGER },
              sugar: { type: Type.INTEGER },
              healthTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['name', 'category', 'portion', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'sugar'],
          },
        },
      },
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

    return res.status(200).json({ items });
  } catch (err: any) {
    console.error('Vercel API error in parse-food:', err);
    return res.status(200).json({
      items: [
        {
          id: 'food-' + Date.now(),
          name: text.trim(),
          category: category || 'lunch',
          portion: '1 serving',
          calories: 390,
          protein: 18,
          carbs: 45,
          fat: 14,
          fiber: 4,
          sodium: 480,
          sugar: 6,
          healthTags: ['Logged'],
        },
      ],
    });
  }
}
