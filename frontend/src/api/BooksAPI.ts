import type { Book } from '../types/book'

/** Deployed API host only — no trailing slash; callers append `/api/...`. */
export const AZURE_BOOKSTORE_API_BASE =
  'https://bookstore-project-fphpd6asdhabhje3.francecentral-01.azurewebsites.net'

const LOCAL_API_BASE = 'http://localhost:5003'

/** Base URL for all book API calls (matches professor’s `API_URL` pattern). */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '')
  }
  return import.meta.env.DEV ? LOCAL_API_BASE : AZURE_BOOKSTORE_API_BASE
}

const BOOKS_ROOT = `${getApiBaseUrl()}/api/books`

export interface FetchBooksResponse {
  books: Book[]
  totalNumBooks: number
}

export async function fetchBooks(
  pageSize: number,
  pageNumber: number,
  sortOrder: 'asc' | 'desc',
  options?: { category?: string; signal?: AbortSignal },
): Promise<FetchBooksResponse> {
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    pageNumber: String(pageNumber),
    sortOrder,
  })
  if (options?.category) {
    params.set('category', options.category)
  }

  const response = await fetch(`${BOOKS_ROOT}?${params}`, { signal: options?.signal })
  if (!response.ok) {
    throw new Error('Unable to load books from the API.')
  }
  return response.json()
}

export async function fetchBookCategories(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(`${BOOKS_ROOT}/categories`, { signal })
  if (!response.ok) {
    throw new Error('Unable to load categories.')
  }
  return response.json()
}

export async function fetchAllBooks(): Promise<Book[]> {
  const response = await fetch(`${BOOKS_ROOT}/all`)
  if (!response.ok) {
    throw new Error('Failed to load books.')
  }
  return response.json()
}

export type BookPayload = Omit<Book, 'bookID'>

export async function createBook(body: BookPayload): Promise<Book> {
  const response = await fetch(BOOKS_ROOT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error((await response.text()) || 'Create failed.')
  }
  return response.json()
}

export async function updateBook(bookID: number, body: BookPayload): Promise<Book> {
  const response = await fetch(`${BOOKS_ROOT}/${bookID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error((await response.text()) || 'Update failed.')
  }
  return response.json()
}

export type DeleteBookResult = 'ok' | 'not_found' | 'failed'

export async function deleteBook(bookID: number): Promise<DeleteBookResult> {
  const response = await fetch(`${BOOKS_ROOT}/${bookID}`, { method: 'DELETE' })
  if (response.status === 404) {
    return 'not_found'
  }
  if (!response.ok) {
    return 'failed'
  }
  return 'ok'
}
