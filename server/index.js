import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  addEngagementMessage,
  addEngagementMilestone,
  authenticateUser,
  cancelIntroRequest,
  createEngagement,
  createIntroRequest,
  createOrUpdateCompanyOnboarding,
  connectHubspot,
  createPost,
  createUser,
  getEngagementCalls,
  getEngagementMilestoneById,
  getEngagementMilestones,
  getEngagementMessages,
  getEngagementOutcome,
  getEngagementsByUser,
  getEngagementWorkspace,
  getUserNotifications,
  getCompanyMetrics,
  getCompanyProfile,
  getUserFromSession,
  getCompanies,
  getFeedItems,
  getIntroRequestsByUser,
  getMeetings,
  ingestCompanyMetrics,
  getRankedCompanies,
  getRecommendedVendors,
  getVendors,
  listPosts,
  markMilestonePaidByReference,
  markUserNotificationRead,
  revokeSession,
  scheduleEngagementCall,
  setMilestonePaymentReference,
  toggleMetricsSharing,
  updateEngagementMilestoneStatus,
  upsertEngagementOutcome
} from './store.js';

const app = express();
const PORT = process.env.PORT || 5000;
const VALID_ROLES = new Set(['Founder', 'Agent', 'Vendor', 'Employee', 'Admin']);
const COMPANY_BOUND_ROLES = new Set(['Founder', 'Vendor', 'Employee', 'Admin']);
const COMPANY_ID_PATTERN = /^[a-z0-9-]{2,64}$/i;
const METRIC_SOURCE_TYPES = new Set(['manual', 'csv', 'quickbooks', 'hubspot', 'stripe']);
const METRIC_VERIFICATION_STATUSES = new Set(['verified', 'self-reported', 'reviewed']);
const METRIC_ALLOWED_KEYS = new Set([
  'growth_percent',
  'retention_percent',
  'pipeline_millions',
  'deals_active',
  'campaigns_live',
  'meetings_quarter'
]);

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

let stripeClient = null;
async function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  try {
    const stripeModule = await import('stripe');
    const Stripe = stripeModule.default;
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
    return stripeClient;
  } catch {
    return null;
  }
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return '';
  }

  return authHeader.slice('Bearer '.length).trim();
}

function readTrimmedText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toCompanyId(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function normalizeDomain(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';

  const withoutScheme = raw.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return withoutScheme.split('/')[0].trim();
}

function isValidDomain(domain) {
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain);
}

function getEmailDomain(email) {
  return String(email || '').toLowerCase().split('@')[1] || '';
}

function matchesCompanyDomain(emailDomain, companyDomain) {
  if (!emailDomain || !companyDomain) return false;
  return emailDomain === companyDomain || emailDomain.endsWith(`.${companyDomain}`);
}

function parseLinkedinCompanySlug(linkedinCompanyUrl) {
  try {
    const normalized = /^https?:\/\//i.test(linkedinCompanyUrl)
      ? linkedinCompanyUrl
      : `https://${linkedinCompanyUrl}`;
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();
    if (!host.includes('linkedin.com')) return '';

    const parts = url.pathname.split('/').filter(Boolean);
    const companyIndex = parts.findIndex((part) => part.toLowerCase() === 'company');
    if (companyIndex === -1 || !parts[companyIndex + 1]) return '';
    return parts[companyIndex + 1].toLowerCase();
  } catch {
    return '';
  }
}

function toTitleCaseSlug(slug) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toFiniteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function normalizeMetricsPayload(metrics) {
  if (!Array.isArray(metrics)) {
    return [];
  }

  return metrics
    .map((entry) => {
      const metricKey = readTrimmedText(entry?.metricKey);
      const metricValue = toFiniteNumber(entry?.metricValue);
      if (!METRIC_ALLOWED_KEYS.has(metricKey) || Number.isNaN(metricValue)) {
        return null;
      }

      return { metricKey, metricValue };
    })
    .filter(Boolean);
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    const user = await getUserFromSession(token);
    if (!user) {
      return res.status(401).json({ error: 'Session is invalid or expired' });
    }

    req.authUser = user;
    req.authToken = token;
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Unable to validate session' });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/company-sync/linkedin-preview', async (req, res) => {
  const linkedinCompanyUrl = readTrimmedText(req.body?.linkedinCompanyUrl);
  const providedCompanyName = readTrimmedText(req.body?.companyName);

  if (!linkedinCompanyUrl) {
    return res.status(400).json({ error: 'LinkedIn company URL is required' });
  }

  const slug = parseLinkedinCompanySlug(linkedinCompanyUrl);
  if (!slug) {
    return res.status(400).json({ error: 'Enter a valid LinkedIn company URL (e.g. linkedin.com/company/alpha-labs)' });
  }

  const inferredName = providedCompanyName || toTitleCaseSlug(slug);
  const suggestedDomain = `${slug.replace(/[^a-z0-9-]/g, '')}.com`;

  return res.json({
    companyName: inferredName,
    companyDomain: suggestedDomain,
    linkedinCompanyUrl,
    companyId: toCompanyId(inferredName),
    syncMode: 'preview'
  });
});

