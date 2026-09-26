# Resona - LastMile Alert System

> An Emergency Warning & Resilient Disaster Broadcast System with Full Authentication and MongoDB Integration.

---

## 🍃 MongoDB Configuration

- **MongoDB Connection URI:** `mongodb://localhost:27017/resona_db`
- **Database Name:** `resona_db`
- **Collections:**
  - `users` (Personnel credentials, roles, agency, hashed passwords with bcrypt)
  - `alerts` (CAP XML, SMS 140, LoRa payloads, multi-lingual translations)
  - `telemetries` (Broadcast delivery metrics, towers, acknowledgements)
  - `acknowledgements` (Citizen SOS & safety check-ins)

---

## 🔐 Authentication System (Login & Register)

### Backend Endpoints (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Registers a new responder or citizen and saves directly into MongoDB `users` collection |
| `POST` | `/api/auth/login` | Validates credentials against MongoDB with bcrypt password verification & returns JWT |
| `GET` | `/api/auth/me` | Fetches active authenticated user session from MongoDB |
| `GET` | `/api/auth/users` | Lists all registered accounts currently stored in MongoDB |
| `POST` | `/api/auth/seed-demo` | Seeds demonstration accounts in MongoDB if empty |

### Pre-Seeded MongoDB Demo Accounts
- **Disaster Commander:** `commander@resona.gov.in` / `Password123!`
- **Meteorological Specialist:** `priya.imd@gov.in` / `Password123!`
- **Citizen Volunteer:** `ramesh.volunteer@gmail.com` / `Password123!`

---

## 🚀 Running the Project

### 1. Start MongoDB
Ensure MongoDB is running locally on port `27017`:
```bash
# Standard local MongoDB
mongodb://localhost:27017/
```

### 2. Start the Backend
```bash
cd BACKEND
npm install
node server.js
```
The backend server runs on `http://localhost:5000`.

### 3. Start the Frontend
```bash
cd FRONTEND
npm install
npm run dev
```
The frontend dev server runs on `http://localhost:5173`.
