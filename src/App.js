import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import CoinDetailsPage from './pages/CoinDetailsPage';

function App() {
  return (
    <div>
    <Routes>
      <Route path='/' element={<HomePage/>} />
      <Route path='/dashboard' element={<Dashboard/>} />
      <Route path='/coin/:id' element={<CoinDetailsPage/>} />
      <Route path='/compare' element={<></>} />
      <Route path='/watchlist' element={<></>} />
    </Routes>
    </div>
  );
}

export default App;
