import { NORM } from './constants.js'

// ── Normalise team names coming from the API ──────────────────────────────────
export const norm = n => NORM[n] || n

// ── Generic fetch wrapper ─────────────────────────────────────────────────────
// Calls our Vercel serverless function which holds the API key server-side
export async function apiFetch(path) {
  const res = await fetch(`/api/football?path=${encodeURIComponent(path)}`)
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

// ── Shared match row mapper (used by both group + knockout) ───────────────────
function mapMatchRow(m) {
  const d = new Date(m.utcDate)
  const rawStatus = m.status
  const now = Date.now()
  const elapsed = now - d.getTime()
  const couldBeLive = elapsed > 0 && elapsed < 130 * 60_000

  const status =
    rawStatus === 'FINISHED'                           ? 'finished' :
    rawStatus === 'IN_PLAY' || rawStatus === 'PAUSED'  ? 'live'     :
    couldBeLive                                        ? 'live'     :
    'upcoming'

  const inferredMinute = status === 'live' && m.minute == null
    ? Math.min(Math.floor(elapsed / 60_000), 90)
    : (m.minute ?? null)

  const scoreHome =
    status === 'finished' ? (m.score?.fullTime?.home ?? null)
    : (m.score?.regularTime?.home ?? m.score?.fullTime?.home ?? null)
  const scoreAway =
    status === 'finished' ? (m.score?.fullTime?.away ?? null)
    : (m.score?.regularTime?.away ?? m.score?.fullTime?.away ?? null)

  return {
    id:     m.id,
    matchNum: m.matchday ?? null,
    home:   norm(m.homeTeam?.name || 'TBD'),
    away:   norm(m.awayTeam?.name || 'TBD'),
    hs:     scoreHome,
    as:     scoreAway,
    minute: inferredMinute,
    date:   d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time:   d.toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit',
              timeZone: 'America/New_York',
            }) + ' ET',
    venue:  m.venue || '',
    status,
  }
}

// Stage label lookup
const STAGE_LABEL = {
  LAST_32:       'Round of 32',
  LAST_16:       'Round of 16',
  QUARTER_FINALS:'Quarter Finals',
  SEMI_FINALS:   'Semi Finals',
  THIRD_PLACE:   'Third Place',
  FINAL:         'Final',
}
const STAGE_ORDER = ['LAST_32','LAST_16','QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL']

// ── Map API knockout matches → bracket format ─────────────────────────────────
export function mapKnockout(data) {
  if (!data.matches) return []
  const ko = data.matches.filter(m => STAGE_LABEL[m.stage])
  const byStage = {}
  for (const m of ko) {
    if (!byStage[m.stage]) byStage[m.stage] = []
    byStage[m.stage].push({ ...mapMatchRow(m), stage: m.stage })
  }
  return STAGE_ORDER
    .filter(s => byStage[s])
    .map(s => ({ stage: s, label: STAGE_LABEL[s], matches: byStage[s] }))
}

// ── Map API matches → internal format ────────────────────────────────────────
export function mapMatches(data) {
  if (!data.matches) return []
  return data.matches
    .filter(m => m.stage === 'GROUP_STAGE')
    .map(m => ({
      ...mapMatchRow(m),
      grp: (m.group || '').replace('GROUP_', '') || '?',
    }))
}

// ── Sort group table ──────────────────────────────────────────────────────────
export const sortTeams = ts => [...ts].sort((a, b) => b.pts - a.pts || b.gd - a.gd)