app.post('/api/auth/signup', async (req, res) => {
  const name = readTrimmedText(req.body?.name);
  const email = readTrimmedText(req.body?.email).toLowerCase();
  const password = readTrimmedText(req.body?.password);
  const role = readTrimmedText(req.body?.role) || 'Founder';
  const companyName = readTrimmedText(req.body?.companyName);
  const companyDomain = normalizeDomain(req.body?.companyDomain);
  const linkedinCompanyUrl = readTrimmedText(req.body?.linkedinCompanyUrl);

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
  }

  if (!isValidEmail(email) || email.length > 255) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be between 8 and 128 characters' });
  }

  if (!VALID_ROLES.has(role)) {
    return res.status(400).json({ error: 'Role must be Founder, Agent, Vendor, Employee, or Admin' });
  }

  if (COMPANY_BOUND_ROLES.has(role)) {
    if (!companyName || companyName.length < 2 || companyName.length > 255) {
      return res.status(400).json({ error: 'Company name is required and must be between 2 and 255 characters' });
    }

    if (!companyDomain || !isValidDomain(companyDomain)) {
      return res.status(400).json({ error: 'A valid company domain is required (e.g. alpha.com)' });
    }

    const emailDomain = getEmailDomain(email);
    if (!matchesCompanyDomain(emailDomain, companyDomain)) {
      return res.status(400).json({ error: 'Use your work email matching the company domain' });
    }

    if (linkedinCompanyUrl && !parseLinkedinCompanySlug(linkedinCompanyUrl)) {
      return res.status(400).json({ error: 'LinkedIn URL must look like linkedin.com/company/<company>' });
    }
  }

  try {
    const result = await createUser({ name, email, password, role, companyName, companyDomain, linkedinCompanyUrl });
    res.status(201).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = readTrimmedText(req.body?.email).toLowerCase();
  const password = readTrimmedText(req.body?.password);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!isValidEmail(email) || email.length > 255) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be between 8 and 128 characters' });
  }

  try {
    const result = await authenticateUser({ email, password });
    res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Failed to sign in' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }

  const user = await getUserFromSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Session is invalid or expired' });
  }

  return res.json({ user });
});

