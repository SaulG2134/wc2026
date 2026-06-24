const BASE = 'https://worldcup26.ir'

// ── Caches ────────────────────────────────────────────────────────────────────
const eventCache = {}          // permanent per finished match
const gamesCache = { data: null, ts: 0 }
const GAMES_TTL  = 60_000      // refresh games list every 60s

// ── Fuzzy team name match ─────────────────────────────────────────────────────
function norm(s = '') {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip accents ü→u etc.
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/united states of america|united states/g, 'usa')
    .replace(/bosnia.+herzegovina/g,                   'bosnia')
    .replace(/korea republic|republic of korea/g,       'south korea')
    .replace(/czechia/g,                               'czech republic')
    .replace(/turkiye|turkey/g,                        'turkiye')
    .replace(/cote.+ivoire|ivory coast/g,              'ivory coast')
    .replace(/dr congo|congo dr|democratic republic.+congo/g, 'dr congo')
    .replace(/cabo verde|cape verde islands?/g,        'cape verde')
    .replace(/\bir iran\b/g,                           'iran')
    .replace(/\bchina pr\b/g,                          'china')
    .replace(/\s+/g, ' ')
    .trim()
}

function teamMatch(a, b) {
  const na = norm(a), nb = norm(b)
  if (!na || !nb) return false
  return na === nb || na.includes(nb) || nb.includes(na)
}

// ── Parse scorer string  ──────────────────────────────────────────────────────
// Handles formats:
//   "F. Balogun 31'"        standard
//   "G. Reyna 90'+8'"       injury time (apostrophe mid-string)
//   "F. Balogun 45+5'"      injury time (standard notation)
//   "Breel Embolo 17'(p)"   penalty
function parseScorers(str, teamName) {
  if (!str || str === 'null') return []
  const results = []
  const re = /"([^"]+)"/g
  let m
  while ((m = re.exec(str)) !== null) {
    const entry = m[1]
    const isPen = /\(p\)/i.test(entry)
    const isOG  = /\(og\)/i.test(entry)

    let minute, scorer

    // Format: "90'+8'" — split added time
    const splitMin = entry.match(/(\d+)'\+(\d+)'/)
    if (splitMin) {
      minute = `${splitMin[1]}+${splitMin[2]}`
      scorer = entry
        .replace(/\s*\d+'[+]\d+'\s*/, '')
        .replace(/\s*\([^)]+\)/g, '')
        .trim()
    } else {
      // Format: "45'" or "45+5'"
      const minMatch = entry.match(/(\d+(?:\+\d+)?)'/)
      if (!minMatch) continue
      minute = minMatch[1]
      scorer = entry
        .replace(/\s*\([^)]+\)/g, '')
        .replace(/\s*\d+(?:\+\d+)?'\s*/, '')
        .trim()
    }

    if (!scorer) continue
    results.push({ scorer, minute, type: isOG ? 'OWN_GOAL' : isPen ? 'PENALTY' : 'NORMAL', team: teamName })
  }
  return results
}

// ── Fetch & cache all games ───────────────────────────────────────────────────
async function fetchGames(token) {
  if (gamesCache.data && Date.now() - gamesCache.ts < GAMES_TTL) {
    return gamesCache.data
  }
  const r = await fetch(`${BASE}/get/games`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await r.json()
  const list = json?.games ?? (Array.isArray(json) ? json : [])
  gamesCache.data = list
  gamesCache.ts   = Date.now()
  return list
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const { home, away, status } = req.query

  if (!home || !away) {
    return res.status(400).json({ error: 'Missing home or away' })
  }

  const cacheKey = `${norm(home)}_${norm(away)}`
  if (eventCache[cacheKey] && status !== 'live') {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(eventCache[cacheKey])
  }

  const token = process.env.WC26_TOKEN
  if (!token) return res.status(500).json({ error: 'WC26_TOKEN not configured' })

  try {
    const games = await fetchGames(token)

    const game = games.find(g =>
      teamMatch(g.home_team_name_en || '', home) &&
      teamMatch(g.away_team_name_en || '', away)
    )

    if (!game) {
      return res.status(404).json({ error: 'Match not found', home, away })
    }

    const goals = [
      ...parseScorers(game.home_scorers, home),
      ...parseScorers(game.away_scorers, away),
    ]

    const result = { goals, bookings: [] }

    if (game.finished === 'TRUE' || game.finished === true) {
      eventCache[cacheKey] = result
    }

    res.setHeader('X-Cache', 'MISS')
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
