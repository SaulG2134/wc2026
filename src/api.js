import { NORM } from './constants.js'

const BASE = '/fda/v4'

// ── Normalise team names coming from the API ──────────────────────────────────
export const norm = n => NORM[n] || n

// ── Generic fetch wrapper ─────────────────────────────────────────────────────
export async function apiFetch(path, key) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': key },
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`${res.status}: ${txt || res.statusText}`)
  }
  return res.json()
}

// ── Map API standings → internal format ──────────────────────────────────────
export function mapStandings(data) {
  if (!data.standings) return []
  return data.standings
    .filter(s => s.type === 'TOTAL' && s.group)
    .map(s => ({
      id: s.group.replace('GROUP_', ''),
      teams: s.table.map(r => ({
        name: norm(r.team.name || r.team.shortName || ''),
        mp:   r.playedGames,
        w:    r.won,
        d:    r.draw,
        l:    r.lost,
        gd:   r.goalDifference,
        pts:  r.points,
      })),
    }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

// ── Map API matches → internal format ────────────────────────────────────────
export function mapMatches(data) {
  if (!data.matches) return []
  return data.matches
    .filter(m => m.stage === 'GROUP_STAGE')
    .map(m => {
      const d = new Date(m.utcDate)
      const rawStatus = m.status
      const status =
        rawStatus === 'FINISHED'                          ? 'finished' :
        rawStatus === 'IN_PLAY' || rawStatus === 'PAUSED' ? 'live'     :
        'upcoming'

      return {
        id:     m.id,
        grp:    (m.group || '').replace('GROUP_', '') || '?',
        home:   norm(m.homeTeam?.name || 'TBD'),
        away:   norm(m.awayTeam?.name || 'TBD'),
        hs:     m.score?.fullTime?.home ?? null,
        as:     m.score?.fullTime?.away ?? null,
        minute: m.minute ?? null,
        date:   d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time:   d.toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit',
                  timeZone: 'America/New_York',
                }) + ' ET',
        venue:  m.venue || '',
        status,
      }
    })
}

// ── Sort group table ──────────────────────────────────────────────────────────
export const sortTeams = ts => [...ts].sort((a, b) => b.pts - a.pts || b.gd - a.gd)
