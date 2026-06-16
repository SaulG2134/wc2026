import { C, F } from '../constants.js'
import { sortTeams } from '../api.js'

export default function GroupCard({ group, compact = false }) {
  const sorted = sortTeams(group.teams)

  return (
    <div style={{ background:C.card, borderRadius:12, padding:compact?12:16, border:`1px solid ${C.border}` }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ width:26, height:26, borderRadius:7, background:C.accent, color:'#000', fontWeight:800, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {group.id}
        </div>
        <span style={{ fontWeight:700, fontSize:compact?13:15 }}>Group {group.id}</span>
      </div>

      {/* Column headers */}
      <div style={{ display:'grid', gridTemplateColumns:'16px 22px 1fr 26px 18px 18px 18px 28px', gap:'2px 4px', fontSize:10, color:C.dim, marginBottom:6 }}>
        <span /><span /><span>TEAM</span>
        <span style={{textAlign:'center'}}>MP</span>
        <span style={{textAlign:'center'}}>W</span>
        <span style={{textAlign:'center'}}>D</span>
        <span style={{textAlign:'center'}}>L</span>
        <span style={{textAlign:'center', color:C.accent}}>PTS</span>
      </div>

      {/* Rows */}
      {sorted.map((t, i) => (
        <div key={t.name} style={{
          display: 'grid',
          gridTemplateColumns: '16px 22px 1fr 26px 18px 18px 18px 28px',
          gap: '2px 4px', alignItems: 'center', padding: '5px 0',
          borderLeft: i < 2 ? `3px solid ${C.green}` : '3px solid transparent',
        }}>
          <span style={{ fontSize:11, color:C.dim, paddingLeft:4 }}>{i+1}</span>
          <span style={{ fontSize:compact?15:17 }}>{F[t.name] || '🏳️'}</span>
          <span style={{ fontSize:compact?11:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</span>
          <span style={{ fontSize:11, color:C.muted, textAlign:'center' }}>{t.mp}</span>
          <span style={{ fontSize:11, color:C.muted, textAlign:'center' }}>{t.w}</span>
          <span style={{ fontSize:11, color:C.muted, textAlign:'center' }}>{t.d}</span>
          <span style={{ fontSize:11, color:C.muted, textAlign:'center' }}>{t.l}</span>
          <span style={{ fontSize:compact?12:14, fontWeight:700, color:C.accent, textAlign:'center' }}>{t.pts}</span>
        </div>
      ))}
    </div>
  )
}
