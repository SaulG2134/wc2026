import { useState, useEffect } from 'react'
import { C } from '../constants.js'
import AuthButton from './AuthButton.jsx'

const LINKS = [
  { id:'home',      label:'Home' },
  { id:'hub',       label:'My Hub' },
  { id:'matches',   label:'Matches' },
  { id:'groups',    label:'Groups' },
  { id:'bracket',   label:'Bracket' },
  { id:'predictor', label:'AI Predictor' },
]

export default function Nav({ tab, setTab, live = [], lastUpdated, loading, user }) {
  const [pulse,    setPulse]    = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const t = setInterval(() => setPulse(v => !v), 900)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [tab])

  const isLive   = live.length > 0
  const dotColor = isLive ? C.red : C.green

  return (
    <nav style={{
      background: 'rgba(7,16,31,.97)',
      borderBottom: `1px solid ${C.border}`,
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', gap:4 }}>

        {/* Logo */}
        <div
          style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 0', marginRight: isMobile ? 0 : 20, cursor:'pointer', flex: isMobile ? 1 : 'none' }}
          onClick={() => setTab('home')}
        >
          <div style={{
            width:32, height:32, borderRadius:8,
            background:'linear-gradient(135deg,#00c8ff 0%,#0055ff 100%)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <span style={{ fontSize:16 }}>🏆</span>
          </div>
          <div style={{ lineHeight:1 }}>
            <span style={{ fontSize:15, fontWeight:900, color:'white', letterSpacing:-.3 }}>World Cup</span>
            <span style={{ fontSize:15, fontWeight:900, background:'linear-gradient(90deg,#00c8ff,#0055ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginLeft:5 }}>2026</span>
          </div>
        </div>

        {/* Desktop tabs */}
        {!isMobile && LINKS.map(l => (
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
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
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

          {!isMobile && lastUpdated && (
            <span style={{ fontSize:11, color:C.dim }}>
              Updated {lastUpdated.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })}
            </span>
          )}

          {!isMobile && <AuthButton user={user} />}

          {isMobile && (
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{ background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'white', fontSize:16, lineHeight:1 }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{ borderTop:`1px solid ${C.border}`, background:'rgba(7,16,31,.99)', padding:'12px 16px 16px' }}>
          {LINKS.map(l => (
            <button key={l.id} onClick={() => setTab(l.id)} style={{
              display:'block', width:'100%', textAlign:'left',
              background: tab===l.id ? C.accentBg : 'transparent',
              color:      tab===l.id ? C.accent   : C.muted,
              border:     `1px solid ${tab===l.id ? 'rgba(0,200,255,.25)' : 'transparent'}`,
              borderRadius:10, padding:'10px 14px', cursor:'pointer',
              fontSize:14, fontWeight: tab===l.id ? 700 : 400, marginBottom:6,
            }}>
              {l.label}
            </button>
          ))}
          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
            <AuthButton user={user} />
          </div>
        </div>
      )}
    </nav>
  )
}
