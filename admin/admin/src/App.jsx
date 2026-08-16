import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Productlists from './pages/products_list/Productlists'
import Orders from './pages/orders/Orders'
import Dashboard from './pages/dashboard/Dashboard'
import AddProduct from './pages/add_product/Addproduct'
import Sidebar from './components/sidebar/Sidebar'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"


function App() {


  return (
    <>
      
      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
      <div className="admin">
        <div className="navbar">
          <Navbar />
        </div>
        <div className="pag-container">
          <div className="sidebar">
            <Sidebar />
          </div>
          <div className="pages">

            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/productlist' element={<Productlists />} />
              <Route path='/orders' element={<Orders />} />
              <Route path='/add-product' element={<AddProduct />} />
            </Routes>
          </div>
        </div>

      </div>
    </>
  )
}

export default App
