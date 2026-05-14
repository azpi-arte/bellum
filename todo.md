# FloraScan Project Roadmap (MVP)

## 🏗️ Phase 1: The Skeleton (Foundations)
- [x] Initialize SvelteKit project (JS, Prettier, no Tailwind).
- [x] Set up Supabase project and database schema (`flowers` table with PostGIS integration).
- [x] Configure `vite-plugin-pwa` for basic manifest and service worker integration.
- [ ] Implement Basic Auth (Supabase Auth - Sign in with University Email).

## 🗺️ Phase 2: The Core Loop (Scanning & Mapping)
- [x] **The Camera:** Build robust capture component using `navigator.mediaDevices` and hidden `<input type="file">`.
- [x] **State Management Isolation:** Refactor messy component state into pure Svelte 5 module files (`capture.svelte.js`).
- [x] **Resilient GPS:** Implement `exifr` fallback logic to gracefully handle OS-level EXIF stripping.
- [ ] **The Map:** Integrate Mapbox GL JS and render dynamic flower pins based on viewport bounds.
- [ ] **Submissions:** Create the final flow to upload the compressed image + geospatial metadata to Supabase.

## 🌸 Phase 3: The "Magic" (AI & UX)
- [x] Draft UI workflow for Identification -> Optional Summary generation.
- [ ] Connect Pl@ntNet API for auto-identification via a secure Supabase Edge Function.
- [ ] Connect Google Gemini Multimodal API for the opt-in "Cute Summaries" feature.
- [ ] Build "Flower Profile" feed expansion with scoped CSS styling.

## 🚀 Phase 4: Polish & Scale
- [ ] Implement Mapbox Map Clustering (to prevent UI lag when 100 pins populate a single garden).
- [ ] Add "Flower Routes" feature to allow users to follow specific walking paths.
- [ ] Audit performance on low-end Android devices and known campus cellular "dead zones."
- [ ] Deploy physical QR codes to specific campus "hotspots" for the soft launch.