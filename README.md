# FIFA World Cup 2026 Tracker

A live World Cup 2026 tracker built with React and Vite. Follows all 48 teams across the group stage and knockout rounds with real-time scores, standings, and AI-powered match predictions.

## Features

- **Live Scores** — match scores refresh every 30–60 seconds using the football-data.org API, with time-based live detection as a fallback for API delays
- **Group Standings** — all 12 groups with live standings, qualification zones highlighted
- **Knockout Bracket** — auto-populates as teams advance through the tournament
- **AI Predictor** — Llama 3 powered match predictions with score, win probability, possession, and likely scorers pulled from real squad rosters
- **My Hub** — follow your favorite teams and see their upcoming fixtures and results in one place
- **Google Auth** — sign in with Google to sync your favorites across devices
- **Mobile Responsive** — hamburger nav and responsive grids for mobile use

## Tech Stack

- **Frontend** — React, Vite
- **Backend** — Vercel serverless functions (API proxy + caching)
- **Database & Auth** — Supabase (Postgres + Google OAuth)
- **AI** — Groq API (Llama 3.3 70B)
- **Match Data** — football-data.org API
- **Deployment** — Vercel

## Usage

The live app is hosted at [wc-2026-rust.vercel.app](https://wc-2026-rust.vercel.app) — no account required to browse. Sign in with Google to save your favorite teams across devices.

## Running Locally

If you want to run your own instance:

```bash
git clone https://github.com/yourusername/wc-2026.git
cd wc-2026
npm install
```

You will need your own API keys for [football-data.org](https://www.football-data.org), [Supabase](https://supabase.com), and [Groq](https://console.groq.com). Copy `.env.example` to `.env` and fill them in, then run:

```bash
vercel dev
```

## Security

- All third-party API keys are server-side only via Vercel serverless functions — never exposed to the browser
- Supabase Row Level Security (RLS) enforces that users can only read and write their own data
- Google OAuth handles authentication — no passwords stored

## License

MIT — feel free to use this as a reference for your own projects.
