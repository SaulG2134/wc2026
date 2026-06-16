import { useState, useEffect } from 'react'
import { C } from '../constants.js'

const LINKS = [
  { id:'home',      label:'Home' },
  { id:'hub',       label:'My Hub' },
  { id:'matches',   label:'Matches' },
  { id:'groups',    label:'Groups' },
  { id:'predictor', label:'⚡ Predictor' },
]

export default function Nav({ tab, setTab, live = [], lastUpdated, loading }) {
  const [pulse, setPulse] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setPulse(v => !v), 900)
    return () => clearInterval(t)
  }, [])

  const isLive   = live.length > 0
  const dotColor = isLive ? C.red : C.green

  return (
    <nav style={{
      background: 'rgba(7,16,31,.97)',
      borderBottom: `1px solid ${C.border}`,
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', gap:4 }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 0', marginRight:20, cursor:'pointer' }} onClick={() => setTab('home')}>
          <div style={{
            width:32, height:32, borderRadius:8,
            background:'linear-gradient(135deg,#00c8ff 0%,#0055ff 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0,
          }}>
            <span style={{ fontSize:16 }}>🏆</span>
          </div>
          <div style={{ lineHeight:1 }}>
            <span style={{ fontSize:15, fontWeight:900, color:'white', letterSpacing:-.3 }}>World Cup</span>
            <span style={{ fontSize:15, fontWeight:900, background:'linear-gradient(90deg,#00c8ff,#0055ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginLeft:5 }}>2026</span>
          </div>
        </div>

        {/* Tabs */}
        {LINKS.map(l => (
          <button key={l.id} onClick={() => setTab(l.id)} style={{
            background: tab===l.id ? C.accentBg : 'transparent',
            color:      tab===l.id ? C.accent   : C.muted,
            border:     `1px solid ${tab===l.id ? 'rgba(0,200,255,.35)' : 'transparent'}`,
            borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
            fontSize: 13, fontWeight: tab===l.id ? 700 : 400, transition: 'all .15s',
          }}>
            {l.label}
          </button>
        ))}

        {/* Right side */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:14 }}>
          {lastUpdated && (
            <span style={{ fontSize:11, color:C.dim }}>
              Updated {lastUpdated.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })}
            </span>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{
              width:7, height:7, borderRadius:'50%', display:'inline-block',
              background: pulse ? dotColor : 'transparent',
              border: `1.5px solid ${dotColor}`,
              transition: 'background .3s',
            }} />
            <span style={{ color:dotColor, fontWeight:700, fontSize:11, letterSpacing:.8 }}>
              {isLive ? `${live.length} LIVE` : 'LIVE'}
            </span>
          </div>

        </div>
      </div>
    </nav>
  )
}
