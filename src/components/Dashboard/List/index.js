import React, { useState } from 'react'
import "./styles.css"
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import { Tooltip } from '@mui/material';
import { convertNumbers } from '../../../functions/convertNumbers';
import { Link } from 'react-router-dom';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

const List = ({ coin }) => {
    const [isStarred, setIsStarred] = useState( (JSON.parse(localStorage.getItem('starred')) || []).includes(coin.id))

    function handleStarIconClick(event) {
        event.preventDefault();

        const starredCoins = JSON.parse(localStorage.getItem('starred')) || []
        console.log("localstorage>>", starredCoins)
        if (starredCoins.includes(coin.id)) {
            const filtededCoins = starredCoins.filter(el => el != coin.id)
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
            <tr className='list-row' >
                <Tooltip title={coin.name} >
                    <td className="info-flex">
                        <img src={coin.image} className='coin-logo' alt="" />
                    </td>
                </Tooltip>
                <td className="name-col">
                    <p className='coin-symbol' >{coin.symbol}</p>
                    <p className='coin-name mobile-hide' >{coin.name}</p>
                </td>
                <Tooltip title="Price change (24h)" >
                    <td className="chip-flex-list">
                        <div className="star-icon" onClick={handleStarIconClick}>
                            {isStarred ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
                        </div>
                        <div className={coin.price_change_percentage_24h > 0 ? "price-chip" : "price-chip-red"}>{coin.price_change_percentage_24h.toFixed(2) + "%"}</div>
                        <div className={(coin.price_change_percentage_24h > 0 ? "icon-chip" : "icon-chip-red") + " mobile-hide"} >
                            {coin.price_change_percentage_24h > 0 ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
                        </div>
                    </td>
                </Tooltip>
                <Tooltip title="Current price" >
                    <td className="info-container td-center-align list-price-mobile"  >
                        <h1 style={{ color: coin.price_change_percentage_24h > 0 ? "var(--green)" : "var(--red)" }} >${coin.current_price.toLocaleString()}</h1>
                    </td>
                </Tooltip>
                <Tooltip title="Total Volume" >
                    <td className='mobile-hide'>
                        <p className='total_volume td-right-align ' > {coin.total_volume.toLocaleString()}</p>
                    </td>
                </Tooltip>
                <Tooltip title="Market cap">
                    <td className='market_cap-desktop'>
                        <p className=' td-right-align' >{coin.market_cap.toLocaleString()}</p>
                    </td>
                </Tooltip>
                <Tooltip title="Market cap">
                    <td className='market_cap-mobile'>
                        <p className=' td-right-align' >{"$" + convertNumbers(coin.market_cap.toLocaleString())}</p>
                    </td>

                </Tooltip>
            </tr>
        </Link>
    )
}

export default List