import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const storeFilePath = process.env.STORE_FILE_PATH || path.join(dataDir, 'store.json');

const fallbackSessions = [];
const fallbackCompanyMetrics = [];

function ensureDataDirectory() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

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
  { id: 'm1', companyId: 'alpha', topic: 'Pipeline review', schedule: '2026-08-08 10:00', visibility: 'Shared metrics enabled', host: 'Mina Chen' },
  { id: 'm2', companyId: 'pulse', topic: 'Revenue sync', schedule: '2026-08-09 14:30', visibility: 'Private until profile accepts', host: 'Jordan Rivera' },
  { id: 'm3', companyId: 'nova', topic: 'Growth advisory roundtable', schedule: '2026-08-12 16:00', visibility: 'Open to invited advisors', host: 'Priya Shah' }
];

const feedItems = [
  { id: 'feed-1', author: 'Mina Chen', detail: 'Alpha Labs shared a new pipeline review with approved partners.', time: '12m ago' },
  { id: 'feed-2', author: 'Jordan Rivera', detail: 'Nova Insights published a benchmark trend for growth-stage teams.', time: '34m ago' },
  { id: 'feed-3', author: 'Priya Shah', detail: 'Pulse Commerce opened a selective metrics window for invited vendors.', time: '1h ago' }
];

function loadPersistedFallbackStore() {
  try {
    if (!fs.existsSync(storeFilePath)) {
      return;
    }

    const raw = fs.readFileSync(storeFilePath, 'utf8');
    if (!raw.trim()) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.companies)) {
      companies.splice(0, companies.length, ...parsed.companies);
    }
    if (Array.isArray(parsed.vendors)) {
      vendors.splice(0, vendors.length, ...parsed.vendors);
    }
    if (Array.isArray(parsed.meetings)) {
      meetings.splice(0, meetings.length, ...parsed.meetings);
    }
    if (Array.isArray(parsed.feedItems)) {
      feedItems.splice(0, feedItems.length, ...parsed.feedItems);
    }
    if (Array.isArray(parsed.companyMetrics)) {
      fallbackCompanyMetrics.splice(0, fallbackCompanyMetrics.length, ...parsed.companyMetrics);
    }
  } catch (error) {
    console.warn('Unable to load persisted fallback store. Continuing with seeded data.');
  }
}

function persistFallbackStore() {
  try {
    ensureDataDirectory();
    let existing = {};
    if (fs.existsSync(storeFilePath)) {
      const raw = fs.readFileSync(storeFilePath, 'utf8');
      existing = raw.trim() ? JSON.parse(raw) : {};
    }

    fs.writeFileSync(
      storeFilePath,
      JSON.stringify({
        ...existing,
        companies,
        vendors,
        meetings,
        feedItems,
        companyMetrics: fallbackCompanyMetrics
      }, null, 2),
      'utf8'
    );
  } catch (error) {
    console.warn('Unable to persist fallback store data.');
  }
}

loadPersistedFallbackStore();

function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function parseCompanyRow(row) {
  return {
    id: row.id,
    name: row.name,
    sector: row.sector,
    summary: row.summary,
    growth: row.growth,
    retention: row.retention,
    pipeline: row.pipeline,
    hubspotStatus: row.hubspot_status,
    rating: row.rating,
    review: row.review,
    metricsSharing: row.metrics_sharing,
    hubspotMetrics: {
      deals: row.hubspot_deals,
      campaigns: row.hubspot_campaigns,
      meetings: row.hubspot_meetings,
      portal: row.hubspot_portal || undefined,
      owner: row.hubspot_owner || undefined,
      connectedAt: row.hubspot_connected_at || undefined
    }
  };
}

