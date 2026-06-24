/**
 * API fetch wrapper — calls the Vercel serverless proxy so API keys
 * never reach the browser. All data transformation lives in lib/mappers.js.
 */

/** @param {string} path - e.g. '/v4/competitions/WC/matches' */
export async function apiFetch(path) {
  const res = await fetch(`/api/football?path=${encodeURIComponent(path)}`)
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`${res.status}: ${txt || res.statusText}`)
  }
  return res.json()
}

// Re-export mappers so existing imports don't break
export { norm, mapStandings, mapMatches, mapKnockout, sortTeams, mergeRounds } from './lib/mappers.js'
