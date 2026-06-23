// ── In-memory cache ───────────────────────────────────────────────────────────
// Vercel serverless functions share memory within the same instance, so this
// cache is shared across all requests hitting the same instance.
// TTL: 60s normally, 30s when a live match is in progress.
const cache = {}
const TTL_NORMAL = 60_000
const TTL_LIVE   = 30_000

function isCacheFresh(entry) {
  if (!entry) return false
  const ttl = entry.hasLive ? TTL_LIVE : TTL_NORMAL
  return Date.now() - entry.ts < ttl
}

function hasLiveMatch(data) {
  if (!data?.matches) return false
  return data.matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const path = req.query.path

  if (!path) {
    return res.status(400).json({ error: 'Missing path' })
  }

  const key = process.env.API_KEY

  if (!key) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // Serve from cache if fresh
  if (isCacheFresh(cache[path])) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(cache[path].data)
  }

  // Cache miss — fetch from football-data.org
  const response = await fetch(`https://api.football-data.org${path}`, {
    headers: { 'X-Auth-Token': key },
  })

  const data = await response.json()

  // Only cache successful responses
  if (response.ok) {
    cache[path] = {
      data,
      ts:      Date.now(),
      hasLive: hasLiveMatch(data),
    }
  }

  res.setHeader('X-Cache', 'MISS')
  res.status(response.status).json(data)
}
