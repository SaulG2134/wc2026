import { supabase } from './supabase.js'

// ── Anonymous user ID ─────────────────────────────────────────────────────────
export function getUid() {
  let uid = localStorage.getItem('wc2026_uid')
  if (!uid) {
    uid = crypto.randomUUID()
    localStorage.setItem('wc2026_uid', uid)
  }
  return uid
}

// ── Load user data from Supabase ──────────────────────────────────────────────
export async function loadUserData() {
  const uid = getUid()

  const { data, error } = await supabase
    .from('user_data')
    .select('followed, preds')
    .eq('uid', uid)
    .maybeSingle()

  if (error || !data) {
    return { followed: new Set(), preds: {} }
  }

  return {
    followed: new Set(data.followed || []),
    preds:    data.preds || {},
  }
}

// ── Save user data to Supabase ────────────────────────────────────────────────
export async function saveUserData(followed, preds) {
  const uid = getUid()

  const { error } = await supabase
    .from('user_data')
    .upsert({
      uid,
      followed:   [...followed],
      preds,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'uid' })

  if (error) console.error('Failed to save user data:', error.message)
}
