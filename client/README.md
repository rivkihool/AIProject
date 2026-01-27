# Client (React + Vite)

This is a lightweight React (JavaScript) client using Vite.

Quick start (PowerShell):

```powershell
cd .\client
npm install
npm run dev
```

- The dev server runs on port 3000 by default.
- The Vite config proxies `/api` to `http://localhost:5228` so API calls like `/api/auth` or `/api/tasks` go to the ASP.NET server started from the `server` folder.

If your ASP.NET backend runs on a different port update `client/vite.config.js` proxy `'/api': 'http://localhost:5228'`.

You can build for production with `npm run build` and preview the build with `npm run preview`.
