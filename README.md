# SamayPhotoManage

Event photography studio management system — MERN stack (MongoDB, Express, React, Node).

## Project structure

```
server/
  src/
    config/      # DB connection
    models/      # Mongoose schemas (one file per collection)
    middleware/   # auth, validation, error handling
    controllers/  # request handlers
    routes/       # Express routers, mounted under /api
    utils/        # shared helpers (JWT, zod schemas, async wrapper)
    app.js        # Express app (middleware + routes)
    server.js     # boot: connect DB, seed admin, listen
    seed.js       # optional demo data

client/
  src/
    components/
      ui/         # Button, Card, Input, Badge, Dialog (shadcn-style primitives)
      layout/     # Sidebar, Topbar, AppShell, FinancePinDialog
      dashboard/   # StatCard, ListCard
      customers/   # QuickAddDialog, WorkflowCard
    pages/         # Dashboard, Customers, CustomerForm, CustomerDetail, Finance, Settings
    lib/           # axios instance, cn()/money()/formatDate() helpers
    App.jsx        # routing + auth gate
    main.jsx       # entry point
```

## Setup

1. Copy `server/.env.example` to `server/.env` and fill in real values (MongoDB URI, JWT secret, admin credentials, finance PIN).
2. Install dependencies:
   ```
   npm install --workspace server
   npm install --workspace client
   ```
3. (Optional) seed demo data: `npm --workspace server run seed`
4. Run both apps: `npm run dev` (from the repo root)

The first admin account is created automatically from `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `FINANCE_PIN` on server startup.

## Notes

- `react-query@3` is installed with `--legacy-peer-deps` since its peer range predates React 19; it works correctly at runtime.
- Dashboard intentionally excludes all financial data — that lives behind the PIN-gated Finance page.
