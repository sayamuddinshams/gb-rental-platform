import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configs & database utilities
import db from './config/db.js';
import { loadDb } from './utils/mockDb.js';
import seed from './utils/seed.js';

// Import middlewares
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with Vite's client address
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial Database check/seed (runs asynchronously at startup)
const initializeDatabase = async () => {
  try {
    if (process.env.DB_MODE === 'json' || !process.env.DATABASE_URL) {
      loadDb();
      // If mock db is completely fresh/empty, trigger seeder
      const userCheck = await db.query('SELECT * FROM users');
      if (userCheck.rows.length === 0) {
        console.log('Detected empty mock database. Auto-seeding default data...');
        await seed();
      }
    } else {
      // Postgres mode: check if users exist, otherwise guide developer to seed
      const userCheck = await db.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCheck.rows[0].count, 10) === 0) {
        console.log('PostgreSQL database is connected but empty. You can run "npm run db:seed" to populate it.');
      }
    }
  } catch (err) {
    console.error('Database initialization warning:', err.message);
  }
};

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    dbMode: process.env.DB_MODE || 'json'
  });
});

// Fallback for static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('RentGB Express Server is running in development mode.');
  });
}

// Catch-all API 404s
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API Endpoint not found: [${req.method}] ${req.originalUrl}` });
});

// Apply Global Error Handling
app.use(errorHandler);

// Launch server
app.listen(PORT, () => {
  console.log(`RentGB backend listening on http://localhost:${PORT}`);
  initializeDatabase();
});
