import React, { useEffect, useState } from 'react'
import "./styles.css"
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import { Link } from 'react-router-dom';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

const Grid = ({ coin }) => {
    const [isStarred, setIsStarred] = useState( (JSON.parse(localStorage.getItem('starred')) || []).includes(coin.id))

    function handleStarIconClick(event){
        event.preventDefault();

        const starredCoins = JSON.parse(localStorage.getItem('starred')) || []
        console.log("localstorage>>", starredCoins)
        if(starredCoins.includes(coin.id)) {
            const filtededCoins = starredCoins.filter(el=>el!=coin.id)
            localStorage.setItem('starred', JSON.stringify(filtededCoins))
            setIsStarred(false)
        }
        else {
            localStorage.setItem('starred', JSON.stringify([...starredCoins, coin.id]));
            setIsStarred(true)
        }
    }

    return (
        <Link to={`/coin/${coin.id}`} >
            <div className={`grid-container ${coin.price_change_percentage_24h < 0 && "grid-container-red"}`} >
                <div className='grid-top' >
                    <div className="info-flex">
                        <img src={coin.image} className='coin-logo' alt="" />
                        <div className="name-col">
                            <p className='coin-symbol' >{coin.symbol}</p>
                            <p className='coin-name' >{coin.name}</p>
                        </div>
                    </div>
                    <div className="star-icon" onClick={handleStarIconClick}>
                       {isStarred?  <StarRoundedIcon/>: <StarBorderRoundedIcon />}
                    </div>
                </div>
                <div className="chip-flex">
                    <div className={coin.price_change_percentage_24h > 0 ? "price-chip" : "price-chip-red"}>{coin.price_change_percentage_24h.toFixed(2) + "%"}</div>
                    <div className={coin.price_change_percentage_24h > 0 ? "icon-chip" : "icon-chip-red"} >
                        {coin.price_change_percentage_24h > 0 ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
                    </div>
                </div>
                <div className="info-container"  >
                    <h1 style={{ color: coin.price_change_percentage_24h > 0 ? "var(--green)" : "var(--red)" }} >${coin.current_price.toLocaleString()}</h1>
                    <p className='total_volume' >Totol Volume : {coin.total_volume.toLocaleString()}</p>
                    <p className='market_cap' >Market Cap : {coin.market_cap.toLocaleString()}</p>
                </div>
            </div>
        </Link>
    )
}

export default Grid