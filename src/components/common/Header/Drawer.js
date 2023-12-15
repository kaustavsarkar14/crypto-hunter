import Drawer from '@mui/material/Drawer';
import { useState } from 'react';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { IconButton } from '@mui/material';
import { Link } from 'react-router-dom';

export default function TemporaryDrawer() {
    const [isOpen, setOpen] = useState(false)

    return (
        <div>
                <div>
                    <IconButton onClick={() => setOpen(true)}>
                        <MenuRoundedIcon className='menu-icon' />
                    </IconButton>
                    <Drawer
                        anchor={'right'}
                        open={isOpen}
                        onClose={() => setOpen(false)}
                    >
                        <div className='mobile-links' >
                            <Link to={'/'}>Home</Link>
                            <Link to={'/compare'}>Compare</Link>
                            <Link to={"/list"} >List</Link>
                            <Link to={'watchlist'} >Watchlist</Link>
                        </div>
                    </Drawer>
                </  div>
        </div>
    );
}