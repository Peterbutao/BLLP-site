# Tablet Allocation Calc

Worship Night 2026 flyer / site for **Living Waters Church International — Bwaila City of Eagles**.

## Phone display name
App name shown when added to home screen (Android / iOS): **Tablet Allocation Calc**

Configured via:
- `index.html` → `<title>`, `<meta name="application-name">`, `<meta name="apple-mobile-web-app-title">`
- `manifest.json` → `name` / `short_name`
- `site.webmanifest` (alias)

## Webpage structure
- **Header / Navbar** (`index.html:41-75`) — sticky header with `static/logo.png` (`index.html:460`) and nav links (Home / Countdown / Details / Venue)
- **Hero** (`index.html:113-121`) — Worship Night headline + description + hero image `static/DSC_0888.jpg-Photoroom.png` (`index.html:506`)
- **Countdown** (`index.html:220-266`, `index.html:588-621`) — live countdown to `2026-09-09T18:00:00+02:00` (CAT, Africa/Blantyre) with days/hours/mins/secs, updates every second, shows "happening now" after expiry
- **Details grid** (`index.html:312-351`) — Date / Time / Venue cards
- **Flyer embed + Venue** (`index.html:359-414`) — mini poster preview reusing both static assets + map placeholder

## Files
- `index.html` — full webpage (uses `static/logo.png` and `static/DSC_0888.jpg-Photoroom.png`)
- `static/logo.png` — church seal / app icon / header logo
- `static/DSC_0888.jpg-Photoroom.png` — choir photo (hero + flyer embed)
- `manifest.json` / `site.webmanifest` — PWA manifest with display name `Tablet Allocation Calc`
- `README.md` — this file

## Run locally
```bash
# from project root
python -m http.server 8000
# then open http://localhost:8000
```

## Install on phone
1. Open site in Chrome/Safari
2. Add to Home Screen — icon and name will appear as **Tablet Allocation Calc**
