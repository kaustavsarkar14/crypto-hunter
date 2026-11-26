import { Drawer } from 'vaul'

/**
 * iOS-style bottom sheet: drag to dismiss. `nested` stacks it on top of a parent
 * sheet (the parent scales back, like iOS) instead of fighting it for focus.
 */
export function Sheet({ open, onOpenChange, title, description, nested = false, children }) {
  const Root = nested ? Drawer.NestedRoot : Drawer.Root
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Drawer.Content className="glass-strong fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-lg flex-col rounded-t-[32px] pb-[env(safe-area-inset-bottom)] outline-none">
          <Drawer.Handle className="mt-2.5 !h-1.5 !w-10 !bg-white/25" />
          <div className="px-6 pt-4 pb-2">
            <Drawer.Title className="text-[20px] font-semibold tracking-tight">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-1 text-[14px] text-muted">{description}</Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">{title}</Drawer.Description>
            )}
          </div>
          <div className="no-scrollbar overflow-y-auto px-6 pt-2 pb-6">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Root>
  )
}
