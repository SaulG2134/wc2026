import { useState, useEffect, useCallback } from 'react'
import { C } from './constants.js'
import { apiFetch, mapStandings, mapMatches } from './api.js'
import { loadUserData, saveUserData } from './lib/userData.js'
import Nav       from './components/Nav.jsx'
import Home      from './pages/Home.jsx'
import Groups    from './pages/Groups.jsx'
import Matches   from './pages/Matches.jsx'
import Hub       from './pages/Hub.jsx'
import Predictor from './pages/Predictor.jsx'

export default function App() {
  const [tab,         setTab]         = useState('home')
  const [groups,      setGroups]      = useState([])
  const [matches,     setMatches]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [followed,    setFollowed]    = useState(new Set())
  const [preds,       setPreds]       = useState({})
  const [dataLoaded,  setDataLoaded]  = useState(false)

  // ── Load user data from Supabase on first mount ──────────────────────────
  useEffect(() => {
    loadUserData().then(({ followed, preds }) => {
      setFollowed(followed)
      setPreds(preds)
      setDataLoaded(true)
    })
  }, [])

  // ── Save to Supabase whenever followed or preds change ───────────────────
  useEffect(() => {
    if (!dataLoaded) return
    saveUserData(followed, preds)
  }, [followed, preds, dataLoaded])

  // ── Fetch match + standings data via serverless function ─────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [standingsData, matchesData] = await Promise.all([
        apiFetch('/v4/competitions/WC/standings'),
        apiFetch('/v4/competitions/WC/matches'),
      ])
      setGroups(mapStandings(standingsData))
      setMatches(mapMatches(matchesData))
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, 60_000)
    return () => clearInterval(t)
  }, [fetchAll])

  const live = matches.filter(m => m.status === 'live')

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:'white', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <Nav
        tab={tab} setTab={setTab}
        live={live} lastUpdated={lastUpdated} loading={loading}
      />

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
        {error && (
          <div style={{ background:'#1a1020', border:`1px solid ${C.red}40`, borderRadius:10, padding:'12px 18px', margin:'20px 0', color:C.red, fontSize:14 }}>
            ⚠️ {error} — retrying in 60s
          </div>
        )}

        {tab === 'home'      && <Home groups={groups} matches={matches} setTab={setTab} />}
        {tab === 'matches'   && <Matches matches={matches} />}
        {tab === 'groups'    && <Groups groups={groups} />}
        {tab === 'hub'       && <Hub groups={groups} matches={matches} followed={followed} setFollowed={setFollowed} />}
        {tab === 'predictor' && <Predictor matches={matches} preds={preds} setPreds={setPreds} />}
      </main>
    </div>
  )
}
