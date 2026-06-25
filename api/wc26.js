const BASE = 'https://worldcup26.ir'

// ── Team name normalisation ───────────────────────────────────────────────────
const NORM = {
  'Bosnia and Herzegovina':'Bosnia','Bosnia & Herzegovina':'Bosnia',
  'Korea Republic':'South Korea','Republic of Korea':'South Korea',
  'Czechia':'Czech Republic',
  "Côte d'Ivoire":'Ivory Coast',"Cote d'Ivoire":'Ivory Coast',
  'Congo DR':'DR Congo','Democratic Republic of Congo':'DR Congo',
  'Democratic Republic of the Congo':'DR Congo',
  "Congo, the Democratic Republic of the":'DR Congo',
  'Cabo Verde':'Cape Verde','Cape Verde Islands':'Cape Verde',
  'Türkiye':'Turkey','Turkiye':'Turkey',
  'Curaçao':'Curacao',
  'United States':'USA','United States of America':'USA',
  'IR Iran':'Iran','China PR':'China',
}
const normName = n => NORM[n] || n || 'TBD'

// ── Stage mapping ─────────────────────────────────────────────────────────────
const STAGE_BY_TYPE = {
  r32: { key:'LAST_32',        label:'Round of 32' },
  r16: { key:'LAST_16',        label:'Round of 16' },
  qf:  { key:'QUARTER_FINALS', label:'Quarter Finals' },
  sf:  { key:'SEMI_FINALS',    label:'Semi Finals' },
  '3rd':{ key:'THIRD_PLACE',   label:'Third Place' },
  f:   { key:'FINAL',          label:'Final' },
}
// worldcup26.ir uses "r16" for their first knockout round — figure out which
// is really R32 vs R16 by game count when we have data
const STAGE_ORDER = ['LAST_32','LAST_16','QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL']

// ── Date helpers ──────────────────────────────────────────────────────────────
const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(localDate) {
  if (!localDate) return { date:'', time:'' }
  const [datePart, timePart = ''] = localDate.split(' ')
  const [mo, day] = datePart.split('/')
  const date = `${MONTHS[parseInt(mo)]} ${parseInt(day)}`
  let time = ''
  if (timePart) {
    const [h, m] = timePart.split(':')
    const hr = parseInt(h)
    time = `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'} ET`
  }
  return { date, time }
}

// ── Map a single game object ──────────────────────────────────────────────────
function mapGame(g) {
  const finished = g.finished === 'TRUE' || g.finished === true
  const te       = (g.time_elapsed || '').toLowerCase()
  const isLive   = !finished && te !== '' && te !== 'notstarted'
  const status   = finished ? 'finished' : isLive ? 'live' : 'upcoming'
  const minute   = isLive && /^\d+$/.test(te) ? parseInt(te) : null

  const home = normName(g.home_team_name_en)
  const away = normName(g.away_team_name_en)
  const { date, time } = formatDate(g.local_date)
  const stageInfo = STAGE_BY_TYPE[g.type]

  return {
    id:      String(g.id),
    home,
    away,
    hs:      (finished || isLive) ? (parseInt(g.home_score) ?? null) : null,
    as:      (finished || isLive) ? (parseInt(g.away_score) ?? null) : null,
    status,
    minute,
    grp:     g.type === 'group' ? (g.group || '?') : null,
    stage:   stageInfo?.key  ?? null,
    date,
    time,
    venue:   '',
    matchNum: parseInt(g.matchday) || null,
  }
}

// ── Compute standings from game results ───────────────────────────────────────
function computeStandings(games) {
  const groups = {}
  for (const g of games) {
    if (g.type !== 'group') continue
    const grp  = g.group;  if (!grp) continue
    const home = normName(g.home_team_name_en)
    const away = normName(g.away_team_name_en)
    if (!home || !away || home === 'TBD' || away === 'TBD') continue
    if (!groups[grp]) groups[grp] = {}
    if (!groups[grp][home]) groups[grp][home] = { mp:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }
    if (!groups[grp][away]) groups[grp][away] = { mp:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }
    if (g.finished !== 'TRUE' && g.finished !== true) continue
    const hs = parseInt(g.home_score) || 0
    const as = parseInt(g.away_score) || 0
    groups[grp][home].mp++; groups[grp][away].mp++
    groups[grp][home].gf += hs; groups[grp][home].ga += as
    groups[grp][away].gf += as; groups[grp][away].ga += hs
    if      (hs > as) { groups[grp][home].w++; groups[grp][home].pts += 3; groups[grp][away].l++ }
    else if (as > hs) { groups[grp][away].w++; groups[grp][away].pts += 3; groups[grp][home].l++ }
    else              { groups[grp][home].d++; groups[grp][home].pts++;     groups[grp][away].d++; groups[grp][away].pts++ }
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, teams]) => ({
      id,
      teams: Object.entries(teams).map(([name, s]) => ({ name, ...s, gd: s.gf - s.ga })),
    }))
}

// ── Cache ─────────────────────────────────────────────────────────────────────
let cache = { data: null, ts: 0 }
const TTL = 60_000

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const token = process.env.WC26_TOKEN
  if (!token) return res.status(500).json({ error: 'WC26_TOKEN not configured' })

  if (cache.data && Date.now() - cache.ts < TTL) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(cache.data)
  }

  try {
    const r    = await fetch(`${BASE}/get/games`, { headers: { Authorization: `Bearer ${token}` } })
    const json = await r.json()
    const games = json?.games ?? (Array.isArray(json) ? json : [])

    // Sort all games chronologically so upcoming[0] is always the next match
    const parseLocalDate = d => {
      if (!d) return 0
      const [datePart, timePart = '0:00'] = d.split(' ')
      const parts = datePart.split('/')
      const mo = parseInt(parts[0]), day = parseInt(parts[1]), yr = parts[2] ? parseInt(parts[2]) : 2026
      const [h, m] = timePart.split(':').map(Number)
      return new Date(yr, mo - 1, day, h, m).getTime()
    }
    games.sort((a, b) => parseLocalDate(a.local_date) - parseLocalDate(b.local_date))

    const matches  = games.filter(g => g.type === 'group').map(mapGame)
    const standings = computeStandings(games)

    // Knockout rounds
    const byStage = {}
    for (const g of games.filter(g => g.type !== 'group')) {
      const m = mapGame(g)
      if (!m.stage) continue
      if (!byStage[m.stage]) byStage[m.stage] = []
      byStage[m.stage].push(m)
    }
    const KEY_TO_LABEL = Object.fromEntries(Object.values(STAGE_BY_TYPE).map(v => [v.key, v.label]))
    const rounds = STAGE_ORDER
      .filter(s => byStage[s])
      .map(s => ({ stage: s, label: KEY_TO_LABEL[s] ?? s, matches: byStage[s] }))

    const result = { matches, standings, rounds }
    cache = { data: result, ts: Date.now() }
    res.setHeader('X-Cache', 'MISS')
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
