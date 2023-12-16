import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SelectData({ data, setData, options, label }) {

    const handleChange = (event) => {
        setData(event.target.value);
    };

    return (
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="demo-select-small-label">Age</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={data}
                label={label}
                onChange={handleChange}
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
                {/* <MenuItem value="">
                    <em>None</em>
                </MenuItem> */}

                {
                    options.map(option => <MenuItem value={option.value}>{option.text}</MenuItem>)
                }
            </Select>
        </FormControl>
    );
}
