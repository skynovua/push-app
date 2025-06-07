#!/bin/bash

# 🎨 Icon Generator Script for iOS PWA Support
# Generates PNG icons from SVG for better iOS compatibility

echo "🎨 Generating PNG icons for iOS PWA support..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "⚠️  ImageMagick not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Please install ImageMagick manually:"
        echo "   brew install imagemagick"
        echo "   or visit: https://imagemagick.org/script/download.php"
        exit 1
    fi
fi

# Navigate to project directory
cd "$(dirname "$0")"

# Check if source icon exists
if [ ! -f "public/icon.svg" ]; then
    echo "❌ Source icon public/icon.svg not found"
    exit 1
fi

echo "📱 Generating iOS-compatible PNG icons..."

# Create PNG icons for different sizes
sizes=(72 96 128 144 152 167 180 192 384 512)

for size in "${sizes[@]}"; do
    echo "  → Generating ${size}x${size} icon..."
    magick public/icon.svg -resize ${size}x${size} public/icon-${size}x${size}.png
done

# Generate Apple Touch Icon (standard 180x180)
echo "🍎 Generating Apple Touch Icon..."
magick public/icon.svg -resize 180x180 public/apple-touch-icon.png

# Generate favicon in different sizes
echo "🌐 Generating favicons..."
magick public/icon.svg -resize 32x32 public/favicon-32x32.png
magick public/icon.svg -resize 16x16 public/favicon-16x16.png

# Generate splash screens (basic ones)
echo "🌊 Generating basic splash screens..."

# iPhone 5/SE
magick -size 640x1136 xc:"#2563eb" -gravity center \
    \( public/icon.svg -resize 120x120 \) -composite \
    public/splash-640x1136.png

# iPhone 6/7/8
magick -size 750x1334 xc:"#2563eb" -gravity center \
    \( public/icon.svg -resize 140x140 \) -composite \
    public/splash-750x1334.png

# iPhone 6+/7+/8+
magick -size 1242x2208 xc:"#2563eb" -gravity center \
    \( public/icon.svg -resize 180x180 \) -composite \
    public/splash-1242x2208.png

echo "✅ All icons generated successfully!"
echo ""
echo "📋 Generated files:"
for size in "${sizes[@]}"; do
    echo "  📱 icon-${size}x${size}.png"
done
echo "  🍎 apple-touch-icon.png"
echo "  🌐 favicon-32x32.png"
echo "  🌐 favicon-16x16.png"
echo "  🌊 splash-640x1136.png"
echo "  🌊 splash-750x1334.png"
echo "  🌊 splash-1242x2208.png"
echo ""
echo "🚀 Your PWA is now ready for iOS installation!"
