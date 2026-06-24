import { NORM } from '../constants.js'

/** Normalise team names from the API to display names */
export const norm = n => NORM[n] || n

// ── Stage lookups ─────────────────────────────────────────────────────────────
const STAGE_LABEL = {
  LAST_32:       'Round of 32',
  LAST_16:       'Round of 16',
  QUARTER_FINALS:'Quarter Finals',
  SEMI_FINALS:   'Semi Finals',
  THIRD_PLACE:   'Third Place',
  FINAL:         'Final',
}
const STAGE_ORDER = ['LAST_32','LAST_16','QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL']

// ── Shared match row mapper ───────────────────────────────────────────────────
function mapMatchRow(m) {
  const d        = new Date(m.utcDate)
  const now      = Date.now()
  const elapsed  = now - d.getTime()
  const rawStatus = m.status

  const couldBeLive = elapsed > 0 && elapsed < 130 * 60_000
  const status =
    rawStatus === 'FINISHED'                          ? 'finished' :
    rawStatus === 'IN_PLAY' || rawStatus === 'PAUSED' ? 'live'     :
    couldBeLive                                       ? 'live'     :
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

  const homeName = norm(m.homeTeam?.name || 'TBD')
  const awayName = norm(m.awayTeam?.name || 'TBD')

  return {
    id:       m.id,
    matchNum: m.matchday ?? null,
    home:     homeName,
    away:     awayName,
    hs:       scoreHome,
    as:       scoreAway,
    minute:   inferredMinute,
    date:     d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time:     d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET',
    venue:    m.venue || '',
    status,
  }
}

// ── Public mappers ────────────────────────────────────────────────────────────

/** Map API standings response → group array */
export function mapStandings(data) {
  if (!data.standings) return []
  return data.standings
    .filter(s => s.type === 'TOTAL' && s.group)
    .map(s => ({
      id:    s.group.replace('GROUP_', ''),
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

/** Map API matches response → group stage match array */
export function mapMatches(data) {
  if (!data.matches) return []
  return data.matches
    .filter(m => m.stage === 'GROUP_STAGE')
    .map(m => ({ ...mapMatchRow(m), grp: (m.group || '').replace('GROUP_', '') || '?' }))
}

/** Map API matches response → knockout bracket rounds array */
export function mapKnockout(data) {
  if (!data.matches) return []
  const byStage = {}
  for (const m of data.matches.filter(m => STAGE_LABEL[m.stage])) {
    if (!byStage[m.stage]) byStage[m.stage] = []
    byStage[m.stage].push({ ...mapMatchRow(m), stage: m.stage })
  }
  return STAGE_ORDER
    .filter(s => byStage[s])
    .map(s => ({ stage: s, label: STAGE_LABEL[s], matches: byStage[s] }))
}

/** Sort group table by points then goal difference */
export const sortTeams = ts => [...ts].sort((a, b) => b.pts - a.pts || b.gd - a.gd)

/**
 * Merge new bracket rounds with previous ones.
 * Real team names are never downgraded back to TBD.
 */
export function mergeRounds(oldRounds, newRounds) {
  if (newRounds.length === 0) return oldRounds
  const known = {}
  for (const round of oldRounds) {
    for (const m of round.matches) {
      if (m.home !== 'TBD') known[m.id + '_home'] = m.home
      if (m.away !== 'TBD') known[m.id + '_away'] = m.away
    }
  }
  return newRounds.map(round => ({
    ...round,
    matches: round.matches.map(m => ({
      ...m,
      home: m.home === 'TBD' && known[m.id + '_home'] ? known[m.id + '_home'] : m.home,
      away: m.away === 'TBD' && known[m.id + '_away'] ? known[m.id + '_away'] : m.away,
    })),
  }))
}
