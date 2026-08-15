# Cytisinio

A tiny mobile-first PWA companion for the 25-day cytisine quit-smoking course
(Desmoxan / Recigar / Tabex / Dextasine).

- Enter the date & time of your first pill
- Tap **"I took a pill"** to log each intake (with undo) — no more "did I take it?"
- The next-pill time and countdown are computed from your **last logged pill**,
  not a theoretical schedule
- See today's pills: logged ones crossed out, remaining ones projected
- Preview the upcoming days (dose steps, quit day, phase changes)
- Daily "what to expect" guidance
- Works offline, installable on your phone (Add to Home Screen)

## Schedule (standard leaflet)

| Days  | Interval      | Pills/day |
|-------|---------------|-----------|
| 1–3   | every 2 h     | 6         |
| 4–12  | every 2.5 h   | 5         |
| 13–16 | every 3 h     | 4         |
| 17–20 | every 5 h     | 3         |
| 21–25 | 1–2 per day   | ≤2        |

Smoking must stop completely by **day 5**.

## Run

No build step — it's plain HTML/CSS/JS. Serve the folder over HTTP:

```sh
python3 -m http.server 8741
# open http://localhost:8741
```

Deploy anywhere static (Vercel, Netlify, GitHub Pages). State lives in
`localStorage` — no backend, no accounts.

## Disclaimer

Schedule helper only, not medical advice. Follow your package leaflet and ask a
doctor or pharmacist if unsure.
