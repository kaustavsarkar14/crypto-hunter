import React, { useContext, useState } from 'react'
import Header from '../components/common/Header'
import coinsContext from '../context/coinsContext'
import Loader from '../components/common/Loader'
import Grid from '../components/Dashboard/Grid'

const WatchList = () => {
    const { coins, isLoading } = useContext(coinsContext)
    const starredCoinsIds = JSON.parse(localStorage.getItem('starred')) || []
    const starredCoins = coins.filter(coin => starredCoinsIds.includes(coin.id))
    console.log(starredCoins)
    return (
        <div>
            <Header />
            {
                isLoading ?
                    <Loader />
                    :
                    <div className="grid-flex">
                        {
                            starredCoins.map((coin) => <Grid coin={coin} />)
                        }
                    </div>
            }
        </div>
    )
}

export default WatchList