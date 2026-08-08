import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackStorePath = process.env.STORE_FILE_PATH || path.join(__dirname, 'data', 'store.json');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/socialdb'
});

const memoryStore = {
  users: [],
  posts: [],
  sessions: []
};

let databaseReady = false;
let usingMemoryFallback = false;

function loadMemoryStore() {
  try {
    if (!fs.existsSync(fallbackStorePath)) {
      return;
    }

    const raw = fs.readFileSync(fallbackStorePath, 'utf8');
    if (!raw.trim()) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.users)) {
      memoryStore.users = parsed.users;
    }
    if (Array.isArray(parsed.posts)) {
      memoryStore.posts = parsed.posts;
    }
    if (Array.isArray(parsed.sessions)) {
      memoryStore.sessions = parsed.sessions;
    }
  } catch (error) {
    console.warn('Unable to load fallback auth/post store.');
  }
}

function persistMemoryStore() {
  try {
    const directory = path.dirname(fallbackStorePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    let existing = {};
    if (fs.existsSync(fallbackStorePath)) {
      const raw = fs.readFileSync(fallbackStorePath, 'utf8');
      existing = raw.trim() ? JSON.parse(raw) : {};
    }

    fs.writeFileSync(
      fallbackStorePath,
      JSON.stringify(
        {
          ...existing,
          users: memoryStore.users,
          posts: memoryStore.posts,
          sessions: memoryStore.sessions
        },
        null,
        2
      ),
      'utf8'
    );
  } catch (error) {
    console.warn('Unable to persist fallback auth/post store.');
  }
}

loadMemoryStore();

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

function isConnectionError(error) {
  const candidates = [error, error?.cause, ...(error?.errors || [])].filter(Boolean);

  return candidates.some((candidate) => {
    const code = candidate?.code || candidate?.cause?.code;
    const message = `${candidate?.message || ''} ${candidate?.cause?.message || ''}`.toLowerCase();

    return (
      code === 'ECONNREFUSED' ||
      code === '28P01' ||
      code === '08001' ||
      message.includes('econnrefused') ||
      message.includes('connect econnrefused') ||
      message.includes('connection terminated') ||
      message.includes('timeout exceeded')
    );
  });
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
    persistMemoryStore();
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
    persistMemoryStore();
    return createMemoryResult([{ id: post.id, author: post.author, content: post.content, created_at: post.created_at }]);
  }

  if (normalized.includes('INSERT INTO SESSIONS')) {
    const [token, userId, expiresAt] = params;
    const session = {
      token,
      user_id: Number(userId),
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };

    memoryStore.sessions.push(session);
    persistMemoryStore();
    return createMemoryResult([]);
  }

  if (normalized.includes('DELETE FROM SESSIONS WHERE TOKEN = $1')) {
    const [token] = params;
    memoryStore.sessions = memoryStore.sessions.filter((session) => session.token !== token);
    persistMemoryStore();
    return createMemoryResult([]);
  }

  if (normalized.includes('FROM SESSIONS S') && normalized.includes('INNER JOIN USERS U')) {
    const [token] = params;
    const session = memoryStore.sessions.find((entry) => entry.token === token && new Date(entry.expires_at) > new Date());
    if (!session) {
      return createMemoryResult([]);
    }

    const user = memoryStore.users.find((entry) => entry.id === session.user_id);
    if (!user) {
      return createMemoryResult([]);
    }

    return createMemoryResult([{ id: user.id, name: user.name, email: user.email, role: user.role }]);
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
    if (isConnectionError(error)) {
      usingMemoryFallback = true;
      return queryMemory(text, params);
    }

    throw error;
  }
}
