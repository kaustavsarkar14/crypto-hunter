import { ColorType, CrosshairMode, LineStyle } from 'lightweight-charts'

export function baseOptions({ timeVisible = false, priceFormatter } = {}) {
  return {
    autoSize: true,
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: 'rgba(235,235,245,0.55)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter Variable", system-ui, sans-serif',
      fontSize: 11,
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { color: 'rgba(255,255,255,0.05)' },
    },
    rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.12, bottom: 0.08 } },
    timeScale: { borderVisible: false, timeVisible, secondsVisible: false, fixLeftEdge: true, fixRightEdge: true },
    crosshair: {
      mode: CrosshairMode.Magnet,
      vertLine: { color: 'rgba(255,255,255,0.25)', style: LineStyle.Solid, width: 1, labelBackgroundColor: '#2c2c34' },
      horzLine: { color: 'rgba(255,255,255,0.18)', style: LineStyle.Dashed, labelBackgroundColor: '#2c2c34' },
    },
    localization: priceFormatter ? { priceFormatter } : undefined,
    handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true },
    handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
  }
}

/** CoinGecko returns ms timestamps, sometimes duplicated — charts need strictly ascending seconds. */
export function toSeries(points, map) {
  const out = []
  let last = -Infinity
  if (!Array.isArray(points)) return out
  for (const p of points) {
    const time = Math.floor(p[0] / 1000)
    if (time <= last) continue
    last = time
    out.push({ time, ...map(p) })
  }
  return out
}

export const SERIES_COLORS = ['#0a84ff', '#bf5af2', '#ff9f0a']
