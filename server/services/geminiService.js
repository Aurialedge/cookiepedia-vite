import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      console.log('✅ Gemini AI service initialized');
    }
  }

  async getRecipeSuggestions(query, limit = 8) {
    if (!this.genAI) {
      throw new Error('Gemini API not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });

      const prompt = `
You are a professional chef and recipe expert. Based on the search query "${query}", provide ${limit} relevant recipe suggestions.

Return ONLY a valid JSON array with this exact structure (no additional text or formatting):
[
  {
    "id": 1,
    "name": "Recipe Name",
    "type": "dessert/appetizer/main course/etc",
    "difficulty": "easy/medium/hard",
    "cookTime": "25 minutes",
    "rating": 4.8,
    "image": "/images/Recipe1.avif",
    "ingredients": ["flour", "butter", "sugar", "chocolate chips"],
    "tags": ["sweet", "classic", "popular"],
    "description": "Brief description of the recipe"
  }
]

Guidelines:
- Provide a variety of relevant recipes based on the query.
- Make recipe names creative and appealing.
- Use realistic cook times.
- Ratings should be between 4.0-5.0.
- Include 4-8 main ingredients.
- Add 2-4 relevant tags.
- Keep descriptions under 50 words.
- Vary difficulty levels.
- Use existing image paths like "/images/Recipe1.avif" to "/images/Recipe8.avif".

Search query: "${query}"
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean and parse the JSON response
      let cleanedText = text.trim();
      
      // Remove any markdown formatting
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Parse the JSON
      const suggestions = JSON.parse(cleanedText);

      // Validate the response structure
      if (!Array.isArray(suggestions)) {
        throw new Error('Invalid response format from Gemini API');
      }

      // Ensure each suggestion has required fields
      const validatedSuggestions = suggestions.map((suggestion, index) => ({
        id: suggestion.id || index + 1,
        name: suggestion.name || 'Unnamed Recipe',
        type: suggestion.type || 'cookie',
        difficulty: suggestion.difficulty || 'medium',
        cookTime: suggestion.cookTime || '30 minutes',
        rating: suggestion.rating || 4.5,
        image: suggestion.image || `/images/Recipe${(index % 8) + 1}.avif`,
        ingredients: Array.isArray(suggestion.ingredients) ? suggestion.ingredients : [],
        tags: Array.isArray(suggestion.tags) ? suggestion.tags : [],
        description: suggestion.description || 'Delicious homemade recipe'
      }));

      return validatedSuggestions.slice(0, limit);

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Return fallback suggestions if API fails
      return this.getFallbackSuggestions(query, limit);
    }
  }

  getFallbackSuggestions(query, limit = 8) {
    const fallbackRecipes = [
      {
        id: 1,
        name: "Classic Chocolate Chip Cookies",
        type: "cookie",
        difficulty: "easy",
        cookTime: "25 minutes",
        rating: 4.8,
        image: "/images/Recipe1.avif",
        ingredients: ["flour", "butter", "sugar", "chocolate chips"],
        tags: ["classic", "popular", "sweet"],
        description: "Timeless favorite with crispy edges and chewy centers"
      },
      {
        id: 2,
        name: "Double Chocolate Brownies",
        type: "brownie",
        difficulty: "easy",
        cookTime: "35 minutes",
        rating: 4.9,
        image: "/images/Recipe2.avif",
        ingredients: ["dark chocolate", "butter", "sugar", "eggs"],
        tags: ["chocolate", "fudgy", "rich"],
        description: "Rich, fudgy brownies with intense chocolate flavor"
      },
      {
        id: 3,
        name: "Vanilla Sugar Cookies",
        type: "cookie",
        difficulty: "easy",
        cookTime: "20 minutes",
        rating: 4.6,
        image: "/images/Recipe3.avif",
        ingredients: ["flour", "butter", "sugar", "vanilla"],
        tags: ["vanilla", "simple", "decorative"],
        description: "Perfect base for decorating with icing and sprinkles"
      },
      {
        id: 4,
        name: "Oatmeal Raisin Cookies",
        type: "cookie",
        difficulty: "easy",
        cookTime: "22 minutes",
        rating: 4.4,
        image: "/images/Recipe4.jpg",
        ingredients: ["oats", "flour", "raisins", "cinnamon"],
        tags: ["healthy", "chewy", "traditional"],
        description: "Hearty cookies with wholesome oats and sweet raisins"
      },
      {
        id: 5,
        name: "Lemon Bars",
        type: "bar",
        difficulty: "medium",
        cookTime: "40 minutes",
        rating: 4.7,
        image: "/images/Recipe5.avif",
        ingredients: ["lemon juice", "flour", "butter", "powdered sugar"],
        tags: ["citrus", "tangy", "summer"],
        description: "Bright and tangy bars with buttery shortbread crust"
      },
      {
        id: 6,
        name: "Snickerdoodles",
        type: "cookie",
        difficulty: "easy",
        cookTime: "25 minutes",
        rating: 4.5,
        image: "/images/Recipe6.jpg",
        ingredients: ["flour", "butter", "cinnamon", "sugar"],
        tags: ["cinnamon", "soft", "classic"],
        description: "Soft cookies rolled in cinnamon sugar perfection"
      },
      {
        id: 7,
        name: "Peanut Butter Cookies",
        type: "cookie",
        difficulty: "easy",
        cookTime: "18 minutes",
        rating: 4.6,
        image: "/images/Recipe7.avif",
        ingredients: ["peanut butter", "flour", "sugar", "eggs"],
        tags: ["peanut butter", "nutty", "protein"],
        description: "Rich peanut butter cookies with classic fork marks"
      },
      {
        id: 8,
        name: "Gingerbread Cookies",
        type: "cookie",
        difficulty: "medium",
        cookTime: "30 minutes",
        rating: 4.5,
        image: "/images/Recipe8.avif",
        ingredients: ["molasses", "ginger", "cinnamon", "flour"],
        tags: ["spiced", "holiday", "decorative"],
        description: "Festive spiced cookies perfect for decorating"
      }
    ];

    // Filter based on query if possible
    const queryLower = query.toLowerCase();
    let filtered = fallbackRecipes.filter(recipe => 
      recipe.name.toLowerCase().includes(queryLower) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(queryLower)) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );

    // If no matches, return all recipes
    if (filtered.length === 0) {
      filtered = fallbackRecipes;
    }

    return filtered.slice(0, limit);
  }

  async getPopularRecipes() {
    if (!this.genAI) {
      return [
        'chocolate chip cookies',
        'brownies',
        'sugar cookies',
        'oatmeal cookies',
        'snickerdoodles',
        'peanut butter cookies',
        'gingerbread cookies',
        'lemon bars'
      ];
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      const prompt = `
List 10 popular cookie and dessert recipe search terms that people commonly look for.
Return ONLY a JSON array of strings, no additional text:
["recipe name 1", "recipe name 2", ...]

Focus on:
- Classic cookies (chocolate chip, sugar, etc.)
- Popular brownies and bars
- Holiday favorites
- Trending dessert recipes
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const popular = JSON.parse(cleanedText);
      return Array.isArray(popular) ? popular : [];

    } catch (error) {
      console.error('Error fetching popular recipes:', error);
      return [
        'chocolate chip cookies',
        'brownies',
        'sugar cookies',
        'oatmeal cookies',
        'snickerdoodles',
        'peanut butter cookies',
        'gingerbread cookies',
        'lemon bars'
      ];
    }
  }

  isConfigured() {
    return !!this.genAI;
  }
}

export default new GeminiService();
