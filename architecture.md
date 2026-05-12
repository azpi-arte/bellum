# Architectural Design Document: FloraScan Campus
**Status:** Draft | **Version:** 1.5

## 2. Tech Stack Decisions
| Component | Choice | Rationale |
| :--- | :--- | :--- |
| **Frontend** | SvelteKit (JS) | Svelte 5 Runes for reactivity. |
| **Styling** | Hybrid CSS | Global CSS Variables + Scoped Component Styles. |
| **PWA** | Vite-PWA | Offline service worker. |

## 4. Architectural Decisions (ADR)
### ADR 005: Hybrid Styling Strategy
**Context:** Need for consistency without Tailwind bloat.
**Decision:** Use a single `app.css` for design tokens (variables) and Svelte `<style>` tags for component-specific logic.
**Consequence:** High performance, no build-time overhead, easy to maintain.