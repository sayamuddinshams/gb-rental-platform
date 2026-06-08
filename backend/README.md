# ⚙️ RentGB - Node/Express Backend API Server

This is the backend REST API server of the RentGB broker-free property portal, built using Node.js and Express.

## 🛠️ Step-by-Step Run & Setup Instructions

Follow these steps to run the backend API server on your local machine:

### 1. Install Node.js
Make sure you have Node.js (LTS version recommended) installed. You can check your version by running:
```bash
node -v
npm -v
```

### 2. Install Dependencies
Navigate to the `backend/` directory in your terminal and run:
```bash
npm install
```

### 3. Environment Configuration
The backend requires environment variables to run. A preconfigured [.env](file:///c:/Users/uddin/OneDrive/Desktop/fyp/backend/.env) file is already created for you in this directory. 
- By default, the application runs in **JSON mode** (`DB_MODE=json`), which does not require installing any database. It writes database tables directly into a local JSON store file ([db_store.json](file:///c:/Users/uddin/OneDrive/Desktop/fyp/backend/data/db_store.json)).
- If you wish to connect to a live PostgreSQL database:
  1. Set `DB_MODE=postgres` in `.env`.
  2. Provide your Postgres connection string in the `DATABASE_URL` variable.

### 4. Seed Mock Data
To populate the database (either your PostgreSQL database or the offline JSON engine) with mock listings, users, messages, and bookings, run the following command:
```bash
npm run db:seed
```

### 5. Launch the Server
Start the development server with live reload:
```bash
npm run dev
```
The server will start, and the API endpoints will be accessible at: `http://localhost:5000`

---

## 🗄️ Dual-Mode Database Engine (`config/db.js`)
The API server automatically adjusts to your environment availability:
1.  **Production/Postgres mode**: Connects to a PostgreSQL database if `DB_MODE=postgres` is set in the `.env` file along with `DATABASE_URL`.
2.  **JSON fallback mode (Default)**: If no database credentials are found or `DB_MODE=json` is set, it switches automatically to a JSON database persistence file (`data/db_store.json`), which mimics SQL database query transactions using a regex router (`utils/mockDb.js`). This enables running the application offline instantly without setting up databases.

---

## 📂 Folder Architecture
*   `config/` - Schema definitions (`schema.sql`) and database client pool connection router.
*   `controllers/` - Route handlers mapping request payloads to DB operations.
*   `middleware/` - Stateless JWT validation checks, role verification rules, and error-handling utilities.
*   `routes/` - Express endpoint mappings for auth, listings, tours, notifications, and administrative logs.
*   `utils/` - Seeder utilities (`seed.js`) and simulated SQL database persistence controllers.
