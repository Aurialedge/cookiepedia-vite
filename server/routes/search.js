import express from 'express';
import Fuse from 'fuse.js';
import { recipeDatabase, getPopularRecipes } from '../data/recipes.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

// Configure Fuse.js for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'ingredients', weight: 0.2 },
    { name: 'tags', weight: 0.1 }
  ],
  threshold: 0.4, // Lower = more strict matching
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2
};

const fuse = new Fuse(recipeDatabase, fuseOptions);

// GET /api/search/suggestions?q=query&limit=10
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 8 } = req.query;

    // Validate query
    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: [],
        message: 'Query too short'
      });
    }

    let suggestions = [];
    let source = 'gemini';

    // Try Gemini API first
    if (geminiService.isConfigured()) {
      try {
        console.log(`🤖 Getting Gemini suggestions for: "${query}"`);
        suggestions = await geminiService.getRecipeSuggestions(query.trim(), parseInt(limit));
      } catch (geminiError) {
        console.error('Gemini API failed, falling back to local search:', geminiError.message);
        source = 'fallback';
        
        // Fallback to local fuzzy search
        const results = fuse.search(query.trim());
        suggestions = results
          .slice(0, parseInt(limit))
          .map(result => ({
            id: result.item.id,
            name: result.item.name,
            type: result.item.type,
            difficulty: result.item.difficulty,
            cookTime: result.item.cookTime,
            rating: result.item.rating,
            image: result.item.image,
            ingredients: result.item.ingredients,
            tags: result.item.tags,
            description: `Delicious ${result.item.name.toLowerCase()} recipe`,
            score: result.score,
            matches: result.matches?.map(match => ({
              key: match.key,
              value: match.value,
              indices: match.indices
            }))
          }));
      }
    } else {
      console.log('⚠️  Gemini API not configured, using local search');
      source = 'local';
      
      // Use local fuzzy search
      const results = fuse.search(query.trim());
      suggestions = results
        .slice(0, parseInt(limit))
        .map(result => ({
          id: result.item.id,
          name: result.item.name,
          type: result.item.type,
          difficulty: result.item.difficulty,
          cookTime: result.item.cookTime,
          rating: result.item.rating,
          image: result.item.image,
          ingredients: result.item.ingredients,
          tags: result.item.tags,
          description: `Delicious ${result.item.name.toLowerCase()} recipe`,
          score: result.score,
          matches: result.matches?.map(match => ({
            key: match.key,
            value: match.value,
            indices: match.indices
          }))
        }));
    }

    res.json({
      success: true,
      query: query,
      suggestions,
      total: suggestions.length,
      source: source,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/search/popular - Get popular search terms
router.get('/popular', async (req, res) => {
  try {
    let popularSearches = [];
    let source = 'gemini';

    // Try Gemini API first
    if (geminiService.isConfigured()) {
      try {
        console.log('🤖 Getting popular recipes from Gemini');
        popularSearches = await geminiService.getPopularRecipes();
      } catch (geminiError) {
        console.error('Gemini API failed for popular recipes:', geminiError.message);
        source = 'fallback';
        popularSearches = getPopularRecipes().map(r => r.name);
      }
    } else {
      source = 'local';
      popularSearches = getPopularRecipes().map(r => r.name);
    }

    res.json({
      success: true,
      popular: popularSearches,
      source: source,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Popular search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/search/categories - Get recipe categories
router.get('/categories', (req, res) => {
  try {
    const categories = [
      { name: 'Cookies', count: 45, icon: '🍪' },
      { name: 'Brownies', count: 12, icon: '🍫' },
      { name: 'Macarons', count: 8, icon: '🧁' },
      { name: 'Biscotti', count: 6, icon: '🥖' },
      { name: 'Holiday Treats', count: 15, icon: '🎄' },
      { name: 'Gluten-Free', count: 18, icon: '🌾' },
      { name: 'Vegan', count: 22, icon: '🌱' },
      { name: 'Quick & Easy', count: 35, icon: '⚡' }
    ];

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
