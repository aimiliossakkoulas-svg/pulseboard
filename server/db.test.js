import test from 'node:test';
import assert from 'node:assert/strict';
import { query } from './db.js';

test('signup and login work through the fallback store when postgres is unavailable', async () => {
  const signup = await query(
    `INSERT INTO users (
      name, email, password_hash, role, company_id, company_name, company_domain, linkedin_company_url, company_verified
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, email, role, company_id, company_name, company_domain, linkedin_company_url, company_verified`,
    ['Test User', 'fallback@example.com', 'hash123', 'Founder', 'fallback-company', 'Fallback Company', 'example.com', null, true]
  );

  assert.equal(signup.rows[0].email, 'fallback@example.com');

  const existing = await query('SELECT id FROM users WHERE email = $1', ['fallback@example.com']);
  assert.equal(existing.rowCount, 1);

  const login = await query(
    `SELECT
      id, name, email, role, company_id, company_name, company_domain, linkedin_company_url, company_verified
    FROM users
    WHERE email = $1 AND password_hash = $2`,
    ['fallback@example.com', 'hash123']
  );

  assert.equal(login.rows[0].email, 'fallback@example.com');
  assert.equal(login.rows[0].company_name, 'Fallback Company');
});
