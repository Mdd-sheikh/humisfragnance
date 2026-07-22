import { useContext, useState } from 'react'

import './App.css'
import Footer from './components/footer/Footer'
import Navbar from './components/navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Auth from './features/Auth/Auth'
import Shoppage from './pages/shop/Shoppage'
import { Context } from './context/Context'
import Cartpage from './pages/cart/Cartpage'
import ContactPage from './pages/contact/ContactPage'
import Giftpage from './pages/gift/Giftpage'
import CollectionPage from './pages/collection/Collectionpage'
import Aboutpage from './pages/about/Aboutpage'
import PrivateRoute from './routes/PrivateRoute'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './styles/toast.css'


function App() {

  const [IsAuthOpen, setIsAuthOpen] = useState(false)


  return (
    <>
      {IsAuthOpen ? <Auth setIsAuthOpen={setIsAuthOpen} /> : <></>}
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="app">
        <Navbar isAuthopen={IsAuthOpen} setIsAuthOpen={setIsAuthOpen} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route element={<PrivateRoute isAuthopen={IsAuthOpen} setIsAuthOpen={setIsAuthOpen} />}>
            <Route path='/cart' element={<Cartpage />} />
          </Route>
          <Route element={<PrivateRoute isAuthopen={IsAuthOpen} setIsAuthOpen={setIsAuthOpen} />}>
          <Route path='/shop' element={<Shoppage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/gift' element={<Giftpage />} />
            <Route path='/collections' element={<CollectionPage />} />
            <Route path='/about' element={<Aboutpage />} />
          </Route>
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
