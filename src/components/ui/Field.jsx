import clsx from 'clsx'

export function Field({ label, hint, children, className }) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-faint">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'h-12 w-full rounded-2xl bg-white/[0.07] px-4 text-[16px] text-ink ring-1 ring-white/10 ring-inset placeholder:text-faint outline-none transition focus:bg-white/[0.1] focus:ring-accent/70 tabular'
