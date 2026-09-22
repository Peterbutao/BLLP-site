# Worship Night 2026 — Living Waters Church International

Live flyer / event site for **Worship Night (Live Recording)** at **Living Waters Church International — Bwaila City of Eagles, Lilongwe, Malawi**.

> **Date:** Sunday 4th Oct 2026 — **5:30PM – 9:00PM** (CAT, Africa/Blantyre)
> **Venue:** Bwaila City of Eagles, Lilongwe [-13.975334, 33.7634107](https://maps.app.goo.gl/yGSBEXCcB2UogxH27)
> **Contact:** Jemimah Mhango — [+265 882 06 68 60](https://wa.me/265882066860) (WhatsApp)
> **Theme:** *Let everything that has breath praise the Lord. Praise the Lord!*

Live site: `https://worshipnight-livingwaters.pages.dev/`

## What this site is

A single-page, fully-prerendered flyer site that replaces a static poster:

- **Header** — church logo (`static/logo.png`) + Living Waters Church International / Bwaila City of Eagles
- **Hero** — `Worship / night / (Live Recording)` banner with animated choir image (`static/DSC_0888.jpg-Photoroom.png`) — pan/zoom on mobile, zoom on desktop, grid background + floating particles
- **Event details** — Date (Sunday 4th Oct 2026) + Time (5:30PM – 9:00PM)
- **Countdown** — live `days / hours / mins / secs` to `2026-10-04T17:30:00` (`src/routes/+page.svelte:25`), fixed footer, updates every second
- **CTA** — `Join Us` → `✓ See You There!` (`src/routes/+page.svelte:43`)
- **Interactive map** — Leaflet + OpenStreetMap, church marker with popup, 80m radius circle, `Use My Location` → geolocate + draw line + open Google Maps directions (`src/routes/+page.svelte:53`, `src/routes/+page.svelte:122`)
- **Contact** — WhatsApp card for Jemimah Mhango (`src/routes/+page.svelte:22`)
- **SEO** — Open Graph / Twitter cards, canonical URL, JSON-LD `MusicEvent` (`src/routes/+layout.svelte:44`), `og-image.jpg` (1200×630)

## Tech stack

- **Framework:** SvelteKit `2.63` + Svelte `5.56` (runes mode, `svelte.config.js:5`)
- **Build:** Vite `8.0`, TypeScript `6.0`, `svelte-check`
- **Map:** Leaflet `1.9.4` (dynamic import, client-only)
- **Styling:** `src/app.css` (custom, Inter font, no Tailwind)
- **Adapter:** `@sveltejs/adapter-cloudflare` `7.2.9` for Cloudflare Pages/Workers (`svelte.config.js:1`) — fully prerendered (`src/routes/+layout.ts:1` `export const prerender = true`)
- **Also installed:** `@sveltejs/adapter-static` `3.0.10` (inactive, can be removed)

## Project structure

```
src/
  app.css                # all styling, animations, responsive
  app.html               # shell
  lib/assets/favicon.png
  routes/
    +layout.ts           # prerender = true
    +layout.svelte       # <head> SEO, OG, Twitter, JSON-LD
    +page.svelte         # hero, countdown, map, contact
static/
  logo.png               # header / favicon
  DSC_0888.jpg-Photoroom.png # choir photo
  og-image.jpg / og-image.png / og-logo.png
  chat.png
  robots.txt
svelte.config.js         # adapter-cloudflare
vite.config.ts           # sveltekit()
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # svelte-check
npm run build    # → .svelte-kit/cloudflare/ (_worker.js + static assets)
npm run preview  # preview production build
```

## Deploy to Cloudflare

**Cloudflare Pages (recommended, Git integration):**
1. Connect repo in Cloudflare dashboard
2. Build command: `npm run build`
3. Output: auto-detected from `adapter-cloudflare` (`.svelte-kit/cloudflare`)

**Workers (wrangler):**
```bash
npm run build
npx wrangler deploy
```
No `wrangler.jsonc` is committed — add `assets.directory: ".svelte-kit/cloudflare"` if you need custom wrangler config. The build already emits `_worker.js`, `_routes.json` and `_headers` with immutable caching.

## Assets & attribution

- Map tiles: © OpenStreetMap (`src/routes/+page.svelte:76`)
- Choir photo: `static/DSC_0888.jpg-Photoroom.png`
- Icons/markers via Leaflet CDN + custom divIcons
