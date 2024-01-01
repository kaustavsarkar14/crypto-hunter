import React, { useContext, useState } from 'react'
import "./styles.css"
import { MenuItem, Select } from '@mui/material'
import coinsContext from '../../../context/coinsContext'

const Filters = () => {
    const {sortType, setSortType} = useContext(coinsContext)
    const handleSortInputChange=(e)=>{
        setSortType(e.target.value)
    }
  return (
    <div className='filters-div'>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={sortType}
                label="sort"
                onChange={handleSortInputChange}
                sx={{
                    height: "2rem",
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
                }}
            >
                <MenuItem value={"popularity"}>Popularity</MenuItem>
                <MenuItem value={"a-z"}>Name(a-z)</MenuItem>
                <MenuItem value={"z-a"}>Name(z-a)</MenuItem>
                <MenuItem value={"price-h-l"}>Price(high-low)</MenuItem>
                <MenuItem value={"price-l-h"}>Price(low-high)</MenuItem>
                <MenuItem value={"change-h-l"}>Price change(high-low)</MenuItem>
                <MenuItem value={"change-l-h"}>Price change(low-high)</MenuItem>
            </Select>
    </div>
  )
}

export default Filters