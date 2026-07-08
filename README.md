# 🏨 Stayora – Smart Hotel Management System

A complete full-stack **Hotel Management System** built as a 4rth-semester Computer
Science semester project. It demonstrates a PostgreSQL database (16 tables), a
Node.js + Express REST API (MVC architecture), JWT authentication, role-based
access control, and a Bootstrap + Chart.js admin dashboard.

---

## 🧱 Tech Stack

| Layer        | Technology                              |
|--------------|------------------------------------------|
| Frontend     | HTML5, CSS3, Bootstrap 5, Vanilla JS      |
| Backend      | Node.js, Express.js (MVC)                 |
| Database     | PostgreSQL (Neon Cloud only)              |
| Auth         | JWT + bcrypt                              |
| Charts       | Chart.js                                  |
| File Upload  | Multer                                    |

---

## 📁 Folder Structure

```
stayora/
├── config/
│   └── db.js                  # Neon PostgreSQL connection (pg Pool)
├── controllers/
│   ├── authController.js      # Register / Login / Logout / Profile
│   ├── dashboardController.js # Analytics queries (JOIN, COUNT, SUM, GROUP BY)
│   └── genericController.js   # Factory: full CRUD for any module
├── models/
│   ├── tableConfig.js         # Metadata for all 16 tables
│   ├── genericModel.js        # Reusable SQL query builder (CRUD)
│   └── userModel.js           # Auth-specific queries
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── uploadRoutes.js
│   ├── genericRoutes.js       # Factory: builds CRUD routes
│   └── index.js                # Mounts every route
├── middleware/
│   ├── authMiddleware.js      # JWT protect + role guard
│   ├── uploadMiddleware.js    # Multer config
│   └── errorMiddleware.js     # 404 + centralized error handler
├── utils/
│   ├── asyncHandler.js
│   └── generateToken.js
├── database/
│   └── database.sql           # Full schema + sample data (16 tables)
├── uploads/                   # Uploaded room images
├── public/                    # Frontend (served statically by Express)
│   ├── index.html, login.html, register.html, dashboard.html,
│   │   guests.html, rooms.html, bookings.html, payments.html,
│   │   employees.html, services.html, profile.html, 404.html
│   ├── css/style.css
│   └── js/ (api.js, layout.js, auth.js, dashboard.js, crud.js)
├── server.js                  # Entry point
├── app.js                     # Express app configuration
├── package.json
├── .env.example
├── postman_collection.json
├── VIVA_NOTES.md
└── README.md
```

---

## 🗄️ Database Design (16 Tables)

1. **Roles** – Admin / Receptionist
2. **Users** – staff login accounts
3. **Departments** – hotel departments
4. **Employees** – staff records
5. **Guests** – hotel guests
6. **RoomTypes** – Standard, Deluxe, Suite, Family
7. **Rooms** – individual rooms + status
8. **Bookings** – guest reservations
9. **Payments** – payments against bookings
10. **Invoices** – generated invoices
11. **Services** – Laundry, Spa, Food, Airport Pickup
12. **ServiceBookings** – services used per booking
13. **Housekeeping** – room cleaning tasks
14. **Reviews** – guest reviews/ratings
15. **ContactMessages** – public "Contact Us" form submissions
16. **ActivityLogs** – audit trail of user actions

All tables use `SERIAL` primary keys, `FOREIGN KEY` relationships, `NOT NULL`,
`UNIQUE`, and `CHECK` constraints, and are normalized to 3NF. See
`database/database.sql` for the full script (CREATE TABLE + sample INSERT data
+ INDEXES).

---

## 🚀 Setup & Running Steps

### 1. Install dependencies
```bash
npm install
```

