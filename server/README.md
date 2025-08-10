# Cookiepedia Server

Backend API server for Cookiepedia search functionality with AI-powered auto-suggestions.

## Features

- **🤖 AI-Powered Search**: Google Gemini API integration for intelligent recipe suggestions
- **🔍 Real-time Suggestions**: Smart auto-complete as users type
- **📊 Fallback System**: Local fuzzy search when API is unavailable
- **🎯 Context-Aware**: Understands cooking terminology and recipe relationships
- **⚡ Fast Response**: Optimized with debouncing and caching
- **🌐 CORS Support**: Cross-origin requests enabled for frontend integration

## API Endpoints

### Search Suggestions
```
GET /api/search/suggestions?q=query&limit=10
```
Returns auto-suggestions based on recipe names, ingredients, and tags.

### Popular Searches
```
GET /api/search/popular
```
Returns list of popular search terms.

### Categories
```
GET /api/search/categories
```
Returns recipe categories with counts and icons.

### Health Check
```
GET /api/health
```
Server status and health information.

## Installation & Setup

### 1. Navigate to the server directory:
```bash
cd server
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Get your Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 4. Configure environment:
```bash
cp .env.example .env
```

Edit the `.env` file and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-pro
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000` by default.

### 6. Verify Setup:
- ✅ Server starts without errors
- ✅ Console shows "Gemini AI integration: ENABLED"
- ✅ Test endpoint: `http://localhost:5000/api/health`

## Environment Variables

- `PORT`: Server port (default: 5000)
- `CORS_ORIGIN`: Frontend URL for CORS (default: http://localhost:5173)
- `SEARCH_LIMIT`: Maximum search results (default: 10)
- `SEARCH_MIN_LENGTH`: Minimum query length (default: 2)

## Database

The server uses an in-memory recipe database located in `/data/recipes.js`. This includes:

- 20+ recipe entries
- Fuzzy search capabilities
- Recipe metadata (difficulty, cook time, ratings)
- Ingredient lists and tags
- Image references

## Frontend Integration

The frontend uses custom React hooks:
- `useSearch()`: Main search functionality with debouncing
- `usePopularSearches()`: Popular search terms
- `useCategories()`: Recipe categories

## Search Features

- **Fuzzy Matching**: Intelligent search with typo tolerance
- **Debounced Requests**: Optimized API calls (300ms delay)
- **Highlighted Results**: Search term highlighting in suggestions
- **Rich Metadata**: Recipe details, ratings, and cook times
- **Error Handling**: Graceful error states and loading indicators

## Development

The server uses:
- **Express.js**: Web framework
- **Fuse.js**: Fuzzy search library
- **CORS**: Cross-origin resource sharing
- **Nodemon**: Development auto-reload

## Production Deployment

For production deployment:
1. Set appropriate environment variables
2. Use a process manager like PM2
3. Configure reverse proxy (nginx/Apache)
4. Enable HTTPS
5. Set up monitoring and logging
