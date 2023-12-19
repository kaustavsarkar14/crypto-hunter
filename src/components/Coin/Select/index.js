import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SelectDate({ days, handleDaysChange }) {

    return (
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={days}
                onChange={e=>handleDaysChange(e)}
                sx={{
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
                }}
            >
                <MenuItem value={7}>7 days</MenuItem>
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={60}>60 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={180}>6 Months</MenuItem>
                <MenuItem value={365}>1 Year</MenuItem>
                <MenuItem value={"max"}>Max</MenuItem>
            </Select>
    );
}
