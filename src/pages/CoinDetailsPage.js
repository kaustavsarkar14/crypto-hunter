import React, { useEffect, useState } from 'react'
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

const CoinDetailsPage = () => {
    const { id } = useParams()
    const [coin, setCoin] = useState({})
    const [isLoading, setLoading] = useState(true)
    const [days, setDays] = useState(30)
    const [chartData, setChartData] = useState({})
    const [priceType, setPriceType] = useState('prices');

    useEffect(() => {
        getData()
    }, [days, priceType])
    
    async function getData() {
        setCoin(await getCoinDetails(id))
        const prices = await getCoinPrices(id, days, priceType)
        settingChartData(setChartData, prices, days)
        setLoading(false)
    }
    function handleDaysChange(e){
        setDays(e.target.value)
    }
    function handlePriceTypeChange(e){
        setPriceType(e.target.value)
    }
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
                        <div className="grey-wrapper">
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