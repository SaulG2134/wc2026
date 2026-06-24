/** Fetch goal scorers for a live or finished match */
export async function fetchMatchEvents(home, away, status = 'finished') {
  const qs = `home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}&status=${status}`
  const res = await fetch(`/api/match-events?${qs}`)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export { mergeRounds, sortTeams } from './lib/mappers.js'
