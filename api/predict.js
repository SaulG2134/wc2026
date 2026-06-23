// Fetch WC squads and return attacking/midfield players for a team name
async function getSquadPlayers(teamName, apiKey) {
  try {
    const r = await fetch('https://api.football-data.org/v4/competitions/WC/teams', {
      headers: { 'X-Auth-Token': apiKey },
    })
    if (!r.ok) return null
    const data = await r.json()
    const team = data.teams?.find(t =>
      t.name?.toLowerCase() === teamName.toLowerCase() ||
      t.shortName?.toLowerCase() === teamName.toLowerCase() ||
      t.tla?.toLowerCase() === teamName.toLowerCase()
    )
    if (!team?.squad?.length) return null
    // Keep attackers and midfielders for scorer suggestions
    const scorers = team.squad
      .filter(p => p.position === 'Offence' || p.position === 'Midfield')
      .map(p => p.name)
    return scorers.length ? scorers : team.squad.map(p => p.name)
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { home, away, homeStats, awayStats } = req.body

  if (!home || !away) {
    return res.status(400).json({ error: 'Missing teams' })
  }

  const groqKey = process.env.GROQ_KEY
  if (!groqKey) {
    return res.status(500).json({ error: 'GROQ_KEY not configured' })
  }

  const apiKey = process.env.API_KEY

  // Fetch real squads in parallel
  const [homeSquad, awaySquad] = await Promise.all([
    apiKey ? getSquadPlayers(home, apiKey) : Promise.resolve(null),
    apiKey ? getSquadPlayers(away, apiKey) : Promise.resolve(null),
  ])

  const rosterLine = (squad, team) =>
    squad?.length
      ? `${team} squad (ONLY pick scorers from this list): ${squad.join(', ')}`
      : `${team} squad: (use your knowledge of the official 2026 WC squad)`

  const prompt = `You are a football/soccer analyst for the 2026 FIFA World Cup group stage.

Match: ${home} vs ${away}

Current tournament stats:
- ${home}: ${homeStats.pts} pts, ${homeStats.w}W ${homeStats.d}D ${homeStats.l}L, GD: ${homeStats.gd}, MP: ${homeStats.mp}
- ${away}: ${awayStats.pts} pts, ${awayStats.w}W ${awayStats.d}D ${awayStats.l}L, GD: ${awayStats.gd}, MP: ${awayStats.mp}

Official squad rosters:
- ${rosterLine(homeSquad, home)}
- ${rosterLine(awaySquad, away)}

Based on team quality, current form, and historical performance, respond ONLY with this exact JSON and nothing else:
{
  "score": { "home": <integer>, "away": <integer> },
  "win": { "home": <integer 0-100>, "draw": <integer 0-100>, "away": <integer 0-100> },
  "possession": { "home": <integer 0-100>, "away": <integer 0-100> },
  "scorers": {
    "home": [
      { "name": "<player name>", "chance": <integer 0-100> },
      { "name": "<player name>", "chance": <integer 0-100> }
    ],
    "away": [
      { "name": "<player name>", "chance": <integer 0-100> },
      { "name": "<player name>", "chance": <integer 0-100> }
    ]
  }
}

Rules:
- win.home + win.draw + win.away must equal 100
- possession.home + possession.away must equal 100
- scorers MUST be chosen from the official squad rosters provided above
- score should reflect the win probabilities`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 400,
      }),
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    // Extract JSON from response (model sometimes adds extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0])
    res.status(200).json(parsed)
  } catch (e) {
    console.error('Predict error:', e.message)
    res.status(500).json({ error: 'Prediction failed', detail: e.message })
  }
}
