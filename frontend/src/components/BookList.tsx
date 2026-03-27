import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Book } from '../types/book'
import { useCart } from '../context/CartContext'

type SortOrder = 'asc' | 'desc'

interface BooksResponse {
  books: Book[]
  totalNumBooks: number
}

interface BrowseState {
  pageSize: number
  pageNumber: number
  sortOrder: SortOrder
  category: string
}

const apiUrl = 'http://localhost:5003/api/books'
const categoriesUrl = 'http://localhost:5003/api/books/categories'
// Restored on mount so "Continue Shopping" returns to the same category/page/sort.
const browseStateKey = 'bookstore-browse-state'

function BookList() {
  const { addToCart, totalPrice, totalQuantity } = useCart()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [pageSize, setPageSize] = useState<number>(5)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [category, setCategory] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [toastText, setToastText] = useState<string>('')

  useEffect(() => {
    const rawBrowseState = sessionStorage.getItem(browseStateKey)

    if (!rawBrowseState) {
      return
    }

    try {
      const parsed = JSON.parse(rawBrowseState) as BrowseState
      setPageSize(parsed.pageSize ?? 5)
      setPageNumber(parsed.pageNumber ?? 1)
      setSortOrder(parsed.sortOrder ?? 'asc')
      setCategory(parsed.category ?? '')
    } catch {
      // Ignore invalid session storage values.
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(
      browseStateKey,
      JSON.stringify({ pageSize, pageNumber, sortOrder, category }),
    )
  }, [category, pageNumber, pageSize, sortOrder])

  useEffect(() => {
    const controller = new AbortController()

    const fetchCategories = async () => {
      try {
        const response = await fetch(categoriesUrl, { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Unable to load categories.')
        }

        const data = (await response.json()) as string[]
        setCategories(data)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setCategories([])
      }
    }

    fetchCategories()
    return () => controller.abort()
  }, [])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [pageSize, totalItems],
  )

  useEffect(() => {
    const controller = new AbortController()

    const fetchBooks = async () => {
      try {
        setIsLoading(true)
        setError('')

        const query = new URLSearchParams({
          pageSize: String(pageSize),
          pageNumber: String(pageNumber),
          sortOrder,
        })

        if (category) {
          query.set('category', category)
        }

        const response = await fetch(`${apiUrl}?${query.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to load books from the API.')
        }

        const data: BooksResponse = await response.json()
        setBooks(data.books)
        setTotalItems(data.totalNumBooks)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setError('Unable to load books. Make sure the backend API is running.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()

    return () => controller.abort()
  }, [category, pageNumber, pageSize, sortOrder])

  // When filtering shrinks the result set, clamp page so controls stay valid.
  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages)
    }
  }, [pageNumber, totalPages])

  const pageButtons = Array.from({ length: totalPages }, (_, index) => index + 1)

  const handleAddToCart = (book: Book) => {
    addToCart(book)
    setToastText(`Added "${book.title}" to cart`)
  }

  useEffect(() => {
    if (!toastText) {
      return
    }

    const timerId = window.setTimeout(() => {
      setToastText('')
    }, 2200)

    return () => window.clearTimeout(timerId)
  }, [toastText])

  return (
    <div className="bookstore-shell">
      <div className="container py-4 py-md-5">
        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h1 className="mb-2">Online Bookstore</h1>
          <Link to="/cart" className="btn btn-outline-dark position-relative">
            Go To Cart
            {totalQuantity > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-9">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="accordion mb-4" id="browseOptions">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#browseOptionsPanel"
                        aria-expanded="true"
                        aria-controls="browseOptionsPanel"
                      >
                        Browse Options
                      </button>
                    </h2>
                    <div
                      id="browseOptionsPanel"
                      className="accordion-collapse collapse show"
                      data-bs-parent="#browseOptions"
                    >
                      <div className="accordion-body">
                        <div className="row g-3">
                          <div className="col-12 col-sm-6 col-lg-3">
                            <label htmlFor="category" className="form-label">
                              Category
                            </label>
                            <select
                              id="category"
                              className="form-select"
                              value={category}
                              onChange={(e) => {
                                setCategory(e.target.value)
                                setPageNumber(1)
                              }}
                            >
                              <option value="">All categories</option>
                              {categories.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-12 col-sm-6 col-lg-3">
                            <label htmlFor="pageSize" className="form-label">
                              Results per page
                            </label>
                            <select
                              id="pageSize"
                              className="form-select"
                              value={pageSize}
                              onChange={(e) => {
                                setPageSize(Number(e.target.value))
                                setPageNumber(1)
                              }}
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={15}>15</option>
                              <option value={20}>20</option>
                            </select>
                          </div>

                          <div className="col-12 col-sm-6 col-lg-3">
                            <label htmlFor="sortOrder" className="form-label">
                              Sort by title
                            </label>
                            <select
                              id="sortOrder"
                              className="form-select"
                              value={sortOrder}
                              onChange={(e) => {
                                setSortOrder(e.target.value as SortOrder)
                                setPageNumber(1)
                              }}
                            >
                              <option value="asc">A to Z</option>
                              <option value="desc">Z to A</option>
                            </select>
                          </div>

                          <div className="col-12 col-sm-6 col-lg-3 d-flex align-items-end">
                            <div className="text-muted">
                              Showing page {pageNumber} of {totalPages}
                              <div>{totalItems} matching books</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="table-responsive">
                  <table className="table table-striped table-bordered align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Author</th>
                        <th scope="col">Publisher</th>
                        <th scope="col">ISBN</th>
                        <th scope="col">Classification</th>
                        <th scope="col">Category</th>
                        <th scope="col">Pages</th>
                        <th scope="col">Price</th>
                        <th scope="col">Cart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={9} className="text-center py-4">
                            Loading books...
                          </td>
                        </tr>
                      ) : books.length > 0 ? (
                        books.map((book) => (
                          <tr key={book.bookID}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.publisher}</td>
                            <td>{book.isbn}</td>
                            <td>{book.classification}</td>
                            <td>{book.category}</td>
                            <td>{book.pageCount}</td>
                            <td>${book.price.toFixed(2)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() => handleAddToCart(book)}
                              >
                                Add To Cart
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="text-center py-4">
                            No books found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={pageNumber === 1 || isLoading}
                    onClick={() => setPageNumber((current) => current - 1)}
                  >
                    Previous
                  </button>

                  {pageButtons.map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={`btn ${
                        page === pageNumber ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                      disabled={page === pageNumber || isLoading}
                      onClick={() => setPageNumber(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={pageNumber === totalPages || isLoading}
                    onClick={() => setPageNumber((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5">Cart Summary</h2>
                <p className="mb-1">
                  Quantity: <strong>{totalQuantity}</strong>
                </p>
                <p className="mb-3">
                  Price: <strong>${totalPrice.toFixed(2)}</strong>
                </p>
                <div className="d-grid">
                  <Link to="/cart" className="btn btn-primary">
                    Open Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toastText && (
          <div className="toast-container position-fixed bottom-0 end-0 p-3">
            <div className="toast show align-items-center text-bg-primary border-0">
              <div className="d-flex">
                <div className="toast-body">{toastText}</div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  aria-label="Close"
                  onClick={() => setToastText('')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookList
