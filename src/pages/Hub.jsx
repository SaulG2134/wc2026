import { useState } from 'react'
import { C, F } from '../constants.js'
import GroupCard from '../components/GroupCard.jsx'
import { useFollowedMatches } from '../hooks/useFollowedMatches.js'

// ── Section header with optional badge ───────────────────────────────────────
function SectionHeader({ title, count, label, live: isLive }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isLive && (
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, display: 'inline-block', boxShadow: `0 0 6px ${C.red}` }} />
        )}
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: isLive ? C.red : 'white' }}>{title}</h2>
      </div>
      {count != null && (
        <span style={{ fontSize: 12, background: C.card2, border: `1px solid ${C.border}`, padding: '2px 10px', borderRadius: 20, color: C.muted, fontWeight: 600 }}>
          {count} {label}
        </span>
      )}
    </div>
  )
}

// ── Match event row (goal / card) ─────────────────────────────────────────────
function EventRow({ e, right }) {
  const isGoal    = 'scorer' in e
  const icon = isGoal
    ? (e.type === 'OWN_GOAL' ? '⚽ OG' : e.type === 'PENALTY' ? '⚽ P' : '⚽')
    : (e.card === 'RED_CARD' ? '🟥' : e.card === 'YELLOW_RED_CARD' ? '🟥' : '🟨')

  const name = isGoal ? e.scorer : e.player

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      justifyContent: right ? 'flex-end' : 'flex-start',
      fontSize: 11, color: C.muted, marginBottom: 4,
    }}>
      {right ? (
        <>
          <span style={{ color: C.dim }}>{e.minute}'</span>
          <span style={{ fontWeight: 600, color: 'white' }}>{name}</span>
          <span>{icon}</span>
        </>
      ) : (
        <>
          <span>{icon}</span>
          <span style={{ fontWeight: 600, color: 'white' }}>{name}</span>
          <span style={{ color: C.dim }}>{e.minute}'</span>
        </>
      )}
    </div>
  )
}

