# PWA Implementation Guide - Option 1 (Basic)

> **Goal**: Make DSR installable as a home screen app on iOS and Android with minimal effort
>
> **What you'll get**: App icon, standalone mode, splash screen, basic caching
>
> **What you won't get**: Full offline functionality (requires internet to work)
>
> **Estimated time**: 30-45 minutes

## ✅ Icons Already Generated!

Your DSR app icons (with white "DSR" text on purple/blue background) are already created in `public/icons/`. You can skip Step 5 unless you want to customize them!

---

## Prerequisites

- Next.js project (✅ you have this)
- Node.js and pnpm installed
- Logo/icon image (at least 512x512px)

---

## Step 1: Install next-pwa Package

```bash
pnpm add next-pwa
```

---

## Step 2: Configure next.config.js

Update your `next.config.js` to enable PWA:

```javascript
/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable in dev mode
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  // Your existing config...
};

module.exports = withPWA(nextConfig);
```

---

## Step 3: Create manifest.json

Create `public/manifest.json`:

```json
{
  "name": "DSR - Data Security and Records",
  "short_name": "DSR",
  "description": "Detention and law enforcement records management system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

**Note**: Adjust `theme_color` and `background_color` to match your brand colors.

---

## Step 4: Add iOS-Specific Meta Tags

Update your root layout file `app/layout.tsx` to include these meta tags in the `<head>`:

```typescript
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "DSR - Data Security and Records",
  description: "Detention and law enforcement records management system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DSR",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Apple Touch Icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Step 5: App Icons ✅

**Good news!** Your DSR icons are already generated and ready to use!

The icons feature:

- White "DSR" text on your brand purple/blue background
- All required sizes for iOS and Android
- Located in `public/icons/` folder

If you want to regenerate or customize them:

```bash
# Regenerate icons
node scripts/generate-icons.js
node scripts/convert-to-png.js
```

To customize the color, edit `scripts/generate-icons.js` and change the `PRIMARY_COLOR` value.

### Generated Icon Files

Your `public/icons/` folder contains:

```
public/icons/
├── icon-72x72.png ✅
├── icon-96x96.png ✅
├── icon-128x128.png ✅
├── icon-144x144.png ✅
├── icon-152x152.png ✅
├── icon-192x192.png ✅
├── icon-384x384.png ✅
├── icon-512x512.png ✅
├── apple-touch-icon.png (180x180) ✅
├── favicon-32x32.png ✅
└── favicon-16x16.png ✅
```

---

## Step 6: Update .gitignore

Add these lines to prevent committing generated service worker files:

```
# PWA files
/public/sw.js
/public/workbox-*.js
/public/sw.js.map
/public/workbox-*.js.map
```

---

## Step 7: Test Your PWA

### Test Locally

1. Build your app:

```bash
pnpm build
pnpm start
```

2. Open http://localhost:3000 in Chrome
3. Open DevTools → Application → Manifest (should show your manifest)
4. Check Service Workers tab (should show registered worker)

### Test on Android

1. Deploy to a test server or use ngrok
2. Open in Chrome on Android
3. Chrome should show "Install app" banner
4. Tap to install → app appears on home screen

### Test on iOS (iPhone)

1. Deploy to production or accessible URL (iOS requires HTTPS)
2. Open in Safari
3. Tap Share → "Add to Home Screen"
4. Open from home screen → should open fullscreen

---

## Step 8: Deployment Checklist

Before deploying:

- [ ] Icons generated and placed in `public/icons/`
- [ ] `manifest.json` created with correct paths
- [ ] Meta tags added to root layout
- [ ] `next.config.js` updated with PWA config
- [ ] Build succeeds: `pnpm build`
- [ ] **HTTPS enabled** (required for PWA, especially iOS)

---

## Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Ensure you're testing on `pnpm start` (production build), not `pnpm dev`
- Clear browser cache and reload

### Icons Not Showing

- Verify icon paths in `manifest.json` match actual files
- Check icons are proper PNG format
- Use absolute paths starting with `/icons/...`

### iOS Not Working

- **Must use HTTPS** (use Vercel/Netlify for easy HTTPS)
- Check Safari → Develop → Service Workers
- Clear website data and retry

### App Opens in Browser Instead of Standalone

- Check `"display": "standalone"` in manifest
- On iOS: Re-add to home screen after manifest changes

---

## What You've Achieved

✅ **Installable app** on iOS and Android home screens
✅ **Fullscreen experience** (no browser UI)
✅ **Custom splash screen** on launch
✅ **Basic asset caching** (faster subsequent loads)
✅ **Professional appearance** with proper icons

## What's Still Missing (By Design)

❌ **Full offline functionality** - App requires internet
❌ **Data caching** - Fresh data fetched each time
❌ **Push notifications** - Not implemented (especially limited on iOS)

---

## Next Steps (Optional)

If users later request full offline support, you can upgrade to Option 2:

- Cache tRPC responses in IndexedDB
- Queue mutations when offline
- Implement sync strategy

But for most use cases, this basic PWA is sufficient!

---

## Questions?

- PWA not installing? Check HTTPS is enabled
- Icons not showing? Verify file paths in manifest
- Need offline support? Consider upgrading to Option 2

**Estimated maintenance**: Minimal - just update icons/manifest when branding changes.
