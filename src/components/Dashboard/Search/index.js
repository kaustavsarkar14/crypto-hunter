import React from 'react'
import "./styles.css"
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

const Search = ({search, onSearchChange}) => {
  return (
    <div className='search-flex' >
    <SearchRoundedIcon/>        
    <input type="text" className='search-input' value={search} onChange={e=>onSearchChange(e.target.value)} />
    </div>
  )
}

export default Search