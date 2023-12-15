import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useContext, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import Grid from '../Grid';
import List from '../List';
import "./styles.css"
import Button from '../../common/Button';
import coinsContext from '../../../context/coinsContext';
import LoadingGrid from '../LoadingGrid';

export default function Tabs() {
    const [value, setValue] = useState('grid');

    const { filteredCoins, setSearch, isLoading,paginatedCoins } = useContext(coinsContext)

    const coins = [...paginatedCoins]
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
                            isLoading ?
                                Array(20).fill(0).map(el => <LoadingGrid />)
                                :
                                (
                                    coins.length == 0 ?
                                        <div style={{ maxWidth: "200px", display: "flex", flexDirection: "column", gap: "2rem", margin: "auto" }}>
                                            <h2>No results found!</h2>
                                            <Button buttonText={"Clear Search"} onClick={() => setSearch('')} />
                                        </div>
                                        :
                                        coins.map((coin) => <Grid key={coin.id} coin={coin} />)
                                )
                        }
                    </div>
                </TabPanel>
                <TabPanel value="list">
                    <table className="list-table">
                        {
                            coins.length == 0 ?
                                <tr style={{ maxWidth: "200px", display: "flex", flexDirection: "column", gap: "2rem", margin: "auto" }}>
                                    <h2>No results found!</h2>
                                    <Button buttonText={"Clear Search"} onClick={() => setSearch('')} />
                                </tr>
                                :
                                coins.map((coin) => <List key={coin.id} coin={coin} />)
                        }
                    </table>
                </TabPanel>
            </TabContext>
        </ThemeProvider>
    );
}
