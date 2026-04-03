import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiBaseUrl } from '../config/apiBaseUrl'
import type { Book } from '../types/book'

const booksAllUrl = `${apiBaseUrl}/api/books/all`

type FormState = {
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: string
  price: string
}

const emptyForm: FormState = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: '',
  price: '',
}

function bookToForm(book: Book): FormState {
  return {
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    isbn: book.isbn,
    classification: book.classification,
    category: book.category,
    pageCount: String(book.pageCount),
    price: String(book.price),
  }
}

function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const loadBooks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await fetch(booksAllUrl)
      if (!response.ok) {
        throw new Error('Failed to load books.')
      }
      const data = (await response.json()) as Book[]
      setBooks(data)
    } catch {
      setError('Unable to load books. Check that the API is running and CORS allows this origin.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBooks()
  }, [loadBooks])

  const startAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const startEdit = (book: Book) => {
    setEditingId(book.bookID)
    setForm(bookToForm(book))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const parsePayload = (): Omit<Book, 'bookID'> | null => {
    const pageCount = Number(form.pageCount)
    const price = Number(form.price)
    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.publisher.trim() ||
      !form.isbn.trim() ||
      !form.classification.trim() ||
      !form.category.trim()
    ) {
      setError('All text fields are required.')
      return null
    }

    if (!Number.isFinite(pageCount) || pageCount <= 0) {
      setError('Page count must be a number greater than zero.')
      return null
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Price must be a number zero or greater.')
      return null
    }

    setError('')
    return {
      title: form.title.trim(),
      author: form.author.trim(),
      publisher: form.publisher.trim(),
      isbn: form.isbn.trim(),
      classification: form.classification.trim(),
      category: form.category.trim(),
      pageCount,
      price,
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const payload = parsePayload()
    if (!payload) {
      return
    }

    const body = {
      title: payload.title,
      author: payload.author,
      publisher: payload.publisher,
      isbn: payload.isbn,
      classification: payload.classification,
      category: payload.category,
      pageCount: payload.pageCount,
      price: payload.price,
    }

    try {
      setIsLoading(true)
      if (editingId === null) {
        const response = await fetch(`${apiBaseUrl}/api/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Create failed.')
        }
      } else {
        const response = await fetch(`${apiBaseUrl}/api/books/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Update failed.')
        }
      }

      cancelEdit()
      await loadBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (bookID: number) => {
    if (!window.confirm('Delete this book from the database?')) {
      return
    }

    try {
      setIsLoading(true)
      setError('')
      const response = await fetch(`${apiBaseUrl}/api/books/${bookID}`, {
        method: 'DELETE',
      })
      if (response.status === 404) {
        setError('Book was not found (it may have been deleted already).')
      } else if (!response.ok) {
        throw new Error('Delete failed.')
      }

      if (editingId === bookID) {
        cancelEdit()
      }

      await loadBooks()
    } catch {
      setError('Delete failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bookstore-shell">
      <div className="container py-4 py-md-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h1 className="mb-0">Admin — Books</h1>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/" className="btn btn-outline-secondary">
              Back to store
            </Link>
            <button type="button" className="btn btn-primary" onClick={startAdd}>
              Add new book
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">{editingId === null ? 'Add book' : `Edit book #${editingId}`}</h2>
            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-md-6">
                <label className="form-label" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="author">
                  Author
                </label>
                <input
                  id="author"
                  className="form-control"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="publisher">
                  Publisher
                </label>
                <input
                  id="publisher"
                  className="form-control"
                  value={form.publisher}
                  onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="isbn">
                  ISBN
                </label>
                <input
                  id="isbn"
                  className="form-control"
                  value={form.isbn}
                  onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="classification">
                  Classification
                </label>
                <input
                  id="classification"
                  className="form-control"
                  value={form.classification}
                  onChange={(e) => setForm((f) => ({ ...f, classification: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  className="form-control"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="pageCount">
                  Page count
                </label>
                <input
                  id="pageCount"
                  type="number"
                  min={1}
                  className="form-control"
                  value={form.pageCount}
                  onChange={(e) => setForm((f) => ({ ...f, pageCount: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="col-12 d-flex flex-wrap gap-2">
                <button type="submit" className="btn btn-success" disabled={isLoading}>
                  {editingId === null ? 'Create' : 'Save changes'}
                </button>
                {(editingId !== null || Object.values(form).some((v) => v !== '')) && (
                  <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                    Clear form
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h5 mb-3">All books</h2>
            <div className="table-responsive">
              <table className="table table-striped table-bordered align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Title</th>
                    <th scope="col">Author</th>
                    <th scope="col">Category</th>
                    <th scope="col">Price</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && books.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Loading…
                      </td>
                    </tr>
                  ) : books.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No books in the database.
                      </td>
                    </tr>
                  ) : (
                    books.map((book) => (
                      <tr key={book.bookID}>
                        <td>{book.bookID}</td>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.category}</td>
                        <td>${book.price.toFixed(2)}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => startEdit(book)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => void handleDelete(book.bookID)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBooksPage
