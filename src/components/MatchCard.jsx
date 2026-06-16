import { useState, useEffect } from 'react'
import { C, F } from '../constants.js'

export default function MatchCard({ m }) {
  const done = m.status === 'finished'
  const live = m.status === 'live'

  const [pulse, setPulse] = useState(true)
  useEffect(() => {
    if (!live) return
    const t = setInterval(() => setPulse(v => !v), 800)
    return () => clearInterval(t)
  }, [live])

  return (
    <div style={{
      background: C.card,
      borderRadius: 12,
      padding: '14px 18px',
      border: `1px solid ${live ? C.red + '66' : C.border}`,
      marginBottom: 10,
    }}>
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

      {m.venue && (
        <div style={{ marginTop:8, fontSize:11, color:C.dim }}>📍 {m.venue}</div>
      )}
    </div>
  )
}
