import { useState, useEffect, useCallback, useRef } from 'react'
import { C } from './constants.js'
import { mergeRounds } from './api.js'
import { loadUserData, saveUserData, migrateAnonData } from './lib/userData.js'
import { supabase } from './lib/supabase.js'
import Nav           from './components/Nav.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Home      from './pages/Home.jsx'
import Groups    from './pages/Groups.jsx'
import Matches   from './pages/Matches.jsx'
import Hub       from './pages/Hub.jsx'
import Predictor from './pages/Predictor.jsx'
import Bracket   from './pages/Bracket.jsx'
import Players   from './pages/Players.jsx'

export default function App() {
  const TABS = ['home','hub','matches','groups','bracket','players','predictor']
  const hashTab = window.location.hash.replace('#','')
  const [tab, setTabRaw] = useState(TABS.includes(hashTab) ? hashTab : 'home')

  const setTab = (t) => {
    setTabRaw(t)
    window.location.hash = t
  }
  const [groups,      setGroups]      = useState([])
  const [matches,     setMatches]     = useState([])
  const [rounds,      setRounds]      = useState(() => {
    try {
      const cached = localStorage.getItem('wc26_bracket')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [followed,    setFollowed]    = useState(new Set())
  const [preds,       setPreds]       = useState({})
  const [dataLoaded,  setDataLoaded]  = useState(false)
  const [user,        setUser]        = useState(null)
  const hasData = useRef(false)

  // ── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for sign-in / sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (event === 'SIGNED_IN' && nextUser) {
        // Migrate any anonymous data to the real account
        await migrateAnonData(nextUser.id)
        // Reload favorites under the new identity
        const { followed: f, preds: p } = await loadUserData()
        setFollowed(f)
        setPreds(p)
      }

      if (event === 'SIGNED_OUT') {
        // Clear user data and go home
        setFollowed(new Set())
        setPreds({})
        setTab('home')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

  // ── Fetch match + standings data via worldcup26.ir ───────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/wc26')
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setGroups(data.standings)
      setMatches(data.matches)
      setRounds(prev => {
        const merged = mergeRounds(prev, data.rounds ?? [])
        try { localStorage.setItem('wc26_bracket', JSON.stringify(merged)) } catch {}
        return merged
      })
      hasData.current = true
      setLastUpdated(new Date())
    } catch (e) {
      if (!hasData.current) setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const hasLive = matches.some(m => m.status === 'live')

  useEffect(() => {
    fetchAll()
    // Poll every 60s during live games, 120s otherwise
    const interval = hasLive ? 60_000 : 120_000
    let t = setInterval(fetchAll, interval)

    // Pause polling when tab is hidden, resume + refetch when visible again
    const onVisibility = () => {
      if (document.hidden) {
        clearInterval(t)
      } else {
        fetchAll()
        t = setInterval(fetchAll, interval)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetchAll, hasLive])

  const live = matches.filter(m => m.status === 'live')

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:'white', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tab-content { animation: fadeUp 0.25s ease forwards; }

        .grid-2col      { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .grid-3col      { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .grid-2col-wide { display:grid; grid-template-columns:1fr 1fr; gap:24px; }

        @media (max-width: 768px) {
          .grid-2col      { grid-template-columns: 1fr !important; }
          .grid-3col      { grid-template-columns: 1fr 1fr !important; }
          .grid-2col-wide { grid-template-columns: 1fr !important; }
          .hero-title     { font-size: 40px !important; }
          .hero-inner     { padding: 24px 18px 20px !important; }
          .stats-bar      { padding: 10px 16px !important; overflow-x: auto !important; flex-wrap: nowrap !important; }
          .stats-bar > div { padding: 0 14px !important; flex-shrink: 0 !important; }
          .hub-layout     { grid-template-columns: 1fr !important; }
          .hero-live-box  { min-width: 0 !important; width: 100% !important; }
          .featured-teams      { gap: 8px !important; }
          .featured-flag       { font-size: 22px !important; }
          .featured-name       { font-size: 14px !important; }
          .featured-score      { font-size: 26px !important; }
          .featured-vs         { padding: 0 2px !important; }
          .featured-vs-time    { display: none !important; }
          .predictor-scorers   { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .grid-3col { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Nav
        tab={tab} setTab={setTab}
        live={live} lastUpdated={lastUpdated} loading={loading}
        user={user}
      />

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
        {error && (
          <div style={{ background:'#1a1020', border:`1px solid ${C.red}40`, borderRadius:10, padding:'12px 18px', margin:'20px 0', color:C.red, fontSize:14 }}>
            ⚠️ {error} — retrying in 60s
          </div>
        )}

        <ErrorBoundary>
          <div key={tab} className="tab-content">
            {tab === 'home'      && <Home groups={groups} matches={matches} setTab={setTab} />}
            {tab === 'matches'   && <Matches matches={matches} onRefresh={fetchAll} loading={loading} />}
            {tab === 'groups'    && <Groups groups={groups} />}
            {tab === 'hub'       && <Hub groups={groups} matches={matches} followed={followed} setFollowed={setFollowed} />}
            {tab === 'bracket'   && <Bracket rounds={rounds} loading={loading} />}
            {tab === 'predictor' && <Predictor matches={matches} groups={groups} />}
            {tab === 'players'   && <Players />}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  )
}
