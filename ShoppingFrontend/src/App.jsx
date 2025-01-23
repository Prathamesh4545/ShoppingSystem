import React from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import GetProductById from './pages/GetProductById'
import Product from './components/Product'
import { Route,Routes } from 'react-router-dom'

const App = () => {
  return (
    <>
    <Navbar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/product/:id' element={<Product/>}/>
      </Routes>
    </>
  )
}

export default App