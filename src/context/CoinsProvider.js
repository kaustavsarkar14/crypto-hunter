import { useEffect, useState } from "react";
import coinsContext from "./coinsContext";

const CoinsProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paginatedCoins, setPaginatedCoins] = useState([]);
  const [isSearching, setSearching] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [sortType, setSortType] = useState("popularity");
  const [filteredCoins, setFilteredCoins] = useState([]);
  const handlePageChange = (e, value) => {
    setSearch("");
    setPage(value);
    setPaginatedCoins(coins.slice((value - 1) * 10, (value - 1) * 10 + 10));
    setSearching(false);
  };
  const onSearchChange = (inputValue) => {
    setSearch(inputValue);
    setSearching(true);
  };
  useEffect(() => {
    if (search == "") setSearching(false);
  }, [search]);

  useEffect(() => {
    fetchAllCoins();
    const interval = setInterval(() => {
      fetchAllCoins();
    }, 300000);
    if (currency == "USD") setCurrencySymbol("$");
    if (currency == "INR") setCurrencySymbol("₹");
    if (currency == "EUR") setCurrencySymbol("€");
    return () => clearInterval(interval);
  }, [currency]);

  async function fetchAllCoins() {
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`
    )
      .then((data) => data.json())
      .then((data) => {
        setCoins(data);
        setPaginatedCoins(data.slice(0, 10));
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }
  const sortCoin = (a, b) => {
    if (sortType == "a-z") return a.name.localeCompare(b.name);
    else if (sortType == "z-a") return b.name.localeCompare(a.name);
    else if(sortType == "price-l-h") return a.current_price - b.current_price
    else if(sortType == "price-h-l") return b.current_price - a.current_price
    else if(sortType == "change-h-l") return a.price_change_24h - b.price_change_24h
    else if(sortType == "change-l-h") return b.price_change_24h - a.price_change_24h
    else return a.market_cap_rank - b.market_cap_rank
  };
  useEffect(() => {
    setPaginatedCoins(coins.sort(sortCoin));
    setFilteredCoins(
      coins
        .filter(
          (coin) =>
            coin.name.toLowerCase().includes(search.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(search.toLowerCase())
        )
        .sort(sortCoin)
    );
  }, [search, sortType]);

  
  return (
    <coinsContext.Provider
      value={{
        coins,
        filteredCoins,
        search,
        setSearch,
        onSearchChange,
        isLoading,
        setLoading,
        page,
        handlePageChange,
        paginatedCoins,
        isSearching,
        currency,
        setCurrency,
        currencySymbol,
        sortType,
        setSortType,
        setSearch
      }}
    >
      {children}
    </coinsContext.Provider>
  );
};

export default CoinsProvider;
