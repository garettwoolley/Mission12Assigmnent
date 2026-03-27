import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Book } from '../types/book'
import type { CartContextValue, CartItem } from '../types/cart'

// Session-only cart: survives route changes and refresh until the tab is closed.
const CART_STORAGE_KEY = 'bookstore-cart'

const CartContext = createContext<CartContextValue | undefined>(undefined)

function readStoredCart(): CartItem[] {
  const rawValue = sessionStorage.getItem(CART_STORAGE_KEY)

  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart())

  useEffect(() => {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (book: Book) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.book.bookID === book.bookID)

      if (existingItem) {
        return currentItems.map((item) =>
          item.book.bookID === book.bookID
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentItems, { book, quantity: 1 }]
    })
  }

  const updateQuantity = (bookID: number, quantity: number) => {
    const safeQuantity = Math.max(1, quantity)

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.book.bookID === bookID ? { ...item, quantity: safeQuantity } : item,
      ),
    )
  }

  const removeFromCart = (bookID: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.book.bookID !== bookID))
  }

  const clearCart = () => setItems([])

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.book.price * item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      totalQuantity,
      totalPrice,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [items, totalPrice, totalQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
