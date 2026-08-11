import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createUser, createPost, getCompanies, toggleMetricsSharing, connectHubspot } from './store.js';

test('persists users, posts, and company updates', async () => {
  const uniqueSuffix = Date.now();
  const uniqueDomain = `storetest-${uniqueSuffix}.com`;
  const uniqueEmail = `store-${uniqueSuffix}@${uniqueDomain}`;
  const signup = await createUser({
    name: 'Test User',
    email: uniqueEmail,
    password: 'secret',
    role: 'Founder',
    companyName: `Store Test Labs ${uniqueSuffix}`,
    companyDomain: uniqueDomain
  });
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

test('persists auth sessions across a fresh module load', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'companyboard-store-'));
  const tempStorePath = path.join(tempDir, 'store.json');
  process.env.STORE_FILE_PATH = tempStorePath;
  const originalStoreFilePath = process.env.STORE_FILE_PATH;

  const uniqueSuffix = Date.now();
  const uniqueDomain = `sessiontest-${uniqueSuffix}.com`;
  const uniqueEmail = `session-${uniqueSuffix}@${uniqueDomain}`;

  const firstLoad = await import(new URL(`./store.js?test=${uniqueSuffix}`, import.meta.url).href);
  const signup = await firstLoad.createUser({
    name: 'Session Tester',
    email: uniqueEmail,
    password: 'secret123',
    role: 'Founder',
    companyName: `Session Test Labs ${uniqueSuffix}`,
    companyDomain: uniqueDomain
  });

  const secondLoad = await import(new URL(`./store.js?test=${uniqueSuffix + 1}`, import.meta.url).href);
  const restoredUser = await secondLoad.getUserFromSession(signup.token);

  assert.ok(restoredUser);
  assert.equal(restoredUser.email, uniqueEmail);

  process.env.STORE_FILE_PATH = originalStoreFilePath;
  fs.rmSync(tempDir, { recursive: true, force: true });
});
