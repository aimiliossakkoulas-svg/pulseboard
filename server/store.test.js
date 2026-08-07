import test from 'node:test';
import assert from 'node:assert/strict';
import { createUser, createPost, getCompanies, toggleMetricsSharing, connectHubspot } from './store.js';

test('persists users, posts, and company updates', async () => {
  const user = await createUser({ name: 'Test User', email: 'store@example.com', password: 'secret', role: 'Founder' });
  assert.equal(user.email, 'store@example.com');

  const post = await createPost({ author: user.name, content: 'A new update from the test user.' });
  assert.equal(post.author, user.name);

  const companies = await getCompanies();
  assert.ok(companies.length > 0);

  const updated = await toggleMetricsSharing(companies[0].id);
  assert.equal(updated.metricsSharing, 'private');

  const connected = await connectHubspot(companies[0].id, { portal: 'demo', owner: 'Ava' });
  assert.equal(connected.hubspotStatus, 'Connected');
  assert.equal(connected.hubspotMetrics.deals, '18 active');
});
