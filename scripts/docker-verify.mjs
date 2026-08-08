import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const options = {
  apiUrl: 'http://localhost:5000',
  webUrl: 'http://localhost:3000',
  timeoutMs: 90000,
  skipRestart: false,
  help: false
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === '--help' || arg === '-h') {
    options.help = true;
  } else if (arg === '--skip-restart') {
    options.skipRestart = true;
  } else if (arg === '--api-url' && args[index + 1]) {
    options.apiUrl = args[index + 1];
    index += 1;
  } else if (arg === '--web-url' && args[index + 1]) {
    options.webUrl = args[index + 1];
    index += 1;
  } else if (arg === '--timeout-ms' && args[index + 1]) {
    options.timeoutMs = Number(args[index + 1]) || options.timeoutMs;
    index += 1;
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

if (options.help) {
  console.log(`Usage: node scripts/docker-verify.mjs [options]

Options:
  --api-url <url>      API base URL to verify (default: http://localhost:5000)
  --web-url <url>      Web base URL to verify (default: http://localhost:3000)
  --timeout-ms <ms>    Max wait time for health checks (default: 90000)
  --skip-restart       Skip the API restart persistence check
  --help, -h           Show this message
`);
  process.exit(0);
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithMessage(url, errorMessage) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(`${errorMessage}: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`${errorMessage}: received ${response.status}`);
  }

  return response;
}

async function waitFor(check, label, timeoutMs) {
  const start = Date.now();
  let lastError = 'Unknown failure';

  while (Date.now() - start < timeoutMs) {
    try {
      const result = await check();
      console.log(`PASS ${label}`);
      return result;
    } catch (error) {
      lastError = error.message;
      await sleep(1500);
    }
  }

  throw new Error(`Timed out waiting for ${label}: ${lastError}`);
}

async function getJson(url, errorMessage) {
  const response = await fetchWithMessage(url, errorMessage);
  return response.json();
}

async function postJson(url, body, extraHeaders = {}) {
  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    throw new Error(`Request failed for ${url}: ${error.message}`);
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  return { response, data };
}

function restartApiContainer() {
  console.log('Restarting Docker API container to verify persistence...');
  execFileSync('docker', ['compose', 'restart', 'api'], {
    stdio: 'inherit'
  });
}

async function verify() {
  console.log('Checking web and API availability...');

  await waitFor(
    async () => {
      const health = await getJson(`${options.apiUrl}/health`, 'API health check failed');
      if (health.status !== 'ok') {
        throw new Error('Health response did not report ok status');
      }
      return health;
    },
    'API health endpoint',
    options.timeoutMs
  );

  await waitFor(
    async () => {
      const response = await fetchWithMessage(options.webUrl, 'Web app did not respond');
      const html = await response.text();
      if (!html.includes('<!doctype html') && !html.includes('<div id="root">')) {
        throw new Error('Web response did not look like the app shell');
      }
      return true;
    },
    'web app root page',
    options.timeoutMs
  );

  const beforePosts = await getJson(`${options.apiUrl}/api/posts`, 'Initial posts read failed');
  if (!Array.isArray(beforePosts)) {
    throw new Error('Posts endpoint did not return an array');
  }
  console.log(`PASS posts endpoint returned ${beforePosts.length} records before write`);

  const uniqueSuffix = Date.now();
  const email = `docker-verify-${uniqueSuffix}@example.com`;
  const password = 'verify-pass-1234';
  const message = `docker-verify-${uniqueSuffix}`;

  const signup = await postJson(`${options.apiUrl}/api/auth/signup`, {
    name: 'Docker Verify',
    email,
    password,
    role: 'Founder'
  });

  if (signup.response.status !== 201 || !signup.data.token) {
    throw new Error(`Signup failed: ${signup.data.error || signup.response.status}`);
  }
  console.log('PASS signup and token issuance');

  const createPost = await postJson(
    `${options.apiUrl}/api/posts`,
    { content: message },
    { Authorization: `Bearer ${signup.data.token}` }
  );

  if (createPost.response.status !== 201 || createPost.data.content !== message) {
    throw new Error(`Post creation failed: ${createPost.data.error || createPost.response.status}`);
  }
  console.log(`PASS protected post creation (${createPost.data.id || 'created'})`);

  const createdPostId = createPost.data.id;

  if (!options.skipRestart) {
    restartApiContainer();

    await waitFor(
      async () => {
        const health = await getJson(`${options.apiUrl}/health`, 'API health check after restart failed');
        if (health.status !== 'ok') {
          throw new Error('Health response after restart did not report ok status');
        }
        return health;
      },
      'API restart recovery',
      options.timeoutMs
    );
  }

  const afterPosts = await getJson(`${options.apiUrl}/api/posts`, 'Posts read after verification failed');
  if (!Array.isArray(afterPosts)) {
    throw new Error('Posts endpoint did not return an array after verification');
  }

  const persisted = afterPosts.find((post) => post.id === createdPostId || post.content === message);
  if (!persisted) {
    throw new Error('Created post was not found after verification flow');
  }
  console.log('PASS persisted post survived verification flow');

  console.log('Docker verification succeeded.');
}

verify().catch((error) => {
  console.error(`Docker verification failed: ${error.message}`);
  process.exit(1);
});
