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
  const uniqueSuffix = Date.now();
  const uniqueDomain = `apitest-${uniqueSuffix}.com`;
  const uniqueCompany = `API Test Labs ${uniqueSuffix}`;
  const uniqueEmail = `api-${uniqueSuffix}@${uniqueDomain}`;

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
      companyName: uniqueCompany,
      companyDomain: uniqueDomain
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
      email: `api-founder-2-${uniqueSuffix}@${uniqueDomain}`,
      password: 'verysecure123',
      role: 'Founder',
      companyName: uniqueCompany,
      companyDomain: uniqueDomain
    })
  });
  assert.equal(duplicateFounder.status, 409);

  const engagementCreate = await fetch(`${baseUrl}/api/engagements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({
      vendorId: 'vendor-1',
      title: 'Construction advisory sprint',
      pricingModel: 'milestone',
      consultantFee: 5000,
      feeCurrency: 'USD'
    })
  });
  assert.equal(engagementCreate.status, 201);
  const engagementData = await getJson(engagementCreate);
  assert.ok(engagementData.id);

  const messageCreate = await fetch(`${baseUrl}/api/engagements/${engagementData.id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({ channel: 'chat', body: 'Kickoff scheduled for next week' })
  });
  assert.equal(messageCreate.status, 201);

  const milestoneCreate = await fetch(`${baseUrl}/api/engagements/${engagementData.id}/milestones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({ title: 'Site operations audit', amount: 2500 })
  });
  assert.equal(milestoneCreate.status, 201);
  const milestoneData = await getJson(milestoneCreate);
  assert.equal(milestoneData.status, 'planned');

  const milestoneUpdate = await fetch(`${baseUrl}/api/engagements/${engagementData.id}/milestones/${milestoneData.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({ status: 'funded' })
  });
  assert.equal(milestoneUpdate.status, 200);

  const employeeSignup = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Field Employee',
      email: `employee-${uniqueSuffix}@${uniqueDomain}`,
      password: 'verysecure123',
      role: 'Employee',
      companyName: uniqueCompany,
      companyDomain: uniqueDomain
    })
  });
  assert.equal(employeeSignup.status, 201);
  const employeeData = await getJson(employeeSignup);

  const forbiddenPaidUpdate = await fetch(`${baseUrl}/api/engagements/${engagementData.id}/milestones/${milestoneData.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${employeeData.token}`
    },
    body: JSON.stringify({ status: 'paid' })
  });
  assert.equal(forbiddenPaidUpdate.status, 403);

  const checkoutCreate = await fetch(`${baseUrl}/api/engagements/${engagementData.id}/milestones/${milestoneData.id}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({ origin: baseUrl })
  });
  assert.equal(checkoutCreate.status, 201);
  const checkoutData = await getJson(checkoutCreate);
  assert.ok(checkoutData.reference);

  const webhookComplete = await fetch(`${baseUrl}/api/billing/stripe/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: checkoutData.reference
        }
      }
    })
  });
  assert.equal(webhookComplete.status, 200);

  const webhookDuplicate = await fetch(`${baseUrl}/api/billing/stripe/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: checkoutData.reference
        }
      }
    })
  });
  assert.equal(webhookDuplicate.status, 200);
  const duplicateWebhookData = await getJson(webhookDuplicate);
  assert.equal(duplicateWebhookData.duplicate, true);

  const callCreate = await fetch(`${baseUrl}/api/engagements/${engagementData.id}/calls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({
      provider: 'meet',
      meetingUrl: 'https://meet.google.com/example-room',
      agenda: 'Kickoff',
      scheduledAt: new Date(Date.now() + 86400000).toISOString()
    })
  });
  assert.equal(callCreate.status, 201);

  const outcomeUpdate = await fetch(`${baseUrl}/api/engagements/${engagementData.id}/outcome`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({
      baselineGrowth: 8,
      currentGrowth: 14,
      baselineRetention: 70,
      currentRetention: 78,
      baselinePipeline: 1.2,
      currentPipeline: 1.6
    })
  });
  assert.equal(outcomeUpdate.status, 200);

  const workspace = await fetch(`${baseUrl}/api/engagements/${engagementData.id}/workspace`, {
    headers: { Authorization: `Bearer ${signupData.token}` }
  });
  assert.equal(workspace.status, 200);
  const workspaceData = await getJson(workspace);
  assert.ok(Array.isArray(workspaceData.messages));
  assert.ok(Array.isArray(workspaceData.milestones));
  assert.ok(Array.isArray(workspaceData.calls));
  assert.equal(typeof workspaceData.outcome.roiPercent, 'number');
  assert.ok(workspaceData.milestones.some((item) => item.status === 'paid'));

  const payments = await fetch(`${baseUrl}/api/engagements/${engagementData.id}/payments`, {
    headers: { Authorization: `Bearer ${signupData.token}` }
  });
  assert.equal(payments.status, 200);
  const paymentData = await getJson(payments);
  assert.ok(Array.isArray(paymentData));
  assert.ok(paymentData.some((item) => item.eventType === 'checkout_created'));
  assert.ok(paymentData.some((item) => item.eventType === 'checkout_completed'));

  const notifications = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${signupData.token}` }
  });
  assert.equal(notifications.status, 200);
  const notificationsData = await getJson(notifications);
  assert.ok(Array.isArray(notificationsData));
  assert.ok(notificationsData.length > 0);

  const markRead = await fetch(`${baseUrl}/api/notifications/${notificationsData[0].id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${signupData.token}` }
  });
  assert.equal(markRead.status, 200);

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
      companyName: uniqueCompany,
      sector: 'SaaS',
      summary: 'Growth-focused company onboarding with baseline metrics for ranking confidence.',
      sourceType: 'manual',
      metricsSharing: 'private',
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
  assert.ok(typeof onboardingData.completion?.percent === 'number');
  assert.ok(Array.isArray(onboardingData.completion?.checklist));

  const profilePatch = await fetch(`${baseUrl}/api/companies/${onboardingData.company.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({
      sector: 'Fintech',
      summary: 'Updated company summary for profile editing coverage and trust clarity.',
      metricsSharing: 'accepted'
    })
  });
  assert.equal(profilePatch.status, 200);
  const patchedProfile = await getJson(profilePatch);
  assert.equal(patchedProfile.company.sector, 'Fintech');
  assert.equal(patchedProfile.company.metricsSharing, 'accepted');
  assert.match(patchedProfile.company.summary, /Updated company summary/);
  assert.ok(typeof patchedProfile.completion?.percent === 'number');

  const forbiddenPatch = await fetch(`${baseUrl}/api/companies/alpha`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signupData.token}`
    },
    body: JSON.stringify({
      sector: 'Should Fail',
      summary: 'This update should be rejected because the user does not own alpha.'
    })
  });
  assert.equal(forbiddenPatch.status, 403);

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
