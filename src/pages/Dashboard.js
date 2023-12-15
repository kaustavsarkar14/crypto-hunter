import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import Tabs from '../components/Dashboard/Tabs'
import Search from '../components/Dashboard/Search'
import PaginationControlled from '../components/Dashboard/Pagination'

const Dashboard = () => {
    
    return (
        <div>
            <Header />
            <Search/>
            <Tabs />
            <PaginationControlled/>
        </div>
    )
}

export default Dashboard