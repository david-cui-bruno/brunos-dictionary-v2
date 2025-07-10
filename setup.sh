#!/bin/bash

echo "🚀 Setting up Brown Slang Dictionary v2..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize Supabase
echo "��️  Initializing Supabase..."
npx supabase init

# Start Supabase locally
echo "🏃 Starting Supabase locally..."
npx supabase start

# Generate types
echo "🔧 Generating TypeScript types..."
npm run db:generate

# Build the project
echo "🔨 Building the project..."
npm run build

echo "✅ Setup complete! Run 'npm run dev' to start the development server." 