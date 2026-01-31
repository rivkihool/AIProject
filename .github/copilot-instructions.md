# Copilot Instructions

## Project Overview
Full-stack task management system with React (Vite) frontend and ASP.NET Core Web API backend using Entity Framework Core with SQL Server LocalDB.

**Architecture:** Client-server separation in `client/` and `server/` directories.

## Tech Stack
- **Frontend:** React 18 (JavaScript, not TypeScript), Vite, React Router v7, Axios
- **Backend:** ASP.NET Core 8.0, Entity Framework Core 8.0, SQL Server (LocalDB)
- **Auth:** JWT tokens stored in localStorage (`auth_token` and `auth_user` keys)

## Critical Workflows

### Starting the Application
**Backend (from `server/`):**
```powershell
dotnet restore
dotnet ef database update              # Apply migrations
dotnet run                             # Runs on http://localhost:5228
```

**Frontend (from `client/`):**
```powershell
npm install  # First time only
npm run dev  # Runs on http://localhost:3000
```

### Database Migrations
Always run from `server/` directory:
- Create: `dotnet ef migrations add <MigrationName>`
- Apply: `dotnet ef database update`
- Connection string in [server/appsettings.json](../server/appsettings.json) uses LocalDB by default

## Project-Specific Patterns

### Frontend Conventions
- **Use JavaScript, NOT TypeScript** - This project explicitly uses `.jsx` files
- **API calls:** Use [client/src/api/axiosInstance.js](../client/src/api/axiosInstance.js) (pre-configured with JWT interceptors)
- **Auth flow:** [AuthContext](../client/src/context/AuthContext.jsx) provides `login()`, `logout()`, `user`, `isAuthenticated`
- **Protected routes:** Wrap with [ProtectedRoute](../client/src/components/ProtectedRoute.jsx) component (uses `<Outlet/>` pattern)
- **Routing:** React Router v7 with nested routes in [App.jsx](../client/src/App.jsx)
- **Styling:** CSS files co-located with pages (see [pages/auth.css](../client/src/pages/auth.css))

### Backend Conventions
- **Controllers:** REST API pattern in `Controllers/` ([AuthController.cs](../server/Controllers/AuthController.cs) for authentication)
- **Models:** Simple POCOs in `Models/` with data annotations
- **DbContext:** [AppDbContext](../server/Data/AppDbContext.cs) uses `DbSet<T>` pattern
- **API routes:** Follow `api/[controller]` convention (e.g., `/api/auth`)

### API Integration
- Vite proxy in [vite.config.js](../client/vite.config.js) forwards `/api/*` to `http://localhost:5228`
- Axios instance auto-attaches `Bearer` token from localStorage
- 401 responses trigger global `unauthorized` event → automatic logout in AuthContext

### Authentication Pattern
1. Login/Register POST to `/api/auth/login` or `/api/auth/register`
2. Response contains `{ token, user }`
3. [AuthContext](../client/src/context/AuthContext.jsx) stores both in localStorage
4. [axiosInstance](../client/src/api/axiosInstance.js) reads `auth_token` and attaches to all requests
5. 401 responses auto-logout via custom window event

## Key Files to Reference
- [client/src/context/AuthContext.jsx](../client/src/context/AuthContext.jsx) - Authentication state management
- [client/src/api/axiosInstance.js](../client/src/api/axiosInstance.js) - Centralized HTTP client with interceptors
- [server/Program.cs](../server/Program.cs) - Backend service configuration (JWT, CORS, EF Core)
- [server/Controllers/AuthController.cs](../server/Controllers/AuthController.cs) - Authentication endpoints
- [client/vite.config.js](../client/vite.config.js) - Dev server proxy configuration
- [instructions/ui.instructions.md](instructions/ui.instructions.md) - UI-specific coding guidelines

## Common Pitfalls
- Backend runs on port 5228, not 5000 - update vite proxy if this changes
- LocalDB connection string requires Windows authentication (`Trusted_Connection=True`)
- Protected routes must be nested inside `<ProtectedRoute>` element, not wrapped individually
- Always use JavaScript (.jsx) for React components, never TypeScript
- JWT secrets must be configured in `appsettings.Development.json` for local dev (see server/README.md)
