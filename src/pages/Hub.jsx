import { useState } from 'react'
import { C, F } from '../constants.js'

// ── Fixture card (upcoming / live) ────────────────────────────────────────────
function FixtureCard({ m }) {
  const isLive = m.status === 'live'
  return (
    <div style={{
      background: C.card2, borderRadius: 10, padding: '14px 18px',
      border: `1px solid ${isLive ? C.red + '55' : C.border}`,
      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 16,
    }}>
      {/* Time / date */}
      <div style={{ minWidth: 72, flexShrink: 0 }}>
        {isLive
          ? <span style={{ fontSize: 11, fontWeight: 800, color: C.red, letterSpacing: 1 }}>● LIVE{m.minute ? ` ${m.minute}'` : ''}</span>
          : <>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>{m.time}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{m.date}</div>
            </>
        }
      </div>

      {/* Teams */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1 }}>
          <span style={{ fontSize: 20 }}>{F[m.home] || '🏳️'}</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{m.home}</span>
        </div>
        {isLive
          ? <span style={{ fontWeight: 900, fontSize: 18, color: C.red, minWidth: 44, textAlign: 'center' }}>{m.hs}–{m.as}</span>
          : <span style={{ fontSize: 12, color: C.dim, minWidth: 24, textAlign: 'center' }}>VS</span>
        }
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{m.away}</span>
          <span style={{ fontSize: 20 }}>{F[m.away] || '🏳️'}</span>
        </div>
      </div>

      {/* Group badge */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: C.accentBg, padding: '3px 8px', borderRadius: 6, letterSpacing: 0.5 }}>
          GROUP {m.grp}
        </span>
        {m.venue && <div style={{ fontSize: 10, color: C.dim, marginTop: 4, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {m.venue}</div>}
      </div>
    </div>
  )
}

// ── Result card (finished) ────────────────────────────────────────────────────
function ResultCard({ m }) {
  return (
    <div style={{
      background: C.card2, borderRadius: 10, padding: '14px 18px',
      border: `1px solid ${C.border}`, marginBottom: 8,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: 1 }}>GROUP {m.grp}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: C.muted, background: C.border, padding: '2px 8px', borderRadius: 4, letterSpacing: 1 }}>FT</span>
      </div>
      {/* Score row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ fontSize: 22 }}>{F[m.home] || '🏳️'}</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{m.home}</span>
        </div>
        <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 2, minWidth: 64, textAlign: 'center' }}>
          {m.hs} – {m.as}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{m.away}</span>
          <span style={{ fontSize: 22 }}>{F[m.away] || '🏳️'}</span>
        </div>
      </div>
      {/* Footer */}
      {(m.time || m.venue) && (
        <div style={{ marginTop: 10, display: 'flex', gap: 16, fontSize: 11, color: C.dim }}>
          {m.date && <span>📅 {m.date}</span>}
          {m.venue && <span>📍 {m.venue}</span>}
        </div>
      )}
    </div>
  )
}

// ── Group mini-table ──────────────────────────────────────────────────────────
function GroupTable({ group }) {
  return (
    <div style={{ background: C.card2, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ background: C.border, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'white', background: C.accent, borderRadius: 4, padding: '1px 7px' }}>
          {group.id.replace('Group ', '')}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Group {group.id.replace('Group ', '')}</span>
      </div>
      <div style={{ padding: '0 14px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 28px 28px 28px 36px 36px', gap: 0, padding: '6px 0 4px', borderBottom: `1px solid ${C.border}` }}>
          {['TEAM','MP','W','D','L','GD','PTS'].map(h => (
            <span key={h} style={{ fontSize: 10, color: C.dim, fontWeight: 700, textAlign: h==='TEAM'?'left':'center' }}>{h}</span>
          ))}
        </div>
        {group.teams.map((t, i) => (
          <div key={t.name} style={{
            display: 'grid', gridTemplateColumns: '1fr 32px 28px 28px 28px 36px 36px',
            padding: '7px 0', borderBottom: i < group.teams.length-1 ? `1px solid ${C.border}` : 'none',
            borderLeft: i < 2 ? `2px solid ${C.green}` : '2px solid transparent',
            paddingLeft: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{F[t.name] || '🏳️'}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{t.name.length > 12 ? t.name.slice(0,11)+'…' : t.name}</span>
            </div>
            {[t.mp, t.w, t.d, t.l, t.gd > 0 ? `+${t.gd}` : t.gd, t.pts].map((v, vi) => (
              <span key={vi} style={{
                fontSize: 12, textAlign: 'center', fontWeight: vi === 5 ? 800 : 400,
                color: vi === 5 ? C.accent : vi === 4 ? (t.gd > 0 ? C.green : t.gd < 0 ? C.red : C.muted) : C.muted,
              }}>{v}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Hub page ─────────────────────────────────────────────────────────────
export default function Hub({ groups, matches, followed, setFollowed }) {
  const allTeams = groups.flatMap(g => g.teams.map(t => ({ ...t, groupId: g.id })))
  const [search, setSearch] = useState('')

  const followedList    = allTeams.filter(t => followed.has(t.name))
  const followedGroups  = groups.filter(g => g.teams.some(t => followed.has(t.name)))
  const followedMatches = matches.filter(m => followed.has(m.home) || followed.has(m.away))
  const live     = followedMatches.filter(m => m.status === 'live')
  const upcoming = followedMatches.filter(m => m.status === 'upcoming')
  const finished = followedMatches.filter(m => m.status === 'finished')

  const toggle  = n => setFollowed(prev => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s })
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
                  <button onClick={() => toggle(t.name)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                    color: C.yellow, padding: 4,
                  }}>★</button>
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
              style={{
                width: '100%', background: C.card2, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '9px 12px', color: 'white', fontSize: 13,
                outline: 'none', boxSizing: 'border-box',
              }}
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
              {followedGroups.map(g => <GroupTable key={g.id} group={g} />)}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div>
          {followed.size === 0 ? (
            <div style={{
              background: C.card, borderRadius: 12, padding: 64,
              border: `1px solid ${C.border}`, textAlign: 'center',
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>⭐</div>
              <p style={{ color: C.muted, fontSize: 15, margin: 0, fontWeight: 500 }}>Search and follow teams on the left to see their fixtures here</p>
            </div>
          ) : (
            <>
              {/* Live */}
              {live.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, display: 'inline-block', boxShadow: `0 0 6px ${C.red}` }} />
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.red }}>Live Now</h2>
                  </div>
                  {live.map(m => <FixtureCard key={m.id} m={m} />)}
                </div>
              )}

              {/* Upcoming fixtures */}
              {upcoming.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Followed Fixtures</h2>
                    <span style={{ fontSize: 12, background: C.card2, border: `1px solid ${C.border}`, padding: '2px 10px', borderRadius: 20, color: C.muted, fontWeight: 600 }}>
                      {upcoming.length} {upcoming.length === 1 ? 'Game' : 'Games'}
                    </span>
                  </div>
                  {upcoming.map(m => <FixtureCard key={m.id} m={m} />)}
                </div>
              )}

              {/* Recent results */}
              {finished.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Results</h2>
                    <span style={{ fontSize: 12, background: C.card2, border: `1px solid ${C.border}`, padding: '2px 10px', borderRadius: 20, color: C.muted, fontWeight: 600 }}>
                      {finished.length} Finished
                    </span>
                  </div>
                  {finished.slice().reverse().map(m => <ResultCard key={m.id} m={m} />)}
                </div>
              )}

              {/* All followed matches are finished (nothing upcoming) */}
              {upcoming.length === 0 && live.length === 0 && finished.length === 0 && (
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
