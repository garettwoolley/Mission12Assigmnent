import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartPage() {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()

  return (
    <div className="bookstore-shell">
      <div className="container py-4 py-md-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h1 className="mb-0">Shopping Cart</h1>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            {items.length === 0 ? (
              <div className="text-center py-4">
                <p className="mb-3">Your cart is empty.</p>
                <Link to="/" className="btn btn-primary">
                  Browse Books
                </Link>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Subtotal</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.book.bookID}>
                          <td>{item.book.title}</td>
                          <td>${item.book.price.toFixed(2)}</td>
                          <td style={{ maxWidth: '110px' }}>
                            <input
                              type="number"
                              min={1}
                              className="form-control"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.book.bookID,
                                  Number.isNaN(Number(e.target.value))
                                    ? 1
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </td>
                          <td>${(item.book.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFromCart(item.book.bookID)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                  <h2 className="h5 mb-0">Total: ${totalPrice.toFixed(2)}</h2>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
