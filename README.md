# FIFA World Cup 2026 Tracker

A live World Cup 2026 tracker built with React and Vite. Follows all 48 teams across the group stage and knockout rounds with real-time scores, standings, and match timelines.

## Features

- **Live Scores** — scores and match minute refresh every 30 seconds via the worldcup26.ir API
- **Match Timeline** — click any live or finished match to expand a goal-by-goal timeline with scorer names and minutes
- **Group Standings** — all 12 groups with live standings computed from match results
- **Knockout Bracket** — auto-populates as teams advance through the tournament
- **AI Predictor** — Llama 3 powered match predictions with score, win probability, and likely scorers
- **My Hub** — follow your favorite teams and see their upcoming fixtures and results in one place
- **Google Auth** — sign in with Google to sync your favorites across devices
- **Mobile Responsive** — hamburger nav and responsive grids

## Tech Stack

- **Frontend** — React, Vite
- **Backend** — Vercel serverless functions (API proxy + caching)
- **Database & Auth** — Supabase (Postgres + Google OAuth)
- **AI** — Groq API (Llama 3.3 70B)
- **Match Data** — worldcup26.ir (free JWT-based API)
- **Deployment** — Vercel

## Live App

Hosted at [wc-2026-rust.vercel.app](https://wc-2026-rust.vercel.app) — no account required to browse. Sign in with Google to save your favorite teams across devices.

## Running Locally

```bash
git clone https://github.com/SaulG2134/wc2026.git
cd wc2026
npm install
cp .env.example .env   # fill in your keys
vercel dev
```

See `.env.example` for the required environment variables.

## Security

- All API keys are server-side only via Vercel serverless functions — never exposed to the browser
- Supabase Row Level Security (RLS) enforces that users can only read and write their own data
- Google OAuth handles authentication — no passwords stored

## License

MIT — feel free to use this as a reference for your own projects.
