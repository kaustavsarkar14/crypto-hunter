import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import { useParams } from 'react-router-dom'
import { modifyCoinObject } from '../functions/modifyCoinObject'
import List from '../components/Dashboard/List'
import CoinInfo from '../components/Coin/CoinInfo'
import Loader from '../components/common/Loader'
import getCoinDetails from '../functions/getCoinDetails'
import getCoinPrices from '../functions/getCoinPrices'
import LineChart from '../components/Coin/LineChart'
import convertDate from '../functions/convertDate'
import SelectData from '../components/Coin/Select'

const CoinDetailsPage = () => {
    const { id } = useParams()
    const [coin, setCoin] = useState({})
    const [isLoading, setLoading] = useState(true)
    const [days, setDays] = useState(30)
    const [chartData, setChartData] = useState({})
    useEffect(() => {
        getData()
    }, [days])
    async function getData() {
        setCoin(await getCoinDetails(id))
        const prices = await getCoinPrices(id, days)
        console.log(prices)
        setChartData({
            labels: prices.map(item => convertDate(item[0], days)),
            datasets: [{
                label: coin.name + " price",
                data: prices.map(item => item[1]),
                fill: false,
                borderColor: '#3a80e9',
                backgroundColor: 'rgba(58, 128, 233, 1)',
                tension: 0.25,
                borderWidth: 2,
                pointRadius: 0,
            }]
        })
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
                        <div className="grey-wrapper">
                            <List coin={coin} />
                        </div>
                        <div className="grey-wrapper">
                            <SelectData
                            data={days}
                            setData={setDays}
                            options={[{value:7, text:"7 days"},{value:30, text:"30 days"},{value:365, text:"1yr"},{value:"max", text:"All time"}]}
                            label={"Days"}
                            />
                            <LineChart chartData={chartData} />
                        </div>
                        <CoinInfo heading={coin.name} description={coin.desc} />
                    </>
            }
        </div>
    )
}

export default CoinDetailsPage