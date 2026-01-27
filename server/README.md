# Server (ASP.NET Core + EF Core)

This folder contains an ASP.NET Core Web API project with JWT authentication, Entity Framework Core, and SQL Server.

## Prerequisites
- .NET 8.0 SDK
- SQL Server LocalDB or SQL Server
- dotnet-ef tool: `dotnet tool install --global dotnet-ef`

## Quick Start (PowerShell)

### 1. Restore Dependencies
```powershell
cd .\server
dotnet restore
```

### 2. Configure JWT Secrets

**For Local Development:**
```powershell
# Copy the template
Copy-Item appsettings.json appsettings.Development.json
```

Edit `appsettings.Development.json` and replace the JWT key with a secure random key:

Generate a secure 256-bit key:
```powershell
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Update the `"Key"` field in `appsettings.Development.json`:
```json
{
  "Jwt": {
    "Key": "paste-your-generated-key-here",
    "Issuer": "AIProjectAPI",
    "Audience": "AIProjectClient"
  }
}
```

### 3. Database Setup
```powershell
# Apply migrations to create the database
dotnet ef database update
```

### 4. Run the API
```powershell
dotnet run
```

The API will be available at `http://localhost:5228`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
- `POST /api/auth/login` - Login user
  - Body: `{ "email": "string", "password": "string" }`

## Environment Configuration

### Development
- Uses `appsettings.Development.json` (⚠️ gitignored - create locally)
- Automatically loaded when `ASPNETCORE_ENVIRONMENT=Development`

### Production
Set these environment variables:
- `JWT_SECRET_KEY` - Secure 256-bit random key (required)
- `JWT_ISSUER` - API issuer name (optional, fallback to config)
- `JWT_AUDIENCE` - API audience name (optional, fallback to config)
- `ConnectionStrings__DefaultConnection` - Production database connection string

## Security Notes
🔒 **Never commit `appsettings.Development.json` to source control** (already in .gitignore)  
🔒 **Always use environment variables in production**  
🔒 **Generate unique JWT keys for each environment**  
🔒 **The placeholder key in `appsettings.json` will not work - must configure real key**

## Database Migrations

### Create a new migration
```powershell
dotnet ef migrations add MigrationName
```

### Apply migrations
```powershell
dotnet ef database update
```

### Rollback migration
```powershell
dotnet ef database update PreviousMigrationName
```

## Notes
- The project uses SQL Server LocalDB by default for development
- Connection string is in `appsettings.json`
- For production, use a proper SQL Server instance
- CORS is configured to allow `http://localhost:3000` and `https://localhost:3000` (Vite frontend)