function toCompanyId(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

const METRIC_SOURCE_TYPES = new Set(['hubspot', 'quickbooks', 'stripe', 'manual', 'csv']);
const METRIC_VERIFICATION_STATUSES = new Set(['verified', 'self-reported', 'reviewed']);
const METRIC_ALLOWED_KEYS = new Set([
  'growth_percent',
  'retention_percent',
  'pipeline_millions',
  'deals_active',
  'campaigns_live',
  'meetings_quarter'
]);

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function toFiniteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeSourceType(value) {
  const sourceType = String(value || '').toLowerCase().trim();
  return METRIC_SOURCE_TYPES.has(sourceType) ? sourceType : '';
}

function normalizeVerificationStatus(value) {
  const status = String(value || '').toLowerCase().trim();
  return METRIC_VERIFICATION_STATUSES.has(status) ? status : '';
}

function normalizeMetricEntries(metrics) {
  if (!Array.isArray(metrics)) {
    return [];
  }

  return metrics
    .map((entry) => {
      const key = String(entry?.metricKey || '').trim();
      const value = toFiniteNumber(entry?.metricValue);
      if (!METRIC_ALLOWED_KEYS.has(key)) {
        return null;
      }

      return {
        metricKey: key,
        metricValue: Number(value.toFixed(4))
      };
    })
    .filter(Boolean);
}

function buildMetricSnapshot(company, metricRows) {
  const latestByKey = new Map();
  for (const row of metricRows) {
    if (!latestByKey.has(row.metricKey)) {
      latestByKey.set(row.metricKey, row);
    }
  }

  const growth = latestByKey.get('growth_percent');
  const retention = latestByKey.get('retention_percent');
  const pipeline = latestByKey.get('pipeline_millions');
  const deals = latestByKey.get('deals_active');
  const campaigns = latestByKey.get('campaigns_live');
  const meetings = latestByKey.get('meetings_quarter');

  const metricCompany = {
    ...company,
    growth: growth ? `${growth.metricValue}%` : company.growth,
    retention: retention ? `${retention.metricValue}%` : company.retention,
    pipeline: pipeline ? `$${pipeline.metricValue}M` : company.pipeline,
    hubspotMetrics: {
      ...company.hubspotMetrics,
      deals: deals ? `${deals.metricValue} active` : company.hubspotMetrics.deals,
      campaigns: campaigns ? `${campaigns.metricValue} live` : company.hubspotMetrics.campaigns,
      meetings: meetings ? `${meetings.metricValue} this quarter` : company.hubspotMetrics.meetings
    }
  };

  if (metricRows.length === 0) {
    return {
      company: metricCompany,
      confidence: 0.68,
      sourceDiversity: 0,
      verificationStrength: 0.62
    };
  }

  const avgConfidence = metricRows.reduce((sum, row) => sum + clamp01(row.confidenceScore), 0) / metricRows.length;
  const distinctSources = new Set(metricRows.map((row) => row.sourceType)).size;
  const sourceDiversity = clamp01(distinctSources / 3);
  const verifiedRatio = metricRows.filter((row) => row.verificationStatus === 'verified').length / metricRows.length;
  const reviewedRatio = metricRows.filter((row) => row.verificationStatus === 'reviewed').length / metricRows.length;
  const verificationStrength = clamp01((verifiedRatio * 1) + (reviewedRatio * 0.7));

  const confidence = clamp01((avgConfidence * 0.6) + (sourceDiversity * 0.2) + (verificationStrength * 0.2));

  return {
    company: metricCompany,
    confidence,
    sourceDiversity,
    verificationStrength
  };
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function parseNumberFromText(value) {
  if (typeof value !== 'string') {
    return 0;
  }

  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function parseRatingOutOfTen(value) {
  if (typeof value !== 'string') {
    return 0;
  }

  const [scoreText, totalText] = value.split('/');
  const score = Number(scoreText || 0);
  const total = Number(totalText || 10) || 10;

  return clamp((score / total) * 100);
}

function parseCurrencyToMillions(value) {
  if (typeof value !== 'string') {
    return 0;
  }

  const num = parseNumberFromText(value);
  if (value.toUpperCase().includes('M')) {
    return num;
  }
  if (value.toUpperCase().includes('K')) {
    return num / 1000;
  }

  return num / 1000000;
}

function getFitTagsForSector(sector) {
  const normalized = String(sector || '').toLowerCase();

  if (normalized.includes('saas')) {
    return ['revenue operations', 'hubspot automation', 'marketing operations'];
  }
  if (normalized.includes('commerce') || normalized.includes('e-commerce')) {
    return ['marketing operations', 'revenue operations'];
  }
  if (normalized.includes('analytics')) {
    return ['revenue operations', 'hubspot automation'];
  }

  return ['revenue operations'];
}

function scoreCompany(company, metricContext = {}) {
  const confidence = clamp01(metricContext.confidence ?? 0.68);
  const sourceDiversity = clamp01(metricContext.sourceDiversity ?? 0);
  const verificationStrength = clamp01(metricContext.verificationStrength ?? 0.62);

  const completenessFields = [
    company.name,
    company.sector,
    company.summary,
    company.growth,
    company.retention,
    company.pipeline,
    company.rating,
    company.review
  ];
  const completeness = clamp((completenessFields.filter(Boolean).length / completenessFields.length) * 100);

  const growthPercent = clamp(parseNumberFromText(company.growth) * 2.5);
  const retentionPercent = clamp(parseNumberFromText(company.retention));
  const growthMomentum = clamp((growthPercent * 0.65) + (retentionPercent * 0.35));

  const deals = clamp(parseNumberFromText(company.hubspotMetrics?.deals) * 4.2);
  const campaigns = clamp(parseNumberFromText(company.hubspotMetrics?.campaigns) * 7.5);
  const meetingsCount = clamp(parseNumberFromText(company.hubspotMetrics?.meetings) * 2.8);
  const engagement = clamp((deals * 0.45) + (campaigns * 0.3) + (meetingsCount * 0.25));

  const trustBase = company.metricsSharing === 'accepted' ? 78 : 58;
  const trustBonus = company.hubspotStatus === 'Connected' ? 15 : 6;
  const trust = clamp(trustBase + trustBonus);

  const peerReview = clamp(parseRatingOutOfTen(company.rating));

  const weightedScore = clamp(
    (0.30 * completeness) +
    (0.25 * growthMomentum) +
    (0.20 * engagement) +
    (0.15 * trust) +
    (0.10 * peerReview)
  );

  const freshness = company.hubspotStatus === 'Connected' ? 1.03 : 0.98;
  const sharingModifier = company.metricsSharing === 'accepted' ? 1 : 0.95;
  const confidenceModifier = 0.88 + (confidence * 0.16);
  const diversityModifier = 0.94 + (sourceDiversity * 0.06);
  const verificationModifier = 0.93 + (verificationStrength * 0.07);
  const finalScore = clamp(Number((weightedScore * freshness * sharingModifier * confidenceModifier * diversityModifier * verificationModifier).toFixed(2)));

  const components = [
    { key: 'profile', label: 'High profile completeness', value: completeness },
    { key: 'growth', label: 'Strong growth momentum', value: growthMomentum },
    { key: 'engagement', label: 'Active HubSpot engagement', value: engagement },
    { key: 'trust', label: 'Trusted sharing behavior', value: trust },
    { key: 'review', label: 'Positive peer reviews', value: peerReview }
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((entry) => entry.label);

  const pipelineMillions = parseCurrencyToMillions(company.pipeline);
  const tier = finalScore >= 85
    ? 'Elite signal'
    : finalScore >= 72
      ? 'High signal'
      : pipelineMillions >= 1
        ? 'Emerging signal'
        : 'Developing signal';

  return {
    score: finalScore,
    tier,
    reasons: components,
    breakdown: {
      profileQuality: Number(completeness.toFixed(2)),
      growthMomentum: Number(growthMomentum.toFixed(2)),
      engagementQuality: Number(engagement.toFixed(2)),
      trustSignal: Number(trust.toFixed(2)),
      peerReview: Number(peerReview.toFixed(2)),
      metricConfidence: Number((confidence * 100).toFixed(2)),
      sourceDiversity: Number((sourceDiversity * 100).toFixed(2)),
      verificationStrength: Number((verificationStrength * 100).toFixed(2))
    }
  };
}

function scoreVendorForCompany(vendor, company) {
  const fitTags = getFitTagsForSector(company.sector);
  const category = String(vendor.category || '').toLowerCase();
  const fit = fitTags.some((tag) => category.includes(tag)) ? 92 : 56;

  const tierToOutcome = {
    'Featured partner': 90,
    'Premium access': 82,
    'Preferred vendor': 76
  };
  const outcomeScore = tierToOutcome[vendor.tier] || 70;

  const needsHubspot = String(company.hubspotStatus || '').toLowerCase() !== 'connected';
  const serviceCompatibility = needsHubspot && category.includes('hubspot') ? 94 : 78;
  const availability = vendor.tier === 'Featured partner' ? 74 : 82;
  const priceAlignment = vendor.tier === 'Premium access' ? 72 : 84;

  const score = clamp(Number((
    (0.35 * fit) +
    (0.25 * outcomeScore) +
    (0.20 * serviceCompatibility) +
    (0.10 * availability) +
    (0.10 * priceAlignment)
  ).toFixed(2)));

  const reasons = [
    fit >= 85 ? `Strong ${company.sector} fit` : 'Broad execution fit',
    outcomeScore >= 85 ? 'Verified premium outcomes' : 'Consistent delivery record',
    serviceCompatibility >= 90 ? 'Directly supports current stack gaps' : 'Good service compatibility'
  ];

  return {
    ...vendor,
    match: {
      score,
      reasons
    }
  };
}

async function queryWithFallback(text, params, fallbackFn) {
  try {
    return await query(text, params);
  } catch (error) {
    if (fallbackFn) {
      return fallbackFn(error);
    }

    throw error;
  }
}

async function bootstrapDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sector VARCHAR(100) NOT NULL,
        summary TEXT NOT NULL,
        growth VARCHAR(50) NOT NULL,
        retention VARCHAR(50) NOT NULL,
        pipeline VARCHAR(50) NOT NULL,
        hubspot_status VARCHAR(100) NOT NULL,
        rating VARCHAR(50) NOT NULL,
        review VARCHAR(255) NOT NULL,
        metrics_sharing VARCHAR(30) NOT NULL,
        hubspot_deals VARCHAR(100) NOT NULL,
        hubspot_campaigns VARCHAR(100) NOT NULL,
        hubspot_meetings VARCHAR(100) NOT NULL,
        hubspot_portal VARCHAR(100),
        hubspot_owner VARCHAR(100),
        hubspot_connected_at TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        tier VARCHAR(100) NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id VARCHAR(64) PRIMARY KEY,
        company_id VARCHAR(64) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        schedule VARCHAR(100) NOT NULL,
        visibility VARCHAR(255) NOT NULL,
        host VARCHAR(100) NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS feed_items (
        id VARCHAR(64) PRIMARY KEY,
        author VARCHAR(100) NOT NULL,
        detail TEXT NOT NULL,
        time VARCHAR(50) NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS company_metrics (
        id SERIAL PRIMARY KEY,
        company_id VARCHAR(64) NOT NULL,
        source_type VARCHAR(50) NOT NULL,
        verification_status VARCHAR(50) NOT NULL,
        confidence_score DOUBLE PRECISION NOT NULL,
        metric_key VARCHAR(100) NOT NULL,
        metric_value DOUBLE PRECISION NOT NULL,
        captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const companyCount = await query('SELECT COUNT(*)::int AS count FROM companies');
    if (companyCount.rows[0]?.count === 0) {
      for (const company of companies) {
        await query(
          `INSERT INTO companies (
            id, name, sector, summary, growth, retention, pipeline,
            hubspot_status, rating, review, metrics_sharing,
            hubspot_deals, hubspot_campaigns, hubspot_meetings
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            company.id,
            company.name,
            company.sector,
            company.summary,
            company.growth,
            company.retention,
            company.pipeline,
            company.hubspotStatus,
            company.rating,
            company.review,
            company.metricsSharing,
            company.hubspotMetrics.deals,
            company.hubspotMetrics.campaigns,
            company.hubspotMetrics.meetings
          ]
        );
      }
    }

    const vendorCount = await query('SELECT COUNT(*)::int AS count FROM vendors');
    if (vendorCount.rows[0]?.count === 0) {
      for (const vendor of vendors) {
        await query(
          'INSERT INTO vendors (id, name, category, description, tier) VALUES ($1, $2, $3, $4, $5)',
          [vendor.id, vendor.name, vendor.category, vendor.description, vendor.tier]
        );
      }
    }

    const meetingCount = await query('SELECT COUNT(*)::int AS count FROM meetings');
    if (meetingCount.rows[0]?.count === 0) {
      for (const meeting of meetings) {
        await query(
          'INSERT INTO meetings (id, company_id, topic, schedule, visibility, host) VALUES ($1, $2, $3, $4, $5, $6)',
          [meeting.id, meeting.companyId, meeting.topic, meeting.schedule, meeting.visibility, meeting.host]
        );
      }
    }

    const feedCount = await query('SELECT COUNT(*)::int AS count FROM feed_items');
    if (feedCount.rows[0]?.count === 0) {
      for (const item of feedItems) {
        await query(
          'INSERT INTO feed_items (id, author, detail, time) VALUES ($1, $2, $3, $4)',
          [item.id, item.author, item.detail, item.time]
        );
      }
    }

    const metricsCount = await query('SELECT COUNT(*)::int AS count FROM company_metrics');
    if (metricsCount.rows[0]?.count === 0) {
      for (const company of companies) {
        const seedMetrics = [
          { metricKey: 'growth_percent', metricValue: parseNumberFromText(company.growth) },
          { metricKey: 'retention_percent', metricValue: parseNumberFromText(company.retention) },
          { metricKey: 'pipeline_millions', metricValue: parseCurrencyToMillions(company.pipeline) },
          { metricKey: 'deals_active', metricValue: parseNumberFromText(company.hubspotMetrics?.deals) },
          { metricKey: 'campaigns_live', metricValue: parseNumberFromText(company.hubspotMetrics?.campaigns) },
          { metricKey: 'meetings_quarter', metricValue: parseNumberFromText(company.hubspotMetrics?.meetings) }
        ];

        for (const metric of seedMetrics) {
          await query(
            `INSERT INTO company_metrics (
              company_id, source_type, verification_status, confidence_score, metric_key, metric_value
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [company.id, 'hubspot', 'verified', 0.95, metric.metricKey, metric.metricValue]
          );
        }
      }
    }
  } catch (error) {
    // Database bootstrapping is best-effort so local fallback mode still works.
  }
}

await bootstrapDatabase();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function normalizeUserRow(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role
  };
}

export async function createUser({ name, email, password, role }) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    const error = new Error('A user with that email already exists');
    error.statusCode = 409;
    throw error;
  }

  const created = await query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashPassword(password), role || 'Founder']
  );

  const user = normalizeUserRow(created.rows[0]);
  const token = await createSession(user);
  return { user, token };
}

