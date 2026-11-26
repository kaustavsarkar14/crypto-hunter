// Free, keyless news: public RSS feeds from major crypto outlets, edge-cached for 5 minutes.
const FEEDS = [
  { source: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { source: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
  { source: 'Decrypt', url: 'https://decrypt.co/feed' },
  { source: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/.rss/full/' },
]

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

export function cleanText(s = '') {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}

function toIso(s) {
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** Minimal RSS parser — feeds are well-formed enough that a DOM parser isn't needed in the Worker. */
const httpUrl = (u) => (u && /^https:\/\//.test(u) ? u : null)

/** Cover image from the usual RSS spots: media:content, media:thumbnail, image enclosure, first <img>. */
export function extractImage(item) {
  const attr = (re) => item.match(re)?.[1]?.replace(/&amp;/g, '&')
  return (
    httpUrl(attr(/<media:content[^>]*\burl="([^"]+)"/)) ??
    httpUrl(attr(/<media:thumbnail[^>]*\burl="([^"]+)"/)) ??
    httpUrl(attr(/<enclosure[^>]*\burl="([^"]+)"[^>]*type="image/)) ??
    httpUrl(attr(/<img[^>]*\bsrc="([^"]+)"/))
  )
}

export function parseRss(xml, source) {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? []
  const field = (item, tag) => item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]
  return items.map((item) => ({
    source,
    title: cleanText(field(item, 'title')),
    url: cleanText(field(item, 'link')),
    published: toIso(cleanText(field(item, 'pubDate'))),
    summary: cleanText(field(item, 'description')).slice(0, 160),
    image: extractImage(item),
  })).filter((i) => i.title && /^https?:\/\//.test(i.url))
}

export function filterNews(items, query, limit) {
  const sorted = [...items].sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''))
  const terms = (query ?? '').toLowerCase().split(/[\s,]+/).filter((t) => t.length > 1)
  if (!terms.length) return { matched: true, items: sorted.slice(0, limit) }
  const hits = sorted.filter((i) => {
    const text = `${i.title} ${i.summary}`.toLowerCase()
    return terms.some((t) => new RegExp(`\\b${t.replace(/[^a-z0-9]/g, '')}\\b`).test(text))
  })
  return hits.length ? { matched: true, items: hits.slice(0, limit) } : { matched: false, items: sorted.slice(0, limit) }
}

async function fetchAllFeeds() {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ source, url }) => {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'CryptoHunter/2.0 (news reader; Cloudflare Worker)' },
        cf: { cacheTtl: 300, cacheEverything: true },
      })
      if (!res.ok) throw new Error(`${source} ${res.status}`)
      return parseRss(await res.text(), source)
    }),
  )
  const seen = new Set()
  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((i) => {
      const key = i.title.toLowerCase()
      return seen.has(key) ? false : seen.add(key)
    })
}

/** Newest first, but no more than `perSource` in a row from one outlet, so the carousel stays varied. */
export function latestMixed(items, limit, perSource = 3) {
  const sorted = [...items].sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''))
  const counts = {}
  const picked = []
  for (const i of sorted) {
    if ((counts[i.source] ?? 0) >= perSource) continue
    counts[i.source] = (counts[i.source] ?? 0) + 1
    picked.push(i)
    if (picked.length === limit) break
  }
  return picked
}

/** Headlines for the home-page carousel (with images). */
export async function getHeadlines(limit = 12) {
  return latestMixed(await fetchAllFeeds(), limit)
}

/** Keyword search for the copilot (no images: they would only burn tokens). */
export async function getNews({ query, limit = 6 }) {
  const items = (await fetchAllFeeds()).map(({ image, ...rest }) => rest)
  const { matched, items: picked } = filterNews(items, query, limit)
  return {
    query: query ?? null,
    note: matched ? undefined : `No recent headlines mention "${query}"; showing the latest general crypto news instead.`,
    articles: picked,
  }
}
