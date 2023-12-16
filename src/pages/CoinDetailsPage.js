import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import { useParams } from 'react-router-dom'
import { modifyCoinObject } from '../functions/modifyCoinObject'
import List from '../components/Dashboard/List'
import CoinInfo from '../components/Coin/CoinInfo'
import Loader from '../components/common/Loader'
import getCoinDetails from '../functions/getCoinDetails'
import getCoinPrices from '../functions/getCoinPrices'

const CoinDetailsPage = () => {
    const { id } = useParams()
    const [coin, setCoin] = useState({})
    const [isLoading, setLoading] = useState(true)
    const [days, setDays ] = useState(7)
    useEffect(() => {
        getData()
    }, [])
    async function getData(){
        setCoin(await getCoinDetails(id))
        const prices = await getCoinPrices(id, days)
        console.log(prices)
        setLoading(false)
    }
    return (
        <div>
            <Header />
            {
                isLoading?
                <Loader/>
                :
                <>
                <div className="grey-wrapper">
                    <List coin={coin} />
                </div>
                <CoinInfo heading={coin.name} description={coin.desc} />
                </>
            }
        </div>
    )
}

export default CoinDetailsPage