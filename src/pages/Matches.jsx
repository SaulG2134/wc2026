import { useState, useEffect } from 'react'
import { C } from '../constants.js'
import MatchCard from '../components/MatchCard.jsx'

const FILTERS = [
  { id:'all',      label:'All Matches' },
  { id:'live',     label:'🔴 Live' },
  { id:'finished', label:'Finished' },
  { id:'upcoming', label:'Upcoming' },
]

/**
 * @param {{ matches: Array, onRefresh: Function, loading: boolean }} props
 */
export default function Matches({ matches, onRefresh, loading }) {
  const hasLive = matches.some(m => m.status === 'live')
  const [filter, setFilter] = useState(() => hasLive ? 'live' : 'upcoming')

  // If live games appear after initial render, jump to live tab
  useEffect(() => {
    if (hasLive && filter === 'upcoming') setFilter('live')
  }, [hasLive, filter])

  const live    = matches.filter(m => m.status === 'live')
  const list    = matches.filter(m => filter === 'all' ? true : m.status === filter)
  const byDate  = list.reduce((acc, m) => {
    ;(acc[m.date] = acc[m.date] || []).push(m)
    return acc
  }, {})

  return (
    <div style={{ padding:'32px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
        <h1 style={{ margin:0, fontSize:32, fontWeight:900 }}>Matches</h1>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{ marginLeft:'auto', background:'transparent', border:`1px solid ${C.border}`, color: loading ? C.dim : C.muted, borderRadius:20, padding:'6px 14px', cursor: loading ? 'default' : 'pointer', fontSize:12, fontWeight:600 }}
        >
          {loading ? '↻ Refreshing…' : '↻ Refresh'}
        </button>
      </div>
      <p style={{ color:C.muted, marginBottom:22, fontSize:14 }}>{matches.length} group stage matches</p>

      {/* ── LIVE BANNER ── shown whenever there are live games, regardless of filter */}
      {live.length > 0 && filter !== 'live' && (
        <div
          onClick={() => setFilter('live')}
          style={{
            display:'flex', alignItems:'center', gap:10, cursor:'pointer',
            background:'rgba(239,68,68,.1)', border:`1px solid rgba(239,68,68,.35)`,
            borderRadius:10, padding:'10px 16px', marginBottom:16,
          }}
        >
          <span style={{ width:8, height:8, borderRadius:'50%', background:C.red, display:'inline-block', boxShadow:`0 0 6px ${C.red}`, flexShrink:0 }} />
          <span style={{ color:C.red, fontWeight:700, fontSize:13 }}>
            {live.length} match{live.length > 1 ? 'es' : ''} live right now
          </span>
          <span style={{ color:C.red, fontSize:12, marginLeft:'auto', opacity:.7 }}>View →</span>
        </div>
      )}

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
          <div className="grid-2col">
            {ms.map(m => <MatchCard key={m.id} m={m} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
