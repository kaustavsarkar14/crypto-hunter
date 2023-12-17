import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import SelectCoins from '../components/Compare/SelectCoins.js'
import SelectDate from '../components/Coin/Select/index.js'
import getCoinDetails from '../functions/getCoinDetails.js'
import List from '../components/Dashboard/List/index.js'
import Loader from '../components/common/Loader/index.js'
import getCoinPrices from '../functions/getCoinPrices.js'
import CoinInfo from '../components/Coin/CoinInfo/index.js'

const ComparePage = () => {
  const [isLoading, setLoading] = useState(false)
  const [crypt1, setCrypto1] = useState("bitcoin")
  const [crypt2, setCrypto2] = useState("ethereum")
  const [crypto1Data, setCrypto1Data] = useState(null)
  const [crypto2Data, setCrypto2Data] = useState(null)
  const [priceType, setPriceType] = useState('prices')
  const [days, setDays] = useState(7)

  useEffect(() => {
    getData()
  }, [crypt1, crypt2, days])

  async function getData() {
    setLoading(true)
    setCrypto1Data(await getCoinDetails(crypt1))
    setCrypto2Data(await getCoinDetails(crypt2))
    const crypto1Prices = await getCoinPrices(crypt1, days, priceType)
    const crypto2Prices = await getCoinPrices(crypt2, days, priceType)
    console.log(crypto1Prices, crypto2Prices)
    // settingChartData(setChartData, prices, days)
    setLoading(false)
  }
  return (
    <div>
      <Header />
      {
        isLoading ?
          <Loader />
          :
          <>
            <div className="coin-controls container">
              <SelectCoins {...{ crypt1, crypt2, setCrypto1, setCrypto2 }} />
              <SelectDate days={days} setDays={setDays} />
            </div>
            <div className="grey-wrapper" style={{marginBottom:"1.5rem"}} >
              <List coin={crypto1Data} />
            </div>
            <div className="grey-wrapper">
              <List coin={crypto2Data} />
            </div>
          </>
      }
    </div>
  )
}

export default ComparePage