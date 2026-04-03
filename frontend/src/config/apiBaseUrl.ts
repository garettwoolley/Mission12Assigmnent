const trimmed = import.meta.env.VITE_API_URL?.trim()

export const apiBaseUrl = trimmed && trimmed.length > 0 ? trimmed : 'http://localhost:5003'
