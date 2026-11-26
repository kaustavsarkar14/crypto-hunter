/**
 * gpt-oss was trained to cite as 【Source】 (sometimes 【Source†L12】). We rewrite those
 * markers into markdown links pointing at the article the model actually read.
 * Works on a stream: a marker split across deltas is held back until it closes.
 */
export function createCitationRewriter() {
  const urls = new Map() // lowercased source name → article url
  let pending = ''

  const linkFor = (inner) => {
    const name = inner.split(/[†:|]/)[0].trim()
    const url = urls.get(name.toLowerCase())
    return url ? ` [${name}](${url})` : '' // unknown source → drop the marker rather than show junk
  }

  return {
    /** Register articles returned by get_crypto_news (first article per source wins). */
    addArticles(articles = []) {
      for (const a of articles) if (!urls.has(a.source.toLowerCase())) urls.set(a.source.toLowerCase(), a.url)
    },
    push(delta) {
      let text = pending + delta
      pending = ''
      const open = text.lastIndexOf('【')
      if (open !== -1 && text.indexOf('】', open) === -1) {
        let cut = open
        while (cut > 0 && /\s/.test(text[cut - 1])) cut-- // hold the space before it too
        pending = text.slice(cut)
        text = text.slice(0, cut)
      }
      return text.replace(/\s?【([^】]*)】/g, (_, inner) => linkFor(inner))
    },
    flush() {
      const rest = pending
      pending = ''
      return rest.replace(/\s*【[^】]*$/, '')
    },
  }
}