app.post('/api/auth/logout', async (req, res) => {
  const token = getBearerToken(req);

  if (token) {
    await revokeSession(token);
  }

  return res.status(204).send();
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await listPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', requireAuth, async (req, res) => {
  const content = readTrimmedText(req.body?.content);

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  if (content.length > 2000) {
    return res.status(400).json({ error: 'Content must be 2000 characters or fewer' });
  }

  try {
    const post = await createPost({ author: req.authUser.name, content });
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

app.get('/api/companies/ranked', async (req, res) => {
  try {
    const companies = await getRankedCompanies();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ranked companies' });
  }
});

app.post('/api/companies/onboarding', requireAuth, async (req, res) => {
  const companyName = readTrimmedText(req.body?.companyName);
  const sector = readTrimmedText(req.body?.sector);
  const summary = readTrimmedText(req.body?.summary);
  const sourceType = readTrimmedText(req.body?.sourceType).toLowerCase() || 'manual';
  const metricsSharing = readTrimmedText(req.body?.metricsSharing).toLowerCase() || 'private';
  const verificationStatus = readTrimmedText(req.body?.verificationStatus).toLowerCase() || 'self-reported';
  const confidenceScore = toFiniteNumber(req.body?.confidenceScore);
  const metrics = normalizeMetricsPayload(req.body?.metrics);
  const capturedAt = readTrimmedText(req.body?.capturedAt) || new Date().toISOString();

  if (!companyName || companyName.length < 2 || companyName.length > 255) {
    return res.status(400).json({ error: 'Company name must be between 2 and 255 characters' });
  }

  if (!sector || sector.length > 100) {
    return res.status(400).json({ error: 'Sector is required and must be under 100 characters' });
  }

  if (!summary || summary.length < 20 || summary.length > 500) {
    return res.status(400).json({ error: 'Summary must be between 20 and 500 characters' });
  }

  if (!METRIC_SOURCE_TYPES.has(sourceType)) {
    return res.status(400).json({ error: 'Source type is invalid' });
  }

  if (!METRIC_VERIFICATION_STATUSES.has(verificationStatus)) {
    return res.status(400).json({ error: 'Verification status is invalid' });
  }

  if (Number.isNaN(confidenceScore) || confidenceScore < 0 || confidenceScore > 1) {
    return res.status(400).json({ error: 'Confidence score must be between 0 and 1' });
  }

  if (!metrics.length) {
    return res.status(400).json({
      error: 'At least one valid metric is required',
      supportedMetricKeys: [...METRIC_ALLOWED_KEYS]
    });
  }

  try {
    const company = await createOrUpdateCompanyOnboarding({
      companyName,
      sector,
      summary,
      sourceType,
      metricsSharing
    });

    if (!company?.id) {
      return res.status(500).json({ error: 'Failed to create company profile' });
    }

    await ingestCompanyMetrics({
      companyId: company.id,
      sourceType,
      verificationStatus,
      confidenceScore,
      metrics,
      capturedAt
    });

    const profile = await getCompanyProfile(company.id);
    return res.status(201).json(profile);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to onboard company' });
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

app.get('/api/vendors/recommended/:companyId', async (req, res) => {
  const { companyId } = req.params;

  if (!COMPANY_ID_PATTERN.test(companyId)) {
    return res.status(400).json({ error: 'Company id is invalid' });
  }

  try {
    const recommended = await getRecommendedVendors(companyId);
    res.json(recommended);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Failed to fetch recommended vendors' });
  }
});

app.get('/api/companies/:companyId/profile', async (req, res) => {
  const { companyId } = req.params;

  if (!COMPANY_ID_PATTERN.test(companyId)) {
    return res.status(400).json({ error: 'Company id is invalid' });
  }

  try {
    const profile = await getCompanyProfile(companyId);
    res.json(profile);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Failed to fetch company profile' });
  }
});

app.get('/api/companies/:companyId/metrics', async (req, res) => {
  const { companyId } = req.params;

  if (!COMPANY_ID_PATTERN.test(companyId)) {
    return res.status(400).json({ error: 'Company id is invalid' });
  }

  try {
    const metrics = await getCompanyMetrics(companyId);
    return res.json(metrics);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to fetch company metrics' });
  }
});

app.post('/api/companies/:companyId/metrics/:sourceType', requireAuth, async (req, res) => {
  const { companyId, sourceType } = req.params;
  const normalizedSource = readTrimmedText(sourceType).toLowerCase();
  const verificationStatus = readTrimmedText(req.body?.verificationStatus).toLowerCase() || 'self-reported';
  const confidenceScore = toFiniteNumber(req.body?.confidenceScore);
  const metrics = normalizeMetricsPayload(req.body?.metrics);
  const capturedAt = readTrimmedText(req.body?.capturedAt) || new Date().toISOString();

  if (!COMPANY_ID_PATTERN.test(companyId)) {
    return res.status(400).json({ error: 'Company id is invalid' });
  }

  if (!METRIC_SOURCE_TYPES.has(normalizedSource)) {
    return res.status(400).json({ error: 'Source type is invalid' });
  }

  if (!METRIC_VERIFICATION_STATUSES.has(verificationStatus)) {
    return res.status(400).json({ error: 'Verification status is invalid' });
  }

  if (Number.isNaN(confidenceScore) || confidenceScore < 0 || confidenceScore > 1) {
    return res.status(400).json({ error: 'Confidence score must be between 0 and 1' });
  }

  if (!metrics.length) {
    return res.status(400).json({
      error: 'At least one valid metric is required',
      supportedMetricKeys: [...METRIC_ALLOWED_KEYS]
    });
  }

  try {
    const result = await ingestCompanyMetrics({
      companyId,
      sourceType: normalizedSource,
      verificationStatus,
      confidenceScore,
      metrics,
      capturedAt
    });

    return res.status(201).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to ingest company metrics' });
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

app.post('/api/companies/:companyId/share', requireAuth, async (req, res) => {
  const { companyId } = req.params;

  if (!COMPANY_ID_PATTERN.test(companyId)) {
    return res.status(400).json({ error: 'Company id is invalid' });
  }

  try {
    const company = await toggleMetricsSharing(companyId);
    res.json(company);
  } catch (error) {
    res.status(404).json({ error: error.message || 'Company not found' });
  }
});

app.post('/api/companies/:companyId/hubspot', requireAuth, async (req, res) => {
  const { companyId } = req.params;
  const portal = readTrimmedText(req.body?.portal);
  const owner = readTrimmedText(req.body?.owner);

  if (!COMPANY_ID_PATTERN.test(companyId)) {
    return res.status(400).json({ error: 'Company id is invalid' });
  }

  if (!portal || portal.length > 100) {
    return res.status(400).json({ error: 'Portal is required and must be under 100 characters' });
  }

  if (!owner || owner.length > 100) {
    return res.status(400).json({ error: 'Owner is required and must be under 100 characters' });
  }

  try {
    const company = await connectHubspot(companyId, { portal, owner });
    res.json(company);
  } catch (error) {
    res.status(404).json({ error: error.message || 'Company not found' });
  }
});

app.post('/api/intro-requests', requireAuth, async (req, res) => {
  const vendorId = readTrimmedText(req.body?.vendorId);
  const message = readTrimmedText(req.body?.message);

  if (!vendorId || vendorId.length > 64) {
    return res.status(400).json({ error: 'vendorId is required' });
  }

  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message must be under 1000 characters' });
  }

  try {
    const request = await createIntroRequest({ userId: req.authUser.id, vendorId, message });
    return res.status(201).json(request);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to create intro request' });
  }
});

app.get('/api/intro-requests', requireAuth, async (req, res) => {
  try {
    const requests = await getIntroRequestsByUser(req.authUser.id);
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch intro requests' });
  }
});

app.delete('/api/intro-requests/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid request id' });
  }

  try {
    await cancelIntroRequest(id, req.authUser.id);
    return res.status(204).send();
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to cancel intro request' });
  }
});

app.get('/api/engagements', requireAuth, async (req, res) => {
  try {
    const engagements = await getEngagementsByUser(req.authUser);
    return res.json(engagements);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch engagements' });
  }
});

app.post('/api/engagements', requireAuth, async (req, res) => {
  const vendorId = readTrimmedText(req.body?.vendorId);
  const title = readTrimmedText(req.body?.title);
  const pricingModel = readTrimmedText(req.body?.pricingModel).toLowerCase() || 'milestone';
  const consultantFee = toFiniteNumber(req.body?.consultantFee);
  const feeCurrency = readTrimmedText(req.body?.feeCurrency).toUpperCase() || 'USD';
  const introRequestId = Number.isFinite(Number(req.body?.introRequestId)) ? Number(req.body.introRequestId) : null;

  if (!vendorId || vendorId.length > 64) {
    return res.status(400).json({ error: 'vendorId is required' });
  }

  if (!title || title.length < 4 || title.length > 255) {
    return res.status(400).json({ error: 'Title must be between 4 and 255 characters' });
  }

  if (!['hourly', 'fixed', 'milestone'].includes(pricingModel)) {
    return res.status(400).json({ error: 'Pricing model must be hourly, fixed, or milestone' });
  }

  if (Number.isNaN(consultantFee) || consultantFee < 0) {
    return res.status(400).json({ error: 'Consultant fee must be a positive number' });
  }

  try {
    const engagement = await createEngagement({
      authUser: req.authUser,
      vendorId,
      title,
      pricingModel,
      consultantFee,
      feeCurrency,
      introRequestId
    });
    return res.status(201).json(engagement);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to create engagement' });
  }
});

app.get('/api/engagements/:engagementId/workspace', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  if (!Number.isFinite(engagementId)) {
    return res.status(400).json({ error: 'Invalid engagement id' });
  }

  try {
    const workspace = await getEngagementWorkspace(req.authUser, engagementId);
    return res.json(workspace);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to fetch engagement workspace' });
  }
});

app.post('/api/engagements/:engagementId/messages', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  const body = readTrimmedText(req.body?.body);
  const channel = readTrimmedText(req.body?.channel).toLowerCase() || 'chat';

  if (!Number.isFinite(engagementId)) {
    return res.status(400).json({ error: 'Invalid engagement id' });
  }

  if (!body || body.length > 4000) {
    return res.status(400).json({ error: 'Message body is required and must be under 4000 characters' });
  }

  if (!['chat', 'note', 'call-summary'].includes(channel)) {
    return res.status(400).json({ error: 'Channel must be chat, note, or call-summary' });
  }

  try {
    const message = await addEngagementMessage({ authUser: req.authUser, engagementId, channel, body });
    return res.status(201).json(message);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to add message' });
  }
});

app.get('/api/engagements/:engagementId/messages', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  if (!Number.isFinite(engagementId)) {
    return res.status(400).json({ error: 'Invalid engagement id' });
  }

  try {
    const messages = await getEngagementMessages(req.authUser, engagementId);
    return res.json(messages);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to fetch messages' });
  }
});

app.post('/api/engagements/:engagementId/milestones', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  const title = readTrimmedText(req.body?.title);
  const amount = toFiniteNumber(req.body?.amount);
  const dueDate = readTrimmedText(req.body?.dueDate) || null;

  if (!Number.isFinite(engagementId)) {
    return res.status(400).json({ error: 'Invalid engagement id' });
  }
  if (!title || title.length > 255) {
    return res.status(400).json({ error: 'Milestone title is required and must be under 255 characters' });
  }
  if (Number.isNaN(amount) || amount < 0) {
    return res.status(400).json({ error: 'Milestone amount must be a positive number' });
  }

  try {
    const milestone = await addEngagementMilestone({ authUser: req.authUser, engagementId, title, amount, dueDate });
    return res.status(201).json(milestone);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || 'Failed to add milestone' });
  }
});

