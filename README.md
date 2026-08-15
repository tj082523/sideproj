E-commerce Booking System

React frontend, PHP REST API, MySQL database. Public booking site and the
admin dashboard are fully separate areas of the app, gated by user role.

## Structure

```
booking-system/
├── backend/          PHP REST API
│   ├── config/        database.php, cors.php
│   ├── includes/       helpers.php (auth/token helpers)
│   ├── api/            all endpoints (auth, services, bookings, users, dashboard)
│   └── database/       schema.sql
└── frontend/          React (Vite)
    └── src/
        ├── pages/public   Home, Services, Booking, Login, Register, My Bookings
        └── pages/admin    Dashboard, Bookings, Services, Users (with Trash/Restore)
```

## Key feature: undo-able user deletion

Deleting a user in the admin dashboard never removes the row immediately.
It sets a `deleted_at` timestamp, which:
- hides the account from login and all public listings
- moves it into the admin **Trash** tab

From Trash, an admin can **Restore** the account (clears `deleted_at`) or
**permanently delete** it (irreversible, and only allowed once it's already
in the trash, as a safety guard). Every action is written to
`admin_action_log` for auditing. A one-click **Undo** toast also appears
right after a delete.

## 1. Database setup

```bash
mysql -u root -p < backend/database/schema.sql
```

This creates the `booking_system` database, all tables, a seed admin account,
and a few sample services.

**Seed admin login:** `admin@bookingsystem.com` / `Admin123!`
(change this password after first login in a real deployment)

## 2. Backend setup

Requires PHP 8+ with the `pdo_mysql` extension, served by Apache or PHP's
built-in server.

```bash
cd backend
# Point these at your MySQL instance (or edit config/database.php directly)
export DB_HOST=127.0.0.1
export DB_NAME=booking_system
export DB_USER=root
export DB_PASS=yourpassword

php -S localhost:8000
```

The API is now available at `http://localhost:8000/api/...`, e.g.
`http://localhost:8000/api/services.php`.

## 3. Frontend setup

Requires Node.js 18+.

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if your API isn't on localhost:8000
npm run dev
```

Visit `http://localhost:5173` for the public site.
Visit `http://localhost:5173/admin/login` for the admin dashboard.

## API overview

| Endpoint | Methods | Notes |
|---|---|---|
| `/api/auth/register.php` | POST | Public sign-up |
| `/api/auth/login.php` | POST | Returns bearer token |
| `/api/auth/logout.php` | POST | Revokes token |
| `/api/auth/me.php` | GET | Current user |
| `/api/services.php` | GET, POST, PUT, DELETE | GET is public; write ops require admin |
| `/api/bookings.php` | GET, POST, PUT, DELETE | Customers see/manage their own; admins see all |
| `/api/users.php` | GET, POST, DELETE | Admin only. Soft delete, restore, trash listing |
| `/api/dashboard.php` | GET | Admin-only summary stats |

All authenticated requests send `Authorization: Bearer <token>`.

## Notes for production

- Swap the simple bearer-token auth for shorter-lived tokens + refresh if needed.
- Serve the backend behind HTTPS and restrict CORS origins in `config/cors.php`.
- Set a strong `DB_PASS` and don't commit real credentials.
