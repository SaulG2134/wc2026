import { supabase } from './supabase.js'

// ── Get current authenticated user ID ────────────────────────────────────────
// Falls back to anonymous UUID in localStorage if not signed in
export function getAnonUid() {
  let uid = localStorage.getItem('wc2026_uid')
  if (!uid) {
    uid = crypto.randomUUID()
    localStorage.setItem('wc2026_uid', uid)
  }
  return uid
}

async function getUid() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? getAnonUid()
}

// ── Migrate anonymous data to real account on first login ─────────────────────
// Called once right after a user signs in for the first time.
export async function migrateAnonData(userId) {
  const anonUid = localStorage.getItem('wc2026_uid')
  if (!anonUid) return  // nothing to migrate

  // Check if anon row exists
  const { data: anonRow } = await supabase
    .from('user_data')
    .select('followed, preds')
    .eq('uid', anonUid)
    .maybeSingle()

  if (!anonRow) return  // no anon data, nothing to do

  // Check if user already has real data
  const { data: realRow } = await supabase
    .from('user_data')
    .select('uid')
    .eq('uid', userId)
    .maybeSingle()

  if (!realRow) {
    // Move anon data to real account
    await supabase
      .from('user_data')
      .upsert({
        uid:        userId,
        followed:   anonRow.followed,
        preds:      anonRow.preds,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'uid' })
  }

  // Clean up anon row and localStorage key
  await supabase.from('user_data').delete().eq('uid', anonUid)
  localStorage.removeItem('wc2026_uid')
}

// ── Load user data from Supabase ──────────────────────────────────────────────
export async function loadUserData() {
  const uid = await getUid()

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
  const uid = await getUid()

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

// ── Auth helpers ──────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  if (error) console.error('Google sign-in failed:', error.message)
}

export async function signOut() {
  await supabase.auth.signOut()
}