app.patch('/api/engagements/:engagementId/milestones/:milestoneId', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  const milestoneId = parseInt(req.params.milestoneId, 10);
  const status = readTrimmedText(req.body?.status);

  if (!Number.isFinite(engagementId) || !Number.isFinite(milestoneId)) {
    return res.status(400).json({ error: 'Invalid engagement or milestone id' });
  }

  try {
    const milestone = await updateEngagementMilestoneStatus({ authUser: req.authUser, engagementId, milestoneId, status });
    return res.json(milestone);
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ error: error.message || 'Failed to update milestone' });
  }
});

app.post('/api/engagements/:engagementId/milestones/:milestoneId/checkout', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  const milestoneId = parseInt(req.params.milestoneId, 10);
  if (!Number.isFinite(engagementId) || !Number.isFinite(milestoneId)) {
    return res.status(400).json({ error: 'Invalid engagement or milestone id' });
  }

  if (!['Founder', 'Admin'].includes(String(req.authUser.role || ''))) {
    return res.status(403).json({ error: 'Only Founder or Admin can create milestone checkout sessions' });
  }

  try {
    const milestone = await getEngagementMilestoneById(req.authUser, engagementId, milestoneId);
    const stripe = await getStripeClient();
    let provider = 'manual';
    let reference = `manual-${engagementId}-${milestoneId}-${Date.now()}`;
    let checkoutUrl = '';

    if (stripe) {
      const origin = readTrimmedText(req.body?.origin) || process.env.WEB_BASE_URL || 'http://localhost:3000';
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: `${origin}/app?checkout=success&engagement=${engagementId}`,
        cancel_url: `${origin}/app?checkout=cancel&engagement=${engagementId}`,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              product_data: { name: milestone.title },
              unit_amount: Math.round((Number(milestone.amount) || 0) * 100)
            }
          }
        ],
        metadata: {
          engagementId: String(engagementId),
          milestoneId: String(milestoneId)
        }
      });

      provider = 'stripe';
      reference = session.id;
      checkoutUrl = session.url || '';
    }

    const updated = await setMilestonePaymentReference({
      authUser: req.authUser,
      engagementId,
      milestoneId,
      provider,
      reference
    });

    return res.status(201).json({
      provider,
      reference,
      checkoutUrl,
      milestone: updated
    });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ error: error.message || 'Failed to create checkout session' });
  }
});

