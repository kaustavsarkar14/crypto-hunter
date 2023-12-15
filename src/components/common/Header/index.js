import "./styles.css"
import TemporaryDrawer from './Drawer'
import Button from "../Button"
import { Link } from "react-router-dom"
const Header = () => {
  return (
    <div className='navbar' >
      <h1 className='logo' >CryptoTracker</h1>
      <div className='links' >
        <Link to={'/'}>Home</Link>
        <Link to={'/compare'}>Compare</Link>
        <Link to={"/list"} >List</Link>
        <Link to={'watchlist'} >Watchlist</Link>
        <Link to={"/dashboard"} ><Button buttonText={"Dashboard"} onClick={() => { console.log("first") }} /></Link>
      </div>
      <div className='drawer' >
        <TemporaryDrawer />
      </div>
    </div>
  )
}

export default Header