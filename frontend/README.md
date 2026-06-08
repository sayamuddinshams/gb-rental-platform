# 💻 RentGB - React Frontend Client

This is the frontend client module of the RentGB broker-free property portal, built using React, Vite, and Tailwind CSS.

## 🛠️ Step-by-Step Run & Setup Instructions

Follow these steps to run the frontend client on your local machine:

### 1. Install Node.js
Ensure you have Node.js installed. Check version via:
```bash
node -v
npm -v
```

### 2. Install Dependencies
Navigate to the `frontend/` directory in your terminal and run:
```bash
npm install
```

### 3. Start Development Server
Ensure the backend server is running at `http://localhost:5000` (refer to backend README). Then launch the Vite frontend server:
```bash
npm run dev
```
The client will start, and you can access the application in your browser at:
`http://localhost:5173`

### 4. Build for Production
To bundle the frontend for production distribution:
```bash
npm run build
```
This compiles the code into static files in the `dist/` directory.

### 5. Local Production Preview
To preview your compiled build locally:
```bash
npm run preview
```

---

## 📂 Folder Architecture
*   `src/context/` - Global context wrappers for Theme toggling, notifications toast alerts, and JWT/role state authentication management.
*   `src/layouts/` - Common templates (header/footer main container layout and sidebars dashboard portals template).
*   `src/pages/` - Contains subfolders for different user experiences:
    *   `public/` - Landing page (`Home`), property lists, detailed views, and login/signup auth screens.
    *   `tenant/` - Booking scheduler calendar logs, messages inbox panel, and settings profile.
    *   `owner/` - Property listing editor forms, visit logs vetting status tables, and business stats.
    *   `admin/` - System growth KPI indicators, user account activation controls, and audit security events logs.

---

## 📡 API Proxying
To prevent Cross-Origin Resource Sharing (CORS) errors during development, requests made to `/api/*` are configured in `vite.config.js` to automatically proxy through to the backend server at `http://localhost:5000`.
