# Architectural Design Document: FloraScan Campus
**Status:** Draft | **Version:** 1.6
**Project Lead:** User & AI Assistant

## 1. Executive Summary
FloraScan is a Progressive Web App (PWA) designed for college students to crowdsource a live map of campus flora. By prioritizing low-friction onboarding (no app store downloads), offline resilience, and gamified AI interactions, the application fosters community engagement and environmental awareness. The latest iteration pivots to a specialized API architecture to ensure botanical data integrity while retaining a playful, AI-driven conversational interface.

## 2. Tech Stack Decisions
| Component | Choice | Rationale |
| :--- | :--- | :--- |
| **Frontend** | SvelteKit (Svelte 5 Runes) | Employs `.svelte.js` files for strict logic isolation and UI reactivity. Tiny bundle size ensures fast load times on spotty campus cellular networks. |
| **Styling** | Hybrid CSS | Combines global CSS variables (`app.css`) for design tokens with scoped `<style>` tags in components. Prevents utility-class bloat while ensuring consistent theming. |
| **Backend/DB** | Supabase | Leverages built-in PostGIS for efficient geospatial queries (e.g., rendering flowers within the user's current map viewport), Auth, and Storage for user-uploaded images. |
| **PWA Layer** | Vite-PWA | Manages Service Workers for caching map tiles, machine learning models, and providing offline fallback features. |
| **Mapping** | Mapbox GL JS | Handles rendering large numbers of clustered data points more efficiently than Leaflet. |

## 3. System Architecture
1. **The Capture Loop:** User takes a photo via native HTML5 media capture. The client attempts EXIF GPS extraction via dynamic import (`exifr`). If metadata is stripped by the OS, a manual "Live GPS" fallback is triggered via the Geolocation API.
2. **Identification Pipeline:** Image is sent to a Supabase Edge Function, which proxies the request to the Pl@ntNet API for scientific identification, preserving API keys.
3. **Optional Enrichment:** The user is prompted to generate "Fun AI Facts." If initiated, the backend queries Google Gemini 1.5 Flash to synthesize conversational metadata about the identified plant.
4. **Data Persistence:** The compressed image is saved to Supabase Storage. The location (as a PostGIS `geometry` point), scientific identification, and optional AI summary are committed to the `flowers` table.

## 4. Architectural Decisions (ADR)

### ADR 001: PWA over Native App
**Context:** Need to maximize student participation across iOS and Android without download friction.
**Decision:** Deploy as a Progressive Web App accessible instantly via QR codes placed in campus gardens.
**Consequence:** Forfeits low-level AR access, but guarantees maximum onboarding velocity.

### ADR 005: Hybrid Styling Strategy
**Context:** Need for consistency without Tailwind bloat.
**Decision:** Use a single `app.css` for design tokens (variables) and Svelte `<style>` tags for component-specific logic.
**Consequence:** High performance, no build-time overhead, easy to maintain.

### ADR 006: Resilient Metadata Extraction
**Context:** Mobile operating systems intentionally strip EXIF GPS data from photos selected via the browser to protect user privacy.
**Decision:** Treat `exifr` failures as the default state on mobile. Implement immediate failover to the HTML5 Geolocation API via a manual "Use Current Device Location" button.

### ADR 010: AI-Augmented Botanical Facts (The "Hybrid" Intelligence)
**Context:** Maintaining complex taxonomy alignments between multiple botanical databases is a high-maintenance burden.
**Decision:** We use Pl@ntNet (or a similar rigid API) strictly for Scientific Identification to ensure map data integrity. We use Google Gemini exclusively as an opt-in "Summarizer" to create conversational UI content.
**Consequence:** Eliminates complex taxonomy syncing while keeping the app fun for students, lowering latency, and preserving AI API quotas.