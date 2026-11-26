import clsx from 'clsx'

/** `vt` gives the logo a view-transition name so it morphs between pages. */
export function CoinLogo({ src, alt = '', id, vt = false, className }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={vt && id ? { viewTransitionName: `coin-${id}` } : undefined}
      className={clsx('shrink-0 rounded-full bg-white/5 object-cover', className)}
    />
  )
}
