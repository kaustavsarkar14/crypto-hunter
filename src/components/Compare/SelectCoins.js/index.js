import React, { useContext } from 'react'
import "./styles.css"
import coinsContext from '../../../context/coinsContext'
import Loader from '../../common/Loader'
import { MenuItem, Select } from '@mui/material'

const SelectCoins = ({crypt1, crypt2, setCrypto1, setCrypto2}) => {
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

    const handleChange=(e)=>{
        console.log(e.target.value)
    }

    if (isLoading) return <Loader />
    return (
        <div className='coins-select-flex' >
            <p>Crypto 1</p>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={crypt1}
                    label={"Crypto 1"}
                    onChange={(e)=>setCrypto1(e.target.value)}
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
                    value={crypt2}
                    label={"Crypto 2"}
                    onChange={(e)=>setCrypto2(e.target.value)}
                    sx={style}
                >
                    {
                        coins.map(coin => <MenuItem key={coin.id} value={coin.id}>{coin.name}</MenuItem>)
                    }
                </Select>
            
        </div>
    )
}

export default SelectCoins