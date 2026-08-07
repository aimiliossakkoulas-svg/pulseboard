import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/socialdb'
});

const memoryStore = {
  users: [],
  posts: []
};

let databaseReady = false;
let usingMemoryFallback = false;

async function ensureDatabase() {
  if (databaseReady) {
    return;
  }

  try {
    await pool.query('SELECT NOW()');
    databaseReady = true;
    console.log('Connected to PostgreSQL');
  } catch (error) {
    usingMemoryFallback = true;
    databaseReady = true;
    console.warn('PostgreSQL unavailable, using in-memory fallback store for auth and posts.');
  }
}

await ensureDatabase();

function createMemoryResult(rows) {
  return { rows, rowCount: rows.length };
}

function queryMemory(text, params = []) {
  const normalized = text.trim().toUpperCase();

  if (normalized === 'SELECT NOW()') {
    return createMemoryResult([{ now: new Date().toISOString() }]);
  }

  if (normalized.includes('SELECT ID FROM USERS WHERE EMAIL = $1')) {
    const [email] = params;
    const match = memoryStore.users.find((user) => user.email === email);
    return createMemoryResult(match ? [{ id: match.id }] : []);
  }

  if (normalized.includes('INSERT INTO USERS')) {
    const [name, email, passwordHash, role] = params;
    const existing = memoryStore.users.find((user) => user.email === email);
    if (existing) {
      const error = new Error('duplicate user');
      error.code = '23505';
      throw error;
    }

    const user = {
      id: memoryStore.users.length + 1,
      name,
      email,
      role: role || 'Founder',
      password_hash: passwordHash
    };
    memoryStore.users.push(user);
    return createMemoryResult([{ id: user.id, name: user.name, email: user.email, role: user.role }]);
  }

  if (normalized.includes('SELECT ID, NAME, EMAIL, ROLE FROM USERS WHERE EMAIL = $1 AND PASSWORD_HASH = $2')) {
    const [email, passwordHash] = params;
    const match = memoryStore.users.find((user) => user.email === email && user.password_hash === passwordHash);
    return createMemoryResult(match ? [{ id: match.id, name: match.name, email: match.email, role: match.role }] : []);
  }

  if (normalized.includes('SELECT ID, AUTHOR, CONTENT, CREATED_AT FROM POSTS ORDER BY CREATED_AT DESC')) {
    return createMemoryResult(
      memoryStore.posts
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((post) => ({ id: post.id, author: post.author, content: post.content, created_at: post.created_at }))
    );
  }

  if (normalized.includes('INSERT INTO POSTS')) {
    const [author, content] = params;
    const post = {
      id: memoryStore.posts.length + 1,
      author,
      content,
      created_at: new Date().toISOString()
    };
    memoryStore.posts.push(post);
    return createMemoryResult([{ id: post.id, author: post.author, content: post.content, created_at: post.created_at }]);
  }

  throw new Error(`Unsupported query in memory fallback: ${text}`);
}

export async function query(text, params) {
  if (usingMemoryFallback) {
    return queryMemory(text, params);
  }

  try {
    return await pool.query(text, params);
  } catch (error) {
    if (error?.code === 'ECONNREFUSED' || error?.code === '28P01' || error?.code === '08001') {
      usingMemoryFallback = true;
      return queryMemory(text, params);
    }

    throw error;
  }
}
