# Mission 12 Bookstore

This project is a full-stack bookstore app built for the Mission 12 assignment. It uses the provided `Bookstore.sqlite` database, an ASP.NET Core API backend, and a React + Vite frontend.

## Project Structure

```text
Mission12Assignment/
├── backend/
│   └── Bookstore.API/
├── frontend/
├── Bookstore.sqlite
└── WaterProject copy/
```

`WaterProject copy` is included only as a reference for structure and implementation style. The actual assignment app is the new `backend/` and `frontend/` at the root.

## Features

- Displays all required book fields:
  - Title
  - Author
  - Publisher
  - ISBN
  - Classification
  - Category
  - Page Count
  - Price
- Pagination with a default of 5 books per page
- Adjustable page size
- Title sorting
- Category filtering
- Shopping cart with quantity updates, line subtotals, and total
- Cart summary on the home page (quantity + price)
- Session-persistent cart and browse state
- Continue Shopping flow from cart back to main list
- Bootstrap styling

## Requirements

Make sure these are installed:

- .NET 10 SDK
- Node.js and npm

## How To Run

Open two terminals: one for the backend and one for the frontend.

### Run the Backend

From the project root:

```bash
cd backend/Bookstore.API
dotnet watch run --launch-profile http
```

The backend runs at:

```text
http://localhost:5003
```

You can test the API directly in a browser or with `curl`:

```bash
curl "http://localhost:5003/api/books?pageSize=5&pageNumber=1&sortOrder=asc"

curl "http://localhost:5003/api/books/categories"
curl "http://localhost:5003/api/books?pageSize=5&pageNumber=1&sortOrder=asc&category=Biography"
```

### Run the Frontend

In a second terminal, from the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://127.0.0.1:3002/
```

## Build Commands

### Backend build

```bash
cd backend/Bookstore.API
dotnet build
```

### Frontend build

```bash
cd frontend
npm run build
```

## Mission 12 Rubric Coverage

- **App Compiles and Runs**
  - Backend: `dotnet build`
  - Frontend: `npm run build`
- **App Allows User to Filter Books**
  - Category filter in `frontend/src/components/BookList.tsx`
  - Backend category query in `backend/Bookstore.API/Controllers/BooksController.cs`
- **Page Numbers Change with Filtering**
  - Filtered `TotalNumBooks` from API drives pagination totals/buttons
- **App Has Cart that Persists**
  - Cart data is stored in `sessionStorage` via `frontend/src/context/CartContext.tsx`
- **Cart Page**
  - `frontend/src/components/CartPage.tsx` includes quantity, subtotal, and total
- **Cart Summary on Home Page**
  - Right-side cart summary card in `frontend/src/components/BookList.tsx`
- **Bootstrap**
  - Grid layout uses Bootstrap Grid (`row`, `col-*`)
  - `bootstrap.bundle.min.js` is imported in `frontend/src/main.tsx` so accordion collapse behavior works
  - Two additional Bootstrap features used:
    - `accordion` for browse options on home page
    - `toast` confirmation when a book is added to cart
- **Code is Clean**
  - Logic split into focused files/components with clear naming and minimal targeted comments

## Learning Suite Comment (paste with submission)

I used Bootstrap Grid for layout on the main page (`row`/`col-12 col-lg-*` in `BookList.tsx`).  
Two Bootstrap features not covered in class videos that I added are:
1) **Accordion** (`accordion`, `accordion-collapse`) for the Browse Options section on the home page.
2) **Toast** (`toast`, `toast-container`) for add-to-cart confirmation in the bottom-right corner.

## Notes

- The backend is configured to use the provided `Bookstore.sqlite` file in the project root.
- Local development is set up over HTTP to avoid local HTTPS certificate issues.
- CORS allows both `http://localhost:3002` and `http://127.0.0.1:3002` so either URL works with Vite.
- If `localhost:3002` or `localhost:5003` is already in use, the ports will need to be updated in:
  - `frontend/vite.config.ts`
  - `frontend/src/components/BookList.tsx`
  - `backend/Bookstore.API/Program.cs`
  - `backend/Bookstore.API/Properties/launchSettings.json`
