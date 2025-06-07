#!/bin/bash

# 🚀 Push-Up Counter PWA Deployment Script

echo "🏗️  Building Push-Up Counter PWA..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Run type checking
echo "🔍 Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed. Please fix the errors and try again."
    exit 1
fi

# Run linting
echo "🧹 Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  Linting completed with warnings. Continuing..."
fi

# Build for production
echo "🏭 Building for production..."
NODE_ENV=production npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Check if dist directory exists and has content
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Build output not found or empty."
    exit 1
fi

echo "✅ Build successful!"
echo "📊 Build size:"
du -sh dist/

# Preview option
echo ""
read -p "🔍 Would you like to preview the build locally? (y/N): " preview
if [[ $preview =~ ^[Yy]$ ]]; then
    echo "🌐 Starting preview server..."
    echo "📱 Your PWA will be available at: http://localhost:4173"
    echo "🛑 Press Ctrl+C to stop the preview"
    npm run preview
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Push your code to GitHub"
echo "   2. Enable GitHub Pages in repository settings"
echo "   3. Your app will be available at: https://yourusername.github.io/push-app/"
echo ""
echo "🔗 For detailed instructions, see DEPLOYMENT.md"
