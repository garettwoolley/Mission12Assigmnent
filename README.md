# Mission 11 Bookstore

This project is a full-stack bookstore app built for the Mission 11 assignment. It uses the provided `Bookstore.sqlite` database, an ASP.NET Core API backend, and a React + Vite frontend.

## Project Structure

```text
Mission11Assignment/
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

## Notes

- The backend is configured to use the provided `Bookstore.sqlite` file in the project root.
- Local development is set up over HTTP to avoid local HTTPS certificate issues.
- If `localhost:3002` or `localhost:5003` is already in use, the ports will need to be updated in:
  - `frontend/vite.config.ts`
  - `frontend/src/components/BookList.tsx`
  - `backend/Bookstore.API/Program.cs`
  - `backend/Bookstore.API/Properties/launchSettings.json`
