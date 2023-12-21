import {useContext, useState} from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import coinsContext from '../../../context/coinsContext';

export default function CurrencySelect() {
    const {currency, setCurrency} = useContext(coinsContext)

    const handleChange = (event) => {
        setCurrency(event.target.value);
    };

    return (
        <FormControl sx={{ m: 1, minWidth: 10, fontSize: "1rem" }} size="small">
            <InputLabel id="demo-select-small-label">Currency</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={currency}
                label="Currency"
                onChange={handleChange}
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
                <MenuItem value={"USD"}>USD</MenuItem>
                <MenuItem value={"INR"}>INR</MenuItem>
                <MenuItem value={"EUR"}>EUR</MenuItem>
            </Select>
        </FormControl>
    );
}
