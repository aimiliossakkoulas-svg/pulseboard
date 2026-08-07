import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/socialdb'
});

export async function query(text, params) {
  return pool.query(text, params);
}
