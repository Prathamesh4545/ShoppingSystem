import React from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import GetProductById from './pages/GetProductById'
import Product from './components/Product'
import { Route,Routes } from 'react-router-dom'
import AddProduct from './components/AddProduct'
import Footer from './components/Footer'

const App = () => {
  return (
    <>
    <Navbar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/product/:id' element={<Product/>}/>
        <Route path='/product/add' element={<AddProduct/>}/>
      </Routes>
      <Footer/>
    </>
  )
}

export default App