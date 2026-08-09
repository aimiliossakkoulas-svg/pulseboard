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
const fallbackIntroRequests = [];
const fallbackEngagements = [];
const fallbackEngagementMessages = [];
const fallbackMilestones = [];
const fallbackCalls = [];
const fallbackOutcomes = [];
const fallbackNotifications = [];
let fallbackIntroRequestNextId = 1;
let fallbackEngagementNextId = 1;
let fallbackMessageNextId = 1;
let fallbackMilestoneNextId = 1;
let fallbackCallNextId = 1;
let fallbackNotificationNextId = 1;

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
    if (Array.isArray(parsed.introRequests)) {
      fallbackIntroRequests.splice(0, fallbackIntroRequests.length, ...parsed.introRequests);
      fallbackIntroRequestNextId = fallbackIntroRequests.reduce((max, r) => Math.max(max, r.id + 1), 1);
    }
    if (Array.isArray(parsed.engagements)) {
      fallbackEngagements.splice(0, fallbackEngagements.length, ...parsed.engagements);
      fallbackEngagementNextId = fallbackEngagements.reduce((max, r) => Math.max(max, r.id + 1), 1);
    }
    if (Array.isArray(parsed.engagementMessages)) {
      fallbackEngagementMessages.splice(0, fallbackEngagementMessages.length, ...parsed.engagementMessages);
      fallbackMessageNextId = fallbackEngagementMessages.reduce((max, r) => Math.max(max, r.id + 1), 1);
    }
    if (Array.isArray(parsed.engagementMilestones)) {
      fallbackMilestones.splice(0, fallbackMilestones.length, ...parsed.engagementMilestones);
      fallbackMilestoneNextId = fallbackMilestones.reduce((max, r) => Math.max(max, r.id + 1), 1);
    }
    if (Array.isArray(parsed.engagementCalls)) {
      fallbackCalls.splice(0, fallbackCalls.length, ...parsed.engagementCalls);
      fallbackCallNextId = fallbackCalls.reduce((max, r) => Math.max(max, r.id + 1), 1);
    }
    if (Array.isArray(parsed.engagementOutcomes)) {
      fallbackOutcomes.splice(0, fallbackOutcomes.length, ...parsed.engagementOutcomes);
    }
    if (Array.isArray(parsed.notifications)) {
      fallbackNotifications.splice(0, fallbackNotifications.length, ...parsed.notifications);
      fallbackNotificationNextId = fallbackNotifications.reduce((max, r) => Math.max(max, r.id + 1), 1);
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
        companyMetrics: fallbackCompanyMetrics,
        introRequests: fallbackIntroRequests,
        engagements: fallbackEngagements,
        engagementMessages: fallbackEngagementMessages,
        engagementMilestones: fallbackMilestones,
        engagementCalls: fallbackCalls,
        engagementOutcomes: fallbackOutcomes,
        notifications: fallbackNotifications
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
const ENGAGEMENT_STATUSES = new Set(['active', 'paused', 'completed']);
const MESSAGE_CHANNELS = new Set(['chat', 'note', 'call-summary']);
const MILESTONE_STATUSES = new Set(['planned', 'funded', 'in_progress', 'submitted', 'approved', 'paid']);
const BILLING_MODELS = new Set(['hourly', 'fixed', 'milestone']);

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
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'Founder',
        company_id VARCHAR(64),
        company_name VARCHAR(255),
        company_domain VARCHAR(255),
        linkedin_company_url VARCHAR(500),
        company_verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id VARCHAR(64)');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255)');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS company_domain VARCHAR(255)');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_company_url VARCHAR(500)');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS company_verified BOOLEAN NOT NULL DEFAULT FALSE');
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_unique_founder_company
      ON users (company_id)
      WHERE role = 'Founder' AND company_id IS NOT NULL
    `);

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

    await query(`
      CREATE TABLE IF NOT EXISTS intro_requests (
        id SERIAL PRIMARY KEY,
        requester_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vendor_id VARCHAR(64) NOT NULL,
        message TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS engagements (
        id SERIAL PRIMARY KEY,
        requester_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_id VARCHAR(64) NOT NULL,
        vendor_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'active',
        pricing_model VARCHAR(30) NOT NULL DEFAULT 'milestone',
        consultant_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
        fee_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS engagement_messages (
        id SERIAL PRIMARY KEY,
        engagement_id INTEGER NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
        author_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(100) NOT NULL,
        channel VARCHAR(30) NOT NULL DEFAULT 'chat',
        body TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS engagement_milestones (
        id SERIAL PRIMARY KEY,
        engagement_id INTEGER NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        amount DOUBLE PRECISION NOT NULL DEFAULT 0,
        status VARCHAR(30) NOT NULL DEFAULT 'planned',
        payment_provider VARCHAR(30),
        payment_reference VARCHAR(255),
        due_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await query('ALTER TABLE engagement_milestones ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(30)');
    await query('ALTER TABLE engagement_milestones ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255)');

    await query(`
      CREATE TABLE IF NOT EXISTS engagement_calls (
        id SERIAL PRIMARY KEY,
        engagement_id INTEGER NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
        provider VARCHAR(30) NOT NULL,
        meeting_url TEXT NOT NULL,
        agenda TEXT,
        scheduled_at TIMESTAMP NOT NULL,
        created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS engagement_outcomes (
        engagement_id INTEGER PRIMARY KEY REFERENCES engagements(id) ON DELETE CASCADE,
        baseline_growth DOUBLE PRECISION NOT NULL DEFAULT 0,
        current_growth DOUBLE PRECISION NOT NULL DEFAULT 0,
        baseline_retention DOUBLE PRECISION NOT NULL DEFAULT 0,
        current_retention DOUBLE PRECISION NOT NULL DEFAULT 0,
        baseline_pipeline DOUBLE PRECISION NOT NULL DEFAULT 0,
        current_pipeline DOUBLE PRECISION NOT NULL DEFAULT 0,
        roi_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
        last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(60) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        related_engagement_id INTEGER REFERENCES engagements(id) ON DELETE SET NULL,
        read_at TIMESTAMP,
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
    role: row.role,
    companyId: row.company_id || '',
    companyName: row.company_name || '',
    companyDomain: row.company_domain || '',
    linkedinCompanyUrl: row.linkedin_company_url || '',
    companyVerified: Boolean(row.company_verified)
  };
}

export async function createUser({ name, email, password, role, companyName = '', companyDomain = '', linkedinCompanyUrl = '' }) {
  const companyId = companyName ? toCompanyId(companyName) : '';

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    const error = new Error('A user with that email already exists');
    error.statusCode = 409;
    throw error;
  }

  if (role === 'Founder' && companyId) {
    const founderClaim = await query('SELECT id FROM users WHERE role = $1 AND company_id = $2 LIMIT 1', ['Founder', companyId]);
    if (founderClaim.rowCount > 0) {
      const error = new Error('This company already has a founder account. Ask the founder to invite employees.');
      error.statusCode = 409;
      throw error;
    }
  }

  const created = await query(
    `INSERT INTO users (
      name, email, password_hash, role, company_id, company_name, company_domain, linkedin_company_url, company_verified
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, email, role, company_id, company_name, company_domain, linkedin_company_url, company_verified`,
    [
      name,
      email,
      hashPassword(password),
      role || 'Founder',
      companyId || null,
      companyName || null,
      companyDomain || null,
      linkedinCompanyUrl || null,
      Boolean(companyDomain)
    ]
  );

  const user = normalizeUserRow(created.rows[0]);
  const token = await createSession(user);
  return { user, token };
}

export async function authenticateUser({ email, password }) {
  const login = await query(
    `SELECT
      id, name, email, role,
      company_id, company_name, company_domain, linkedin_company_url, company_verified
     FROM users
     WHERE email = $1 AND password_hash = $2`,
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
    `SELECT
      u.id, u.name, u.email, u.role,
      u.company_id, u.company_name, u.company_domain, u.linkedin_company_url, u.company_verified
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

function canAccessEngagement(authUser, engagement) {
  if (!authUser || !engagement) return false;
  if (String(engagement.requesterUserId) === String(authUser.id)) return true;
  return Boolean(authUser.companyId && engagement.companyId && authUser.companyId === engagement.companyId);
}

export async function createEngagement({ authUser, vendorId, title, pricingModel = 'milestone', consultantFee = 0, feeCurrency = 'USD', introRequestId = null }) {
  const normalizedPricing = BILLING_MODELS.has(pricingModel) ? pricingModel : 'milestone';
  const normalizedFee = Math.max(0, Number(consultantFee) || 0);
  const normalizedCurrency = String(feeCurrency || 'USD').toUpperCase().slice(0, 10) || 'USD';
  const companyId = authUser.companyId || toCompanyId(authUser.companyName || authUser.name || 'company');
  const now = new Date().toISOString();

  const result = await queryWithFallback(
    `INSERT INTO engagements (
      requester_user_id, company_id, vendor_id, title, status,
      pricing_model, consultant_fee, fee_currency, started_at, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, 'active', $5, $6, $7, $8, $8, $8)
    RETURNING id, requester_user_id, company_id, vendor_id, title, status, pricing_model, consultant_fee, fee_currency, started_at, created_at, updated_at`,
    [authUser.id, companyId, vendorId, title, normalizedPricing, normalizedFee, normalizedCurrency, now],
    () => {
      const row = {
        id: fallbackEngagementNextId++,
        requester_user_id: String(authUser.id),
        company_id: companyId,
        vendor_id: vendorId,
        title,
        status: 'active',
        pricing_model: normalizedPricing,
        consultant_fee: normalizedFee,
        fee_currency: normalizedCurrency,
        started_at: now,
        created_at: now,
        updated_at: now,
      };
      fallbackEngagements.push({
        id: row.id,
        requesterUserId: String(authUser.id),
        companyId,
        vendorId,
        title,
        status: 'active',
        pricingModel: normalizedPricing,
        consultantFee: normalizedFee,
        feeCurrency: normalizedCurrency,
        startedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      persistFallbackStore();
      return { rowCount: 1, rows: [row] };
    }
  );

  if (introRequestId) {
    await queryWithFallback(
      `UPDATE intro_requests
       SET status = 'accepted', updated_at = $2
       WHERE id = $1 AND requester_user_id = $3`,
      [introRequestId, now, authUser.id],
      () => {
        const req = fallbackIntroRequests.find((entry) => entry.id === introRequestId && String(entry.requesterUserId) === String(authUser.id));
        if (req) {
          req.status = 'accepted';
          req.updatedAt = now;
          persistFallbackStore();
        }
        return { rowCount: req ? 1 : 0, rows: [] };
      }
    );
  }

  const engagement = parseEngagementRow(result.rows[0]);
  await addEngagementMessage({ authUser, engagementId: engagement.id, channel: 'note', body: `Engagement started: ${title}` });
  return engagement;
}

export async function getEngagementsByUser(authUser) {
  const result = await queryWithFallback(
    `SELECT id, requester_user_id, company_id, vendor_id, title, status, pricing_model, consultant_fee, fee_currency, started_at, created_at, updated_at
     FROM engagements
     WHERE requester_user_id = $1 OR company_id = $2
     ORDER BY created_at DESC`,
    [authUser.id, authUser.companyId || ''],
    () => ({
      rowCount: fallbackEngagements.length,
      rows: fallbackEngagements
        .filter((entry) => String(entry.requesterUserId) === String(authUser.id) || (authUser.companyId && entry.companyId === authUser.companyId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((entry) => ({
          id: entry.id,
          requester_user_id: entry.requesterUserId,
          company_id: entry.companyId,
          vendor_id: entry.vendorId,
          title: entry.title,
          status: entry.status,
          pricing_model: entry.pricingModel,
          consultant_fee: entry.consultantFee,
          fee_currency: entry.feeCurrency,
          started_at: entry.startedAt,
          created_at: entry.createdAt,
          updated_at: entry.updatedAt,
        }))
    })
  );

  return result.rows.map(parseEngagementRow);
}

export async function getEngagementWorkspace(authUser, engagementId) {
  const engagementRows = await queryWithFallback(
    `SELECT id, requester_user_id, company_id, vendor_id, title, status, pricing_model, consultant_fee, fee_currency, started_at, created_at, updated_at
     FROM engagements WHERE id = $1 LIMIT 1`,
    [engagementId],
    () => {
      const found = fallbackEngagements.find((entry) => entry.id === engagementId);
      if (!found) return { rowCount: 0, rows: [] };
      return {
        rowCount: 1,
        rows: [{
          id: found.id,
          requester_user_id: found.requesterUserId,
          company_id: found.companyId,
          vendor_id: found.vendorId,
          title: found.title,
          status: found.status,
          pricing_model: found.pricingModel,
          consultant_fee: found.consultantFee,
          fee_currency: found.feeCurrency,
          started_at: found.startedAt,
          created_at: found.createdAt,
          updated_at: found.updatedAt,
        }]
      };
    }
  );

  if (engagementRows.rowCount === 0) {
    const error = new Error('Engagement not found');
    error.statusCode = 404;
    throw error;
  }

  const engagement = parseEngagementRow(engagementRows.rows[0]);
  if (!canAccessEngagement(authUser, engagement)) {
    const error = new Error('You do not have access to this engagement');
    error.statusCode = 403;
    throw error;
  }

  const [messagesResult, milestonesResult, callsResult, outcomeResult] = await Promise.all([
    queryWithFallback(
      `SELECT id, engagement_id, author_user_id, author_name, channel, body, created_at
       FROM engagement_messages WHERE engagement_id = $1 ORDER BY created_at ASC`,
      [engagement.id],
      () => ({
        rowCount: fallbackEngagementMessages.length,
        rows: fallbackEngagementMessages
          .filter((entry) => entry.engagementId === engagement.id)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((entry) => ({
            id: entry.id,
            engagement_id: entry.engagementId,
            author_user_id: entry.authorUserId,
            author_name: entry.authorName,
            channel: entry.channel,
            body: entry.body,
            created_at: entry.createdAt,
          }))
      })
    ),
    queryWithFallback(
      `SELECT id, engagement_id, title, amount, status, due_date, created_at, updated_at
       FROM engagement_milestones WHERE engagement_id = $1 ORDER BY created_at ASC`,
      [engagement.id],
      () => ({
        rowCount: fallbackMilestones.length,
        rows: fallbackMilestones
          .filter((entry) => entry.engagementId === engagement.id)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((entry) => ({
            id: entry.id,
            engagement_id: entry.engagementId,
            title: entry.title,
            amount: entry.amount,
            status: entry.status,
            due_date: entry.dueDate,
            created_at: entry.createdAt,
            updated_at: entry.updatedAt,
          }))
      })
    ),
    queryWithFallback(
      `SELECT id, engagement_id, provider, meeting_url, agenda, scheduled_at, created_by_user_id, created_at
       FROM engagement_calls WHERE engagement_id = $1 ORDER BY scheduled_at ASC`,
      [engagement.id],
      () => ({
        rowCount: fallbackCalls.length,
        rows: fallbackCalls
          .filter((entry) => entry.engagementId === engagement.id)
          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
          .map((entry) => ({
            id: entry.id,
            engagement_id: entry.engagementId,
            provider: entry.provider,
            meeting_url: entry.meetingUrl,
            agenda: entry.agenda,
            scheduled_at: entry.scheduledAt,
            created_by_user_id: entry.createdByUserId,
            created_at: entry.createdAt,
          }))
      })
    ),
    queryWithFallback(
      `SELECT engagement_id, baseline_growth, current_growth, baseline_retention, current_retention,
              baseline_pipeline, current_pipeline, roi_percent, last_updated_at
       FROM engagement_outcomes WHERE engagement_id = $1 LIMIT 1`,
      [engagement.id],
      () => {
        const found = fallbackOutcomes.find((entry) => entry.engagementId === engagement.id);
        if (!found) return { rowCount: 0, rows: [] };
        return {
          rowCount: 1,
          rows: [{
            engagement_id: found.engagementId,
            baseline_growth: found.baselineGrowth,
            current_growth: found.currentGrowth,
            baseline_retention: found.baselineRetention,
            current_retention: found.currentRetention,
            baseline_pipeline: found.baselinePipeline,
            current_pipeline: found.currentPipeline,
            roi_percent: found.roiPercent,
            last_updated_at: found.lastUpdatedAt,
          }]
        };
      }
    ),
  ]);

  const messages = messagesResult.rows.map(parseEngagementMessageRow);
  const milestones = milestonesResult.rows.map(parseMilestoneRow);
  const calls = callsResult.rows.map(parseCallRow);
  const outcome = outcomeResult.rowCount
    ? parseOutcomeRow(outcomeResult.rows[0])
    : {
        engagementId: engagement.id,
        baselineGrowth: 0,
        currentGrowth: 0,
        baselineRetention: 0,
        currentRetention: 0,
        baselinePipeline: 0,
        currentPipeline: 0,
        roiPercent: 0,
        lastUpdatedAt: null,
      };

  return { engagement, messages, milestones, calls, outcome };
}

export async function addEngagementMessage({ authUser, engagementId, channel = 'chat', body }) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const normalizedChannel = MESSAGE_CHANNELS.has(channel) ? channel : 'chat';
  const createdAt = new Date().toISOString();

  const result = await queryWithFallback(
    `INSERT INTO engagement_messages (engagement_id, author_user_id, author_name, channel, body, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, engagement_id, author_user_id, author_name, channel, body, created_at`,
    [workspace.engagement.id, authUser.id, authUser.name, normalizedChannel, body, createdAt],
    () => {
      const row = {
        id: fallbackMessageNextId++,
        engagement_id: workspace.engagement.id,
        author_user_id: String(authUser.id),
        author_name: authUser.name,
        channel: normalizedChannel,
        body,
        created_at: createdAt,
      };
      fallbackEngagementMessages.push({
        id: row.id,
        engagementId: row.engagement_id,
        authorUserId: row.author_user_id,
        authorName: row.author_name,
        channel: row.channel,
        body: row.body,
        createdAt: row.created_at,
      });
      persistFallbackStore();
      return { rowCount: 1, rows: [row] };
    }
  );

  const message = parseEngagementMessageRow(result.rows[0]);
  if (String(workspace.engagement.requesterUserId) !== String(authUser.id)) {
    await createUserNotification({
      userId: workspace.engagement.requesterUserId,
      type: 'engagement-message',
      title: `New message in engagement #${workspace.engagement.id}`,
      body: `${authUser.name}: ${body.slice(0, 160)}`,
      relatedEngagementId: workspace.engagement.id,
    });
  }
  return message;
}

export async function getEngagementMessages(authUser, engagementId) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const result = await queryWithFallback(
    `SELECT id, engagement_id, author_user_id, author_name, channel, body, created_at
     FROM engagement_messages WHERE engagement_id = $1 ORDER BY created_at ASC`,
    [workspace.engagement.id],
    () => ({
      rowCount: fallbackEngagementMessages.length,
      rows: fallbackEngagementMessages
        .filter((entry) => entry.engagementId === workspace.engagement.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((entry) => ({
          id: entry.id,
          engagement_id: entry.engagementId,
          author_user_id: entry.authorUserId,
          author_name: entry.authorName,
          channel: entry.channel,
          body: entry.body,
          created_at: entry.createdAt,
        }))
    })
  );

  return result.rows.map(parseEngagementMessageRow);
}

export async function addEngagementMilestone({ authUser, engagementId, title, amount = 0, dueDate = null }) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const now = new Date().toISOString();
  const normalizedAmount = Math.max(0, Number(amount) || 0);

  const result = await queryWithFallback(
    `INSERT INTO engagement_milestones (engagement_id, title, amount, status, payment_provider, payment_reference, due_date, created_at, updated_at)
     VALUES ($1, $2, $3, 'planned', NULL, NULL, $4, $5, $5)
     RETURNING id, engagement_id, title, amount, status, payment_provider, payment_reference, due_date, created_at, updated_at`,
    [workspace.engagement.id, title, normalizedAmount, dueDate, now],
    () => {
      const row = {
        id: fallbackMilestoneNextId++,
        engagement_id: workspace.engagement.id,
        title,
        amount: normalizedAmount,
        status: 'planned',
        due_date: dueDate,
        created_at: now,
        updated_at: now,
      };
      fallbackMilestones.push({
        id: row.id,
        engagementId: row.engagement_id,
        title,
        amount: normalizedAmount,
        status: 'planned',
        paymentProvider: '',
        paymentReference: '',
        dueDate: dueDate || null,
        createdAt: now,
        updatedAt: now,
      });
      persistFallbackStore();
      return { rowCount: 1, rows: [row] };
    }
  );

  return parseMilestoneRow(result.rows[0]);
}

export async function getEngagementMilestones(authUser, engagementId) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const result = await queryWithFallback(
    `SELECT id, engagement_id, title, amount, status, payment_provider, payment_reference, due_date, created_at, updated_at
     FROM engagement_milestones WHERE engagement_id = $1 ORDER BY created_at ASC`,
    [workspace.engagement.id],
    () => ({
      rowCount: fallbackMilestones.length,
      rows: fallbackMilestones
        .filter((entry) => entry.engagementId === workspace.engagement.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((entry) => ({
          id: entry.id,
          engagement_id: entry.engagementId,
          title: entry.title,
          amount: entry.amount,
          status: entry.status,
          payment_provider: entry.paymentProvider || null,
          payment_reference: entry.paymentReference || null,
          due_date: entry.dueDate,
          created_at: entry.createdAt,
          updated_at: entry.updatedAt,
        }))
    })
  );
  return result.rows.map(parseMilestoneRow);
}

export async function updateEngagementMilestoneStatus({ authUser, engagementId, milestoneId, status }) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const nextStatus = MILESTONE_STATUSES.has(status) ? status : 'planned';
  if (nextStatus === 'paid' && !['Founder', 'Admin'].includes(String(authUser.role || ''))) {
    const error = new Error('Only Founder or Admin can mark milestones as paid');
    error.statusCode = 403;
    throw error;
  }
  const now = new Date().toISOString();
  const result = await queryWithFallback(
    `UPDATE engagement_milestones
     SET status = $3, updated_at = $4
     WHERE id = $1 AND engagement_id = $2
     RETURNING id, engagement_id, title, amount, status, payment_provider, payment_reference, due_date, created_at, updated_at`,
    [milestoneId, workspace.engagement.id, nextStatus, now],
    () => {
      const milestone = fallbackMilestones.find((entry) => entry.id === milestoneId && entry.engagementId === workspace.engagement.id);
      if (!milestone) return { rowCount: 0, rows: [] };
      milestone.status = nextStatus;
      milestone.updatedAt = now;
      persistFallbackStore();
      return {
        rowCount: 1,
        rows: [{
          id: milestone.id,
          engagement_id: milestone.engagementId,
          title: milestone.title,
          amount: milestone.amount,
          status: milestone.status,
          payment_provider: milestone.paymentProvider || null,
          payment_reference: milestone.paymentReference || null,
          due_date: milestone.dueDate,
          created_at: milestone.createdAt,
          updated_at: milestone.updatedAt,
        }]
      };
    }
  );

  if (result.rowCount === 0) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }
  const updated = parseMilestoneRow(result.rows[0]);
  await createUserNotification({
    userId: workspace.engagement.requesterUserId,
    type: 'milestone-status',
    title: `Milestone updated to ${updated.status}`,
    body: `${updated.title} is now ${updated.status}.`,
    relatedEngagementId: workspace.engagement.id,
  });
  return updated;
}

export async function scheduleEngagementCall({ authUser, engagementId, provider, meetingUrl, agenda = '', scheduledAt }) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const now = new Date().toISOString();

  const result = await queryWithFallback(
    `INSERT INTO engagement_calls (engagement_id, provider, meeting_url, agenda, scheduled_at, created_by_user_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, engagement_id, provider, meeting_url, agenda, scheduled_at, created_by_user_id, created_at`,
    [workspace.engagement.id, provider, meetingUrl, agenda || null, scheduledAt, authUser.id, now],
    () => {
      const row = {
        id: fallbackCallNextId++,
        engagement_id: workspace.engagement.id,
        provider,
        meeting_url: meetingUrl,
        agenda: agenda || null,
        scheduled_at: scheduledAt,
        created_by_user_id: String(authUser.id),
        created_at: now,
      };
      fallbackCalls.push({
        id: row.id,
        engagementId: row.engagement_id,
        provider: row.provider,
        meetingUrl: row.meeting_url,
        agenda: row.agenda,
        scheduledAt: row.scheduled_at,
        createdByUserId: row.created_by_user_id,
        createdAt: row.created_at,
      });
      persistFallbackStore();
      return { rowCount: 1, rows: [row] };
    }
  );

  const call = parseCallRow(result.rows[0]);
  await createUserNotification({
    userId: workspace.engagement.requesterUserId,
    type: 'engagement-call',
    title: 'Call scheduled',
    body: `${provider.toUpperCase()} call scheduled for ${new Date(scheduledAt).toLocaleString()}`,
    relatedEngagementId: workspace.engagement.id,
  });
  return call;
}

export async function getEngagementCalls(authUser, engagementId) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const result = await queryWithFallback(
    `SELECT id, engagement_id, provider, meeting_url, agenda, scheduled_at, created_by_user_id, created_at
     FROM engagement_calls WHERE engagement_id = $1 ORDER BY scheduled_at ASC`,
    [workspace.engagement.id],
    () => ({
      rowCount: fallbackCalls.length,
      rows: fallbackCalls
        .filter((entry) => entry.engagementId === workspace.engagement.id)
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .map((entry) => ({
          id: entry.id,
          engagement_id: entry.engagementId,
          provider: entry.provider,
          meeting_url: entry.meetingUrl,
          agenda: entry.agenda,
          scheduled_at: entry.scheduledAt,
          created_by_user_id: entry.createdByUserId,
          created_at: entry.createdAt,
        }))
    })
  );
  return result.rows.map(parseCallRow);
}

export async function upsertEngagementOutcome({ authUser, engagementId, baselineGrowth = 0, currentGrowth = 0, baselineRetention = 0, currentRetention = 0, baselinePipeline = 0, currentPipeline = 0 }) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const data = {
    baselineGrowth: Number(baselineGrowth) || 0,
    currentGrowth: Number(currentGrowth) || 0,
    baselineRetention: Number(baselineRetention) || 0,
    currentRetention: Number(currentRetention) || 0,
    baselinePipeline: Number(baselinePipeline) || 0,
    currentPipeline: Number(currentPipeline) || 0,
  };
  const baselineRevenue = data.baselinePipeline;
  const revenueLift = data.currentPipeline - data.baselinePipeline;
  const roiPercent = baselineRevenue > 0 ? (revenueLift / baselineRevenue) * 100 : 0;
  const now = new Date().toISOString();

  const result = await queryWithFallback(
    `INSERT INTO engagement_outcomes (
      engagement_id, baseline_growth, current_growth, baseline_retention, current_retention,
      baseline_pipeline, current_pipeline, roi_percent, last_updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (engagement_id)
    DO UPDATE SET
      baseline_growth = EXCLUDED.baseline_growth,
      current_growth = EXCLUDED.current_growth,
      baseline_retention = EXCLUDED.baseline_retention,
      current_retention = EXCLUDED.current_retention,
      baseline_pipeline = EXCLUDED.baseline_pipeline,
      current_pipeline = EXCLUDED.current_pipeline,
      roi_percent = EXCLUDED.roi_percent,
      last_updated_at = EXCLUDED.last_updated_at
    RETURNING engagement_id, baseline_growth, current_growth, baseline_retention, current_retention, baseline_pipeline, current_pipeline, roi_percent, last_updated_at`,
    [workspace.engagement.id, data.baselineGrowth, data.currentGrowth, data.baselineRetention, data.currentRetention, data.baselinePipeline, data.currentPipeline, roiPercent, now],
    () => {
      const index = fallbackOutcomes.findIndex((entry) => entry.engagementId === workspace.engagement.id);
      const next = {
        engagementId: workspace.engagement.id,
        baselineGrowth: data.baselineGrowth,
        currentGrowth: data.currentGrowth,
        baselineRetention: data.baselineRetention,
        currentRetention: data.currentRetention,
        baselinePipeline: data.baselinePipeline,
        currentPipeline: data.currentPipeline,
        roiPercent,
        lastUpdatedAt: now,
      };
      if (index >= 0) fallbackOutcomes[index] = next;
      else fallbackOutcomes.push(next);
      persistFallbackStore();
      return {
        rowCount: 1,
        rows: [{
          engagement_id: next.engagementId,
          baseline_growth: next.baselineGrowth,
          current_growth: next.currentGrowth,
          baseline_retention: next.baselineRetention,
          current_retention: next.currentRetention,
          baseline_pipeline: next.baselinePipeline,
          current_pipeline: next.currentPipeline,
          roi_percent: next.roiPercent,
          last_updated_at: next.lastUpdatedAt,
        }]
      };
    }
  );

  const outcome = parseOutcomeRow(result.rows[0]);
  await createUserNotification({
    userId: workspace.engagement.requesterUserId,
    type: 'engagement-outcome',
    title: 'Outcome snapshot updated',
    body: `ROI is now ${outcome.roiPercent.toFixed(2)}% for engagement #${workspace.engagement.id}.`,
    relatedEngagementId: workspace.engagement.id,
  });
  return outcome;
}

export async function getEngagementMilestoneById(authUser, engagementId, milestoneId) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const result = await queryWithFallback(
    `SELECT id, engagement_id, title, amount, status, payment_provider, payment_reference, due_date, created_at, updated_at
     FROM engagement_milestones
     WHERE id = $1 AND engagement_id = $2
     LIMIT 1`,
    [milestoneId, workspace.engagement.id],
    () => {
      const found = fallbackMilestones.find((entry) => entry.id === milestoneId && entry.engagementId === workspace.engagement.id);
      if (!found) return { rowCount: 0, rows: [] };
      return {
        rowCount: 1,
        rows: [{
          id: found.id,
          engagement_id: found.engagementId,
          title: found.title,
          amount: found.amount,
          status: found.status,
          payment_provider: found.paymentProvider || null,
          payment_reference: found.paymentReference || null,
          due_date: found.dueDate,
          created_at: found.createdAt,
          updated_at: found.updatedAt,
        }]
      };
    }
  );

  if (result.rowCount === 0) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  return parseMilestoneRow(result.rows[0]);
}

export async function setMilestonePaymentReference({ authUser, engagementId, milestoneId, provider, reference }) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const now = new Date().toISOString();
  const result = await queryWithFallback(
    `UPDATE engagement_milestones
     SET payment_provider = $3, payment_reference = $4, status = 'funded', updated_at = $5
     WHERE id = $1 AND engagement_id = $2
     RETURNING id, engagement_id, title, amount, status, payment_provider, payment_reference, due_date, created_at, updated_at`,
    [milestoneId, workspace.engagement.id, provider, reference, now],
    () => {
      const found = fallbackMilestones.find((entry) => entry.id === milestoneId && entry.engagementId === workspace.engagement.id);
      if (!found) return { rowCount: 0, rows: [] };
      found.paymentProvider = provider;
      found.paymentReference = reference;
      found.status = 'funded';
      found.updatedAt = now;
      persistFallbackStore();
      return {
        rowCount: 1,
        rows: [{
          id: found.id,
          engagement_id: found.engagementId,
          title: found.title,
          amount: found.amount,
          status: found.status,
          payment_provider: found.paymentProvider,
          payment_reference: found.paymentReference,
          due_date: found.dueDate,
          created_at: found.createdAt,
          updated_at: found.updatedAt,
        }]
      };
    }
  );

  if (result.rowCount === 0) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  await createUserNotification({
    userId: workspace.engagement.requesterUserId,
    type: 'milestone-funded',
    title: 'Milestone funded',
    body: `Payment session created for milestone #${milestoneId}.`,
    relatedEngagementId: workspace.engagement.id,
  });

  return parseMilestoneRow(result.rows[0]);
}

export async function markMilestonePaidByReference(paymentReference) {
  if (!paymentReference) {
    const error = new Error('Payment reference is required');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const result = await queryWithFallback(
    `UPDATE engagement_milestones m
     SET status = 'paid', updated_at = $2
     FROM engagements e
     WHERE m.payment_reference = $1 AND e.id = m.engagement_id
     RETURNING m.id, m.engagement_id, m.title, m.amount, m.status, m.payment_provider, m.payment_reference, m.due_date, m.created_at, m.updated_at, e.requester_user_id`,
    [paymentReference, now],
    () => {
      const found = fallbackMilestones.find((entry) => entry.paymentReference === paymentReference);
      if (!found) return { rowCount: 0, rows: [] };
      found.status = 'paid';
      found.updatedAt = now;
      const engagement = fallbackEngagements.find((entry) => entry.id === found.engagementId);
      persistFallbackStore();
      return {
        rowCount: 1,
        rows: [{
          id: found.id,
          engagement_id: found.engagementId,
          title: found.title,
          amount: found.amount,
          status: found.status,
          payment_provider: found.paymentProvider || null,
          payment_reference: found.paymentReference || null,
          due_date: found.dueDate,
          created_at: found.createdAt,
          updated_at: found.updatedAt,
          requester_user_id: engagement?.requesterUserId || null,
        }]
      };
    }
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  if (row.requester_user_id) {
    await createUserNotification({
      userId: row.requester_user_id,
      type: 'milestone-paid',
      title: 'Milestone paid',
      body: `${row.title} has been marked paid.`,
      relatedEngagementId: row.engagement_id,
    });
  }

  return parseMilestoneRow(row);
}

export async function createUserNotification({ userId, type, title, body, relatedEngagementId = null }) {
  if (!userId || !title || !body) return null;

  const createdAt = new Date().toISOString();
  const result = await queryWithFallback(
    `INSERT INTO user_notifications (user_id, type, title, body, related_engagement_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, type, title, body, related_engagement_id, read_at, created_at`,
    [Number(userId), type || 'system', title, body, relatedEngagementId, createdAt],
    () => {
      const row = {
        id: fallbackNotificationNextId++,
        user_id: String(userId),
        type: type || 'system',
        title,
        body,
        related_engagement_id: relatedEngagementId,
        read_at: null,
        created_at: createdAt,
      };
      fallbackNotifications.push({
        id: row.id,
        userId: String(userId),
        type: row.type,
        title: row.title,
        body: row.body,
        relatedEngagementId: row.related_engagement_id,
        readAt: row.read_at,
        createdAt: row.created_at,
      });
      persistFallbackStore();
      return { rowCount: 1, rows: [row] };
    }
  );

  return parseNotificationRow(result.rows[0]);
}

export async function getUserNotifications(userId) {
  const result = await queryWithFallback(
    `SELECT id, user_id, type, title, body, related_engagement_id, read_at, created_at
     FROM user_notifications
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [Number(userId)],
    () => ({
      rowCount: fallbackNotifications.length,
      rows: fallbackNotifications
        .filter((entry) => String(entry.userId) === String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((entry) => ({
          id: entry.id,
          user_id: entry.userId,
          type: entry.type,
          title: entry.title,
          body: entry.body,
          related_engagement_id: entry.relatedEngagementId,
          read_at: entry.readAt,
          created_at: entry.createdAt,
        }))
    })
  );

  return result.rows.map(parseNotificationRow);
}

export async function markUserNotificationRead(userId, notificationId) {
  const readAt = new Date().toISOString();
  const result = await queryWithFallback(
    `UPDATE user_notifications
     SET read_at = $3
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, type, title, body, related_engagement_id, read_at, created_at`,
    [notificationId, Number(userId), readAt],
    () => {
      const found = fallbackNotifications.find((entry) => entry.id === notificationId && String(entry.userId) === String(userId));
      if (!found) return { rowCount: 0, rows: [] };
      found.readAt = readAt;
      persistFallbackStore();
      return {
        rowCount: 1,
        rows: [{
          id: found.id,
          user_id: found.userId,
          type: found.type,
          title: found.title,
          body: found.body,
          related_engagement_id: found.relatedEngagementId,
          read_at: found.readAt,
          created_at: found.createdAt,
        }]
      };
    }
  );

  if (result.rowCount === 0) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  return parseNotificationRow(result.rows[0]);
}

export async function getEngagementOutcome(authUser, engagementId) {
  const workspace = await getEngagementWorkspace(authUser, engagementId);
  const result = await queryWithFallback(
    `SELECT engagement_id, baseline_growth, current_growth, baseline_retention, current_retention,
            baseline_pipeline, current_pipeline, roi_percent, last_updated_at
     FROM engagement_outcomes WHERE engagement_id = $1 LIMIT 1`,
    [workspace.engagement.id],
    () => {
      const found = fallbackOutcomes.find((entry) => entry.engagementId === workspace.engagement.id);
      if (!found) return { rowCount: 0, rows: [] };
      return {
        rowCount: 1,
        rows: [{
          engagement_id: found.engagementId,
          baseline_growth: found.baselineGrowth,
          current_growth: found.currentGrowth,
          baseline_retention: found.baselineRetention,
          current_retention: found.currentRetention,
          baseline_pipeline: found.baselinePipeline,
          current_pipeline: found.currentPipeline,
          roi_percent: found.roiPercent,
          last_updated_at: found.lastUpdatedAt,
        }]
      };
    }
  );

  if (result.rowCount === 0) {
    return {
      engagementId: workspace.engagement.id,
      baselineGrowth: 0,
      currentGrowth: 0,
      baselineRetention: 0,
      currentRetention: 0,
      baselinePipeline: 0,
      currentPipeline: 0,
      roiPercent: 0,
      lastUpdatedAt: null,
    };
  }

  return parseOutcomeRow(result.rows[0]);
}

export async function createIntroRequest({ userId, vendorId, message }) {
  const now = new Date().toISOString();
  const result = await queryWithFallback(
    `INSERT INTO intro_requests (requester_user_id, vendor_id, message, status, created_at, updated_at)
     VALUES ($1, $2, $3, 'pending', $4, $4)
     RETURNING id, requester_user_id, vendor_id, message, status, created_at, updated_at`,
    [userId, vendorId, message || null, now],
    () => {
      const existing = fallbackIntroRequests.find(
        (r) => r.requesterUserId === userId && r.vendorId === vendorId && r.status === 'pending'
      );
      if (existing) {
        const error = new Error('An intro request for this vendor is already pending');
        error.statusCode = 409;
        throw error;
      }
      const record = {
        id: fallbackIntroRequestNextId++,
        requesterUserId: userId,
        vendorId,
        message: message || null,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      fallbackIntroRequests.push(record);
      persistFallbackStore();
      return { rowCount: 1, rows: [{ id: record.id, requester_user_id: record.requesterUserId, vendor_id: record.vendorId, message: record.message, status: record.status, created_at: record.createdAt, updated_at: record.updatedAt }] };
    }
  );

  if (result.rowCount === 0) {
    throw new Error('Failed to create intro request');
  }

  return parseIntroRequestRow(result.rows[0]);
}

export async function getIntroRequestsByUser(userId) {
  const result = await queryWithFallback(
    `SELECT id, requester_user_id, vendor_id, message, status, created_at, updated_at
     FROM intro_requests WHERE requester_user_id = $1 ORDER BY created_at DESC`,
    [userId],
    () => ({
      rowCount: fallbackIntroRequests.length,
      rows: fallbackIntroRequests
        .filter((r) => r.requesterUserId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((r) => ({ id: r.id, requester_user_id: r.requesterUserId, vendor_id: r.vendorId, message: r.message, status: r.status, created_at: r.createdAt, updated_at: r.updatedAt }))
    })
  );

  return result.rows.map(parseIntroRequestRow);
}

export async function cancelIntroRequest(id, userId) {
  const result = await queryWithFallback(
    `DELETE FROM intro_requests WHERE id = $1 AND requester_user_id = $2 AND status = 'pending' RETURNING id`,
    [id, userId],
    () => {
      const index = fallbackIntroRequests.findIndex((r) => r.id === id && r.requesterUserId === userId && r.status === 'pending');
      if (index === -1) return { rowCount: 0, rows: [] };
      fallbackIntroRequests.splice(index, 1);
      persistFallbackStore();
      return { rowCount: 1, rows: [{ id }] };
    }
  );

  if (result.rowCount === 0) {
    const error = new Error('Request not found or already processed');
    error.statusCode = 404;
    throw error;
  }
}

function parseIntroRequestRow(row) {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseEngagementRow(row) {
  return {
    id: row.id,
    requesterUserId: String(row.requester_user_id),
    companyId: row.company_id,
    vendorId: row.vendor_id,
    title: row.title,
    status: row.status,
    pricingModel: row.pricing_model,
    consultantFee: Number(row.consultant_fee),
    feeCurrency: row.fee_currency,
    startedAt: row.started_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseEngagementMessageRow(row) {
  return {
    id: row.id,
    engagementId: row.engagement_id,
    authorUserId: String(row.author_user_id),
    authorName: row.author_name || '',
    channel: row.channel,
    body: row.body,
    createdAt: row.created_at,
  };
}

function parseMilestoneRow(row) {
  return {
    id: row.id,
    engagementId: row.engagement_id,
    title: row.title,
    amount: Number(row.amount),
    status: row.status,
    paymentProvider: row.payment_provider || '',
    paymentReference: row.payment_reference || '',
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseNotificationRow(row) {
  return {
    id: row.id,
    userId: String(row.user_id),
    type: row.type,
    title: row.title,
    body: row.body,
    relatedEngagementId: row.related_engagement_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

function parseCallRow(row) {
  return {
    id: row.id,
    engagementId: row.engagement_id,
    provider: row.provider,
    meetingUrl: row.meeting_url,
    agenda: row.agenda,
    scheduledAt: row.scheduled_at,
    createdByUserId: String(row.created_by_user_id),
    createdAt: row.created_at,
  };
}

function parseOutcomeRow(row) {
  return {
    engagementId: row.engagement_id,
    baselineGrowth: Number(row.baseline_growth),
    currentGrowth: Number(row.current_growth),
    baselineRetention: Number(row.baseline_retention),
    currentRetention: Number(row.current_retention),
    baselinePipeline: Number(row.baseline_pipeline),
    currentPipeline: Number(row.current_pipeline),
    roiPercent: Number(row.roi_percent),
    lastUpdatedAt: row.last_updated_at,
  };
}
