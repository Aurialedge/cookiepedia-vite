// Recipe database for search functionality
export const recipeDatabase = [
  {
    id: 1,
    name: "Classic Chocolate Chip Cookies",
    type: "cookie",
    difficulty: "easy",
    cookTime: "25 minutes",
    rating: 4.8,
    image: "/images/Recipe1.avif",
    ingredients: ["flour", "butter", "sugar", "chocolate chips", "eggs", "vanilla"],
    tags: ["classic", "popular", "family-friendly", "sweet"]
  },
  {
    id: 2,
    name: "Spicy Chocolate Chip Cookies",
    type: "cookie",
    difficulty: "medium",
    cookTime: "30 minutes",
    rating: 4.6,
    image: "/images/Recipe2.avif",
    ingredients: ["flour", "butter", "brown sugar", "chocolate chips", "cayenne", "cinnamon"],
    tags: ["spicy", "unique", "chocolate", "bold"]
  },
  {
    id: 3,
    name: "Lemon & Lavender Shortbread",
    type: "shortbread",
    difficulty: "medium",
    cookTime: "35 minutes",
    rating: 4.7,
    image: "/images/Recipe3.avif",
    ingredients: ["flour", "butter", "lemon zest", "lavender", "powdered sugar"],
    tags: ["floral", "citrus", "elegant", "tea-time"]
  },
  {
    id: 4,
    name: "Rosemary-Infused Snickerdoodles",
    type: "cookie",
    difficulty: "medium",
    cookTime: "28 minutes",
    rating: 4.5,
    image: "/images/Recipe4.jpg",
    ingredients: ["flour", "butter", "sugar", "cinnamon", "rosemary", "cream of tartar"],
    tags: ["herb", "unique", "soft", "aromatic"]
  },
  {
    id: 5,
    name: "Matcha White Chocolate Macarons",
    type: "macaron",
    difficulty: "hard",
    cookTime: "45 minutes",
    rating: 4.9,
    image: "/images/Recipe5.avif",
    ingredients: ["almond flour", "powdered sugar", "egg whites", "matcha powder", "white chocolate"],
    tags: ["japanese", "green tea", "delicate", "sophisticated"]
  },
  {
    id: 6,
    name: "Cardamom & Pistachio Biscotti",
    type: "biscotti",
    difficulty: "medium",
    cookTime: "50 minutes",
    rating: 4.4,
    image: "/images/Recipe6.jpg",
    ingredients: ["flour", "sugar", "eggs", "cardamom", "pistachios", "baking powder"],
    tags: ["italian", "crunchy", "coffee-pairing", "nuts"]
  },
  {
    id: 7,
    name: "Gingerbread People",
    type: "cookie",
    difficulty: "easy",
    cookTime: "40 minutes",
    rating: 4.6,
    image: "/images/Recipe7.avif",
    ingredients: ["flour", "molasses", "ginger", "cinnamon", "cloves", "butter"],
    tags: ["holiday", "spiced", "decorative", "traditional"]
  },
  {
    id: 8,
    name: "Classic Oatmeal Raisin",
    type: "cookie",
    difficulty: "easy",
    cookTime: "22 minutes",
    rating: 4.3,
    image: "/images/Recipe8.avif",
    ingredients: ["oats", "flour", "raisins", "butter", "brown sugar", "cinnamon"],
    tags: ["healthy", "chewy", "breakfast", "fiber"]
  },
  {
    id: 9,
    name: "Peanut Butter Blossoms",
    type: "cookie",
    difficulty: "easy",
    cookTime: "25 minutes",
    rating: 4.7,
    image: "/images/Recipe1.webp",
    ingredients: ["peanut butter", "flour", "sugar", "eggs", "chocolate kisses"],
    tags: ["peanut butter", "chocolate", "classic", "kids-favorite"]
  },
  {
    id: 10,
    name: "Salted Caramel Cookies",
    type: "cookie",
    difficulty: "medium",
    cookTime: "32 minutes",
    rating: 4.8,
    image: "/images/Recipe2.webp",
    ingredients: ["flour", "butter", "caramel", "sea salt", "brown sugar", "vanilla"],
    tags: ["salted", "caramel", "gourmet", "sweet-salty"]
  },
  {
    id: 11,
    name: "Double Chocolate Brownies",
    type: "brownie",
    difficulty: "easy",
    cookTime: "35 minutes",
    rating: 4.9,
    image: "/images/Recipe3.webp",
    ingredients: ["dark chocolate", "butter", "sugar", "eggs", "flour", "cocoa powder"],
    tags: ["chocolate", "fudgy", "rich", "decadent"]
  },
  {
    id: 12,
    name: "Vanilla Bean Macaroons",
    type: "macaroon",
    difficulty: "medium",
    cookTime: "30 minutes",
    rating: 4.5,
    image: "/images/Recipe4.jpg",
    ingredients: ["coconut", "egg whites", "sugar", "vanilla bean", "almond extract"],
    tags: ["coconut", "vanilla", "gluten-free", "chewy"]
  },
  {
    id: 13,
    name: "Cinnamon Sugar Snaps",
    type: "cookie",
    difficulty: "easy",
    cookTime: "20 minutes",
    rating: 4.4,
    image: "/images/Recipe7.webp",
    ingredients: ["flour", "butter", "cinnamon", "sugar", "baking soda", "cream of tartar"],
    tags: ["cinnamon", "crispy", "simple", "quick"]
  },
  {
    id: 14,
    name: "Almond Biscotti",
    type: "biscotti",
    difficulty: "medium",
    cookTime: "55 minutes",
    rating: 4.6,
    image: "/images/Recipe8.avif",
    ingredients: ["flour", "almonds", "sugar", "eggs", "baking powder", "almond extract"],
    tags: ["italian", "almonds", "crunchy", "coffee"]
  },
  {
    id: 15,
    name: "Lemon Bars",
    type: "bar",
    difficulty: "medium",
    cookTime: "40 minutes",
    rating: 4.7,
    image: "/images/Recipe5.jpg",
    ingredients: ["flour", "butter", "lemon juice", "lemon zest", "powdered sugar", "eggs"],
    tags: ["citrus", "tangy", "bars", "summer"]
  },
  {
    id: 16,
    name: "Snickerdoodles",
    type: "cookie",
    difficulty: "easy",
    cookTime: "25 minutes",
    rating: 4.5,
    image: "/images/Recipe6.jpg",
    ingredients: ["flour", "butter", "sugar", "cinnamon", "cream of tartar", "baking soda"],
    tags: ["cinnamon", "soft", "classic", "comfort"]
  },
  {
    id: 17,
    name: "Chocolate Crinkles",
    type: "cookie",
    difficulty: "easy",
    cookTime: "28 minutes",
    rating: 4.6,
    image: "/images/Recipe1.avif",
    ingredients: ["cocoa powder", "flour", "sugar", "eggs", "powdered sugar", "oil"],
    tags: ["chocolate", "crackled", "festive", "soft"]
  },
  {
    id: 18,
    name: "Sugar Cookies",
    type: "cookie",
    difficulty: "easy",
    cookTime: "30 minutes",
    rating: 4.4,
    image: "/images/Recipe2.avif",
    ingredients: ["flour", "butter", "sugar", "eggs", "vanilla", "baking powder"],
    tags: ["classic", "decorative", "vanilla", "versatile"]
  },
  {
    id: 19,
    name: "Thumbprint Cookies",
    type: "cookie",
    difficulty: "easy",
    cookTime: "25 minutes",
    rating: 4.5,
    image: "/images/Recipe3.avif",
    ingredients: ["flour", "butter", "sugar", "jam", "nuts", "vanilla"],
    tags: ["jam-filled", "nuts", "colorful", "elegant"]
  },
  {
    id: 20,
    name: "Molasses Cookies",
    type: "cookie",
    difficulty: "easy",
    cookTime: "26 minutes",
    rating: 4.3,
    image: "/images/Recipe4.jpg",
    ingredients: ["flour", "molasses", "ginger", "cinnamon", "cloves", "butter"],
    tags: ["spiced", "soft", "molasses", "traditional"]
  }
];

// Helper functions for search
export const getRecipesByCategory = (category) => {
  return recipeDatabase.filter(recipe => 
    recipe.type === category.toLowerCase() || 
    recipe.tags.includes(category.toLowerCase())
  );
};

export const getRecipesByDifficulty = (difficulty) => {
  return recipeDatabase.filter(recipe => 
    recipe.difficulty === difficulty.toLowerCase()
  );
};

export const getPopularRecipes = (limit = 10) => {
  return recipeDatabase
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getQuickRecipes = (maxTime = 30) => {
  return recipeDatabase.filter(recipe => {
    const time = parseInt(recipe.cookTime);
    return time <= maxTime;
  });
};
