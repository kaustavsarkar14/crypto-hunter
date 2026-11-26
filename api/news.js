import { getHeadlines } from '../worker/src/news.js'
import { json, originAllowed } from './_lib/http.js'

/** Aggregated crypto headlines. Vercel's CDN caches the response for 5 minutes for every visitor. */
export async function GET(request) {
  if (!originAllowed(request)) return json({ error: 'Origin not allowed' }, 403)
  const limit = Math.min(20, Math.max(1, Number(new URL(request.url).searchParams.get('limit')) || 12))
  const articles = await getHeadlines(limit)
  if (!articles.length) return json({ error: 'News feeds unavailable' }, 502)
  return json(
    { articles, updatedAt: new Date().toISOString() },
    200,
    { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  )
}
