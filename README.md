# Loyalty Program

A full-stack web application where users register, submit purchase receipts, and receive vouchers once an administrator validates their receipt.

Built as a take-home assessment.

## Tech Stack

- **Frontend:** React (Vite), Material UI, React Router, Axios, Notistack
- **Backend:** Node.js, Express
- **Database:** PostgreSQL 18
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Multer (local disk storage)
- **Email:** Nodemailer with Ethereal (test SMTP)
- **Containerization:** Docker + Docker Compose (optional)

## Project Structure

```
Loyalty Program/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── pages/       # One folder per page/route
│       ├── components/  # Reusable UI pieces
│       ├── context/     # AuthContext (app-wide login state)
│       └── utils/       # api_*.js (API calls), axiosInstance, config, formatDate
├── server/              # Express backend
│   ├── controllers/     # Business logic per resource
│   ├── models/          # Sequelize models + associations
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Auth, admin-check, file upload
│   ├── utils/           # Helpers (phone normalization, voucher codes, pagination, mailer)
│   ├── uploads/         # Uploaded receipt/avatar files (gitignored)
│   └── seed.js          # Creates the initial admin account
└── README.md
```

## Architecture & Key Design Decisions

**Layered backend structure.** Routes → Controllers → Models, with a `middleware/` layer for cross-cutting concerns (auth, admin checks, file upload validation). This keeps each layer focused on a single responsibility and matches common Express project conventions.

**Authentication.** JWT-based, stateless. Tokens are issued on login/register and carry `{ id, role }`. Passwords are hashed with bcrypt before storage — never stored or transmitted as plain text. Role-based authorization (`user` vs `admin`) is enforced via an `isAdmin` middleware on every admin route, in addition to the frontend hiding admin UI from regular users — the backend is the actual source of truth for authorization, not just the UI.

**Registration: email or phone number.** A user can register with either an email address or a phone number (or both) — enforced by a Sequelize model-level validator (`emailOrPhone`) so this rule holds regardless of which endpoint is used to create/update a user. Phone numbers are normalized server-side (via a `normalizePhone` utility) to a consistent `+60XXXXXXXXX` format, tolerant of however the user actually typed it (with/without leading 0, with dashes/spaces, with/without the country code already included).

**Database design.** Three core tables: `users`, `receipts`, `vouchers`.

- `receipts.userId` → FK to `users.id`
- `vouchers.userId` → FK to `users.id`
- `vouchers.receiptId` → FK to `receipts.id`, with a **unique constraint**

That unique constraint on `vouchers.receiptId` is a deliberate choice: it makes it _structurally impossible_ for one receipt to generate more than one voucher, even under a race condition or a repeated approval request — enforcing business rule 6 at the database level, not just in application logic.

**Receipt status flow.** `PENDING → APPROVED` or `PENDING → REJECTED`, enforced in the `approveReceipt`/`rejectReceipt` controllers: any receipt not currently `PENDING` is rejected with a `409 Conflict` before any state change happens. Rejections require a reason, which is stored and shown to the user (an addition beyond the base spec).

**File uploads.** Handled with Multer, storing files on local disk under `uploads/`, served statically via Express. Both receipt and avatar uploads are restricted by MIME type (JPEG, PNG, and PDF for receipts; JPEG and PNG for avatars) and a file size limit, checked server-side regardless of what the frontend's file picker allows.

**Validation, submission window & duplicate prevention.** A receipt's purchase date must fall within the last 30 days and cannot be in the future — both enforced client-side (via the date input's `min`/`max`) and server-side (the actual enforcement). Duplicate `orderId` submissions are blocked while a prior submission with that same order ID is still `PENDING` or `APPROVED`, but a **rejected** receipt's order ID can be resubmitted — so a user can correct and resubmit a receipt that was rejected for a fixable reason (e.g. a blurry photo), without permanently losing access to that order ID.

