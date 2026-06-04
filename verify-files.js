import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPECTED_FILES = [
  // Root & Orchestration
  'package.json',
  'verify-files.js',
  'frontend/README.md',
  'backend/README.md',

  // Frontend Project structure
  'frontend/package.json',
  'frontend/vite.config.js',
  'frontend/tailwind.config.js',
  'frontend/postcss.config.js',
  'frontend/index.html',
  'frontend/src/main.jsx',
  'frontend/src/index.css',
  'frontend/src/context/AuthContext.jsx',
  'frontend/src/context/ThemeContext.jsx',
  'frontend/src/context/NotificationContext.jsx',
  'frontend/src/layouts/MainLayout.jsx',
  'frontend/src/layouts/DashboardLayout.jsx',

  // Frontend pages
  'frontend/src/pages/public/Home.jsx',
  'frontend/src/pages/public/PropertyList.jsx',
  'frontend/src/pages/public/PropertyDetail.jsx',
  'frontend/src/pages/public/AuthPages.jsx',
  'frontend/src/pages/tenant/TenantDashboard.jsx',
  'frontend/src/pages/tenant/TenantBookings.jsx',
  'frontend/src/pages/tenant/TenantMessages.jsx',
  'frontend/src/pages/tenant/TenantProfile.jsx',
  'frontend/src/pages/owner/OwnerDashboard.jsx',
  'frontend/src/pages/owner/OwnerProperties.jsx',
  'frontend/src/pages/owner/OwnerBookings.jsx',
  'frontend/src/pages/owner/OwnerProfile.jsx',
  'frontend/src/pages/admin/AdminDashboard.jsx',
  'frontend/src/pages/admin/AdminUsers.jsx',
  'frontend/src/pages/admin/AdminProperties.jsx',
  'frontend/src/pages/admin/AdminReports.jsx',
  'frontend/src/pages/admin/AdminLogs.jsx',

  // Backend Component structure
  'backend/package.json',
  'backend/server.js',
  'backend/config/db.js',
  'backend/config/schema.sql',
  'backend/middleware/auth.js',
  'backend/middleware/errorHandler.js',
  'backend/controllers/authController.js',
  'backend/controllers/propertyController.js',
  'backend/controllers/bookingController.js',
  'backend/controllers/messageController.js',
  'backend/controllers/adminController.js',
  'backend/routes/authRoutes.js',
  'backend/routes/propertyRoutes.js',
  'backend/routes/bookingRoutes.js',
  'backend/routes/messageRoutes.js',
  'backend/routes/adminRoutes.js',
  'backend/utils/mockDb.js',
  'backend/utils/seed.js'
];

console.log('====================================================');
console.log('        RentGB Code Verification Tool v2.0         ');
console.log('====================================================\n');

let missingCount = 0;
let successCount = 0;

for (const relPath of EXPECTED_FILES) {
  const absPath = path.join(__dirname, relPath);
  if (fs.existsSync(absPath)) {
    const stats = fs.statSync(absPath);
    console.log(`[ OK ] ${relPath.padEnd(45)} (${stats.size} bytes)`);
    successCount++;
  } else {
    console.error(`[FAIL] ${relPath.padEnd(45)} (File Missing!)`);
    missingCount++;
  }
}

console.log('\n====================================================');
console.log(`Verification Summary:`);
console.log(`- Total Files Verified: ${EXPECTED_FILES.length}`);
console.log(`- Success:              ${successCount}`);
console.log(`- Missing:              ${missingCount}`);
console.log('====================================================');

if (missingCount > 0) {
  console.error('\nERROR: Verification failed. Some required files are missing.');
  process.exit(1);
} else {
  console.log('\nSUCCESS: All expected application files are present and account-vetted!');
  process.exit(0);
}
