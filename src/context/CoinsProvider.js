import { useEffect, useState } from "react"
import coinsContext from "./coinsContext"

const CoinsProvider = ({ children }) => {
    const [coins, setCoins] = useState([])
    const [search, setSearch] = useState('')
    const [isLoading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [paginatedCoins, setPaginatedCoins] = useState([])
    const [isSearching, setSearching] = useState(false)

    const handlePageChange = (e, value) => {
        setSearch('')
        setPage(value)
        setPaginatedCoins(coins.slice((value-1)*10,(value-1)*10+10))
        setSearching(false)
    }
    const onSearchChange = (inputValue) => {
        setSearch(inputValue)
        setSearching(true)
    }
    const filteredCoins = coins.filter(coin => coin.name.toLowerCase().includes(search.toLowerCase()) || coin.symbol.toLowerCase().includes(search.toLowerCase()))
    useEffect(()=>{
        if(search=='') setSearching(false)
    },[search])
    useEffect(() => {
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en')
            .then(data => data.json())
            .then(data => {
                setCoins(data)
                setPaginatedCoins(data.slice(0,10))
                setLoading(false)
            })
            .catch(err => console.log(err))
    }, [])


    return <coinsContext.Provider value={{ filteredCoins, search, setSearch, onSearchChange, isLoading, setLoading , page, handlePageChange,paginatedCoins, isSearching}}>
        {children}
    </coinsContext.Provider>
}


export default CoinsProvider