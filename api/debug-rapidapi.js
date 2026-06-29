export default async function handler(req, res) {
  const key = process.env.RAPIDAPI_KEY
  if (!key) return res.status(500).json({ error: 'RAPIDAPI_KEY not set' })

  const headers = {
    'X-RapidAPI-Key':  key.trim(),
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
  }

  // Search for World Cup leagues to find the right ID
  const r = await fetch('https://api-football-v1.p.rapidapi.com/v3/leagues?name=World Cup&type=Cup', { headers })
  const json = await r.json()
  res.status(200).json(json)
}
