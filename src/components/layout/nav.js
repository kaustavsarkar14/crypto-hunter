import { ArrowLeftRight, Bell, ChartCandlestick, GitCompareArrows, Star, Wallet } from 'lucide-react'

export const NAV = [
  { to: '/markets', label: 'Markets', icon: ChartCandlestick },
  { to: '/compare', label: 'Compare', icon: GitCompareArrows },
  { to: '/convert', label: 'Convert', icon: ArrowLeftRight },
  { to: '/portfolio', label: 'Portfolio', icon: Wallet },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
]
