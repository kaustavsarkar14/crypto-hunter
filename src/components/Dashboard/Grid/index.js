import React, { useContext, useEffect, useState } from 'react'
import "./styles.css"
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import { Link } from 'react-router-dom';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { motion } from 'framer-motion';
import {ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import coinsContext from '../../../context/coinsContext';

const Grid = ({ coin }) => {
    const [isStarred, setIsStarred] = useState( (JSON.parse(localStorage.getItem('starred')) || []).includes(coin.id))
    const { currencySymbol} = useContext(coinsContext)

    function handleStarIconClick(event){
        event.preventDefault();
        const starredCoins = JSON.parse(localStorage.getItem('starred')) || []
        console.log("localstorage>>", starredCoins)
        if(starredCoins.includes(coin.id)) {
            const filtededCoins = starredCoins.filter(el=>el!=coin.id)
            localStorage.setItem('starred', JSON.stringify(filtededCoins))
            setIsStarred(false)
            toast.info("Coin removed from watchlist !",{
                theme:"dark",
            })
        }
        else {
            localStorage.setItem('starred', JSON.stringify([...starredCoins, coin.id]));
            setIsStarred(true)
            toast.success("Coin added to watchlist !",{
                theme:"dark",
            })
        }
    }

    return (
        <Link to={`/coin/${coin.id}`} >
            <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`grid-container ${coin.price_change_percentage_24h < 0 && "grid-container-red"}`} >
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
                       <ToastContainer/>
                    </div>
                </div>
                <div className="chip-flex">
                    <div className={coin.price_change_percentage_24h > 0 ? "price-chip" : "price-chip-red"}>{coin.price_change_percentage_24h.toFixed(2) + "%"}</div>
                    <div className={coin.price_change_percentage_24h > 0 ? "icon-chip" : "icon-chip-red"} >
                        {coin.price_change_percentage_24h > 0 ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
                    </div>
                </div>
                <div className="info-container"  >
                    <h1 style={{ color: coin.price_change_percentage_24h > 0 ? "var(--green)" : "var(--red)" }} >{ currencySymbol+ coin.current_price.toLocaleString()}</h1>
                    <p className='total_volume' >Totol Volume : {coin.total_volume.toLocaleString()}</p>
                    <p className='market_cap' >Market Cap : {coin.market_cap.toLocaleString()}</p>
                </div>
            </motion.div>
        </Link>
    )
}

export default Grid