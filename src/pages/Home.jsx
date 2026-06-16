import { C, F } from '../constants.js'
import MatchCard from '../components/MatchCard.jsx'

// ── Group preview card ────────────────────────────────────────────────────────
function GroupPreview({ group, onView }) {
  const sorted = [...group.teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd)
  return (
    <div
      onClick={onView}
      style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', cursor:'pointer', transition:'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + '66'}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      {/* Header */}
      <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:22, height:22, borderRadius:6, background:C.accent, color:'#000', fontWeight:800, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {group.id}
          </div>
          <span style={{ fontWeight:700, fontSize:13 }}>Group {group.id}</span>
        </div>
        <span style={{ fontSize:10, color:C.dim, fontWeight:600, letterSpacing:.5 }}>PTS</span>
      </div>

      {/* Team rows */}
      {sorted.map((t, i) => (
        <div key={t.name} style={{
          display:'flex', alignItems:'center', gap:10, padding:'8px 14px',
          borderBottom: i < 3 ? `1px solid rgba(26,48,80,.5)` : 'none',
          background: i < 2 ? 'rgba(34,197,94,.03)' : 'transparent',
        }}>
          <div style={{ width:3, height:30, borderRadius:2, background: i < 2 ? C.green : 'transparent', flexShrink:0 }} />
          <span style={{ fontSize:18, flexShrink:0 }}>{F[t.name] || '🏳️'}</span>
          <span style={{ fontSize:13, fontWeight:500, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: i < 2 ? 'white' : C.muted }}>
            {t.name}
          </span>
          <span style={{ fontSize:14, fontWeight:800, color: i < 2 ? C.accent : C.dim, minWidth:20, textAlign:'right' }}>
            {t.pts}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <div style={{ textAlign:'center', padding:'0 24px', borderRight:`1px solid ${C.border}` }}>
      <div style={{ fontSize:28, fontWeight:900, color:'white', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:C.muted, fontWeight:600, letterSpacing:1, marginTop:4 }}>{label}</div>
    </div>
  )
}

// ── Featured next match ───────────────────────────────────────────────────────
function FeaturedMatch({ m, onView }) {
  if (!m) return null
  const live = m.status === 'live'
  const done = m.status === 'finished'
  return (
    <div style={{
      background:'linear-gradient(135deg,#0d2040 0%,#0a1830 50%,#0d2040 100%)',
      border:`1px solid ${live ? C.red+'88' : C.border}`,
      borderRadius:16, padding:'28px 32px', marginBottom:28,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {live && (
            <span style={{ background:C.red, color:'white', fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:20, letterSpacing:1 }}>
              ● LIVE
            </span>
          )}
          {!live && !done && (
            <span style={{ background:C.accentBg, color:C.accent, fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, letterSpacing:1, border:`1px solid rgba(0,200,255,.3)` }}>
              NEXT MATCH
            </span>
          )}
          {done && (
            <span style={{ background:'rgba(255,255,255,.08)', color:C.muted, fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, letterSpacing:1 }}>
              FULL TIME
            </span>
          )}
          <span style={{ fontSize:12, color:C.muted }}>Group {m.grp}</span>
        </div>
        <div style={{ fontSize:12, color:C.dim }}>
          {m.date} · {done || live ? '' : m.time}
          {m.venue && <span> · {m.venue}</span>}
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        {/* Home team */}
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:52 }}>{F[m.home] || '🏳️'}</span>
          <div>
            <div style={{ fontSize:22, fontWeight:800 }}>{m.home}</div>
            <div style={{ fontSize:12, color:C.dim, marginTop:2 }}>Home</div>
          </div>
        </div>

        {/* Score / VS */}
        <div style={{ textAlign:'center', minWidth:100 }}>
          {(live || done) && m.hs !== null ? (
            <>
              <div style={{ fontSize:44, fontWeight:900, color: live ? C.red : 'white', lineHeight:1, letterSpacing:2 }}>
                {m.hs} – {m.as}
              </div>
              {live && m.minute && (
                <div style={{ fontSize:12, color:C.red, fontWeight:700, marginTop:4 }}>{m.minute}'</div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize:13, color:C.dim, fontWeight:700, letterSpacing:2, marginBottom:4 }}>VS</div>
              <div style={{ fontSize:13, color:C.accent, fontWeight:700 }}>{m.time}</div>
            </>
          )}
        </div>

        {/* Away team */}
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:14, justifyContent:'flex-end', flexDirection:'row-reverse' }}>
          <span style={{ fontSize:52 }}>{F[m.away] || '🏳️'}</span>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:22, fontWeight:800 }}>{m.away}</div>
            <div style={{ fontSize:12, color:C.dim, marginTop:2 }}>Away</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop:20, display:'flex', gap:10 }}>
        <button onClick={onView} style={{
          background: live ? C.red : C.accent, color:'#000', fontWeight:800,
          border:'none', borderRadius:20, padding:'8px 22px', cursor:'pointer', fontSize:13,
        }}>
          {live ? 'Watch Live →' : done ? 'View Result →' : 'View Match →'}
        </button>
      </div>
    </div>
  )
}

