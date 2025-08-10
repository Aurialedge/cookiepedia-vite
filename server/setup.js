#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Cookiepedia Server...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    // Create basic .env file
    const envContent = `# Server Configuration
PORT=5000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Search Configuration
SEARCH_LIMIT=10
SEARCH_MIN_LENGTH=2

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
  }
} else {
  console.log('ℹ️  .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  Dependencies not installed. Run: npm install');
} else {
  console.log('✅ Dependencies are installed');
}

console.log('\n📋 Next Steps:');
console.log('1. Get your Gemini API key from: https://makersuite.google.com/app/apikey');
console.log('2. Edit .env file and replace "your_gemini_api_key_here" with your actual API key');
console.log('3. Run: npm run dev');
console.log('4. Server will start on http://localhost:5000');

console.log('\n🔍 Test endpoints:');
console.log('• Health check: http://localhost:5000/api/health');
console.log('• Search suggestions: http://localhost:5000/api/search/suggestions?q=chocolate');
console.log('• Popular searches: http://localhost:5000/api/search/popular');

console.log('\n🎉 Setup complete! Happy coding!');