**Vouchers: expiry and redemption.** Vouchers expire 30 days after issuance and can be redeemed exactly once. Both states are enforced server-side on the redeem endpoint (`409` if already redeemed or expired), and reflected in the UI via a derived status (Active / Redeemed / Expired) rather than exposing the raw boolean flags directly.

**Pagination, search, filter, sort.** All list endpoints (`receipts`, `admin/receipts`, `vouchers`) support pagination. Admin's receipt list additionally supports searching by order ID, submitter name, or submitter email; filtering by status, amount range, and purchase date range; and sorting by several fields — all combinable. Sort fields are whitelisted server-side (never passed directly into a raw `ORDER BY`) to avoid unsafe/arbitrary column references.

**Email notifications.** Approvals/rejections trigger an email via Nodemailer, using Ethereal (a fake SMTP service for development/testing — emails are viewable via a generated preview URL rather than a real inbox). Email sending is wrapped so a failure never blocks the actual approve/reject action; it's a side effect, not a dependency of the core business logic. Users who registered with phone-only (no email on file) are silently skipped.

**Frontend architecture.** A single `AuthContext` holds the logged-in user and token, backed by `localStorage` for persistence across refreshes. `ProtectedRoute` and `AdminRoute` wrapper components handle route-level access control. A shared `axiosInstance` automatically attaches the JWT to every request and redirects to `/login` on a `401` response. Pages that display the same kind of data (receipts, vouchers) render a proper `Table` on larger screens and a stacked `Card` list on mobile, rather than forcing a many-column table into a narrow viewport.

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL 18
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/KirenRaj95/loyalty-program.git
cd loyalty-program
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env_example`) and fill in real values:

```bash
cp .env_example .env
```

```
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loyalty_program

PORT=5000

JWT_SECRET=your_generated_secret
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose_a_password
```

Generate a secure `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Database setup

Create the database:

```bash
psql -U postgres
```

Then run:

```sql
CREATE DATABASE loyalty_program;
```

The application uses `sequelize.sync()` on startup to create tables automatically based on the models — no separate migration step is required for first-time setup.

### 4. Run the backend

```bash
npm run dev
```

Server runs on `http://localhost:5000` by default.

On startup, Sequelize connects to the `loyalty_program` database and automatically creates the required tables.

### 5. Seed the admin account

Once the backend has started successfully and the database tables have been created, open a **new terminal** and run:

```bash
npm run seed
```

This creates one admin account using the `ADMIN_EMAIL`/`ADMIN_PASSWORD` from your `.env`. Running it again is safe — it detects an existing admin and skips.

### 6. Frontend setup

In a separate terminal:

```bash
cd client
npm install
```

Create `client/.env` (copy from `.env_example`):

```bash
cp .env_example .env
```

```
VITE_API_BASE_URL=http://localhost:5000
```

### 7. Run the frontend

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

### 8. Log in

- Visit `http://localhost:5173`
- Register a new account, or log in as the seeded admin using the credentials from your `.env`

## Testing

The application was manually tested end-to-end covering: registration/login (email and phone, including validation edge cases), receipt submission and validation rules, the full approve/reject/voucher-issuance flow including repeat-approval protection, voucher redemption/expiry, pagination/search/filter/sort on all applicable list views, file upload restrictions, and role-based access control on every admin route.

## AI-Assisted Development

I developed this project myself, with Claude (Anthropic) used as a supporting tool during development when needed. It was mainly used for occasional guidance, debugging suggestions, and helping review or refine parts of the implementation.

The overall architecture, database design, application flow, business logic, feature decisions, and implementation were handled by me. I reviewed and adapted any suggestions before incorporating them into the project and made sure I understood how the resulting code worked.

AI was mainly used as a development aid to improve efficiency and help resolve issues during the development process. I remained responsible for the implementation and have a clear understanding of the code and decisions made throughout the project.

## Known Limitations / Possible Future Work

- Email notifications use Ethereal (test SMTP) rather than a production email provider
- No rate limiting on authentication endpoints
- No image optimization/resizing on upload
