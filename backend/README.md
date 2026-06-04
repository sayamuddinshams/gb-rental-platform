# ⚙️ RentGB - Node/Express Backend API Server

This is the backend REST API server of the RentGB broker-free property portal, built using Node.js and Express.

## 🚀 Dev Scripts
From within this folder, you can run:
*   `npm start` - Launches the production Node.js server.
*   `npm run dev` - Runs the API server at `http://localhost:5000`.
*   `npm run db:seed` - Populates the active database (Postgres or local mock DB engine) with standard dummy data.

---

## 🗄️ Dual-Mode Database Engine (`config/db.js`)
The API server automatically adjusts to your environment availability:
1.  **Production mode**: Connects to a PostgreSQL database if `DB_MODE=postgres` is set in the `.env` file along with `DATABASE_URL`.
2.  **JSON fallback mode (Default)**: If no database credentials are found, it switches automatically to a JSON database persistence file (`data/db_store.json`), which mimics SQL database query transactions using a regex router (`utils/mockDb.js`). This enables running the application offline instantly without setting up databases.

---

## 📂 Folder Architecture
*   `config/` - Schema definitions (`schema.sql`) and database client pool connection router.
*   `controllers/` - Route handlers mapping request payloads to DB operations.
*   `middleware/` - Stateless JWT validation checks, role verification rules, and error-handling utilities.
*   `routes/` - Express endpoint mappings for auth, listings, tours, notifications, and administrative logs.
*   `utils/` - Seeder utilities (`seed.js`) and simulated SQL database persistence controllers.
