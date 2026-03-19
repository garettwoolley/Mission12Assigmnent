import { useEffect, useMemo, useState } from 'react'
import type { Book } from '../types/book'

type SortOrder = 'asc' | 'desc'

interface BooksResponse {
  books: Book[]
  totalNumBooks: number
}

const apiUrl = 'http://localhost:5003/api/books'

function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [pageSize, setPageSize] = useState<number>(5)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

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

        const response = await fetch(
          `${apiUrl}?pageSize=${pageSize}&pageNumber=${pageNumber}&sortOrder=${sortOrder}`,
          { signal: controller.signal },
        )

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
  }, [pageNumber, pageSize, sortOrder])

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages)
    }
  }, [pageNumber, totalPages])

  const pageButtons = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="bookstore-shell">
      <div className="container py-4 py-md-5">
        <div className="mb-4">
          <h1 className="mb-2">Online Bookstore</h1>
          <p className="text-muted mb-0">
            Browse the bookstore catalog with pagination and title sorting.
          </p>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between mb-4">
              <div className="d-flex flex-column flex-sm-row gap-3">
                <div>
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

                <div>
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
              </div>

              <div className="align-self-start align-self-lg-end text-muted">
                Showing page {pageNumber} of {totalPages} ({totalItems} total books)
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
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
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
    </div>
  )
}

export default BookList
