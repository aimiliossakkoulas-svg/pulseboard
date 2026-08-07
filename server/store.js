import crypto from 'crypto';

const users = [];
const posts = [];

const companies = [
  {
    id: 'alpha',
    name: 'Alpha Labs',
    sector: 'SaaS',
    summary: 'Growth-stage product company focused on retention and pipeline expansion.',
    growth: '+28%',
    retention: '91%',
    pipeline: '$2.4M',
    hubspotStatus: 'Connected',
    rating: '9.4/10',
    review: 'Trusted by 12 agents',
    metricsSharing: 'accepted',
    hubspotMetrics: {
      deals: '18 active',
      campaigns: '7 live',
      meetings: '24 this quarter'
    }
  },
  {
    id: 'pulse',
    name: 'Pulse Commerce',
    sector: 'E-commerce',
    summary: 'Commerce network using selective profile visibility to share performance metrics.',
    growth: '+19%',
    retention: '87%',
    pipeline: '$1.1M',
    hubspotStatus: 'Connected',
    rating: '8.7/10',
    review: 'Selective visibility',
    metricsSharing: 'private',
    hubspotMetrics: {
      deals: '9 active',
      campaigns: '3 live',
      meetings: '12 this quarter'
    }
  },
  {
    id: 'nova',
    name: 'Nova Insights',
    sector: 'Analytics',
    summary: 'Analytics firm sharing benchmark trends with highly vetted partner networks.',
    growth: '+35%',
    retention: '94%',
    pipeline: '$3.2M',
    hubspotStatus: 'Preview',
    rating: '9.8/10',
    review: 'Partner recommended',
    metricsSharing: 'accepted',
    hubspotMetrics: {
      deals: '22 active',
      campaigns: '10 live',
      meetings: '31 this quarter'
    }
  }
];

const vendors = [
  {
    id: 'vendor-1',
    name: 'HubSync Partners',
    category: 'HubSpot automation',
    description: 'CRM sync and revenue workflows for scaling businesses.',
    tier: 'Featured partner'
  },
  {
    id: 'vendor-2',
    name: 'GrowthOps',
    category: 'Revenue operations',
    description: 'Executive advisory and data-backed pipeline optimization.',
    tier: 'Premium access'
  },
  {
    id: 'vendor-3',
    name: 'CampaignCraft',
    category: 'Marketing operations',
    description: 'Experiment-led campaigns tied to account-based growth motions.',
    tier: 'Preferred vendor'
  }
];

const meetings = [
  { id: 'm1', companyId: 'alpha', topic: 'Pipeline review', schedule: '2026-08-08 10:00', visibility: 'Shared metrics enabled' },
  { id: 'm2', companyId: 'pulse', topic: 'Revenue sync', schedule: '2026-08-09 14:30', visibility: 'Private until profile accepts' }
];

const feedItems = [
  { id: 'feed-1', author: 'Mina Chen', detail: 'Alpha Labs shared a new pipeline review with approved partners.', time: '12m ago' },
  { id: 'feed-2', author: 'Jordan Rivera', detail: 'Nova Insights published a benchmark trend for growth-stage teams.', time: '34m ago' }
];

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function createUser({ name, email, password, role }) {
  const existing = users.find((user) => user.email === email);
  if (existing) {
    const error = new Error('A user with that email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = {
    id: `user-${users.length + 1}`,
    name,
    email,
    role: role || 'Founder',
    password_hash: hashPassword(password)
  };
  users.push(user);
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function authenticateUser({ email, password }) {
  const user = users.find((candidate) => candidate.email === email && candidate.password_hash === hashPassword(password));
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function createPost({ author, content }) {
  const post = {
    id: `post-${posts.length + 1}`,
    author,
    content,
    created_at: new Date().toISOString()
  };
  posts.unshift(post);
  return post;
}

export async function listPosts() {
  return posts;
}

export async function getCompanies() {
  return companies;
}

export async function getVendors() {
  return vendors;
}

export async function getMeetings() {
  return meetings;
}

export async function getFeedItems() {
  return feedItems;
}

export async function toggleMetricsSharing(companyId) {
  const company = companies.find((entry) => entry.id === companyId);
  if (!company) {
    throw new Error('Company not found');
  }

  company.metricsSharing = company.metricsSharing === 'accepted' ? 'private' : 'accepted';
  return company;
}

export async function connectHubspot(companyId, payload) {
  const company = companies.find((entry) => entry.id === companyId);
  if (!company) {
    throw new Error('Company not found');
  }

  company.hubspotStatus = 'Connected';
  company.hubspotMetrics = {
    ...company.hubspotMetrics,
    portal: payload.portal,
    owner: payload.owner,
    connectedAt: new Date().toISOString()
  };

  return company;
}
