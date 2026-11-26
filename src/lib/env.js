/**
 * The Worker (copilot + news) is available in development (Vite proxies /api to it)
 * and in production once VITE_API_URL points at the deployed Worker. Until then,
 * features that need it hide themselves instead of showing broken UI.
 */
export const HAS_API = Boolean(import.meta.env.VITE_API_URL) || import.meta.env.DEV
