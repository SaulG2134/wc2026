import { C, F } from '../constants.js'

// ── Single match slot ─────────────────────────────────────────────────────────
function MatchSlot({ m, isThird }) {
  if (!m) return <div style={{ height: 72, margin: '6px 0' }} />

  const live     = m.status === 'live'
  const done     = m.status === 'finished'
  const hasScore = done || live
  const tbd      = m.home === 'TBD' && m.away === 'TBD'

  const homeWin = done && m.hs > m.as
  const awayWin = done && m.as > m.hs

  const borderColor = live ? C.red + 'bb' : C.border

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      overflow: 'hidden',
      margin: '6px 0',
      minWidth: 200,
      position: 'relative',
      boxShadow: live ? `0 0 12px ${C.red}33` : 'none',
    }}>
      {/* live pulse bar */}
      {live && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:C.red, opacity:.8 }} />
      )}

      {/* Home row */}
      <TeamRow
        name={m.home}
        score={hasScore ? m.hs : null}
        winner={homeWin}
        tbd={tbd}
      />
      <div style={{ height:1, background: C.border }} />
      {/* Away row */}
      <TeamRow
        name={m.away}
        score={hasScore ? m.as : null}
        winner={awayWin}
        tbd={tbd}
      />

      {/* bottom meta */}
      <div style={{
        background:'rgba(0,0,0,.25)', borderTop:`1px solid ${C.border}`,
        padding:'3px 8px', display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <span style={{ fontSize:10, color:C.dim }}>{m.date}</span>
        {live && (
          <span style={{ fontSize:10, color:C.red, fontWeight:700 }}>
            {m.minute ? `${m.minute}'` : 'LIVE'}
          </span>
        )}
        {!live && !done && <span style={{ fontSize:10, color:C.dim }}>{m.time}</span>}
        {done && <span style={{ fontSize:10, color:C.muted, fontWeight:600 }}>FT</span>}
      </div>
    </div>
  )
}

function TeamRow({ name, score, winner, tbd }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:7, padding:'8px 10px',
      background: winner ? 'rgba(34,197,94,.07)' : 'transparent',
    }}>
      <span style={{ fontSize:16, flexShrink:0 }}>
        {tbd ? '🏳️' : (F[name] || '🏳️')}
      </span>
      <span style={{
        flex:1, fontSize:12, fontWeight: winner ? 700 : 400,
        color: tbd ? C.dim : (winner ? 'white' : C.muted),
        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
      }}>
        {name}
      </span>
      {score !== null && (
        <span style={{
          fontSize:14, fontWeight:800,
          color: winner ? C.green : C.muted,
          minWidth:16, textAlign:'right',
        }}>
          {score}
        </span>
      )}
    </div>
  )
}

// ── Connector line between rounds ─────────────────────────────────────────────
// Each pair of matches in round N feeds one match in round N+1.
// We draw a right-side vertical bar + horizontal stub using CSS borders.
function Connectors({ count }) {
  // count = number of match pairs in this round
  const SLOT_H = 84 + 12 // match height + gap
  return (
    <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-around', width:24, flexShrink:0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: SLOT_H * 2, position:'relative', display:'flex', alignItems:'center' }}>
          {/* vertical bar on the left spanning top+bottom match */}
          <div style={{
            position:'absolute', left:0, top:'25%', bottom:'25%',
            width:1, background: C.border,
          }} />
          {/* horizontal stub to the right from mid-point */}
          <div style={{
            position:'absolute', left:0, top:'50%', width:'100%',
            height:1, background: C.border,
            transform:'translateY(-50%)',
          }} />
        </div>
      ))}
    </div>
  )
}

// ── Round column ──────────────────────────────────────────────────────────────
function RoundColumn({ round, isLast }) {
  const { label, matches } = round

  // Final / Third Place: single match, center it
  const isSingle = matches.length === 1

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'stretch', minWidth: 220 }}>
      {/* Round header */}
      <div style={{
        textAlign:'center', marginBottom:12,
        padding:'6px 12px',
        background: isLast ? C.accent : C.card,
        borderRadius:20, border:`1px solid ${isLast ? C.accent : C.border}`,
        fontSize:11, fontWeight:800, letterSpacing:1,
        color: isLast ? '#000' : C.muted,
      }}>
        {label.toUpperCase()}
      </div>

      {/* Match slots */}
      <div style={{
        display:'flex', flexDirection:'column',
        justifyContent: isSingle ? 'center' : 'space-around',
        flex:1,
      }}>
        {matches.map(m => <MatchSlot key={m.id} m={m} />)}
      </div>
    </div>
  )
}

// ── Main bracket page ─────────────────────────────────────────────────────────
export default function Bracket({ rounds }) {
  if (!rounds || rounds.length === 0) {
    return (
      <div style={{ padding:'60px 0', textAlign:'center', color:C.muted }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🏆</div>
        <p style={{ fontSize:15, marginBottom:8 }}>Knockout bracket not available yet.</p>
        <p style={{ fontSize:13, color:C.dim }}>Bracket draws after the group stage ends.</p>
      </div>
    )
  }

  // Separate third place from main bracket
  const main  = rounds.filter(r => r.stage !== 'THIRD_PLACE')
  const third = rounds.find(r => r.stage  === 'THIRD_PLACE')

  return (
    <div style={{ padding:'32px 0' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
        <span style={{ fontSize:28 }}>🏆</span>
        <h1 style={{ margin:0, fontSize:32, fontWeight:900 }}>Bracket</h1>
      </div>
      <p style={{ color:C.muted, marginBottom:28, fontSize:14 }}>
        Knockout stage · updates automatically as results come in
      </p>

      {/* Horizontal scrollable bracket */}
      <div style={{ overflowX:'auto', paddingBottom:16 }}>
        <div style={{
          display:'flex', alignItems:'stretch', gap:0,
          minWidth: main.length * 244,
        }}>
          {main.map((round, i) => {
            const isLast = i === main.length - 1
            const nextRound = main[i + 1]
            const showConnector = nextRound && round.matches.length > nextRound.matches.length

            return (
              <div key={round.stage} style={{ display:'flex', alignItems:'stretch' }}>
                <RoundColumn round={round} isLast={isLast} />
                {showConnector && (
                  <Connectors count={nextRound.matches.length} />
                )}
                {!showConnector && i < main.length - 1 && (
                  <div style={{ width:20 }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Third place playoff */}
      {third && (
        <div style={{ marginTop:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ flex:1, height:1, background:C.border }} />
            <span style={{ fontSize:12, color:C.dim, fontWeight:700, letterSpacing:1 }}>THIRD PLACE PLAYOFF</span>
            <div style={{ flex:1, height:1, background:C.border }} />
          </div>
          <div style={{ maxWidth:240 }}>
            {third.matches.map(m => <MatchSlot key={m.id} m={m} />)}
          </div>
        </div>
      )}
    </div>
  )
}
