import React, { useEffect, useRef } from 'react'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import "./styles.css"
const BackToTop = () => {
    const scrollTopButton = useRef()
    function scrollToTop() {
        document.documentElement.scrollTop = 0
    }
    function handleScroll() {
        if (document.documentElement.scrollTop > 300)
            scrollTopButton.current.style.display = "flex"
        if (document.documentElement.scrollTop < 200)
            scrollTopButton.current.style.display = "none"
    }
    useEffect(() => {
        document.addEventListener('scroll', handleScroll)
        return ()=>{
            document.removeEventListener('scroll', handleScroll)
        }
    }, [])
    return (
        <div className='back-to-top-button'
         ref={scrollTopButton}
         onClick={scrollToTop}
          >
            <ArrowUpwardRoundedIcon className='arrow' style={{ color: "var(--white)" }} />
        </div>
    )
}

export default BackToTop