import React, { useContext } from "react";
import "./styles.css";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import coinsContext from "../../../context/coinsContext";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const Search = () => {
  const { search, onSearchChange, setSearch } = useContext(coinsContext);
  return (
    <div className="search-flex">
      <SearchRoundedIcon />
      <input
        type="text"
        className="search-input"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
        <CloseRoundedIcon sx={{ cursor: "pointer" }} onClick={()=>setSearch("")} />
    </div>
  );
};

export default Search;
