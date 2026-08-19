# Ganesh Chaturthi Utsav — Digital Collection & Expense Tracker

Replaces the manual collection book with a mobile-friendly web app. Public visitors
can view day-wise collections/expenses, programs, sponsors, annadanam sponsors and
velam paata items. Committee admins log in to enter data from their phones.

Stack: **React (Vite) + Tailwind** frontend, **Spring Boot + Spring Security (JWT) + MySQL** backend.

---

## 1. Project layout

```
ganesh-app/
  backend/     Spring Boot API (Java 17, Maven)
  frontend/    React app (Vite)
```

## 2. Backend setup

### Prerequisites
- Java 17+
- Maven (or use your IDE's built-in Maven)
- MySQL 8 running locally (or a free-tier MySQL from Railway/Aiven)

### Steps
1. Create the database (or let it auto-create — `createDatabaseIfNotExist=true` is
   already set in `application.properties`):
   ```sql
   CREATE DATABASE ganesh_festival;
   ```
2. Open `backend/src/main/resources/application.properties` and set your MySQL
   username/password (defaults to `root`/`root`).
3. **Change `app.jwt.secret`** to a long random string before you deploy anywhere
   public.
4. Run it:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The API starts on `http://localhost:8080`.
5. On first boot, a default admin login is created automatically:
   - Email: `admin@ganeshfest.local`
   - Password: `Admin@123`

   **Log in and note this down — there's no "forgot password" flow yet, so if you
   want to change it, do it via a direct SQL update on `admin_user` for now, or add
   more admins by inserting rows with a bcrypt-hashed password.**

### Adding more admin users (quick way, via SQL)
Spring Security's `PasswordEncoder` here is BCrypt. Generate a bcrypt hash (there
are free online bcrypt generators, or use Python's `bcrypt` package) and insert:
```sql
INSERT INTO admin_user (name, email, password_hash, role)
VALUES ('Second Admin', 'admin2@example.com', '<bcrypt-hash-here>', 'ADMIN');
```

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# edit .env to point VITE_API_BASE_URL at your backend, e.g. http://localhost:8080/api
npm run dev
```
Opens on `http://localhost:5173`. On mobile, use `npm run dev -- --host` and open
`http://<your-computer's-LAN-IP>:5173` from your phone (same wifi) to test the
mobile layout on a real device.

## 4. First-time data entry (do this in order)

1. Log into `/admin/login`.
2. Go to **Admin → Festival Year & Days** and create this year (e.g. 2026). If
   you're digitizing partway through the committee's history, also enter the
   **opening balance** — the amount already in hand from all previous years'
   manual books. This gets added into this year's totals automatically.
3. Add each festival day (Chaturthi day 1, day 2, ... Visarjan day) with its date.
   This is only needed for the actual festival days themselves.
4. Use **Collections** and **Expenses** to enter donations/spending. These
   aren't limited to festival days — collection usually starts 10-15 days
   before the festival, and some expenses (mandap booking, advance payments)
   happen early too. Just pick the real date and enter the amount — that's it.
   The app automatically checks that date against the festival days you set up
   in step 3: if it matches one, the entry silently shows up in that day's
   ledger; if not, it just counts toward the year's total. Nobody has to
   decide "is this a festival day or not" — there's no such choice to make.
5. Use **Programs**, **Sponsors**, **Annadanam Sponsors**, and **Velam Paata
   Items** to fill in the rest.
6. For velam paata: add each item with a starting price and optional photo, then
   later tap **Mark as Sold** with the buyer's name and final price once it's
   auctioned off.
7. If the committee lends part of the surplus to villagers at interest (vaddi),
   use **Admin → Village Lending** to record each loan (principal, rate —
   defaults to ₹2 per ₹100) and log repayments as they come in (split into
   principal vs interest). This is admin-only — borrower names never appear on
   the public site, only the aggregate "currently lent out" and "interest
   earned" figures on the dashboard.

Public visitors don't need to log in — everything under the main nav (Dashboard,
Day-wise Ledger, Programs, Annadanam Sponsors, Sponsors, Velam Paata, Past Years)
is open to anyone with the link. The public dashboard shows **cash in hand**,
which already accounts for the opening balance, this year's collection/expense,
and any money currently out on loan to the village.

## 5. Loading last year's book as historical reference (optional)

Create a `FestivalYear` for last year (mark `active = false`), add its days, then
enter the same historical numbers from your book into Collections/Expenses. It'll
then show up under **Past Years** for comparison.

## 6. Deploying for free

| Piece | Free option |
|---|---|
| Backend (Spring Boot) | Render or Railway free web service |
| Database (MySQL) | Railway free MySQL, or Aiven free MySQL |
| Frontend (React) | Vercel or Netlify free tier |
| Velam item photos | Local disk works for low traffic, but Render/Railway free tiers wipe disk on redeploy — switch to Cloudinary free tier if photos matter long-term |

Steps in short:
1. Push `backend/` and `frontend/` to two GitHub repos (or one repo, two folders).
2. On Render/Railway: new web service from the backend repo, add a MySQL addon,
   set env vars `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
   `SPRING_DATASOURCE_PASSWORD`, and `APP_JWT_SECRET` (maps to `app.jwt.secret`)
   instead of hardcoding them in `application.properties`.
3. On Vercel/Netlify: new project from the frontend repo, set env var
   `VITE_API_BASE_URL` to your deployed backend URL + `/api`.
4. Update `app.cors.allowed-origins` in the backend (or its env var equivalent) to
   include your deployed frontend URL, so the browser isn't blocked by CORS.
5. Free backend tiers sleep after inactivity and take 30-60s to wake up on the
   first request — fine here since traffic is bursty around the festival, but
   worth opening the site once yourself 5 minutes before you expect visitors.

## 7. API reference (short version)

**Public (no login, GET only):**
```
GET /api/public/years
GET /api/public/years/{year}/dashboard
GET /api/public/years/{year}/days
GET /api/public/days/{dayId}
GET /api/public/years/{year}/programs
GET /api/public/years/{year}/annadanam-sponsors
GET /api/public/years/{year}/sponsors
GET /api/public/years/{year}/velam-items
```

**Admin (JWT required, `Authorization: Bearer <token>`):**
```
POST /api/auth/login
POST/PUT/DELETE /api/admin/setup/years, /api/admin/setup/days
POST/PUT/DELETE /api/admin/collections
POST/PUT/DELETE /api/admin/expenses
POST/PUT/DELETE /api/admin/programs
POST/PUT/DELETE /api/admin/sponsors
POST/PUT/DELETE /api/admin/annadanam-sponsors
POST/PUT/DELETE /api/admin/velam-items
POST /api/admin/velam-items/{id}/mark-sold
POST /api/admin/velam-items/{id}/unsell
POST /api/admin/velam-items/upload-image  (multipart file upload)
```

## 8. What's intentionally simple (fine for a temple-committee scale app)

- No password reset flow — reset via SQL directly if needed.
- Velam item photos are stored on local disk by default (swap for Cloudinary if
  you need them to survive redeploys).
- No pagination — fine for a few hundred donation entries per festival; revisit
  if this grows to thousands of rows per day.
