# 💻 RentGB - React Frontend Client

This is the frontend client module of the RentGB broker-free property portal, built using React, Vite, and Tailwind CSS.

## 🚀 Dev Scripts
From within this folder, you can run:
*   `npm run dev` - Launches the Vite development server at `http://localhost:5173`.
*   `npm run build` - Compiles the project assets into production-ready static files in the `dist` folder.
*   `npm run preview` - Previews the locally built production output.

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
