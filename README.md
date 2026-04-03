# Bookstore (Missions 12–13)

This project is a full-stack bookstore app built for IS 413. It uses the provided `Bookstore.sqlite` database, an ASP.NET Core API backend, and a React + Vite frontend.

**Phase 6 / Mission 13** work (admin CRUD, Azure prep) should live on the `mission13` branch.

## Project Structure

```text
Mission12Assignment/
├── backend/
│   └── Bookstore.API/
│       └── Bookstore.sqlite
├── frontend/
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
- **Mission 13:** Admin page at `/adminbooks` to **add, edit, and delete** books in the database
- **Mission 13:** `public/routes.json` for Azure Static Web Apps SPA fallback (deep links like `/adminbooks`)
- **Mission 13:** Configurable API URL via `VITE_API_URL` for production builds (see below)

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

Admin / CRUD endpoints (Mission 13):

```bash
curl "http://localhost:5003/api/books/all"
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

### Production API URL (Mission 13)

For a hosted frontend, set the API base URL when building:

```bash
cd frontend
echo "VITE_API_URL=https://your-api-host.example" > .env.production
npm run build
```

See [`frontend/.env.example`](frontend/.env.example). The app defaults to `http://localhost:5003` when unset.

### Azure deployment (Mission 13 — manual steps)

Deployment is done in the Azure portal / your course videos. Typical checklist:

1. **API:** Publish the ASP.NET Core app (e.g. Azure App Service). Set `ASPNETCORE_ENVIRONMENT` to `Production` if you use production settings.
2. **Database:** Follow instructor guidance for SQLite vs Azure SQL on the server. The repo uses SQLite locally; cloud hosting may require a different connection string in Azure **Application settings** / `ConnectionStrings__BookstoreConnection`.
3. **CORS:** Add your **deployed frontend origin** (exact URL, including `https://`) to `Cors:AllowedOrigins` in [`backend/Bookstore.API/appsettings.Production.json`](backend/Bookstore.API/appsettings.Production.json), or override via configuration in Azure. Local dev origins remain in [`backend/Bookstore.API/appsettings.json`](backend/Bookstore.API/appsettings.json).
4. **Frontend:** Deploy the contents of `frontend/dist` (e.g. Azure Static Web Apps). Ensure `routes.json` is present at the site root (Vite copies it from [`frontend/public/routes.json`](frontend/public/routes.json)).
5. **Verify:** Open `https://<your-frontend>/adminbooks` in a **new tab** (deep link). The page must load (SPA fallback). Submit the **live site URL** in Learning Suite (or your GitHub repo link if not deployed).

**Deployed site URL (paste for Learning Suite):** `https://YOUR-FRONTEND-HERE`

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

- The backend uses `Bookstore.sqlite` in [`backend/Bookstore.API/`](backend/Bookstore.API/); the `.csproj` copies it to the build/publish output (`PreserveNewest`) for local runs and Azure.
- Local development is set up over HTTP to avoid local HTTPS certificate issues.
- CORS allowed origins are listed under `Cors:AllowedOrigins` in `appsettings.json` (localhost / 127.0.0.1). Add your Azure frontend URL for production.
- The storefront and admin UI call the API through [`frontend/src/api/BooksAPI.ts`](frontend/src/api/BooksAPI.ts): `VITE_API_URL` if set, otherwise `http://localhost:5003` in dev, otherwise the deployed API at `https://bookstore-project-fphpd6asdhabhje3.francecentral-01.azurewebsites.net`.
- If `localhost:3002` or `localhost:5003` is already in use, the ports will need to be updated in:
  - `frontend/vite.config.ts`
  - `frontend/src/api/BooksAPI.ts` (`LOCAL_API_BASE`) or `.env` / `VITE_API_URL`
  - `backend/Bookstore.API/appsettings.json` (`Cors:AllowedOrigins`)
  - `backend/Bookstore.API/Properties/launchSettings.json`
