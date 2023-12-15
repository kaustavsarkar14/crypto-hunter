import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import Tabs from '../components/Dashboard/Tabs'
import Search from '../components/Dashboard/Search'

const Dashboard = () => {
    const [coins, setCoins] = useState([])
    const [search, setSearch] = useState('')

    const onSearchChange=(inputValue)=>{
        setSearch(inputValue)
    }
    const filteredCoins = coins.filter(coin=>coin.name.toLowerCase().includes(search) || coin.symbol.toLowerCase().includes(search))
    useEffect(()=>{
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en')
        .then(data=>data.json())
        .then(data=>setCoins(data))
        .catch(err=>console.log(err))
    },[])
    return (
        <div>
            <Header />
            <Search search={search} onSearchChange={onSearchChange} />
            <Tabs coins={filteredCoins} setSearch={setSearch}  />
        </div>
    )
}

export default Dashboard