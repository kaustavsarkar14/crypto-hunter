import React from 'react'
import "./styles.css"
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

const Grid = ({ coin }) => {
    return (
        <div className={`grid-container ${coin.price_change_percentage_24h<0 && "grid-container-red"}`} >
            <div className="info-flex">
                <img src={coin.image} className='coin-logo' alt="" />
                <div className="name-col">
                    <p className='coin-symbol' >{coin.symbol}</p>
                    <p className='coin-name' >{coin.name}</p>
                </div>
            </div>
            <div className="chip-flex">
                <div className={coin.price_change_percentage_24h>0?"price-chip":"price-chip-red"}>{coin.price_change_percentage_24h.toFixed(2)+"%"}</div>
                <div className={coin.price_change_percentage_24h>0?"icon-chip":"icon-chip-red"} >
                    {coin.price_change_percentage_24h>0?<TrendingUpRoundedIcon/>:<TrendingDownRoundedIcon/>}
                </div>
            </div>
            <div className="info-container"  >
                <h1 style={{color:coin.price_change_percentage_24h>0?"var(--green)":"var(--red)"}} >${coin.current_price.toLocaleString()}</h1>
                <p className='total_volume' >Totol Volume : {coin.total_volume.toLocaleString()}</p>
                <p className='market_cap' >Market Cap : {coin.market_cap.toLocaleString()}</p>
            </div>
        </div>
    )
}

export default Grid