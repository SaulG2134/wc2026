/**
 * Shared style constants — spread these and override as needed.
 * e.g. <div style={{ ...S.card, padding: 24 }}>
 */
import { C } from './constants.js'

export const S = {
  // Containers
  card:    { background: C.card,  borderRadius: 12, border: `1px solid ${C.border}` },
  card2:   { background: C.card2, borderRadius: 10, border: `1px solid ${C.border}` },
  panel:   { background: C.card,  borderRadius: 12, border: `1px solid ${C.border}`, padding: 18 },

  // Text
  eyebrow: { fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: 3 },
  label:   { fontSize: 11, color: C.muted,  fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  dim:     { fontSize: 11, color: C.dim },

  // Layout
  row:     { display: 'flex', alignItems: 'center' },
  rowBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },

  // Badges
  pill:    { fontSize: 12, background: C.card2, border: `1px solid ${C.border}`, padding: '2px 10px', borderRadius: 20, color: C.muted, fontWeight: 600 },
  badge:   { fontSize: 10, fontWeight: 700, color: C.accent, background: C.accentBg, padding: '3px 8px', borderRadius: 6, letterSpacing: 0.5 },
}
