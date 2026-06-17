export default async function handler(req, res) {
  const path = req.query.path

  if (!path) {
    return res.status(400).json({ error: 'Missing path' })
  }

  // Use API_KEY in production (Vercel env vars), fall back to VITE_API_KEY in dev
  const key = process.env.API_KEY || process.env.VITE_API_KEY

  if (!key) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const response = await fetch(`https://api.football-data.org${path}`, {
    headers: { 'X-Auth-Token': key },
  })

  const data = await response.json()
  res.status(response.status).json(data)
}
