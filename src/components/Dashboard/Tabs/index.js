import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import Grid from '../Grid';
import List from '../List';
import "./styles.css"
import Button from '../../common/Button';

export default function Tabs({ coins, setSearch }) {
    const [value, setValue] = useState('grid');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const style = {
        color: "var(--white)",
    }
    const theme = createTheme({
        palette: {
            primary: {
                main: "#3a80e9"
            }
        }
    })
    if (coins.length == 0) return (
        <div style={{maxWidth:"200px", display:"flex", flexDirection:"column", gap:"2rem", margin:"auto"}}>
            <h2>No results found!</h2>
            <Button buttonText={"Clear Search"} onClick={()=>setSearch('')} />
        </div>
    )
    return (
        <ThemeProvider theme={theme}>
            <TabContext value={value}>
                <TabList variant='fullWidth' onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label="Grid" value="grid" sx={style} />
                    <Tab label="List" value="list" sx={style} />
                </TabList>
                <TabPanel value="grid">
                    <div className="grid-flex">
                        {
                            coins.map((coin) => <Grid key={coin.id} coin={coin} />)
                        }
                    </div>
                </TabPanel>
                <TabPanel value="list">
                    <table className="list-table">
                        {
                            coins.map((coin) => <List key={coin.id} coin={coin} />)
                        }
                    </table>
                </TabPanel>
            </TabContext>
        </ThemeProvider>
    );
}
