import React, { useContext, useState } from "react";
import "./styles.css";

import Pagination from "@mui/material/Pagination";
import coinsContext from "../../../context/coinsContext";

export default function PaginationControlled() {
    const { page, handlePageChange } = useContext(coinsContext)

    return (
        <div className="pagination-div">
            <Pagination
                sx={{
                    "& .MuiPaginationItem-text": {
                        color: "#fff !important",
                        border: "1px solid var(--grey)",
                    },
                    "& .MuiPaginationItem-text:hover": {
                        backgroundColor: "transparent !important",
                    },
                    "& .Mui-selected  ": {
                        backgroundColor: "var(--blue)",
                        borderColor: "var(--blue)",
                    },
                    "& .MuiPaginationItem-ellipsis": {
                        border: "none",
                    },
                }}
                count={10}
                page={page}
                onChange={handlePageChange}
            />
        </div>
    );
}