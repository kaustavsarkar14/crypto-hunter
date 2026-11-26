import { describe, expect, it } from 'vitest'
import { createCitationRewriter } from './citations.js'

describe('citation rewriter', () => {
  const make = () => {
    const r = createCitationRewriter()
    r.addArticles([
      { source: 'CoinDesk', url: 'https://coindesk.com/a' },
      { source: 'CoinDesk', url: 'https://coindesk.com/b' },
      { source: 'Cointelegraph', url: 'https://cointelegraph.com/c' },
    ])
    return r
  }

  it('turns 【Source】 markers into links to the article read', () => {
    expect(make().push('Miners sold 【CoinDesk】.')).toBe('Miners sold [CoinDesk](https://coindesk.com/a).')
    expect(make().push('x 【Cointelegraph†L3-L9】')).toBe('x [Cointelegraph](https://cointelegraph.com/c)')
  })

  it('handles markers split across stream chunks', () => {
    const r = make()
    expect(r.push('ETF inflows 【Coin')).toBe('ETF inflows')
    expect(r.push('Desk】 rose.')).toBe(' [CoinDesk](https://coindesk.com/a) rose.')
  })

  it('drops unknown sources and dangling markers', () => {
    const r = make()
    expect(r.push('a 【Reuters】 b')).toBe('a b')
    expect(r.push('end 【Coin')).toBe('end')
    expect(r.flush()).toBe('')
  })
})
