import express from 'express';
import cors from 'cors';
import { query } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/posts', async (req, res) => {
  try {
    const result = await query('SELECT id, author, content, created_at FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  const { author, content } = req.body;

  if (!author || !content) {
    return res.status(400).json({ error: 'Author and content are required' });
  }

  try {
    const result = await query(
      'INSERT INTO posts (author, content) VALUES ($1, $2) RETURNING id, author, content, created_at',
      [author, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
