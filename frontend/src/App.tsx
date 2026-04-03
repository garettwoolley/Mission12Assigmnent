import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminBooksPage from './components/AdminBooksPage'
import BookList from './components/BookList'
import CartPage from './components/CartPage'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/adminbooks" element={<AdminBooksPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
