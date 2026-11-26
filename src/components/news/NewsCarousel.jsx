import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Newspaper, RefreshCw } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNews } from '../../hooks/queries'
import { fadeUp } from '../../lib/motion'
import { timeAgo } from '../../lib/time'
import { Skeleton } from '../ui/Skeleton'
import { NewsCard } from './NewsCard'

const INTERVAL = 6500 // ms per slide
const RESUME_AFTER = 8000 // ms after the user last swiped/scrolled

/**
 * Auto-advancing, swipeable news carousel.
 * - Native scroll-snap: momentum swiping on touch, trackpads and keyboards all just work.
 * - Autoplay is driven by the active dot's CSS progress animation: `animationend`
 *   advances the slide, so pausing the animation (hover, focus, touch, off-screen,
 *   hidden tab) pauses autoplay at exactly the same point. No timer drift.
 * - Reduced motion: no autoplay.
 */
export function NewsCarousel() {
  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useNews()
  const articles = data?.articles ?? []
  const reduceMotion = useReducedMotion()
  const section = useRef(null)
  const track = useRef(null)
  const lastInteraction = useRef(0)
  const [index, setIndex] = useState(0)
  const [stops, setStops] = useState(0) // how many snap positions are reachable
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const [onScreen, setOnScreen] = useState(true)
  const [, tick] = useState(0) // re-render "updated 3m ago"

  const paused = hovered || focused || interacting || !onScreen

  const offsets = useCallback(() => {
    const el = track.current
    if (!el?.children.length) return []
    const start = el.children[0].offsetLeft
    const max = el.scrollWidth - el.clientWidth
    return [...el.children].map((c) => c.offsetLeft - start).filter((x) => x <= max + 4)
  }, [])

  const goTo = useCallback(
    (i) => {
      const el = track.current
      const list = offsets()
      if (!el || !list.length) return
      const target = ((i % list.length) + list.length) % list.length
      el.scrollTo({ left: list[target], behavior: reduceMotion ? 'auto' : 'smooth' })
    },
    [offsets, reduceMotion],
  )

  // Track which slide is under the snap point
  const onScroll = useCallback(() => {
    const el = track.current
    if (!el) return
    const list = offsets()
    let best = 0
    list.forEach((x, i) => {
      if (Math.abs(x - el.scrollLeft) < Math.abs(list[best] - el.scrollLeft)) best = i
    })
    setIndex(best)
  }, [offsets])

  // Reachable stops change with viewport width (1 card per view on phones, 2 on desktop)
  useEffect(() => {
    const el = track.current
    if (!el) return
    const update = () => setStops(offsets().length)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [articles.length, offsets])

  // Pause when scrolled out of view or the tab is hidden
  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting && !document.hidden), { threshold: 0.35 })
    io.observe(el)
    const onVis = () => setOnScreen(!document.hidden && el.getBoundingClientRect().top < window.innerHeight)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [articles.length])

  // Manual swipe/scroll pauses autoplay for a while
  useEffect(() => {
    if (!interacting) return
    const t = setInterval(() => {
      if (Date.now() - lastInteraction.current > RESUME_AFTER) setInteracting(false)
    }, 1000)
    return () => clearInterval(t)
  }, [interacting])

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  const markInteraction = () => {
    lastInteraction.current = Date.now()
    setInteracting(true)
  }

  const failed = isError && !articles.length

  return (
    <motion.section
      ref={section}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className="mt-16"
      aria-roledescription="carousel"
      aria-label="Latest crypto news"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="size-5 text-teal" />
            <h2 className="text-[26px] font-bold tracking-[-0.02em] md:text-[30px]">Latest news</h2>
          </div>
          <p className="mt-1 text-[14px] text-muted">
            CoinDesk · Cointelegraph · Decrypt · Bitcoin Magazine
            {dataUpdatedAt > 0 && <span className="text-faint"> · updated {timeAgo(dataUpdatedAt)}</span>}
          </p>
        </div>
        <div className={clsx('flex gap-2', failed && 'invisible')}>
          {[
            [ChevronLeft, 'Previous story', -1],
            [ChevronRight, 'Next story', 1],
          ].map(([Icon, label, dir]) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                markInteraction()
                goTo(index + dir)
              }}
              aria-label={label}
              className="glass grid size-10 place-items-center rounded-full text-ink hover:bg-white/15"
            >
              <Icon className="size-5" />
            </motion.button>
          ))}
        </div>
      </div>

      <div
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      >
        <div
          ref={track}
          onScroll={onScroll}
          onPointerDown={markInteraction}
          onWheel={(e) => Math.abs(e.deltaX) > Math.abs(e.deltaY) && markInteraction()}
          aria-live={paused || reduceMotion ? 'polite' : 'off'}
          className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 md:mx-0 md:scroll-px-0 md:px-0"
        >
          {failed ? (
            <div className="glass-card flex h-[220px] w-full flex-col items-center justify-center gap-3 rounded-[28px] text-center">
              <p className="text-[16px] font-semibold">Couldn't load the latest news</p>
              <p className="max-w-sm text-[14px] text-muted">The news service didn't respond. Is the Worker running? Start it with{' '}
                <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-[13px] text-ink">npm run dev:all</code></p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[14px] font-medium ring-1 ring-white/15 hover:bg-white/15 disabled:opacity-60"
              >
                <RefreshCw className={clsx('size-4', isFetching && 'animate-spin')} /> {isFetching ? 'Retrying…' : 'Retry'}
              </motion.button>
            </div>
          ) : !articles.length
            ? Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-[380px] w-[86%] shrink-0 snap-start rounded-[28px] sm:w-[62%] lg:w-[calc(50%-8px)]" />
              ))
            : articles.map((a, i) => (
                <div key={a.url} className="h-[380px] w-[86%] shrink-0 snap-start sm:w-[62%] lg:w-[calc(50%-8px)]">
                  <NewsCard article={a} index={i} total={articles.length} active={i === index} />
                </div>
              ))}
        </div>

        {stops > 1 && (
          <div className="mt-5 flex items-center justify-center gap-1.5" role="tablist" aria-label="Choose story">
            {Array.from({ length: stops }, (_, i) => {
              const active = i === index
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={active}
                  aria-label={`Story ${i + 1}`}
                  onClick={() => {
                    markInteraction()
                    goTo(i)
                  }}
                  className={clsx(
                    'relative h-2 overflow-hidden rounded-full bg-white/20 transition-[width,background-color] duration-500 ease-[var(--ease-ios)] hover:bg-white/35',
                    active ? 'w-8' : 'w-2',
                  )}
                >
                  {active && !reduceMotion && (
                    <span
                      key={index}
                      onAnimationEnd={() => goTo(index + 1)}
                      style={{ animationDuration: `${INTERVAL}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                      className="carousel-progress absolute inset-0 rounded-full bg-white"
                    />
                  )}
                  {active && reduceMotion && <span className="absolute inset-0 rounded-full bg-white" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </motion.section>
  )
}