### 2. Create a Neon PostgreSQL database
1. Go to [https://console.neon.tech](https://console.neon.tech) and create a free account/project.
2. Create a new database (e.g. `stayora`).
3. Copy the **Connection String** shown (it looks like:
   `postgresql://user:password@ep-xxxx.neon.tech/stayora?sslmode=require`)

### 3. Configure environment variables
```bash
cp .env.example .env
```
Open `.env` and paste your Neon connection string into `DATABASE_URL`.

### 4. Run the database script
Open the Neon SQL Editor (or use `psql`) and run the full contents of
`database/database.sql`. This creates all 16 tables and inserts sample data.

```bash
psql "$DATABASE_URL" -f database/database.sql
```

### 5. Start the server
```bash
npm start
```
or for auto-reload during development:
```bash
npm run dev
```

### 6. Open the app
Visit **http://localhost:5000** in your browser.

**Demo login credentials** (from sample data):
- Admin: `admin@stayora.com` / `Password123`
- Receptionist: `reception@stayora.com` / `Password123`

---

## 🔌 REST API Overview

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint             | Access  | Description         |
|--------|-----------------------|---------|----------------------|
| POST   | /auth/register         | Public  | Register new staff  |
| POST   | /auth/login             | Public  | Login, returns JWT  |
| POST   | /auth/logout            | Private | Logout (logs action)|
| GET    | /auth/profile           | Private | Get logged-in user  |

### Every module below supports full CRUD + search + filter + pagination
(`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`)

`/roles`, `/departments`, `/employees`, `/guests`, `/room-types`, `/rooms`,
`/bookings`, `/payments`, `/invoices`, `/services`, `/service-bookings`,
`/housekeeping`, `/reviews`, `/contact-messages`, `/activity-logs`

Example: `GET /api/guests?search=ali&page=1&limit=10`

### Dashboard Analytics
| Method | Endpoint                        | Description                          |
|--------|----------------------------------|---------------------------------------|
| GET    | /dashboard/summary                | Total bookings, revenue, guests, rooms|
| GET    | /dashboard/bookings                | Monthly bookings (bar chart)         |
| GET    | /dashboard/revenue                 | Monthly revenue trend (line chart)   |
| GET    | /dashboard/rooms-status             | Room status breakdown (pie chart)    |
| GET    | /dashboard/services-stats           | Top services used (bar chart)        |
| GET    | /dashboard/recent-bookings          | Last 10 bookings with JOINs          |

### Public Booking (Book Now – No Login Required)
| Method | Endpoint                | Description                                             |
|--------|--------------------------|-----------------------------------------------------------|
| GET    | /public/room-types        | List room types + pricing                                |
| GET    | /public/availability       | Check if rooms of a type are free for given dates        |
| POST   | /public/book                | Create a booking (auto-creates guest, status `PendingConfirmation`) |

This powers `public/book-now.html`, where a customer with no account can
pick dates + a room type and submit a booking request. It's auto-assigned
to the first available room of that type and created with status
`PendingConfirmation` — staff then review/confirm it from the **Bookings**
admin page (update status to `Confirmed`, `CheckedIn`, etc.).

> ⚠️ If you already ran `database.sql` before this feature was added, run
> `database/migration_add_public_booking.sql` once to update the
> `booking_status` CHECK constraint (adds the `PendingConfirmation` value).

### File Upload
| Method | Endpoint  | Description                              |
|--------|-----------|--------------------------------------------|
| POST   | /upload    | Upload a room image (multipart/form-data, field name: `image`) |

All protected routes require header: `Authorization: Bearer <token>`

---

## 🔐 Authentication & Roles

- Passwords are hashed with **bcrypt** before being stored.
- On login, a **JWT** is issued containing `user_id`, `email`, and `role_name`.
- `middleware/authMiddleware.js` verifies the token (`protect`) and can
  restrict a route to specific roles (`authorizeRoles('Admin')`).
- Example: only **Admin** can create/edit/delete Employees, Departments,
  Room Types, Services, Roles, and Activity Logs. **Receptionist** can manage
  Guests, Rooms, Bookings, Payments, etc.

---

## 📮 Postman Collection

Import `postman_collection.json` into Postman. It includes:
- Auth requests (Register, Login)
- CRUD requests for every module
- Dashboard analytics requests

After logging in via the **Login** request, copy the `token` from the
response and set it as the `token` collection variable (or paste it into the
`Authorization: Bearer` header of other requests).

---

## 🧪 Quick Manual Test Checklist

1. `npm start` → console shows "Connected to Neon PostgreSQL" ✅
2. Visit `/` → Home page loads ✅
3. Login with demo Admin account → redirected to Dashboard ✅
4. Dashboard shows 4 charts + 5 summary cards + recent bookings table ✅
5. Add / Edit / Delete a Guest, Room, Booking, Payment, Employee, Service ✅
6. Logout → redirected to login, protected pages redirect back to login ✅

---

## 👩‍🎓 Author Notes

This project was Created to be **fully working out of the box** with a
Neon cloud PostgreSQL database — no local database setup is required.# StayOra-fullstack_project
