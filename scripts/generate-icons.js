/**
 * Generate PWA icons with DSR text
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Convert OKLCH to RGB (approximate)
// oklch(0.623 0.214 259.815) ≈ #6366f1 (indigo-500 similar)
const PRIMARY_COLOR = '#6366f1';
const BACKGROUND_COLOR = '#ffffff';

// Icon sizes needed for PWA
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating PWA icons with DSR text...\n');

// Generate SVG template
function generateSVG(size) {
  const fontSize = size * 0.35; // 35% of icon size
  const borderRadius = size * 0.15; // 15% for rounded corners

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${borderRadius}" fill="${PRIMARY_COLOR}"/>

  <!-- DSR Text -->
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="${BACKGROUND_COLOR}">DSR</text>
</svg>`;
}

// Generate Apple touch icon (180x180)
const appleTouchIconSVG = generateSVG(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIconSVG);

// Generate all PWA icon sizes
SIZES.forEach(size => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`✅ Generated ${filename}`);
});

// Generate favicons
const favicon32SVG = generateSVG(32);
const favicon16SVG = generateSVG(16);
fs.writeFileSync(path.join(iconsDir, 'favicon-32x32.svg'), favicon32SVG);
fs.writeFileSync(path.join(iconsDir, 'favicon-16x16.svg'), favicon16SVG);

console.log('✅ Generated favicon-32x32.svg');
console.log('✅ Generated favicon-16x16.svg');
console.log('✅ Generated apple-touch-icon.svg');

console.log('\n🎉 All icons generated successfully!');
console.log('\n📁 Icons location: public/icons/');
console.log('\n⚠️  NOTE: SVG icons work great for modern browsers.');
console.log('If you need PNG versions (better compatibility), use an online converter:');
console.log('   https://svgtopng.com/ or https://cloudconvert.com/svg-to-png');
console.log('\nOr install sharp and convert programmatically.');