app.get('/api/engagements/:engagementId/milestones', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  if (!Number.isFinite(engagementId)) {
    return res.status(400).json({ error: 'Invalid engagement id' });
  }

  try {
    const milestones = await getEngagementMilestones(req.authUser, engagementId);
    return res.json(milestones);
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ error: error.message || 'Failed to fetch milestones' });
  }
});

app.post('/api/engagements/:engagementId/calls', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  const provider = readTrimmedText(req.body?.provider).toLowerCase();
  const meetingUrl = readTrimmedText(req.body?.meetingUrl);
  const agenda = readTrimmedText(req.body?.agenda);
  const scheduledAt = readTrimmedText(req.body?.scheduledAt);

  if (!Number.isFinite(engagementId)) {
    return res.status(400).json({ error: 'Invalid engagement id' });
  }
  if (!['zoom', 'meet', 'teams', 'other'].includes(provider)) {
    return res.status(400).json({ error: 'Provider must be zoom, meet, teams, or other' });
  }
  if (!meetingUrl || meetingUrl.length > 1500) {
    return res.status(400).json({ error: 'Meeting URL is required and must be under 1500 characters' });
  }
  if (!scheduledAt) {
    return res.status(400).json({ error: 'scheduledAt is required' });
  }

  try {
    const call = await scheduleEngagementCall({ authUser: req.authUser, engagementId, provider, meetingUrl, agenda, scheduledAt });
    return res.status(201).json(call);
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ error: error.message || 'Failed to schedule call' });
  }
});

