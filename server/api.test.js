import test from 'node:test';
import assert from 'node:assert/strict';
import app from './index.js';

function getJson(response) {
  return response.text().then((text) => (text ? JSON.parse(text) : {}));
}

test('auth guards and protected writes work across API endpoints', async (t) => {
  const server = app.listen(0);
  t.after(() => {
    server.close();
  });

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const uniqueEmail = `api-${Date.now()}@example.com`;

  const invalidSignup = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'bad-email', password: 'short' })
  });
  assert.equal(invalidSignup.status, 400);

  const signup = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'API Tester',
      email: uniqueEmail,
      password: 'verysecure123',
      role: 'Founder',
      companyName: 'API Test Labs',
      companyDomain: 'example.com'
    })
  });
  assert.equal(signup.status, 201);
  const signupData = await getJson(signup);
  assert.equal(signupData.user.email, uniqueEmail);
  assert.ok(signupData.token);

  const duplicateFounder = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Second Founder',
      email: `api-founder-2-${Date.now()}@example.com`,
      password: 'verysecure123',
      role: 'Founder',
      companyName: 'API Test Labs',
      companyDomain: 'example.com'
    })
  });
  assert.equal(duplicateFounder.status, 409);

  const forbiddenPost = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'missing token should fail' })
  });
  assert.equal(forbiddenPost.status, 401);

  const createdPost = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({ content: 'authorized post body' })
  });
  assert.equal(createdPost.status, 201);
  const postData = await getJson(createdPost);
  assert.equal(postData.author, 'API Tester');

  const toggleShare = await fetch(`${baseUrl}/api/companies/alpha/share`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${signupData.token}`
    }
  });
  assert.equal(toggleShare.status, 200);
  const companyData = await getJson(toggleShare);
  assert.ok(['accepted', 'private'].includes(companyData.metricsSharing));

  const rankedCompanies = await fetch(`${baseUrl}/api/companies/ranked`);
  assert.equal(rankedCompanies.status, 200);
  const rankedData = await getJson(rankedCompanies);
  assert.ok(Array.isArray(rankedData));
  assert.ok(rankedData.length > 0);
  assert.ok(typeof rankedData[0].rank?.score === 'number');

  const recommendedVendors = await fetch(`${baseUrl}/api/vendors/recommended/${rankedData[0].id}`);
  assert.equal(recommendedVendors.status, 200);
  const recommendedData = await getJson(recommendedVendors);
  assert.ok(Array.isArray(recommendedData));
  assert.ok(recommendedData.length > 0);
  assert.ok(typeof recommendedData[0].match?.score === 'number');

  const companyProfile = await fetch(`${baseUrl}/api/companies/${rankedData[0].id}/profile`);
  assert.equal(companyProfile.status, 200);
  const profileData = await getJson(companyProfile);
  assert.equal(profileData.company.id, rankedData[0].id);
  assert.ok(typeof profileData.company.rank?.score === 'number');
  assert.ok(Array.isArray(profileData.recommendedVendors));
  assert.ok(Array.isArray(profileData.meetings));

  const onboarding = await fetch(`${baseUrl}/api/companies/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({
      companyName: `Onboarded Co ${Date.now()}`,
      sector: 'SaaS',
      summary: 'Growth-focused company onboarding with baseline metrics for ranking confidence.',
      sourceType: 'manual',
      metricsSharing: 'private',
      verificationStatus: 'self-reported',
      confidenceScore: 0.74,
      metrics: [
        { metricKey: 'growth_percent', metricValue: 17.5 },
        { metricKey: 'retention_percent', metricValue: 88.4 },
        { metricKey: 'pipeline_millions', metricValue: 1.4 }
      ]
    })
  });
  assert.equal(onboarding.status, 201);
  const onboardingData = await getJson(onboarding);
  assert.ok(onboardingData.company?.id);
  assert.equal(onboardingData.company.sector, 'SaaS');
  assert.ok(Array.isArray(onboardingData.metrics));

  const metricIngest = await fetch(`${baseUrl}/api/companies/${rankedData[0].id}/metrics/quickbooks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({
      verificationStatus: 'verified',
      confidenceScore: 0.93,
      metrics: [
        { metricKey: 'growth_percent', metricValue: 31.2 },
        { metricKey: 'retention_percent', metricValue: 92.7 },
        { metricKey: 'pipeline_millions', metricValue: 3.8 }
      ]
    })
  });
  assert.equal(metricIngest.status, 201);
  const metricIngestData = await getJson(metricIngest);
  assert.equal(metricIngestData.sourceType, 'quickbooks');
  assert.equal(metricIngestData.verificationStatus, 'verified');

  const companyMetrics = await fetch(`${baseUrl}/api/companies/${rankedData[0].id}/metrics`);
  assert.equal(companyMetrics.status, 200);
  const companyMetricsData = await getJson(companyMetrics);
  assert.ok(Array.isArray(companyMetricsData));
  assert.ok(companyMetricsData.some((entry) => entry.sourceType === 'quickbooks'));
});
