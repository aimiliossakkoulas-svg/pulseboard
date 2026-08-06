const companies = [
  {
    id: 'alpha',
    name: 'Alpha Labs',
    sector: 'SaaS',
    hubspotStatus: 'Connected',
    dealVelocity: '42 days',
    growth: '+28%',
    retention: '91%',
    campaignHealth: 'Strong',
    summary: 'High-growth marketing automation platform accelerating new pipeline and cross-sell motion.'
  },
  {
    id: 'pulse',
    name: 'Pulse Commerce',
    sector: 'E-commerce',
    hubspotStatus: 'Connected',
    dealVelocity: '58 days',
    growth: '+19%',
    retention: '87%',
    campaignHealth: 'Moderate',
    summary: 'A modern B2B marketplace using HubSpot intelligence to improve customer acquisition.'
  },
  {
    id: 'nova',
    name: 'Nova Insights',
    sector: 'Analytics',
    hubspotStatus: 'Preview',
    dealVelocity: '33 days',
    growth: '+35%',
    retention: '94%',
    campaignHealth: 'Excellent',
    summary: 'Data insights company that benchmarks customer success and operational metrics.'
  }
];

const posts = [
  {
    company: 'Alpha Labs',
    title: 'How can we shorten early-stage deal cycles?',
    body: 'We want to reduce our deal velocity while maintaining pipeline quality. Any advice on qualification triggers or HubSpot automation?' 
  },
  {
    company: 'Pulse Commerce',
    title: 'Seeking ideas for campaign-to-product fit alignment',
    body: 'Our marketing campaigns are converting, but handoff to product-led onboarding is lagging. What metrics should we benchmark first?' 
  },
  {
    company: 'Nova Insights',
    title: 'Need help comparing retention benchmarks in analytics',
    body: 'Is 91% retention strong for a B2B analytics SMB? Would love a comparison sample and peer advice.',
    tag: 'Benchmarking'
  }
];

const companyASelect = document.getElementById('company-a');
const companyBSelect = document.getElementById('company-b');
const profileA = document.getElementById('profile-a');
const profileB = document.getElementById('profile-b');
const collabFeed = document.getElementById('collab-feed');
const newPostBtn = document.getElementById('new-post-btn');
const postDialog = document.getElementById('post-dialog');
const cancelPost = document.getElementById('cancel-post');
const submitPost = document.getElementById('submit-post');
const postCompanyInput = document.getElementById('post-company');
const postTextInput = document.getElementById('post-text');
const syncNowBtn = document.getElementById('sync-now-btn');
const syncStatus = document.getElementById('sync-status');
const syncProgress = document.getElementById('sync-progress');
const rankMetricSelect = document.getElementById('rank-metric');
const rankList = document.getElementById('rank-list');
const vendorList = document.getElementById('vendor-list');
const reviewList = document.getElementById('review-list');
const newMeetingBtn = document.getElementById('new-meeting-btn');
const meetingDialog = document.getElementById('meeting-dialog');
const cancelMeeting = document.getElementById('cancel-meeting');
const submitMeeting = document.getElementById('submit-meeting');
const meetingCompanySelect = document.getElementById('meeting-company');
const meetingTopicInput = document.getElementById('meeting-topic');
const meetingTimeInput = document.getElementById('meeting-time');
const meetingList = document.getElementById('meeting-list');

let isSyncing = false;
const vendors = [
  { name: 'HubSync Partners', service: 'HubSpot migration', status: 'Top-rated' },
  { name: 'GrowthOps', service: 'Revenue operations', status: 'Recommended' },
  { name: 'CampaignCraft', service: 'Marketing automation', status: 'Preferred partner' }
];
const reviews = [
  { agent: 'Mia', company: 'Alpha Labs', summary: 'Strong campaign execution; recommend automating lead nurture to reduce cycle time.' },
  { agent: 'Jordan', company: 'Pulse Commerce', summary: 'Good sales velocity, but offer tiered contract follow-up to lift retention.' },
  { agent: 'Leila', company: 'Nova Insights', summary: 'Excellent retention; align reporting dashboards to support vendor success metrics.' }
];
const meetings = [
  { company: 'Alpha Labs', topic: 'Pipeline and revenue sync', when: '2026-08-08 10:00' },
  { company: 'Pulse Commerce', topic: 'HubSpot campaign review', when: '2026-08-09 14:30' }
];

function createOption(company) {
  const option = document.createElement('option');
  option.value = company.id;
  option.textContent = company.name;
  return option;
}

function fillSelects() {
  companies.forEach((company) => {
    companyASelect.appendChild(createOption(company));
    companyBSelect.appendChild(createOption(company));
  });
  companyASelect.value = companies[0].id;
  companyBSelect.value = companies[1].id;
}

function renderProfile(company, container) {
  container.innerHTML = `
    <div class="profile-header">
      <div>
        <h3>${company.name}</h3>
        <p>${company.summary}</p>
      </div>
      <span class="profile-pill">${company.sector}</span>
    </div>
    <div class="profile-metrics">
      <div class="metric-row">
        <div>
          <strong>HubSpot status</strong>
          <span>${company.hubspotStatus}</span>
        </div>
      </div>
      <div class="metric-row">
        <div>
          <strong>Deal velocity</strong>
          <span>${company.dealVelocity}</span>
        </div>
      </div>
      <div class="metric-row">
        <div>
          <strong>Revenue growth</strong>
          <span>${company.growth}</span>
        </div>
      </div>
      <div class="metric-row">
        <div>
          <strong>Retention</strong>
          <span>${company.retention}</span>
        </div>
      </div>
      <div class="metric-row">
        <div>
          <strong>Campaign health</strong>
          <span>${company.campaignHealth}</span>
        </div>
      </div>
    </div>
  `;
}

