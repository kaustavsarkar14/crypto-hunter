import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Navigate, createBrowserRouter, useRouteError } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AppShell } from './components/layout/AppShell'
import { ErrorState } from './components/ui/ErrorState'
import './index.css'
import Home from './pages/Home'
import Markets from './pages/Markets'

function RouteError() {
  const error = useRouteError()
  console.error(error)
  return <ErrorState error={{ message: 'This page hit an unexpected error.' }} onRetry={() => window.location.reload()} />
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Don't retry 404s; back off harder on CoinGecko's 429s.
      retry: (count, err) => err?.status !== 404 && count < 3,
      retryDelay: (attempt, err) => (err?.status === 429 ? 15_000 : Math.min(1000 * 2 ** attempt, 10_000)),
    },
  },
})

// Heavier pages (charts) are code-split; the router waits for the chunk
// before committing, so view transitions never flash a spinner.
const lazy = (load) => async () => ({ Component: (await load()).default })

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        // Pathless boundary: a crash in one page renders inside the shell, nav still usable.
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Home /> },
          { path: 'markets', element: <Markets /> },
          { path: 'dashboard', element: <Navigate to="/markets" replace /> },
          { path: 'coin/:id', lazy: lazy(() => import('./pages/CoinDetail')) },
          { path: 'compare', lazy: lazy(() => import('./pages/Compare')) },
          { path: 'convert', lazy: lazy(() => import('./pages/Convert')) },
          { path: 'watchlist', lazy: lazy(() => import('./pages/Watchlist')) },
          { path: 'portfolio', lazy: lazy(() => import('./pages/Portfolio')) },
          { path: 'alerts', lazy: lazy(() => import('./pages/Alerts')) },
          { path: '*', lazy: lazy(() => import('./pages/NotFound')) },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
