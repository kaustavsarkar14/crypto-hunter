import clsx from 'clsx'

/**
 * Glass surface. `material="card"` is the cheap no-backdrop-filter variant for
 * repeated items; `interactive` adds a pointer-tracking specular highlight.
 */
export function Glass({ as: Comp = 'div', material = 'card', interactive = false, className, onPointerMove, ...rest }) {
  const handleMove = interactive
    ? (e) => {
        const el = e.currentTarget
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
        onPointerMove?.(e)
      }
    : onPointerMove
  return (
    <Comp
      onPointerMove={handleMove}
      className={clsx(
        material === 'card' && 'glass-card',
        material === 'glass' && 'glass',
        material === 'strong' && 'glass-strong',
        interactive && 'glass-interactive',
        'rounded-[28px]',
        className,
      )}
      {...rest}
    />
  )
}
