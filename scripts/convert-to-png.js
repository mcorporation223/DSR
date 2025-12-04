/**
 * Convert SVG icons to PNG format
 * Run with: node scripts/convert-to-png.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '../public/icons');

// Icon sizes to convert
const icons = [
  'icon-72x72.svg',
  'icon-96x96.svg',
  'icon-128x128.svg',
  'icon-144x144.svg',
  'icon-152x152.svg',
  'icon-192x192.svg',
  'icon-384x384.svg',
  'icon-512x512.svg',
  'apple-touch-icon.svg',
  'favicon-32x32.svg',
  'favicon-16x16.svg',
];

console.log('🔄 Converting SVG icons to PNG...\n');

async function convertIcon(filename) {
  const svgPath = path.join(iconsDir, filename);
  const pngPath = path.join(iconsDir, filename.replace('.svg', '.png'));

  try {
    await sharp(svgPath)
      .png()
      .toFile(pngPath);
    console.log(`✅ Converted ${filename} → ${filename.replace('.svg', '.png')}`);
  } catch (error) {
    console.error(`❌ Failed to convert ${filename}:`, error.message);
  }
}

async function convertAll() {
  for (const icon of icons) {
    await convertIcon(icon);
  }
  console.log('\n🎉 All icons converted to PNG!');
  console.log('\n📁 Icons location: public/icons/');
  console.log('\n✨ You can now delete the .svg files if you want (optional)');
}

convertAll().catch(console.error);
