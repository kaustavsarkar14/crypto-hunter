import "./styles.css"
import TemporaryDrawer from './Drawer'
import Button from "../Button"
const Header = () => {
  return (
    <div className='navbar' >
      <h1 className='logo' >CryptoTracker</h1>
      <div className='links' >
        <p>Home</p>
        <p>Compare</p>
        <p>List</p>
        <p>Watchlist</p>
        <Button buttonText={"Dashboard"} onClick={()=>{console.log("first")}} />
      </div>
      <div className='drawer' >
        <TemporaryDrawer />
      </div>
    </div>
  )
}

export default Header