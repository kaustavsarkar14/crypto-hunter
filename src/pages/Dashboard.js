import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import Tabs from '../components/Dashboard/Tabs'
import Search from '../components/Dashboard/Search'
import PaginationControlled from '../components/Dashboard/Pagination'
import BackToTop from '../components/common/BackToTop'
import Filters from '../components/Dashboard/Filters'

const Dashboard = () => {
    
    return (
        <div>
            <BackToTop/>
            <Header />
            <Search/>
            <Filters/>
            <Tabs />
            <PaginationControlled/>
        </div>
    )
}

export default Dashboard