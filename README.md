# Cytisinio

A tiny mobile-first PWA companion for the 25-day cytisine nicotine-cessation course
(Desmoxan / Recigar / Tabex / Dextasine).

- Enter the date & time of your first pill
- Tap **"I took a pill"** to log each intake (with undo) — no more "did I take it?"
- The next-pill time and countdown are computed from your **last logged pill**,
  not a theoretical schedule
- See today's pills: logged ones crossed out, remaining ones projected
- Preview the upcoming days (dose steps, quit day, phase changes)
- Daily "what to expect" guidance
- Product-aware support for cigarettes, nicotine pouches, vaping, and other nicotine products
- A day 1–4 nicotine-use tracker that compares today with the user's usual baseline, followed by a zero-nicotine day 5
- Download and restore a portable JSON backup of all course data
- Optional, private, offline-first cross-device backup with Dexie Cloud
- Works offline, installable on your phone (Add to Home Screen)
- Privacy-friendly Vercel Web Analytics and Speed Insights (anonymous page views and performance only; no journal data)

## Schedule (standard leaflet)

| Days  | Interval      | Pills/day |
|-------|---------------|-----------|
| 1–3   | every 2 h     | 6         |
| 4–12  | every 2.5 h   | 5         |
| 13–16 | every 3 h     | 4         |
| 17–20 | every 5 h     | 3         |
| 21–25 | 1–2 per day   | ≤2        |

All nicotine use must stop completely by **day 5**.

## Run

The app is plain HTML/CSS/JS. Its pinned Dexie dependencies are bundled locally
so the installed PWA never depends on a third-party CDN:

```sh
npm install
npm run build:cloud
```

Then serve the folder over HTTP:

```sh
python3 -m http.server 8741
# open http://localhost:8741
```

Deploy anywhere static (Vercel, Netlify, GitHub Pages). `cloud-sync.js` is a
generated browser bundle and is intentionally committed for static deployments.

## Privacy

Pill intake, nicotine-use, craving, and mood data stay in the visitor's browser
by default. Cloud backup is explicitly opt-in; when enabled, that journey data
is stored privately in the visitor's Dexie Cloud account and remains available
offline through IndexedDB. Disconnecting never removes the local app data.

The production site uses Vercel Web Analytics and Speed Insights for anonymous
page-view and performance data only. Dexie Cloud credentials (`*.key` and
`dexie-cloud.json`) are ignored and must never be committed or deployed.

## Disclaimer

Schedule helper only, not medical advice. Follow your package leaflet and ask a
doctor or pharmacist if unsure.
