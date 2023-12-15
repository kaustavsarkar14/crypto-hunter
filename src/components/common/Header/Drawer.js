import Drawer from '@mui/material/Drawer';
import { useState } from 'react';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { IconButton } from '@mui/material';

export default function TemporaryDrawer() {
    const [isOpen, setOpen] = useState(false)

    return (
        <div>
            {['right'].map((anchor) => (
                <div>
                    <IconButton onClick={() => setOpen(true)}>
                        <MenuRoundedIcon className='menu-icon' />
                    </IconButton>
                    <Drawer
                        anchor={anchor}
                        open={isOpen}
                        onClose={() => setOpen(false)}
                    >
                        <div className='mobile-links' >
                            <p>Home</p>
                            <p>Compare</p>
                            <p>List</p>
                            <p>Watchlist</p>
                        </div>
                    </Drawer>
                </  div>
            ))}
        </div>
    );
}