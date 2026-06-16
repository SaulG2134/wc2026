import { useState } from 'react'
import { C } from '../constants.js'
import MatchCard from '../components/MatchCard.jsx'

const FILTERS = [
  { id:'all',      label:'All Matches' },
  { id:'live',     label:'🔴 Live' },
  { id:'finished', label:'Finished' },
  { id:'upcoming', label:'Upcoming' },
]

export default function Matches({ matches }) {
  const [filter, setFilter] = useState('upcoming')

  const list    = matches.filter(m => filter === 'all' ? true : m.status === filter)
  const byDate  = list.reduce((acc, m) => {
    ;(acc[m.date] = acc[m.date] || []).push(m)
    return acc
  }, {})

  return (
    <div style={{ padding:'32px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
        <span style={{ fontSize:28 }}>📅</span>
        <h1 style={{ margin:0, fontSize:32, fontWeight:900 }}>Matches</h1>
      </div>
      <p style={{ color:C.muted, marginBottom:22, fontSize:14 }}>{matches.length} group stage matches</p>

      <div style={{ display:'flex', gap:8, marginBottom:28, flexWrap:'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            background: filter===f.id ? C.accent : 'transparent',
            color:      filter===f.id ? '#000'   : C.muted,
            border:     `1px solid ${filter===f.id ? C.accent : C.border}`,
            borderRadius:20, padding:'6px 16px', cursor:'pointer', fontWeight:600, fontSize:13,
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p style={{ color:C.dim, fontSize:14 }}>No matches in this category right now.</p>
      )}

      {Object.entries(byDate).map(([date, ms]) => (
        <div key={date} style={{ marginBottom:28 }}>
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <span style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'4px 18px', fontSize:12, color:C.muted, fontWeight:700, letterSpacing:1 }}>
              {date.toUpperCase()}
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {ms.map(m => <MatchCard key={m.id} m={m} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