// ── Unified match card (upcoming, live, finished) ─────────────────────────────
function MatchCard({ m }) {
  const isLive = m.status === 'live'
  const isDone = m.status === 'finished'
  const hasScore = isLive || isDone

  return (
    <div style={{
      background: C.card2, borderRadius: 10, padding: '14px 18px',
      border: `1px solid ${isLive ? C.red + '55' : C.border}`, marginBottom: 8,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isDone ? 10 : 0, alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: 0.5 }}>GROUP {m.grp}</span>
        {isDone && <span style={{ fontSize: 10, fontWeight: 800, color: C.muted, background: C.border, padding: '2px 8px', borderRadius: 4, letterSpacing: 1 }}>FT</span>}
        {!isDone && (
          <span style={{ fontSize: 10, fontWeight: 700, color: isLive ? C.red : C.accent }}>
            {isLive ? `● LIVE${m.minute ? ` ${m.minute}'` : ''}` : `${m.date} · ${m.time}`}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: isDone ? 0 : 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: isDone ? 22 : 20, flexShrink: 0 }}>{F[m.home] || '🏳️'}</span>
          <span style={{ fontWeight: isDone ? 700 : 600, fontSize: isDone ? 15 : 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
        </div>

        {hasScore
          ? <span style={{ fontWeight: 900, fontSize: isDone ? 22 : 18, color: isLive ? C.red : 'white', letterSpacing: isDone ? 2 : 0, minWidth: isDone ? 64 : 44, textAlign: 'center', flexShrink: 0 }}>
              {isDone ? `${m.hs} – ${m.as}` : `${m.hs}–${m.as}`}
            </span>
          : <span style={{ fontSize: 12, color: C.dim, minWidth: 24, textAlign: 'center', flexShrink: 0 }}>VS</span>
        }

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
          <span style={{ fontWeight: isDone ? 700 : 600, fontSize: isDone ? 15 : 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
          <span style={{ fontSize: isDone ? 22 : 20, flexShrink: 0 }}>{F[m.away] || '🏳️'}</span>
        </div>
      </div>

      {/* Match events (finished only) */}
      {isDone && (m.goals?.length > 0 || m.bookings?.length > 0) && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10, display: 'flex', gap: 12 }}>
          {/* Home events */}
          <div style={{ flex: 1 }}>
            {[...(m.goals || []), ...(m.bookings || [])]
              .filter(e => e.team === m.home)
              .sort((a, b) => parseInt(a.minute) - parseInt(b.minute))
              .map((e, i) => <EventRow key={i} e={e} />)}
          </div>
          {/* Away events */}
          <div style={{ flex: 1, textAlign: 'right' }}>
            {[...(m.goals || []), ...(m.bookings || [])]
              .filter(e => e.team === m.away)
              .sort((a, b) => parseInt(a.minute) - parseInt(b.minute))
              .map((e, i) => <EventRow key={i} e={e} right />)}
          </div>
        </div>
      )}

      {isDone && m.venue && (
        <div style={{ marginTop: 8, fontSize: 11, color: C.dim }}>📍 {m.venue}</div>
      )}
    </div>
  )
}

// ── Main Hub page ─────────────────────────────────────────────────────────────
/**
 * @param {{ groups: Array, matches: Array, followed: Set, setFollowed: Function }} props
 */
export default function Hub({ groups, matches, followed, setFollowed }) {
  const [search, setSearch] = useState('')
  const { allTeams, followedList, followedGroups, live, upcoming, finished } = useFollowedMatches(matches, groups, followed)

  const toggle  = name => setFollowed(prev => { const s = new Set(prev); s.has(name) ? s.delete(name) : s.add(name); return s })
  const results = search ? allTeams.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) : []

  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>⭐ PERSONALIZED HUB</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 900 }}>My Favorites</h1>
      <p style={{ color: C.muted, marginBottom: 28, fontSize: 14 }}>Follow your teams to track fixtures and results</p>

      <div className="hub-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── LEFT PANEL ── */}
        <div>
          {/* Followed teams */}
          <div style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
              👥 Followed Teams ({followed.size})
            </h3>
            {followedList.length === 0
              ? <p style={{ color: C.dim, fontSize: 13, margin: 0 }}>Search below to follow a team.</p>
              : followedList.map(t => (
                <div key={t.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 8, background: C.card2,
                  border: `1px solid ${C.border}`, marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{F[t.name] || '🏳️'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>Group {t.groupId} · {t.pts} pts</div>
                    </div>
                  </div>
                  <button onClick={() => toggle(t.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.yellow, padding: 4 }}>★</button>
                </div>
              ))
            }
          </div>

          {/* Search */}
          <div style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>🔍 Follow a Team</h3>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teams…"
              style={{ width: '100%', background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
            {results.slice(0, 6).map(t => (
              <div key={t.name} onClick={() => { toggle(t.name); setSearch('') }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 4px', cursor: 'pointer', borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{F[t.name] || '🏳️'}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</span>
                </div>
                <span style={{ fontSize: 16, color: followed.has(t.name) ? C.yellow : C.dim }}>
                  {followed.has(t.name) ? '★' : '☆'}
                </span>
              </div>
            ))}
          </div>

          {/* Group standings for followed teams */}
          {followedGroups.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>🏆 Group Standings</h3>
              {followedGroups.map(g => <GroupCard key={g.id} group={g} compact />)}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div>
          {followed.size === 0 ? (
            <div style={{ background: C.card, borderRadius: 12, padding: 64, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>⭐</div>
              <p style={{ color: C.muted, fontSize: 15, margin: 0, fontWeight: 500 }}>Search and follow teams on the left to see their fixtures here</p>
            </div>
          ) : (
            <>
              {live.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <SectionHeader title="Live Now" live />
                  {live.map(m => <MatchCard key={m.id} m={m} />)}
                </div>
              )}

              {upcoming.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <SectionHeader title="Followed Fixtures" count={upcoming.length} label={upcoming.length === 1 ? 'Game' : 'Games'} />
                  {upcoming.map(m => <MatchCard key={m.id} m={m} />)}
                </div>
              )}

              {finished.length > 0 && (
                <div>
                  <SectionHeader title="Recent Results" count={finished.length} label="Finished" />
                  {finished.map(m => <MatchCard key={m.id} m={m} />)}
                </div>
              )}

              {live.length === 0 && upcoming.length === 0 && finished.length === 0 && (
                <div style={{ background: C.card, borderRadius: 12, padding: 40, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                  <p style={{ color: C.dim, fontSize: 14, margin: 0 }}>No matches found for your followed teams yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
