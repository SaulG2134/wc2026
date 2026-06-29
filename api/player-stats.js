const BASE = 'https://worldcup26.ir'

let cache = { data: null, ts: 0 }
const TTL = 60_000

function norm(s = '') {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

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
    const splitMin = entry.match(/(\d+)'\+(\d+)'/)
    if (splitMin) {
      minute = `${splitMin[1]}+${splitMin[2]}`
      scorer = entry.replace(/\s*\d+'[+]\d+'\s*/, '').replace(/\s*\([^)]+\)/g, '').trim()
    } else {
      const minMatch = entry.match(/(\d+(?:\+\d+)?)'/)
      if (!minMatch) continue
      minute = minMatch[1]
      scorer = entry.replace(/\s*\([^)]+\)/g, '').replace(/\s*\d+(?:\+\d+)?'\s*/, '').trim()
    }
    if (!scorer) continue
    results.push({ scorer, minute, type: isOG ? 'OWN_GOAL' : isPen ? 'PENALTY' : 'NORMAL', team: teamName })
  }
  return results
}

export default async function handler(req, res) {
  const token = process.env.WC26_TOKEN
  if (!token) return res.status(500).json({ error: 'WC26_TOKEN not configured' })

  if (cache.data && Date.now() - cache.ts < TTL) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(cache.data)
  }

  try {
    const r    = await fetch(`${BASE}/get/games`, { headers: { Authorization: `Bearer ${token}` } })
    const json = await r.json()
    const games = json?.games ?? (Array.isArray(json) ? json : [])

    // Aggregate goals per player across all finished games
    const playerMap = {}

    for (const g of games) {
      if (g.finished !== 'TRUE' && g.finished !== true) continue

      const home = g.home_team_name_en || ''
      const away = g.away_team_name_en || ''

      const allGoals = [
        ...parseScorers(g.home_scorers, home),
        ...parseScorers(g.away_scorers, away),
      ]

      for (const goal of allGoals) {
        if (goal.type === 'OWN_GOAL') continue  // don't credit own goals to scorer
        const key = norm(goal.scorer) + '_' + norm(goal.team)
        if (!playerMap[key]) {
          playerMap[key] = {
            name:      goal.scorer,
            team:      goal.team,
            goals:     0,
            penalties: 0,
          }
        }
        playerMap[key].goals++
        if (goal.type === 'PENALTY') playerMap[key].penalties++
      }
    }

    const players = Object.values(playerMap)
      .sort((a, b) => b.goals - a.goals)

    const result = { players, updatedAt: new Date().toISOString() }
    cache = { data: result, ts: Date.now() }
    res.setHeader('X-Cache', 'MISS')
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
