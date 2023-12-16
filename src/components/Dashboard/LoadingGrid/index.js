import React from 'react'
import "./styles.css"
import { motion } from 'framer-motion'
const LoadingGrid = () => {
  return (
    <motion.div
      className='grid-container'
      initial={{ opacity:1}}
      animate={{  opacity:0.7}}
      transition={{ type:"smooth",duration: 0.6, repeat: Infinity, ease: 'easeInOut',repeatType:"mirror" }}
    />
  )
}

export default LoadingGrid