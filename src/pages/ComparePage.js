import React, { useContext, useEffect, useState } from 'react'
import Header from '../components/common/Header'
import SelectCoins from '../components/Compare/SelectCoins.js'
import SelectDate from '../components/Coin/Select'
import getCoinDetails from '../functions/getCoinDetails.js'
import getCoinPrices from '../functions/getCoinPrices.js'
import Loader from '../components/common/Loader/index.js'
import List from '../components/Dashboard/List/index.js'
import CoinInfo from '../components/Coin/CoinInfo/index.js'
import settingChartData from '../functions/settingChartData.js'
import LineChart from '../components/Coin/LineChart/index.js'
import PriceType from '../components/Coin/PriceType/index.js'
import coinsContext from '../context/coinsContext.js'

const ComparePage = () => {
  const {currency} = useContext(coinsContext)
  const [crypto1, setCrypto1] = useState("bitcoin")
  const [crypto2, setCrypto2] = useState("ethereum")
  const [crypto1Data, setCrypto1Data] = useState({})
  const [crypto2Data, setCrypto2Data] = useState({})
  const [days, setDays] = useState(7)
  const [isLoading, setLoading] = useState(true)
  const [priceType, setPriceType] = useState("prices")
  const [chartData, setChartData] = useState({})

  useEffect(() => {
    getData()
  }, [currency])

  async function getData() {
    setLoading(true)
    const data1 = await getCoinDetails(crypto1,currency)
    const data2 = await getCoinDetails(crypto2,currency)
    if (data1) {
      setCrypto1Data(data1)
    }
    if (data2) {
      setCrypto2Data(data2)
    }
    if (data1 && data2) {
      const prices1 = await getCoinPrices(crypto1, days, priceType,currency)
      const prices2 = await getCoinPrices(crypto2, days, priceType,currency)
      settingChartData(setChartData, prices1, days, prices2)
      setLoading(false)
    }
  }

  async function handleCoinChange(e, isCoin2) {
    setLoading(true)
    if (isCoin2) {
      setCrypto2(e.target.value)
      setCrypto2Data(await getCoinDetails(e.target.value,currency))
      const prices1 = await getCoinPrices(crypto1, days, priceType,currency)
      const prices2 = await getCoinPrices(e.target.value, days, priceType,currency)
      settingChartData(setChartData, prices1, days, prices2)
    }
    else {
      setCrypto1(e.target.value)
      setCrypto1Data(await getCoinDetails(e.target.value,currency))
      const prices1 = await getCoinPrices(e.target.value, days, priceType,currency)
      const prices2 = await getCoinPrices(crypto2, days, priceType,currency)
      settingChartData(setChartData, prices1, days, prices2)
    }
    setLoading(false)
  }

  async function handleDaysChange(e) {
    setLoading(true)
    const prices1 = await getCoinPrices(crypto1, e.target.value, priceType,currency)
    const prices2 = await getCoinPrices(crypto2, e.target.value, priceType,currency)
    if(prices1 && prices2) settingChartData(setChartData, prices1, days, prices2,currency)
    setDays(e.target.value)
    setLoading(false)
  }
  async function handlePriceTypeChange(e) {
    setLoading(true)
    const prices1 = await getCoinPrices(crypto1, days, e.target.value,currency)
    const prices2 = await getCoinPrices(crypto2, days, e.target.value,currency)
    settingChartData(setChartData, prices1, days, prices2,currency)
    setPriceType(e.target.value)
    setLoading(false)
  }

  console.log(chartData)
  return (
    <div>
      <Header />
      <div className='coin-controls container'>
        <SelectCoins crypto1={crypto1} crypto2={crypto2} handleCoinChange={handleCoinChange} />
      </div>
      {
        isLoading ?
          <Loader />
          :
          <div className='container'>
            <div className="grey-wrapper" style={{ marginBottom: "1rem" }} >
              <List coin={crypto1Data} />
            </div>
            <div className="grey-wrapper">
              <List coin={crypto2Data} />
            </div>
            <div className="grey-wrapper p1">
                <SelectDate days={days} handleDaysChange={handleDaysChange} />
                <PriceType priceType={priceType} handlePriceTypeChange={handlePriceTypeChange} />
                <LineChart chartData={chartData} multiAxis={true} priceType={priceType} />
            </div>
            <div className="grey-wrapper">
              <CoinInfo heading={crypto1Data.name} description={crypto1Data.desc} />
            </div>
            <div className="grey-wrapper">

              <CoinInfo heading={crypto2Data.name} description={crypto2Data.desc} />
            </div>
          </div>
      }
    </div>
  )
}

export default ComparePage