import React, { useContext, useEffect, useState } from 'react'
import Header from '../components/common/Header'
import { useParams } from 'react-router-dom'
import List from '../components/Dashboard/List'
import CoinInfo from '../components/Coin/CoinInfo'
import Loader from '../components/common/Loader'
import getCoinDetails from '../functions/getCoinDetails'
import getCoinPrices from '../functions/getCoinPrices'
import LineChart from '../components/Coin/LineChart'
import SelectDate from '../components/Coin/Select'
import settingChartData from '../functions/settingChartData'
import PriceType from '../components/Coin/PriceType'
import coinsContext from '../context/coinsContext'

const CoinDetailsPage = () => {
    const { id } = useParams()
    const {currency} = useContext(coinsContext)
    const [coin, setCoin] = useState({})
    const [isLoading, setLoading] = useState(true)
    const [days, setDays] = useState(30)
    const [chartData, setChartData] = useState({})
    const [priceType, setPriceType] = useState('prices');

    useEffect(() => {
        getData()
    }, [days, priceType, currency])
    
    async function getData() {
        setCoin(await getCoinDetails(id, currency))
        const prices = await getCoinPrices(id, days, priceType, currency)
        settingChartData(setChartData, prices, days)
        setLoading(false)
    }
    function handleDaysChange(e){
        setDays(e.target.value)
    }
    function handlePriceTypeChange(e){
        setPriceType(e.target.value)
    }
    console.log("coinpage data",coin)
    return (
        <div>
            <Header />
            {
                isLoading ?
                    <Loader />
                    :
                    <div className='container'>
                        <div className="grey-wrapper">
                            <List coin={coin} />
                        </div>
                        <div className="grey-wrapper p1">
                            <SelectDate days={days} handleDaysChange={handleDaysChange}/>
                            <PriceType priceType={priceType} handlePriceTypeChange={handlePriceTypeChange} />
                            <LineChart chartData={chartData} />
                        </div>
                        <CoinInfo heading={coin.name} description={coin.desc} />
                    </div>
            }
        </div>
    )
}

export default CoinDetailsPage