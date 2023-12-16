import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import { useParams } from 'react-router-dom'
import { modifyCoinObject } from '../functions/modifyCoinObject'
import List from '../components/Dashboard/List'
import CoinInfo from '../components/Coin/CoinInfo'
import Loader from '../components/common/Loader'

const CoinDetailsPage = () => {
    const { id } = useParams()
    const [coin, setCoin] = useState({})
    const [isLoading, setLoading] = useState(true)
    useEffect(() => {
        fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
            .then(data => data.json())
            .then(data => {
                setCoin(modifyCoinObject(data))
                setLoading(false)
            })
            .catch(err => console.log(err))
    }, [])
    console.log(coin)
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