# ⛰️ RentGB - Broker-Free Property Listing & Rental Portal

RentGB is a premium, localized, full-stack rental and property listing web portal designed specifically for the Gilgit-Baltistan region. The portal facilitates direct peer-to-peer interaction between tenants and property owners, eliminating high brokerage fees and middlemen. 

---

## 🚀 Key Features

### 👤 Tenant Portal
- **Property Discovery**: Filter rentals by city (Gilgit, Skardu, Hunza, Nagar, etc.), category (home, apartment, room, shop), and price.
- **Tour Booking**: Schedule visit requests for properties with desired dates and times.
- **Direct Messaging**: Chat in real-time with property owners directly from the dashboard.
- **Wishlist & History**: Save favorite listings for future reference.

### 🏢 Property Owner Portal
- **Listing Management**: Add, edit, publish, or archive listings with rich details and photo galleries.
- **Booking Approvals**: Accept or decline visit tour requests.
- **Performance Analytics**: View listing views, total listings count, and customer inquires.
- **Profile Customization**: Manage contact information, business details, and address.

### 👑 Administrator Console
- **Registries Management**: View, approve, or ban tenant and landlord accounts.
- **Vetting Queue**: Approve or reject property submissions before they go public.
- **Complaints System**: Review user reports and resolve disputes or flag spam listings.
- **Audit Trails**: Monitor real-time logs tracking administrative actions (banning, approvals).

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React (Vite-powered, ES Modules), Tailwind CSS, Framer Motion (animations), Recharts (KPI graphs), Lucide React (icons).
- **Backend**: Node.js, Express.js.
- **Database (Dual-Mode)**:
  - **Production**: PostgreSQL (NeonDB, ElephantSQL compatible).
  - **Local/Offline Fallback**: In-memory and JSON-persisted SQL parser (`backend/utils/mockDb.js`). This enables running the entire application out-of-the-box without PostgreSQL set up.
- **Authentication**: Stateless JWT token-based auth with Role-Based Access Control (RBAC).

---

## 📦 Directory Structure

The project is split into separate **frontend** and **backend** folders for a clean, modular Final Year Project setup:

```text
fyp/
├── frontend/                   # React Frontend Project
│   ├── src/                    # Components, pages, state context
│   ├── index.html              # Vite index template
│   ├── vite.config.js          # Vite config & proxy redirects
│   ├── tailwind.config.js      # Tailwind theme configuration
│   ├── postcss.config.js       # PostCSS loader config
│   └── package.json            # React Client dependencies
├── backend/                    # Express Backend Project
│   ├── config/                 # Database config & SQL migrations
│   │   ├── db.js               # Connection Router (Postgres / JSON mock switcher)
│   │   └── schema.sql          # Base PostgreSQL database schema
│   ├── controllers/            # Controller logic (auth, property, bookings, messages, admin)
│   ├── middleware/             # Express middlewares (JWT check, error handler)
│   ├── routes/                 # API Endpoint routes definitions
│   ├── utils/                  # Mock database persists & seeder logic
│   │   ├── mockDb.js           # JSON-persisted SQL query simulation router
│   │   └── seed.js             # Seeding logic script
│   ├── server.js               # Express entrypoint
│   └── package.json            # Node.js Express server dependencies
├── package.json                # Root orchestration package
└── verify-files.js             # Project integrity verifier
```

---

## ⚡ Setup & Run Instructions

To run RentGB on your local system, follow these instructions step-by-step:

### 1. Pre-requisites (Node.js Installation)
Ensure that **Node.js** and **NPM** are installed on your computer.
1. Download Node.js from the official site: [https://nodejs.org/](https://nodejs.org/) (Choose the LTS version).
2. Install it on your machine.
3. Open a command prompt or terminal and check the installation:
   ```bash
   node -v
   npm -v
   ```

### 2. Install Project Dependencies
Open your project root folder in terminal (`fyp/`) and run the following command to download and install all frontend & backend dependencies concurrently:
```bash
npm run install:all
```

### 3. Database Selection (Optional configuration)
The system works on **JSON persistence mode** by default. However, if you wish to run it with a live PostgreSQL database:
1. Open [backend/.env](file:///c:/Users/uddin/OneDrive/Desktop/fyp/backend/.env).
2. Set the database variables:
   ```env
   DB_MODE=postgres
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET=your_jwt_secret_token
   PORT=5000
   ```

### 4. Run database seeder (Mock Data Setup)
To populate the database (either PostgreSQL or the JSON engine) with mock property listings, cities, and initial accounts, run:
```bash
npm run db:seed
```

### 5. Launch the Application
Start the concurrent development environment. This command runs both the Node.js Express API server and the Vite React frontend dev server at the same time:
```bash
npm run dev
```

- **Frontend client** will run at: `http://localhost:5173`
- **Backend API server** will run at: `http://localhost:5000`

---

## 🔑 Demo Account Credentials

You can log in to any of the portal modes using the pre-seeded demo accounts:

| Portal Role | Email Address | Password | Key Access |
| :--- | :--- | :--- | :--- |
| **Tenant** | `tenant@gmail.com` | `tenant123` | Bookings, Chats, Wishlist, Profile settings |
| **Property Owner** | `owner@gmail.com` | `owner123` | Listing manager, Tour manager, Charts, Profile settings |
| **Administrator** | `admin@gmail.com` | `admin123` | Users registry, Listing approvals, Reports panel, Audit logs |

---

## 🔍 Validation Tracing
To verify that all files are correctly installed, run the check script using Node:
```bash
node verify-files.js
```
This script will trace the directory and output a confirmation log indicating that all frontend modules, layouts, and backend endpoints are complete.
