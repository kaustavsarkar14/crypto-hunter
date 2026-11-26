import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { timeAgo } from '../../lib/time'

// Brand-ish tints used for the source pill and the image fallback.
const SOURCE_TINT = {
  CoinDesk: 'from-[#0a84ff] to-[#5e5ce6]',
  Cointelegraph: 'from-[#ff9f0a] to-[#ff375f]',
  Decrypt: 'from-[#30d158] to-[#0a84ff]',
  'Bitcoin Magazine': 'from-[#ff9f0a] to-[#ffd60a]',
}

export function NewsCard({ article, active, index, total }) {
  const [broken, setBroken] = useState(false)
  const tint = SOURCE_TINT[article.source] ?? 'from-accent to-violet'
  const showImage = article.image && !broken

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${article.title} (${article.source})`}
      className="group relative block h-full overflow-hidden rounded-[28px] bg-white/5 ring-1 ring-white/10 ring-inset"
    >
      {showImage ? (
        <img
          src={article.image}
          alt=""
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className={`absolute inset-0 size-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-ios)] group-hover:scale-[1.06] ${active ? 'scale-[1.03]' : 'scale-100'}`}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${tint} opacity-70`}>
          <span className="absolute -right-4 -bottom-10 text-[180px] leading-none font-black text-white/10 select-none">
            {article.source[0]}
          </span>
        </div>
      )}

      {/* Legibility scrim: dark at the bottom where the text sits, clear at the top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/5" />
      <div className="absolute inset-0 rounded-[28px] shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]" />

      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[12px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-md">
          <span className={`size-2 rounded-full bg-gradient-to-br ${tint}`} />
          {article.source}
        </span>
        {article.published && (
          <span className="rounded-full bg-black/35 px-2.5 py-1 text-[12px] font-medium text-white/80 ring-1 ring-white/10 backdrop-blur-md">
            {timeAgo(article.published)}
          </span>
        )}
      </div>

      <div className="absolute inset-x-5 bottom-5">
        <h3 className="line-clamp-3 text-[20px] leading-snug font-semibold tracking-[-0.015em] text-white md:text-[22px]">
          {article.title}
        </h3>
        {article.summary && <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-white/70">{article.summary}</p>}
        <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-white/90 transition-transform duration-300 group-hover:translate-x-0.5">
          Read on {article.source}
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  )
}
