# Vercel Page Load Fix - TODO Steps

**Approved Plan Progress Tracker**

## [x] 0. Plan Approved ✅
- User confirmed diagnosis (hydration mismatch from SW in layout + config conflict)

## [x] 1. Created src/app/service-worker-client.tsx ✅
- Client-only SW register

## [x] 2. Updated src/app/layout.tsx ✅
- Removed hydration-breaking SW component
- Added safe SW script in <head>
- Fixed JSX/TS structure

## [x] 3. Renamed next.config.js → next.config.js.bak ✅
- Fixed config conflict / PWA chunk warnings

## [x] 4. Improved src/app/page.tsx ✅
- Added isClient state/guard for AI useEffect

## [ ] 5. Local Test
- npm run build && npm run start
- Verify page loads

## [ ] 6. Deploy & Verify
- git commit/push
- vercel deploy
- Check production page loads

## [ ] 7. Optional: PWA Re-enable (if needed)
- Single next.config.mjs with proper next-pwa + size limits

**Next Step**: Complete #1, mark [x], proceed iteratively.

