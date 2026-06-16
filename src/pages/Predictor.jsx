import { C, F } from '../constants.js'

export default function Predictor({ matches, preds, setPreds }) {
  const upcoming = matches.filter(m => m.status === 'upcoming')

  const set = (id, side, val) => {
    const v = Math.max(0, Math.min(20, parseInt(val) || 0))
    setPreds(prev => ({ ...prev, [id]: { ...(prev[id] || { h:'', a:'' }), [side]: v } }))
  }

  const byDate = upcoming.reduce((acc, m) => {
    ;(acc[m.date] = acc[m.date] || []).push(m)
    return acc
  }, {})

  const filled = Object.keys(preds).filter(id => {
    const p = preds[id]
    return p.h !== '' && p.a !== ''
  }).length

  return (
    <div style={{ padding:'32px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
        <span style={{ fontSize:28 }}>⚡</span>
        <h1 style={{ margin:0, fontSize:32, fontWeight:900 }}>Predictor</h1>
      </div>
      <p style={{ color:C.muted, marginBottom:22, fontSize:14 }}>Pick your scores for upcoming matches</p>

      {/* Progress bar */}
      <div style={{ background:C.card, borderRadius:12, padding:'16px 20px', border:`1px solid ${C.border}`, marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontWeight:600, fontSize:14 }}>Predictions made</span>
          <span style={{ color:C.accent, fontWeight:700, fontSize:14 }}>{filled} / {upcoming.length}</span>
        </div>
        <div style={{ background:C.border, borderRadius:8, height:6 }}>
          <div style={{
            background: `linear-gradient(90deg,${C.accent},#0060ff)`,
            borderRadius:8, height:6, transition:'width .4s',
            width: `${upcoming.length ? (filled / upcoming.length) * 100 : 0}%`,
          }} />
        </div>
        {filled === upcoming.length && filled > 0 && (
          <p style={{ color:C.green, fontSize:13, fontWeight:600, margin:'10px 0 0' }}>🎉 All predictions in!</p>
        )}
      </div>

      {upcoming.length === 0 && (
        <p style={{ color:C.dim, fontSize:14 }}>No upcoming matches to predict right now.</p>
      )}

      {Object.entries(byDate).map(([date, ms]) => (
        <div key={date} style={{ marginBottom:28 }}>
          <div style={{ fontSize:13, color:C.muted, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>{date}</div>

          {ms.map(m => {
            const p = preds[m.id] || {}
            const hasPred = p.h !== undefined && p.a !== undefined && p.h !== '' && p.a !== ''

            return (
              <div key={m.id} style={{
                background: C.card, borderRadius:12, padding:'16px 20px', marginBottom:10,
                border: `1px solid ${hasPred ? 'rgba(0,200,255,.4)' : C.border}`,
                transition: 'border .2s',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:C.accent }}>GROUP {m.grp}</span>
                  <span style={{ fontSize:11, color:C.dim }}>{m.time} · {m.venue}</span>
                </div>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                    <span style={{ fontSize: 24 }}>{F[m.home] || '🏳️'}</span>
                    <span style={{ fontWeight:600, fontSize:14 }}>{m.home}</span>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <input
                      type="number" min="0" max="20"
                      value={p.h ?? ''}
                      onChange={e => set(m.id, 'h', e.target.value)}
                      placeholder="—"
                      style={{ width:50, textAlign:'center', background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 4px', color:'white', fontSize:20, fontWeight:800, outline:'none' }}
                    />
                    <span style={{ color:C.dim, fontWeight:700, fontSize:16 }}>–</span>
                    <input
                      type="number" min="0" max="20"
                      value={p.a ?? ''}
                      onChange={e => set(m.id, 'a', e.target.value)}
                      placeholder="—"
                      style={{ width:50, textAlign:'center', background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 4px', color:'white', fontSize:20, fontWeight:800, outline:'none' }}
                    />
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, justifyContent:'flex-end' }}>
                    <span style={{ fontWeight:600, fontSize:14 }}>{m.away}</span>
                    <span style={{ fontSize: 24 }}>{F[m.away] || '🏳️'}</span>
                  </div>
                </div>

                {hasPred && (
                  <div style={{ marginTop:10, textAlign:'center', fontSize:12, fontWeight:600, color: p.h > p.a ? C.accent : p.h < p.a ? C.muted : C.yellow }}>
                    {p.h > p.a ? `${m.home} wins` : p.h < p.a ? `${m.away} wins` : 'Draw'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
