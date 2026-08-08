import test from 'node:test';
import assert from 'node:assert/strict';
import { createUser, createPost, getCompanies, toggleMetricsSharing, connectHubspot } from './store.js';

test('persists users, posts, and company updates', async () => {
  const uniqueEmail = `store-${Date.now()}@example.com`;
  const signup = await createUser({ name: 'Test User', email: uniqueEmail, password: 'secret', role: 'Founder' });
  assert.equal(signup.user.email, uniqueEmail);
  assert.ok(signup.token);

  const post = await createPost({ author: signup.user.name, content: 'A new update from the test user.' });
  assert.equal(post.author, signup.user.name);

  const companies = await getCompanies();
  assert.ok(companies.length > 0);

  const previousSharing = companies[0].metricsSharing;
  const updated = await toggleMetricsSharing(companies[0].id);
  assert.notEqual(updated.metricsSharing, previousSharing);
  assert.ok(['accepted', 'private'].includes(updated.metricsSharing));

  const connected = await connectHubspot(companies[0].id, { portal: 'demo', owner: 'Ava' });
  assert.equal(connected.hubspotStatus, 'Connected');
  assert.equal(connected.hubspotMetrics.deals, '18 active');
});
