import { useState } from 'react'
import { C } from '../constants.js'
import { apiFetch } from '../api.js'

export default function ApiSetup({ onConnect }) {
  const [val,     setVal]     = useState('')
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const connect = async () => {
    const key = val.trim()
    if (!key) { setErr('Enter your API key.'); return }
    setLoading(true); setErr('')
    try {
      await apiFetch('/competitions/WC/standings', key)
      onConnect(key)
    } catch (e) {
      if (e.message.startsWith('403'))
        setErr('Key invalid or WC 2026 is not on your plan (Tier Two required).')
      else if (e.message.startsWith('404'))
        setErr('Competition not found — WC 2026 may not be active on your account.')
      else
        setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'40px 36px', maxWidth:440, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🏆</div>
          <h1 style={{ fontSize:24, fontWeight:900, color:'white', margin:'0 0 8px' }}>FIFA WC 2026 Live</h1>
          <p style={{ color:C.muted, fontSize:14, margin:0, lineHeight:1.6 }}>
            Connect your <strong style={{color:'white'}}>football-data.org</strong> API key for
            live scores, standings, and fixtures.
          </p>
        </div>

        <div style={{ background:'rgba(0,200,255,.06)', border:`1px solid rgba(0,200,255,.2)`, borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:13, color:C.muted }}>
          💡 Add <code style={{color:C.accent}}>VITE_API_KEY=your_key</code> to your <code style={{color:C.accent}}>.env</code> file to skip this screen.
        </div>

        <label style={{ fontSize:12, color:C.muted, fontWeight:600, display:'block', marginBottom:8 }}>API KEY</label>
        <input
          type="password"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && connect()}
          placeholder="Paste your key here…"
          style={{ width:'100%', background:C.card2, border:`1px solid ${err ? C.red : C.border}`, borderRadius:8, padding:'10px 14px', color:'white', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:6 }}
        />
        {err && <p style={{ color:C.red, fontSize:12, margin:'0 0 12px' }}>{err}</p>}

        <button
          onClick={connect}
          disabled={loading}
          style={{ width:'100%', background: loading ? C.dim : C.accent, color:'#000', fontWeight:800, border:'none', borderRadius:10, padding:12, cursor: loading ? 'default' : 'pointer', fontSize:15, marginTop:8 }}
        >
          {loading ? 'Connecting…' : 'Connect →'}
        </button>

        <p style={{ fontSize:12, color:C.dim, textAlign:'center', marginTop:16 }}>
          Free key at <a href="https://www.football-data.org" target="_blank" rel="noreferrer" style={{color:C.accent}}>football-data.org</a> · Refreshes every 60s
        </p>
      </div>
    </div>
  )
}