export async function authenticateUser({ email, password }) {
  const login = await query(
    'SELECT id, name, email, role FROM users WHERE email = $1 AND password_hash = $2',
    [email, hashPassword(password)]
  );

  if (login.rowCount === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = normalizeUserRow(login.rows[0]);
  const token = await createSession(user);
  return { user, token };
}

export async function createPost({ author, content }) {
  const created = await query(
    'INSERT INTO posts (author, content) VALUES ($1, $2) RETURNING id, author, content, created_at',
    [author, content]
  );

  return created.rows[0];
}

export async function listPosts() {
  const result = await query('SELECT id, author, content, created_at FROM posts ORDER BY created_at DESC');
  return result.rows;
}

export async function getCompanies() {
  const result = await queryWithFallback(
    `SELECT
      id, name, sector, summary, growth, retention, pipeline,
      hubspot_status, rating, review, metrics_sharing,
      hubspot_deals, hubspot_campaigns, hubspot_meetings,
      hubspot_portal, hubspot_owner, hubspot_connected_at
     FROM companies
     ORDER BY name`,
    [],
    () => ({ rows: companies.map((company) => ({
      id: company.id,
      name: company.name,
      sector: company.sector,
      summary: company.summary,
      growth: company.growth,
      retention: company.retention,
      pipeline: company.pipeline,
      hubspot_status: company.hubspotStatus,
      rating: company.rating,
      review: company.review,
      metrics_sharing: company.metricsSharing,
      hubspot_deals: company.hubspotMetrics.deals,
      hubspot_campaigns: company.hubspotMetrics.campaigns,
      hubspot_meetings: company.hubspotMetrics.meetings,
      hubspot_portal: company.hubspotMetrics.portal,
      hubspot_owner: company.hubspotMetrics.owner,
      hubspot_connected_at: company.hubspotMetrics.connectedAt
    })) })
  );

  return result.rows.map(parseCompanyRow);
}

export async function createOrUpdateCompanyOnboarding({
  companyName,
  sector,
  summary,
  sourceType,
  metricsSharing
}) {
  const id = toCompanyId(companyName);
  if (!id) {
    const error = new Error('Company name is required to generate an id');
    error.statusCode = 400;
    throw error;
  }

  const normalizedSharing = metricsSharing === 'accepted' ? 'accepted' : 'private';
  const hubspotStatus = sourceType === 'hubspot' ? 'Connected' : 'Preview';

  await queryWithFallback(
    `INSERT INTO companies (
      id, name, sector, summary, growth, retention, pipeline,
      hubspot_status, rating, review, metrics_sharing,
      hubspot_deals, hubspot_campaigns, hubspot_meetings
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      sector = EXCLUDED.sector,
      summary = EXCLUDED.summary,
      metrics_sharing = EXCLUDED.metrics_sharing,
      hubspot_status = EXCLUDED.hubspot_status`,
    [
      id,
      companyName,
      sector,
      summary,
      '+0%',
      '0%',
      '$0.0M',
      hubspotStatus,
      '8.0/10',
      'New profile',
      normalizedSharing,
      '0 active',
      '0 live',
      '0 this quarter'
    ],
    () => {
      const existingIndex = companies.findIndex((entry) => entry.id === id);
      const candidate = {
        id,
        name: companyName,
        sector,
        summary,
        growth: '+0%',
        retention: '0%',
        pipeline: '$0.0M',
        hubspotStatus,
        rating: '8.0/10',
        review: 'New profile',
        metricsSharing: normalizedSharing,
        hubspotMetrics: {
          deals: '0 active',
          campaigns: '0 live',
          meetings: '0 this quarter'
        }
      };

      if (existingIndex >= 0) {
        companies[existingIndex] = {
          ...companies[existingIndex],
          ...candidate,
          hubspotMetrics: {
            ...companies[existingIndex].hubspotMetrics,
            ...candidate.hubspotMetrics
          }
        };
      } else {
        companies.push(candidate);
      }

      persistFallbackStore();
      return { rowCount: 1, rows: [] };
    }
  );

  const companyList = await getCompanies();
  const created = companyList.find((entry) => entry.id === id);
  return created || null;
}

export async function getCompanyMetrics(companyId) {
  const result = await queryWithFallback(
    `SELECT
      company_id, source_type, verification_status, confidence_score,
      metric_key, metric_value, captured_at, created_at
     FROM company_metrics
     WHERE company_id = $1
     ORDER BY captured_at DESC, created_at DESC`,
    [companyId],
    () => ({
      rows: fallbackCompanyMetrics
        .filter((entry) => entry.companyId === companyId)
        .sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt))
        .map((entry) => ({
          company_id: entry.companyId,
          source_type: entry.sourceType,
          verification_status: entry.verificationStatus,
          confidence_score: entry.confidenceScore,
          metric_key: entry.metricKey,
          metric_value: entry.metricValue,
          captured_at: entry.capturedAt,
          created_at: entry.createdAt
        }))
    })
  );

  return result.rows.map((row) => ({
    companyId: row.company_id,
    sourceType: row.source_type,
    verificationStatus: row.verification_status,
    confidenceScore: Number(row.confidence_score),
    metricKey: row.metric_key,
    metricValue: Number(row.metric_value),
    capturedAt: row.captured_at,
    createdAt: row.created_at
  }));
}

