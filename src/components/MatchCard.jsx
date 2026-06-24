import { useState, useEffect } from 'react'
import { C, F } from '../constants.js'
import { fetchMatchEvents } from '../api.js'

// ── Compact scorer row (used outside timeline) ────────────────────────────────
function EventRow({ e, right }) {
  const icon = e.type === 'OWN_GOAL' ? '⚽ OG' : e.type === 'PENALTY' ? '⚽ P' : '⚽'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:C.muted, marginBottom:2,
      justifyContent: right ? 'flex-end' : 'flex-start' }}>
      {right
        ? <><span style={{color:C.dim}}>{e.minute}'</span><span style={{fontWeight:600,color:'white'}}>{e.scorer}</span><span>{icon}</span></>
        : <><span>{icon}</span><span style={{fontWeight:600,color:'white'}}>{e.scorer}</span><span style={{color:C.dim}}>{e.minute}'</span></>
      }
    </div>
  )
}

// ── Full timeline view ────────────────────────────────────────────────────────
function Timeline({ goals, home, away, live }) {
  const sorted = [...goals].sort((a, b) => {
    const am = parseInt(a.minute), bm = parseInt(b.minute)
    return am - bm
  })

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'16px 0', color:C.dim, fontSize:12 }}>
        {live ? 'No goals yet' : 'No goal data available'}
      </div>
    )
  }

  return (
    <div style={{ padding:'4px 0' }}>
      {sorted.map((e, i) => {
        const isHome = e.team === home
        const icon   = e.type === 'OWN_GOAL' ? '⚽' : e.type === 'PENALTY' ? '⚽' : '⚽'
        const label  = e.type === 'OWN_GOAL' ? ' (OG)' : e.type === 'PENALTY' ? ' (P)' : ''
        const dotColor = isHome ? C.accent : C.red

        return (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 56px 1fr', alignItems:'center', marginBottom:10 }}>
            {/* Home side */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:6, paddingRight:8 }}>
              {isHome && (
                <>
                  <span style={{ fontSize:12, fontWeight:700, color:'white' }}>{e.scorer}{label}</span>
                  <span style={{ fontSize:14 }}>{icon}</span>
                </>
              )}
            </div>

            {/* Centre: dot + line */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
              {i > 0 && (
                <div style={{ width:1, height:10, background:C.border, marginBottom:2 }} />
              )}
              <div style={{
                width:40, height:22, borderRadius:11,
                background: dotColor + '22',
                border:`1.5px solid ${dotColor}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:800, color: dotColor,
              }}>
                {e.minute}'
              </div>
              {i < sorted.length - 1 && (
                <div style={{ width:1, height:10, background:C.border, marginTop:2 }} />
              )}
            </div>

            {/* Away side */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-start', gap:6, paddingLeft:8 }}>
              {!isHome && (
                <>
                  <span style={{ fontSize:14 }}>{icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'white' }}>{e.scorer}{label}</span>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Match card ────────────────────────────────────────────────────────────────
export default function MatchCard({ m }) {
  const done = m.status === 'finished'
  const live = m.status === 'live'
  const canExpand = done || live

  const [pulse,    setPulse]    = useState(true)
  const [events,   setEvents]   = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!live) return
    const t = setInterval(() => setPulse(v => !v), 800)
    return () => clearInterval(t)
  }, [live])

  useEffect(() => {
    if (!done && !live) return
    fetchMatchEvents(m.home, m.away, m.status).then(setEvents).catch(() => {})
    if (!live) return
    const t = setInterval(() => fetchMatchEvents(m.home, m.away, m.status).then(setEvents).catch(() => {}), 30_000)
    return () => clearInterval(t)
  }, [done, live, m.home, m.away, m.status])

  return (
    <div
      onClick={() => canExpand && setExpanded(e => !e)}
      style={{
        background: C.card,
        borderRadius: 12,
        padding: '14px 18px',
        border: `1px solid ${expanded ? C.accent + '55' : live ? C.red + '66' : C.border}`,
        marginBottom: 10,
        cursor: canExpand ? 'pointer' : 'default',
        transition: 'border-color .15s',
      }}
    >
      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.accent, letterSpacing:.5 }}>
          GROUP {m.grp}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, color:C.dim }}>{m.date}</span>

          {done && (
            <span style={{ background:'rgba(255,255,255,.1)', color:'white', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:10 }}>
              FT
            </span>
          )}

          {live && (
            <span style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.4)', borderRadius:10, padding:'2px 8px' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', display:'inline-block', transition:'background .3s', background: pulse ? C.red : 'transparent', border:`1.5px solid ${C.red}` }} />
              <span style={{ fontSize:11, color:C.red, fontWeight:700 }}>
                LIVE{m.minute ? ` ${m.minute}'` : ''}
              </span>
            </span>
          )}

          {!done && !live && (
            <span style={{ color:C.accent, fontSize:12, fontWeight:600 }}>{m.time}</span>
          )}

          {canExpand && (
            <span style={{ fontSize:10, color:C.dim, marginLeft:2 }}>{expanded ? '▲' : '▼'}</span>
          )}
        </div>
      </div>

      {/* Score row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
          <span style={{ fontSize:22 }}>{F[m.home] || '🏳️'}</span>
          <span style={{ fontWeight:600, fontSize:14 }}>{m.home}</span>
        </div>

        <div style={{ textAlign:'center', minWidth:72 }}>
          {(done || live) && m.hs !== null
            ? <span style={{ fontSize:22, fontWeight:900, color: live ? C.red : 'white' }}>{m.hs} – {m.as}</span>
            : <span style={{ fontSize:13, fontWeight:600, color:C.dim }}>VS</span>
          }
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, justifyContent:'flex-end' }}>
          <span style={{ fontWeight:600, fontSize:14 }}>{m.away}</span>
          <span style={{ fontSize:22 }}>{F[m.away] || '🏳️'}</span>
        </div>
      </div>

      {/* Compact goals (collapsed) */}
      {!expanded && events?.goals?.length > 0 && (
        <div style={{ marginTop:8, borderTop:`1px solid ${C.border}`, paddingTop:8, display:'flex', gap:8 }}>
          <div style={{flex:1}}>
            {events.goals.filter(e => e.team === m.home)
              .sort((a,b) => parseInt(a.minute) - parseInt(b.minute))
              .map((e,i) => <EventRow key={i} e={e} />)}
          </div>
          <div style={{flex:1}}>
            {events.goals.filter(e => e.team === m.away)
              .sort((a,b) => parseInt(a.minute) - parseInt(b.minute))
              .map((e,i) => <EventRow key={i} e={e} right />)}
          </div>
        </div>
      )}

      {/* Expanded timeline */}
      {expanded && (
        <div style={{ marginTop:12, borderTop:`1px solid ${C.border}`, paddingTop:12 }} onClick={e => e.stopPropagation()}>
          {/* Team headers */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 56px 1fr', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end', paddingRight:8 }}>
              <span style={{ fontSize:12, fontWeight:800, color:C.accent }}>{m.home}</span>
              <span>{F[m.home] || '🏳️'}</span>
            </div>
            <div style={{ textAlign:'center' }}>
              <span style={{ fontSize:10, color:C.dim, fontWeight:700, letterSpacing:1 }}>MIN</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-start', paddingLeft:8 }}>
              <span>{F[m.away] || '🏳️'}</span>
              <span style={{ fontSize:12, fontWeight:800, color:C.red }}>{m.away}</span>
            </div>
          </div>

          {events
            ? <Timeline goals={events.goals} home={m.home} away={m.away} live={live} />
            : <div style={{ textAlign:'center', color:C.dim, fontSize:12, padding:'12px 0' }}>Loading…</div>
          }
        </div>
      )}

      {m.venue && !expanded && (
        <div style={{ marginTop:8, fontSize:11, color:C.dim }}>📍 {m.venue}</div>
      )}
    </div>
  )
}
