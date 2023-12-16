import React, { useState } from 'react'
import "./styles.css"
const CoinInfo = ({ heading, description }) => {
    const [isExpanded, setExpanded ] = useState(false)
    return (
        <div className='grey-wrapper' >
            <h2 className='coin-info-heading' >{heading}</h2>
            <p className='coin-info-desc'
            onClick={()=>setExpanded(isExpanded=>!isExpanded)}
            dangerouslySetInnerHTML={{__html: description==""?"No description available.":isExpanded?description:description.slice(0,300)+(description.length>200 && "...<p>Read  more</p>")}}
            />
        </div>
    )
}

export default CoinInfo