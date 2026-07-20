import { useContext, useState } from 'react'

import './App.css'
import Footer from './components/footer/Footer'
import Navbar from './components/navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Auth from './features/Auth/Auth'
import ShopPage from './pages/shop/Shoppage'
import { Context } from './context/Context'
import CartPage from './pages/cart/Cartpage'
import ContactPage from './pages/contact/ContactPage'
import GiftPage from './pages/gift/Giftpage'
import CollectionPage from './pages/collection/Collectionpage'
import Aboutpage from './pages/about/Aboutpage'


function App() {

  const [IsAuthOpen, setIsAuthOpen] = useState(false)


  return (
    <>
      {IsAuthOpen ? <Auth setIsAuthOpen={setIsAuthOpen} /> : <></>}
      <div className="app">
        <Navbar isAuthopen={IsAuthOpen} setIsAuthOpen={setIsAuthOpen} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/shop' element={<ShopPage />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/contact' element={<ContactPage />} />
          <Route path='/gift' element={<GiftPage />} />
          <Route path='/collections' element={<CollectionPage />} />
          <Route path='/about' element={<Aboutpage />} />
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
