import { C } from '../constants.js'
import GroupCard from '../components/GroupCard.jsx'

/** @param {{ groups: Array }} props */
export default function Groups({ groups }) {
  return (
    <div style={{ padding:'32px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
        <h1 style={{ margin:0, fontSize:32, fontWeight:900 }}>Group Standings</h1>
      </div>
      <p style={{ color:C.muted, marginBottom:18, fontSize:14 }}>
        12 groups · Top 2 + 8 best 3rd-place teams advance
      </p>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, fontSize:13 }}>
        <div style={{ width:3, height:16, background:C.green, borderRadius:2 }} />
        <span style={{ color:C.muted }}>Qualification Zone (Top 2)</span>
      </div>
      <div className="grid-2col" style={{ gap:18 }}>
        {groups.map(g => <GroupCard key={g.id} group={g} />)}
      </div>
    </div>
  )
}
