export const heroStats = [
  { label: 'Profiles', value: '128+' },
  { label: 'Active meetings', value: '42' },
  { label: 'Partner agents', value: '19' }
];

export const adviceRequests = [
  {
    id: 'advice-1',
    title: 'Need help with retention strategy',
    author: 'Mina Chen',
    detail: 'Looking for a founder who has scaled paid onboarding journeys.'
  },
  {
    id: 'advice-2',
    title: 'Open to reviewing vendor stack',
    author: 'Jordan Rivera',
    detail: 'Happy to share notes on CRM and analytics tooling with trusted peers.'
  }
];

export const fallbackCompanies = [
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

export const fallbackVendors = [
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

export const fallbackMeetings = [
  {
    id: 'm1',
    companyId: 'alpha',
    topic: 'Pipeline review',
    schedule: '2026-08-08 10:00',
    visibility: 'Shared metrics enabled',
    host: 'Mina Chen'
  },
  {
    id: 'm2',
    companyId: 'pulse',
    topic: 'Revenue sync',
    schedule: '2026-08-09 14:30',
    visibility: 'Private until profile accepts',
    host: 'Jordan Rivera'
  },
  {
    id: 'm3',
    companyId: 'nova',
    topic: 'Growth advisory roundtable',
    schedule: '2026-08-12 16:00',
    visibility: 'Open to invited advisors',
    host: 'Priya Shah'
  }
];

export const fallbackFeed = [
  {
    id: 'feed-1',
    author: 'Mina Chen',
    detail: 'Alpha Labs shared a new pipeline review with approved partners.',
    time: '12m ago'
  },
  {
    id: 'feed-2',
    author: 'Jordan Rivera',
    detail: 'Nova Insights published a benchmark trend for growth-stage teams.',
    time: '34m ago'
  },
  {
    id: 'feed-3',
    author: 'Priya Shah',
    detail: 'Pulse Commerce opened a selective metrics window for invited vendors.',
    time: '1h ago'
  }
];
