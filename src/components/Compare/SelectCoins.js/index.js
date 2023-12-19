import React, { useContext } from 'react'
import "./styles.css"
import coinsContext from '../../../context/coinsContext'
import Loader from '../../common/Loader'
import { MenuItem, Select } from '@mui/material'

const SelectCoins = ({crypto1, crypto2, handleCoinChange}) => {
    const { coins, isLoading } = useContext(coinsContext)

    const style = {
        height: "2.5rem",
        color: "var(--white)",
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--blue)",
        },
        "& .MuiSvgIcon-root": {
            color: "var(--white)",
        },
        "&:hover": {
            "&& fieldset": {
                borderColor: "#3a80e9",
            },
        },
    }
    if (isLoading) return <></>
    return (
        <div className='coins-select-flex' >
            <p>Crypto 1</p>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={crypto1}
                    label={"Crypto 1"}
                    onChange={(e)=>handleCoinChange(e, false)}
                    sx={style}
                >
                    {
                        coins.map(coin => <MenuItem key={coin.id} value={coin.id}>{coin.name}</MenuItem>)
                    }
                </Select>
            <p>Crypto 2</p>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={crypto2}
                    label={"Crypto 2"}
                    onChange={(e)=>handleCoinChange(e, true)}
                    sx={style}
                >
                    {
                        coins.filter(coin=>coin.id!=crypto1).map(coin => <MenuItem key={coin.id} value={coin.id}>{coin.name}</MenuItem>)
                    }
                </Select>
            
        </div>
    )
}

export default SelectCoins