// ── Result score card ─────────────────────────────────────────────────────────
function ScoreCard({ m }) {
  const homeWin = m.hs > m.as, awayWin = m.as > m.hs
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`, borderRadius:12,
      padding:'14px 16px',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontSize:10, fontWeight:700, color:C.accent, letterSpacing:.5 }}>GROUP {m.grp}</span>
        <span style={{ fontSize:10, fontWeight:700, color:C.muted, background:'rgba(255,255,255,.08)', padding:'2px 8px', borderRadius:8 }}>FT</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
          <span style={{ fontSize:18 }}>{F[m.home] || '🏳️'}</span>
          <span style={{ fontSize:13, fontWeight: homeWin ? 800 : 500, color: homeWin ? 'white' : C.muted }}>{m.home}</span>
        </div>
        <span style={{ fontWeight:900, fontSize:20, color:'white', minWidth:52, textAlign:'center', letterSpacing:1 }}>
          {m.hs}–{m.as}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, justifyContent:'flex-end' }}>
          <span style={{ fontSize:13, fontWeight: awayWin ? 800 : 500, color: awayWin ? 'white' : C.muted }}>{m.away}</span>
          <span style={{ fontSize:18 }}>{F[m.away] || '🏳️'}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home({ setTab, groups, matches }) {
  const upcoming = matches.filter(m => m.status === 'upcoming')
  const recent   = matches.filter(m => m.status === 'finished').slice().reverse()
  const live     = matches.filter(m => m.status === 'live')

  const featured = live[0] || upcoming[0] || recent[0]
  const nextMatches = upcoming.slice(live[0] ? 0 : 1, live[0] ? 3 : 4)
  const recentResults = recent.slice(0, 4)

  const finished = matches.filter(m => m.status === 'finished').length
  const total    = matches.length

  return (
    <div style={{ padding:'32px 0' }}>

      {/* ── HERO ── */}
      <div style={{
        background:'linear-gradient(160deg,#060f1c 0%,#0d2540 40%,#071018 100%)',
        borderRadius:20, marginBottom:10,
        border:`1px solid ${C.border}`, overflow:'hidden', position:'relative',
      }}>
        {/* glow blobs */}
        <div style={{ position:'absolute', top:-80, left:'30%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,200,255,.06) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-100, right:-50, width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,80,255,.05) 0%,transparent 65%)', pointerEvents:'none' }} />

        <div style={{ padding:'48px 48px 40px', position:'relative' }}>
          {/* Top label */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <span style={{ fontSize:11, color:C.accent, fontWeight:700, letterSpacing:4 }}>🏆 FIFA WORLD CUP</span>
            <span style={{ width:1, height:12, background:C.border }} />
            <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>June 11 – July 19, 2026</span>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:32 }}>
            {/* Left: title */}
            <div>
              <h1 style={{ fontSize:64, fontWeight:900, margin:'0 0 12px', lineHeight:.95, letterSpacing:-2 }}>
                <span style={{ display:'block', color:'white' }}>World Cup</span>
                <span style={{ display:'block', background:'linear-gradient(90deg,#00c8ff 0%,#0055ff 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  2026
                </span>
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
                <span style={{ fontSize:22 }}>🇺🇸</span>
                <span style={{ fontSize:22 }}>🇲🇽</span>
                <span style={{ fontSize:22 }}>🇨🇦</span>
                <span style={{ fontSize:13, color:C.muted, marginLeft:4 }}>USA · Mexico · Canada</span>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setTab('matches')} style={{ background:C.accent, color:'#000', fontWeight:800, border:'none', borderRadius:24, padding:'11px 26px', cursor:'pointer', fontSize:13, letterSpacing:.5 }}>
                  VIEW MATCHES
                </button>
                <button onClick={() => setTab('predictor')} style={{ background:'rgba(255,255,255,.06)', color:'white', fontWeight:600, border:'1px solid rgba(255,255,255,.15)', borderRadius:24, padding:'11px 26px', cursor:'pointer', fontSize:13 }}>
                  ⚡ PREDICTOR
                </button>
              </div>
            </div>

            {/* Right: live status */}
            <div style={{ minWidth:240 }}>
              {live.length > 0 ? (
                <div style={{ background:'rgba(239,68,68,.1)', border:`1px solid ${C.red}55`, borderRadius:14, padding:'18px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:C.red, display:'inline-block', boxShadow:`0 0 8px ${C.red}` }} />
                    <span style={{ fontSize:11, color:C.red, fontWeight:800, letterSpacing:1.5 }}>{live.length} MATCH{live.length > 1 ? 'ES' : ''} LIVE NOW</span>
                  </div>
                  {live.slice(0,2).map(m => (
                    <div key={m.id} style={{ fontSize:13, color:'white', fontWeight:600, marginBottom:4 }}>
                      {F[m.home] || '🏳️'} {m.home} <span style={{ color:C.red }}>{m.hs}–{m.as}</span> {m.away} {F[m.away] || '🏳️'}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background:'rgba(0,200,255,.05)', border:`1px solid rgba(0,200,255,.15)`, borderRadius:14, padding:'18px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:C.green, display:'inline-block' }} />
                    <span style={{ fontSize:11, color:C.green, fontWeight:700, letterSpacing:1.5 }}>TOURNAMENT IN PROGRESS</span>
                  </div>
                  <p style={{ margin:0, color:C.muted, fontSize:13, lineHeight:1.6 }}>
                    {finished} of {total} group matches played.<br/>Scores refresh every 60s.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ borderTop:`1px solid ${C.border}`, padding:'16px 48px', display:'flex', gap:0, background:'rgba(0,0,0,.2)' }}>
          <Stat value="48" label="TEAMS" />
          <Stat value="12" label="GROUPS" />
          <Stat value="104" label="MATCHES" />
          <Stat value="16" label="STADIUMS" />
          <div style={{ textAlign:'center', padding:'0 24px' }}>
            <div style={{ fontSize:28, fontWeight:900, color:C.accent, lineHeight:1 }}>{finished}</div>
            <div style={{ fontSize:11, color:C.muted, fontWeight:600, letterSpacing:1, marginTop:4 }}>PLAYED</div>
          </div>
        </div>
      </div>

      {/* ── FEATURED MATCH ── */}
      <div style={{ marginTop:28 }}>
        <FeaturedMatch m={featured} onView={() => setTab('matches')} />
      </div>

      {/* ── LIVE (if multiple) ── */}
      {live.length > 1 && (
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.red, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:C.red, display:'inline-block', boxShadow:`0 0 6px ${C.red}` }} />
              Live Now
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {live.slice(1).map(m => <MatchCard key={m.id} m={m} />)}
          </div>
        </div>
      )}

      {/* ── UPCOMING + RESULTS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32 }}>
        {/* Upcoming */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h2 style={{ margin:0, fontSize:15, fontWeight:800, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:C.accent }}>📅</span> Upcoming
            </h2>
            <button onClick={() => setTab('matches')} style={{ background:'none', border:'none', color:C.accent, cursor:'pointer', fontSize:12, fontWeight:600 }}>
              All matches →
            </button>
          </div>
          {nextMatches.length > 0
            ? nextMatches.map(m => <MatchCard key={m.id} m={m} />)
            : <p style={{ color:C.dim, fontSize:13 }}>No upcoming matches.</p>}
        </div>

        {/* Recent results */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h2 style={{ margin:0, fontSize:15, fontWeight:800, display:'flex', alignItems:'center', gap:8 }}>
              <span>⚡</span> Recent Results
            </h2>
            <button onClick={() => setTab('matches')} style={{ background:'none', border:'none', color:C.accent, cursor:'pointer', fontSize:12, fontWeight:600 }}>
              All results →
            </button>
          </div>
          {recentResults.length > 0
            ? recentResults.map(m => <ScoreCard key={m.id} m={m} />)
            : <p style={{ color:C.dim, fontSize:13 }}>No results yet.</p>}
        </div>
      </div>

      {/* ── GROUP STANDINGS ── */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:15, fontWeight:800 }}>📊 Group Standings</h2>
          <button onClick={() => setTab('groups')} style={{ background:'none', border:'none', color:C.accent, cursor:'pointer', fontSize:12, fontWeight:600 }}>
            All 12 groups →
          </button>
        </div>
        {groups.length > 0 ? (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:12 }}>
              {groups.slice(0, 3).map(g => <GroupPreview key={g.id} group={g} onView={() => setTab('groups')} />)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {groups.slice(3, 6).map(g => <GroupPreview key={g.id} group={g} onView={() => setTab('groups')} />)}
            </div>
          </>
        ) : (
          <p style={{ color:C.dim, fontSize:13 }}>Standings loading…</p>
        )}
      </div>
    </div>
  )
}
