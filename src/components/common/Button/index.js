import React from 'react'
import "./styles.css"
const Button = ({ buttonText, onClick, outlined }) => {
    return (
        <div className={outlined ? "outlined-btn" : "btn"}
        onClick={()=>onclick && onClick()}
        >
            {buttonText}
        </div>
    )
}

export default Button