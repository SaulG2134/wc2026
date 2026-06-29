import { useState, useEffect } from 'react'
import { C, F } from '../constants.js'

function PlayerRow({ rank, p }) {
  const isTop3 = rank <= 3
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'12px 16px',
      background: isTop3 ? 'rgba(0,200,255,.03)' : 'transparent',
      borderBottom:`1px solid ${C.border}`,
      transition:'background .15s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
    onMouseLeave={e => e.currentTarget.style.background = isTop3 ? 'rgba(0,200,255,.03)' : 'transparent'}
    >
      {/* Rank */}
      <div style={{
        width:28, height:28, borderRadius:8, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        background: isTop3 ? rankColors[rank-1] + '22' : 'transparent',
        border: isTop3 ? `1px solid ${rankColors[rank-1]}44` : 'none',
        fontSize:13, fontWeight:800,
        color: isTop3 ? rankColors[rank-1] : C.dim,
      }}>
        {rank}
      </div>

      {/* Flag + player info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {p.name}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
          <span style={{ fontSize:14 }}>{F[p.team] || '🏳️'}</span>
          <span style={{ fontSize:11, color:C.dim }}>{p.team}</span>
        </div>
      </div>

      {/* Goals */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{
          minWidth:36, height:36, borderRadius:10,
          background: C.accent + '22', border:`1px solid ${C.accent}44`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:18, fontWeight:900, color:C.accent,
        }}>
          {p.goals}
        </div>
        {p.penalties > 0 && (
          <span style={{ fontSize:10, color:C.yellow, background:'rgba(245,158,11,.1)', padding:'2px 6px', borderRadius:6, fontWeight:600 }}>
            {p.penalties}P
          </span>
        )}
      </div>
    </div>
  )
}

export default function Players() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/player-stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const players = data?.players || []
  const leader  = players[0]

  return (
    <div style={{ padding:'32px 0' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:'0 0 6px', fontSize:32, fontWeight:900 }}>Golden Boot</h1>
        <p style={{ margin:0, color:C.muted, fontSize:14 }}>
          Top scorers · World Cup 2026
        </p>
      </div>

      {/* Leader hero */}
      {leader && (
        <div style={{
          background:'linear-gradient(135deg,#0d2040 0%,#0a1830 100%)',
          border:`1px solid ${C.accent}33`, borderRadius:16,
          padding:'20px 24px', marginBottom:24,
          display:'flex', alignItems:'center', gap:16,
        }}>
          <span style={{ fontSize:36 }}>🥇</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:C.accent, fontWeight:700, letterSpacing:1, marginBottom:4 }}>GOLDEN BOOT LEADER</div>
            <div style={{ fontSize:20, fontWeight:900 }}>{leader.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
              <span style={{ fontSize:16 }}>{F[leader.team] || '🏳️'}</span>
              <span style={{ fontSize:13, color:C.dim }}>{leader.team}</span>
            </div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:44, fontWeight:900, color:C.accent, lineHeight:1 }}>{leader.goals}</div>
            <div style={{ fontSize:11, color:C.dim, fontWeight:600, letterSpacing:1 }}>GOALS</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        {/* Column headers */}
        <div style={{
          display:'flex', alignItems:'center', gap:12, padding:'8px 16px',
          borderBottom:`1px solid ${C.border}`,
          fontSize:10, fontWeight:700, color:C.dim, letterSpacing:1,
        }}>
          <span style={{ width:28 }}>#</span>
          <span style={{ flex:1 }}>PLAYER</span>
          <span style={{ paddingRight:4 }}>GOALS</span>
        </div>

        {loading && (
          <div style={{ padding:'40px 0', textAlign:'center', color:C.dim, fontSize:14 }}>
            Loading…
          </div>
        )}
        {error && (
          <div style={{ padding:'40px 0', textAlign:'center', color:C.red, fontSize:14 }}>
            ⚠️ {error}
          </div>
        )}
        {!loading && !error && players.length === 0 && (
          <div style={{ padding:'40px 0', textAlign:'center', color:C.dim, fontSize:14 }}>
            No goals scored yet.
          </div>
        )}
        {!loading && players.map((p, i) => (
          <PlayerRow key={`${p.name}_${p.team}`} rank={i + 1} p={p} />
        ))}
      </div>
    </div>
  )
}
