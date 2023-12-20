import React, { useContext, useEffect, useState } from 'react'
import Header from '../components/common/Header'
import coinsContext from '../context/coinsContext'
import SelectCoins from '../components/Compare/SelectCoins.js'
import Loader from '../components/common/Loader/index.js'
import List from '../components/Dashboard/List/index.js'

const ConvertPage = () => {
  const { coins, isLoading } = useContext(coinsContext)
  const [crypto1, setCrypto1] = useState('bitcoin')
  const [crypto2, setCrypto2] = useState('ethereum')
  const [crypto1Data, setCrypto1Data] = useState(null)
  const [crypto2Data, setCrypto2Data] = useState(null)

  useEffect(() => {

    coins.map(coin => {
      if (coin.id == crypto1) setCrypto1Data(coin)
      if (coin.id == crypto2) setCrypto2Data(coin)
    })
  }, [coins, crypto1, crypto2])

  function handleCoinChange(e, isCoin2) {
    if (isCoin2) {
      setCrypto2(e.target.value)
    }
    else {
      setCrypto1(e.target.value)
    }
  }
  console.log(crypto1Data, crypto2Data)
  return (
    <div>
      <Header />
      <div className="container">
        <SelectCoins crypto1={crypto1} crypto2={crypto2} handleCoinChange={handleCoinChange} />
        {
          isLoading || !crypto1Data || !crypto2Data ?
            <Loader />
            :
            <>
              <div className="grey-wrapper p1">
                <h2 style={{ textAlign: "center" }} >1 <span style={{ fontWeight: "lighter" }}>{crypto1Data.name}</span> = {(crypto1Data.current_price / crypto2Data.current_price).toFixed(2)} <span style={{ fontWeight: "lighter" }}>{crypto2Data.name}</span></h2>
              </div>
              <div>
                <div className="grey-wrapper" style={{ marginBlock: "1rem" }} >
                  <List coin={crypto1Data} />
                </div>
                <div className="grey-wrapper">
                  <List coin={crypto2Data} />
                </div>
              </div>
            </>
        }
      </div>
    </div>
  )
}

export default ConvertPage