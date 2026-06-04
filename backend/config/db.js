import pg from 'pg';
import dotenv from 'dotenv';
import { mockQuery } from '../utils/mockDb.js';

dotenv.config();

let pool = null;
const usePostgres = process.env.DB_MODE === 'postgres';

if (usePostgres) {
  try {
    const connectionString = process.env.DATABASE_URL;
    pool = new pg.Pool({
      connectionString,
      ssl: connectionString && connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false
    });
    
    // Test pool connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('PostgreSQL Connection Error. Switching to local JSON database mode.');
        pool = null;
      } else {
        console.log('Successfully connected to PostgreSQL (NeonDB Compatible).');
      }
    });
  } catch (err) {
    console.error('Failed to configure PostgreSQL pool:', err.message);
    pool = null;
  }
} else {
  console.log('Database Mode set to "json". Utilizing local JSON-persisted engine.');
}

export const query = async (text, params) => {
  if (pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('PostgreSQL Query Error:', err.message);
      throw err;
    }
  } else {
    // Fall back to JSON database engine
    return await mockQuery(text, params);
  }
};

export default {
  query
};
