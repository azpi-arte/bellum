# FloraScan Project Roadmap (MVP)

## Phase 1: The Skeleton (Foundations)
- [ ] Initialize SvelteKit project (JS, Prettier, no Tailwind).
- [ ] Set up Supabase project and database schema (`flowers` table with PostGIS).
- [ ] Configure `vite-plugin-pwa` for manifest and service worker.
- [ ] Implement Basic Auth (Supabase Auth).

## Phase 2: The Core Loop (Scanning & Mapping)
- [ ] **The Camera:** Build capture component using `navigator.mediaDevices`.
- [ ] **The Map:** Integrate Mapbox and render flower pins.
- [ ] **Submissions:** Create flow to upload compressed image + metadata to Supabase.
- [ ] **Offline Mode:** Implement basic caching for map markers.

## Phase 3: The "Magic" (AI & UX)
- [ ] Integrate Plant.id for automatic identification.
- [ ] Connect Gemini API for "Cute Summaries" and facts.
- [ ] Build "Flower Profile" with scoped CSS styling.

## Phase 4: Polish & Scale
- [ ] Implement Map Clustering.
- [ ] Add "Flower Routes" feature.
- [ ] Audit performance on campus "dead zones."