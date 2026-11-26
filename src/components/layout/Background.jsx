/** Slowly drifting colour orbs; the glass surfaces above refract them. */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas">
      <div className="orb top-[-12%] left-[-8%] size-[55vmax] bg-[#0a84ff]/45" />
      <div className="orb top-[20%] right-[-18%] size-[48vmax] bg-[#bf5af2]/35 [animation-delay:-8s]" />
      <div className="orb bottom-[-25%] left-[18%] size-[50vmax] bg-[#30d158]/20 [animation-delay:-16s]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgb(5_6_10/0.65)_70%)]" />
      {/* film grain keeps large gradients from banding */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence baseFrequency=%220.85%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
    </div>
  )
}
