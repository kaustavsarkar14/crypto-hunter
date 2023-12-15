import React, { useContext } from 'react'
import "./styles.css"
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import coinsContext from '../../../context/coinsContext';

const Search = () => {
    const { search, onSearchChange } = useContext(coinsContext)
    return (
        <div className='search-flex' >
            <SearchRoundedIcon />
            <input type="text" className='search-input' value={search} onChange={e => onSearchChange(e.target.value)} />
        </div>
    )
}

export default Search