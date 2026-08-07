import express from 'express';
import cors from 'cors';
import {
  authenticateUser,
  connectHubspot,
  createPost,
  createUser,
  getCompanies,
  getFeedItems,
  getMeetings,
  getVendors,
  listPosts,
  toggleMetricsSharing
} from './store.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const user = await createUser({ name, email, password, role });
    res.status(201).json({ user });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await authenticateUser({ email, password });
    res.json({ user });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Failed to sign in' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await listPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  const { author, content } = req.body;

  if (!author || !content) {
    return res.status(400).json({ error: 'Author and content are required' });
  }

  try {
    const post = await createPost({ author, content });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const companies = await getCompanies();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await getVendors();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await getMeetings();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

app.get('/api/feed', async (req, res) => {
  try {
    const items = await getFeedItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

app.post('/api/companies/:companyId/share', async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await toggleMetricsSharing(companyId);
    res.json(company);
  } catch (error) {
    res.status(404).json({ error: error.message || 'Company not found' });
  }
});

app.post('/api/companies/:companyId/hubspot', async (req, res) => {
  const { companyId } = req.params;
  const { portal, owner } = req.body;

  try {
    const company = await connectHubspot(companyId, { portal, owner });
    res.json(company);
  } catch (error) {
    res.status(404).json({ error: error.message || 'Company not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
