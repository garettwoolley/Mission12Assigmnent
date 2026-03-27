import type { Book } from './book'

export interface CartItem {
  book: Book
  quantity: number
}

export interface CartContextValue {
  items: CartItem[]
  totalQuantity: number
  totalPrice: number
  addToCart: (book: Book) => void
  updateQuantity: (bookID: number, quantity: number) => void
  removeFromCart: (bookID: number) => void
  clearCart: () => void
}