export async function ingestCompanyMetrics({ companyId, sourceType, verificationStatus, confidenceScore, metrics, capturedAt }) {
  const normalizedSource = normalizeSourceType(sourceType);
  const normalizedVerification = normalizeVerificationStatus(verificationStatus);
  const normalizedMetrics = normalizeMetricEntries(metrics);
  const normalizedConfidence = clamp01(toFiniteNumber(confidenceScore));
  const capturedTimestamp = capturedAt || new Date().toISOString();

  if (!normalizedSource) {
    const error = new Error('Unsupported metric source type');
    error.statusCode = 400;
    throw error;
  }

  if (!normalizedVerification) {
    const error = new Error('Unsupported verification status');
    error.statusCode = 400;
    throw error;
  }

  if (!normalizedMetrics.length) {
    const error = new Error('At least one valid metric entry is required');
    error.statusCode = 400;
    throw error;
  }

  const companyList = await getCompanies();
  const company = companyList.find((entry) => entry.id === companyId);
  if (!company) {
    const error = new Error('Company not found');
    error.statusCode = 404;
    throw error;
  }

  await queryWithFallback(
    'DELETE FROM company_metrics WHERE company_id = $1 AND source_type = $2 AND captured_at = $3',
    [companyId, normalizedSource, capturedTimestamp],
    () => {
      for (let i = fallbackCompanyMetrics.length - 1; i >= 0; i -= 1) {
        const item = fallbackCompanyMetrics[i];
        if (item.companyId === companyId && item.sourceType === normalizedSource && item.capturedAt === capturedTimestamp) {
          fallbackCompanyMetrics.splice(i, 1);
        }
      }
      return { rowCount: 0, rows: [] };
    }
  );

  for (const metric of normalizedMetrics) {
    await queryWithFallback(
      `INSERT INTO company_metrics (
        company_id, source_type, verification_status, confidence_score,
        metric_key, metric_value, captured_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        companyId,
        normalizedSource,
        normalizedVerification,
        normalizedConfidence,
        metric.metricKey,
        metric.metricValue,
        capturedTimestamp
      ],
      () => {
        fallbackCompanyMetrics.push({
          companyId,
          sourceType: normalizedSource,
          verificationStatus: normalizedVerification,
          confidenceScore: normalizedConfidence,
          metricKey: metric.metricKey,
          metricValue: metric.metricValue,
          capturedAt: capturedTimestamp,
          createdAt: new Date().toISOString()
        });
        return { rowCount: 1, rows: [] };
      }
    );
  }

  persistFallbackStore();

  return {
    companyId,
    sourceType: normalizedSource,
    verificationStatus: normalizedVerification,
    confidenceScore: normalizedConfidence,
    capturedAt: capturedTimestamp,
    metrics: normalizedMetrics
  };
}

export async function getRankedCompanies() {
  const companyList = await getCompanies();
  const rankedWithMetrics = await Promise.all(
    companyList.map(async (company) => {
      const metrics = await getCompanyMetrics(company.id);
      const metricSnapshot = buildMetricSnapshot(company, metrics);

      return {
        ...metricSnapshot.company,
        rank: scoreCompany(metricSnapshot.company, metricSnapshot),
        metricsMeta: {
          confidence: Number((metricSnapshot.confidence * 100).toFixed(2)),
          sourceDiversity: Number((metricSnapshot.sourceDiversity * 100).toFixed(2)),
          verificationStrength: Number((metricSnapshot.verificationStrength * 100).toFixed(2)),
          latestCapturedAt: metrics[0]?.capturedAt || null,
          sourceTypes: [...new Set(metrics.map((entry) => entry.sourceType))]
        }
      };
    })
  );

  const ranked = rankedWithMetrics
    .sort((a, b) => b.rank.score - a.rank.score)
    .map((company, index) => ({
      ...company,
      rank: {
        ...company.rank,
        position: index + 1
      }
    }));

  return ranked;
}

export async function getVendors() {
  const result = await queryWithFallback(
    'SELECT id, name, category, description, tier FROM vendors ORDER BY name',
    [],
    () => ({ rows: vendors })
  );

  return result.rows;
}

export async function getRecommendedVendors(companyId) {
  const companyList = await getCompanies();
  const company = companyList.find((entry) => entry.id === companyId);
  if (!company) {
    const error = new Error('Company not found');
    error.statusCode = 404;
    throw error;
  }

  const vendorList = await getVendors();
  return vendorList
    .map((vendor) => scoreVendorForCompany(vendor, company))
    .sort((a, b) => b.match.score - a.match.score);
}

export async function getCompanyProfile(companyId) {
  const rankedCompanies = await getRankedCompanies();
  const company = rankedCompanies.find((entry) => entry.id === companyId);

  if (!company) {
    const error = new Error('Company not found');
    error.statusCode = 404;
    throw error;
  }

  const [recommendedVendors, companyMeetings, metrics] = await Promise.all([
    getRecommendedVendors(companyId),
    getMeetings(),
    getCompanyMetrics(companyId)
  ]);

  return {
    company,
    recommendedVendors,
    meetings: companyMeetings.filter((meeting) => meeting.companyId === companyId),
    metrics
  };
}

export async function getMeetings() {
  const result = await queryWithFallback(
    'SELECT id, company_id, topic, schedule, visibility, host FROM meetings ORDER BY schedule',
    [],
    () => ({ rows: meetings.map((meeting) => ({ ...meeting, company_id: meeting.companyId })) })
  );

  return result.rows.map((row) => ({
    id: row.id,
    companyId: row.company_id,
    topic: row.topic,
    schedule: row.schedule,
    visibility: row.visibility,
    host: row.host
  }));
}

export async function getFeedItems() {
  const result = await queryWithFallback(
    'SELECT id, author, detail, time FROM feed_items ORDER BY id',
    [],
    () => ({ rows: feedItems })
  );

  return result.rows;
}

export async function toggleMetricsSharing(companyId) {
  const result = await queryWithFallback(
    `UPDATE companies
     SET metrics_sharing = CASE WHEN metrics_sharing = 'accepted' THEN 'private' ELSE 'accepted' END
     WHERE id = $1
     RETURNING
      id, name, sector, summary, growth, retention, pipeline,
      hubspot_status, rating, review, metrics_sharing,
      hubspot_deals, hubspot_campaigns, hubspot_meetings,
      hubspot_portal, hubspot_owner, hubspot_connected_at`,
    [companyId],
    () => {
      const company = companies.find((entry) => entry.id === companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      company.metricsSharing = company.metricsSharing === 'accepted' ? 'private' : 'accepted';
      persistFallbackStore();

      return {
        rowCount: 1,
        rows: [{
          id: company.id,
          name: company.name,
          sector: company.sector,
          summary: company.summary,
          growth: company.growth,
          retention: company.retention,
          pipeline: company.pipeline,
          hubspot_status: company.hubspotStatus,
          rating: company.rating,
          review: company.review,
          metrics_sharing: company.metricsSharing,
          hubspot_deals: company.hubspotMetrics.deals,
          hubspot_campaigns: company.hubspotMetrics.campaigns,
          hubspot_meetings: company.hubspotMetrics.meetings,
          hubspot_portal: company.hubspotMetrics.portal,
          hubspot_owner: company.hubspotMetrics.owner,
          hubspot_connected_at: company.hubspotMetrics.connectedAt
        }]
      };
    }
  );

  if (result.rowCount === 0) {
    throw new Error('Company not found');
  }

  return parseCompanyRow(result.rows[0]);
}

export async function connectHubspot(companyId, payload) {
  const connectedAt = new Date().toISOString();
  const result = await queryWithFallback(
    `UPDATE companies
     SET
      hubspot_status = 'Connected',
      hubspot_portal = $2,
      hubspot_owner = $3,
      hubspot_connected_at = $4
     WHERE id = $1
     RETURNING
      id, name, sector, summary, growth, retention, pipeline,
      hubspot_status, rating, review, metrics_sharing,
      hubspot_deals, hubspot_campaigns, hubspot_meetings,
      hubspot_portal, hubspot_owner, hubspot_connected_at`,
    [companyId, payload.portal, payload.owner, connectedAt],
    () => {
      const company = companies.find((entry) => entry.id === companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      company.hubspotStatus = 'Connected';
      company.hubspotMetrics = {
        ...company.hubspotMetrics,
        portal: payload.portal,
        owner: payload.owner,
        connectedAt
      };

      persistFallbackStore();

      return {
        rowCount: 1,
        rows: [{
          id: company.id,
          name: company.name,
          sector: company.sector,
          summary: company.summary,
          growth: company.growth,
          retention: company.retention,
          pipeline: company.pipeline,
          hubspot_status: company.hubspotStatus,
          rating: company.rating,
          review: company.review,
          metrics_sharing: company.metricsSharing,
          hubspot_deals: company.hubspotMetrics.deals,
          hubspot_campaigns: company.hubspotMetrics.campaigns,
          hubspot_meetings: company.hubspotMetrics.meetings,
          hubspot_portal: company.hubspotMetrics.portal,
          hubspot_owner: company.hubspotMetrics.owner,
          hubspot_connected_at: company.hubspotMetrics.connectedAt
        }]
      };
    }
  );

  if (result.rowCount === 0) {
    throw new Error('Company not found');
  }

  return parseCompanyRow(result.rows[0]);
}

export async function getUserFromSession(token) {
  const result = await queryWithFallback(
    `SELECT u.id, u.name, u.email, u.role
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > NOW()
     LIMIT 1`,
    [token],
    () => {
      const active = fallbackSessions.find((session) => session.token === token && new Date(session.expiresAt) > new Date());
      if (!active) {
        return { rowCount: 0, rows: [] };
      }

      return {
        rowCount: 1,
        rows: [active.user]
      };
    }
  );

  if (result.rowCount === 0) {
    return null;
  }

  return normalizeUserRow(result.rows[0]);
}

export async function revokeSession(token) {
  await queryWithFallback(
    'DELETE FROM sessions WHERE token = $1',
    [token],
    () => {
      const index = fallbackSessions.findIndex((session) => session.token === token);
      if (index !== -1) {
        fallbackSessions.splice(index, 1);
      }

      return { rowCount: 1, rows: [] };
    }
  );
}

async function createSession(user) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  await queryWithFallback(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, Number(user.id), expiresAt],
    () => {
      fallbackSessions.push({ token, user, expiresAt });
      return { rowCount: 1, rows: [] };
    }
  );

  return token;
}