function renderFeed() {
  collabFeed.innerHTML = '';
  posts.forEach((post) => {
    const postItem = document.createElement('article');
    postItem.className = 'feed-item';
    postItem.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <div class="tag">${post.company}${post.tag ? ' · ' + post.tag : ''}</div>
    `;
    collabFeed.appendChild(postItem);
  });
}

function updateComparison() {
  const companyA = companies.find((company) => company.id === companyASelect.value);
  const companyB = companies.find((company) => company.id === companyBSelect.value);
  if (companyA) renderProfile(companyA, profileA);
  if (companyB) renderProfile(companyB, profileB);
}

function parseMetric(metric, value) {
  if (metric === 'dealVelocity') {
    return parseInt(value.replace(' days', ''), 10) || 0;
  }
  return parseInt(value.replace('+', '').replace('%', ''), 10) || 0;
}

function renderRankings() {
  const metric = rankMetricSelect.value;
  const sorted = [...companies].sort((a, b) => {
    const aValue = parseMetric(metric, a[metric]);
    const bValue = parseMetric(metric, b[metric]);
    if (metric === 'dealVelocity') return aValue - bValue;
    return bValue - aValue;
  });

  rankList.innerHTML = '';
  sorted.forEach((company, index) => {
    const scoreValue = company[metric];
    const item = document.createElement('div');
    item.className = 'rank-item';
    item.innerHTML = `
      <div>
        <strong>#${index + 1} ${company.name}</strong>
        <span>${company.summary}</span>
      </div>
      <div class="rank-score">${scoreValue}</div>
    `;
    rankList.appendChild(item);
  });
}

function renderVendors() {
  vendorList.innerHTML = '';
  vendors.forEach((vendor) => {
    const item = document.createElement('div');
    item.className = 'vendor-item';
    item.innerHTML = `
      <div>
        <strong>${vendor.name}</strong>
        <span>${vendor.service}</span>
      </div>
      <button type="button">Request intro</button>
    `;
    vendorList.appendChild(item);
  });
}

function renderReviews() {
  reviewList.innerHTML = '';
  reviews.forEach((review) => {
    const item = document.createElement('div');
    item.className = 'review-item';
    item.innerHTML = `
      <div class="review-meta">
        <span>${review.agent} · ${review.company}</span>
      </div>
      <strong>${review.summary}</strong>
    `;
    reviewList.appendChild(item);
  });
}

function renderMeetings() {
  meetingList.innerHTML = '';
  meetings.forEach((meeting) => {
    const item = document.createElement('div');
    item.className = 'meeting-item';
    item.innerHTML = `
      <strong>${meeting.topic}</strong>
      <span>${meeting.company} · ${meeting.when}</span>
    `;
    meetingList.appendChild(item);
  });
}

function setSyncProgress(value) {
  syncProgress.style.width = `${value}%`;
}

function completeSync() {
  isSyncing = false;
  syncNowBtn.disabled = false;
  setSyncProgress(100);
  syncStatus.textContent = 'Synced just now';
  companies.forEach((company) => {
    if (company.hubspotStatus === 'Preview') {
      company.hubspotStatus = 'Connected';
      company.campaignHealth = 'Strong';
    }
    company.growth = company.growth.replace('+', '').replace('%', '');
    const growthDelta = Math.round((Math.random() * 4) + 1);
    company.growth = `+${parseInt(company.growth, 10) + growthDelta}%`;
  });
  updateComparison();
}

function startSync() {
  if (isSyncing) return;
  isSyncing = true;
  syncNowBtn.disabled = true;
  syncStatus.textContent = 'Syncing with HubSpot...';
  setSyncProgress(0);

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.max(8, Math.random() * 20);
    if (progress >= 100) {
      clearInterval(interval);
      completeSync();
      renderRankings();
      return;
    }
    setSyncProgress(progress);
  }, 250);
}

companyASelect.addEventListener('change', updateComparison);
companyBSelect.addEventListener('change', updateComparison);
rankMetricSelect.addEventListener('change', renderRankings);
syncNowBtn.addEventListener('click', startSync);
newPostBtn.addEventListener('click', () => {
  postDialog.showModal();
  postCompanyInput.focus();
});
cancelPost.addEventListener('click', () => postDialog.close());
cancelPost.addEventListener('click', () => postDialog.close());

submitPost.addEventListener('click', () => {
  const company = postCompanyInput.value.trim() || 'Community';
  const text = postTextInput.value.trim();
  if (!text) return;

  posts.unshift({
    company,
    title: `Help request from ${company}`,
    body: text
  });
  renderFeed();
  postDialog.close();
  postCompanyInput.value = '';
  postTextInput.value = '';
});

function init() {
  fillSelects();
  updateComparison();
  renderRankings();
  renderVendors();
  renderReviews();
  renderMeetings();
  renderFeed();
}

init();
