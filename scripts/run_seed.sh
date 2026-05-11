#!/bin/bash
echo "🚀 Starting Seed Process..."

# 1. Generate users.json
echo "📦 Generating seed data..."
cd "$(dirname "$0")"
node generate-seed.js

# 2. Run SeedApp to push to MongoDB
echo "🔌 Pushing data to MongoDB..."
cd SeedApp
dotnet run

echo "✅ Seed process finished!"
