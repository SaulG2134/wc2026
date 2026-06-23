import { useState } from 'react'
import { C, F } from '../constants.js'

// ── Stat bar ──────────────────────────────────────────────────────────────────
function StatBar({ leftVal, rightVal, leftLabel, rightLabel, color = C.accent }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{leftVal}%</span>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: .5 }}>{leftLabel}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{rightVal}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: C.border, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${leftVal}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 4, transition: 'width .6s' }} />
      </div>
    </div>
  )
}

// ── Win probability bar ───────────────────────────────────────────────────────
function WinBar({ home, draw, away, homeTeam, awayTeam }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{home}%</div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{homeTeam}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.yellow }}>{draw}%</div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>DRAW</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.accent }}>{away}%</div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{awayTeam}</div>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: `${home}%`, background: C.green, transition: 'width .6s' }} />
        <div style={{ width: `${draw}%`, background: C.yellow, transition: 'width .6s' }} />
        <div style={{ width: `${away}%`, background: C.accent, transition: 'width .6s' }} />
      </div>
    </div>
  )
}

// ── Scorer row ────────────────────────────────────────────────────────────────
function ScorerRow({ name, chance, flag }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 16 }}>{flag}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'white' }}>{name}</span>
      <div style={{ width: 80, height: 5, borderRadius: 3, background: C.border, overflow: 'hidden' }}>
        <div style={{ width: `${chance}%`, height: '100%', background: C.accent, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, minWidth: 36, textAlign: 'right' }}>{chance}%</span>
    </div>
  )
}

// ── AI Result card ────────────────────────────────────────────────────────────
function AiResult({ result, m }) {
  return (
    <div style={{
      background: 'rgba(139,92,246,.06)',
      border: '1px solid rgba(139,92,246,.25)',
      borderRadius: 12, padding: '18px 20px', marginTop: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 14 }}></span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: 1 }}>AI PREDICTION</span>
      </div>

      {/* Predicted score */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>PREDICTED SCORE</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>{F[m.home] || '🏳️'}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{m.home}</div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 900, color: 'white', letterSpacing: 4 }}>
            {result.score.home} – {result.score.away}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>{F[m.away] || '🏳️'}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{m.away}</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(139,92,246,.2)', marginBottom: 16 }} />

      {/* Win probability */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>WIN PROBABILITY</div>
        <WinBar
          home={result.win.home}
          draw={result.win.draw}
          away={result.win.away}
          homeTeam={m.home}
          awayTeam={m.away}
        />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(139,92,246,.2)', marginBottom: 16 }} />

      {/* Possession */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>POSSESSION</div>
        <StatBar
          leftVal={result.possession.home}
          rightVal={result.possession.away}
          leftLabel="POSSESSION"
          color="#a78bfa"
        />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(139,92,246,.2)', marginBottom: 16 }} />

      {/* Likely scorers */}
      <div>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>LIKELY SCORERS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{m.home}</div>
            {result.scorers.home.map(s => (
              <ScorerRow key={s.name} name={s.name} chance={s.chance} flag={F[m.home] || '🏳️'} />
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{m.away}</div>
            {result.scorers.away.map(s => (
              <ScorerRow key={s.name} name={s.name} chance={s.chance} flag={F[m.away] || '🏳️'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Match prediction card ─────────────────────────────────────────────────────
function MatchPredictCard({ m, groups }) {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const getStats = (teamName) => {
    for (const g of groups) {
      const t = g.teams.find(t => t.name === teamName)
      if (t) return t
    }
    return { pts: 0, w: 0, d: 0, l: 0, gd: 0, mp: 0 }
  }

  const predict = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home:      m.home,
          away:      m.away,
          homeStats: getStats(m.home),
          awayStats: getStats(m.away),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: C.card, borderRadius: 14, padding: '18px 20px', marginBottom: 12,
      border: `1px solid ${result ? 'rgba(139,92,246,.4)' : C.border}`,
      transition: 'border .2s',
    }}>
      {/* Match header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>GROUP {m.grp}</span>
        <span style={{ fontSize: 11, color: C.dim }}>{m.date} · {m.time}</span>
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 32 }}>{F[m.home] || '🏳️'}</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{m.home}</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.dim, padding: '0 16px' }}>VS</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{m.away}</span>
          <span style={{ fontSize: 32 }}>{F[m.away] || '🏳️'}</span>
        </div>
      </div>

      {/* Predict button */}
      {!result && (
        <button
          onClick={predict}
          disabled={loading}
          style={{
            width: '100%', padding: '10px 0',
            background: loading ? 'rgba(139,92,246,.1)' : 'rgba(139,92,246,.15)',
            border: '1px solid rgba(139,92,246,.4)',
            borderRadius: 10, color: loading ? C.muted : '#a78bfa',
            fontWeight: 800, fontSize: 13, cursor: loading ? 'default' : 'pointer',
            letterSpacing: .5, transition: 'all .15s',
          }}
        >
          {loading ? ' Analyzing match...' : ' AI Prediction'}
        </button>
      )}

      {error && (
        <div style={{ color: C.red, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
          ⚠️ {error}
        </div>
      )}

      {result && <AiResult result={result} m={m} />}

      {result && (
        <button
          onClick={() => setResult(null)}
          style={{
            width: '100%', marginTop: 10, padding: '8px 0',
            background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.dim, fontSize: 12,
            cursor: 'pointer', fontWeight: 600,
          }}
        >
          ↺ Re-analyze
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Predictor({ matches, groups = [] }) {
  const upcoming = matches.filter(m => m.status === 'upcoming')

  const byDate = upcoming.reduce((acc, m) => {
    ;(acc[m.date] = acc[m.date] || []).push(m)
    return acc
  }, {})

  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 900, background: C.accent, color: '#000', borderRadius: 6, padding: '3px 8px', letterSpacing: 1 }}>AI</span>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Predictor</h1>
      </div>
      <p style={{ color: C.muted, marginBottom: 28, fontSize: 14 }}>
        AI-powered match predictions — score, possession, win probability & likely scorers
      </p>

      {upcoming.length === 0 && (
        <p style={{ color: C.dim, fontSize: 14 }}>No upcoming matches to predict right now.</p>
      )}

      {Object.entries(byDate).map(([date, ms]) => (
        <div key={date} style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 12, color: C.muted, fontWeight: 700,
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ width: 24, height: 1, background: C.border, display: 'inline-block' }} />
            {date}
            <span style={{ flex: 1, height: 1, background: C.border, display: 'inline-block' }} />
          </div>
          {ms.map(m => (
            <MatchPredictCard key={m.id} m={m} groups={groups} />
          ))}
        </div>
      ))}
    </div>
  )
}