app.get('/api/engagements/:engagementId/calls', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  if (!Number.isFinite(engagementId)) {
    return res.status(400).json({ error: 'Invalid engagement id' });
  }

  try {
    const calls = await getEngagementCalls(req.authUser, engagementId);
    return res.json(calls);
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ error: error.message || 'Failed to fetch calls' });
  }
});

app.put('/api/engagements/:engagementId/outcome', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  if (!Number.isFinite(engagementId)) {
    return res.status(400).json({ error: 'Invalid engagement id' });
  }

  try {
    const outcome = await upsertEngagementOutcome({
      authUser: req.authUser,
      engagementId,
      baselineGrowth: toFiniteNumber(req.body?.baselineGrowth),
      currentGrowth: toFiniteNumber(req.body?.currentGrowth),
      baselineRetention: toFiniteNumber(req.body?.baselineRetention),
      currentRetention: toFiniteNumber(req.body?.currentRetention),
      baselinePipeline: toFiniteNumber(req.body?.baselinePipeline),
      currentPipeline: toFiniteNumber(req.body?.currentPipeline),
    });
    return res.json(outcome);
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ error: error.message || 'Failed to update outcome' });
  }
});

app.post('/api/billing/stripe/webhook', async (req, res) => {
  try {
    const stripe = await getStripeClient();
    let event = req.body;

    if (stripe && process.env.STRIPE_WEBHOOK_SECRET && req.headers['stripe-signature'] && req.rawBody) {
      event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    }

    if (event?.type === 'checkout.session.completed') {
      const reference = event?.data?.object?.id || event?.data?.object?.payment_intent || '';
      if (reference) {
        try {
          await markMilestonePaidByReference(String(reference));
        } catch {
          // Keep webhook idempotent and non-blocking.
        }
      }
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Webhook processing failed' });
  }
});

app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.authUser.id);
    return res.json(notifications);
  } catch {
    return res.status(500).json({ error: 'Failed to load notifications' });
  }
});

app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
  const notificationId = parseInt(req.params.id, 10);
  if (!Number.isFinite(notificationId)) {
    return res.status(400).json({ error: 'Invalid notification id' });
  }

  try {
    const updated = await markUserNotificationRead(req.authUser.id, notificationId);
    return res.json(updated);
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ error: error.message || 'Failed to update notification' });
  }
});

app.get('/api/engagements/:engagementId/outcome', requireAuth, async (req, res) => {
  const engagementId = parseInt(req.params.engagementId, 10);
  if (!Number.isFinite(engagementId)) {
    return res.status(400).json({ error: 'Invalid engagement id' });
  }

  try {
    const outcome = await getEngagementOutcome(req.authUser, engagementId);
    return res.json(outcome);
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ error: error.message || 'Failed to fetch outcome' });
  }
});

export function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

const currentFilePath = fileURLToPath(import.meta.url);
const launchedScriptPath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (launchedScriptPath && launchedScriptPath === currentFilePath) {
  startServer();
}

export default app;
