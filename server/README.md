# Server (ASP.NET Core + EF Core)

This folder contains a minimal ASP.NET Core Web API project configured with Entity Framework Core and SQL Server (LocalDB) to make migrations easy to run locally.

Quick start (PowerShell):

```powershell
# 1. Go to the server folder
cd .\server

# 2. Restore packages
dotnet restore

# 3. (If you don't have dotnet-ef tool) Install the EF CLI tool globally
dotnet tool install --global dotnet-ef

# 4. Create an initial migration (will create Migrations folder)
dotnet ef migrations add InitialCreate

# 5. Apply the migration to create the database (uses LocalDB)
dotnet ef database update

# 6. Run the API
dotnet run
```

Notes:
- The project uses SQL Server LocalDB by default (connection string in `appsettings.json`). For a production SQL Server instance, replace the connection string accordingly.
- Migrations will be created in a `Migrations` folder inside `server`.
- If you prefer scaffolding with `dotnet new webapi`, you can replace this scaffold, but the files here are ready for `dotnet ef migrations`.
