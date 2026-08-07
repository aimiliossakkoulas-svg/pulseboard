import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialCompanies = [
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

const marketplaceVendors = [
  {
    name: 'HubSync Partners',
    category: 'HubSpot automation',
    description: 'CRM sync and revenue workflows for scaling businesses.',
    tier: 'Featured partner'
  },
  {
    name: 'GrowthOps',
    category: 'Revenue operations',
    description: 'Executive advisory and data-backed pipeline optimization.',
    tier: 'Premium access'
  },
  {
    name: 'CampaignCraft',
    category: 'Marketing operations',
    description: 'Experiment-led campaigns tied to account-based growth motions.',
    tier: 'Preferred vendor'
  }
];

const meetings = [
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

const adviceRequests = [
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

const previewFeed = [
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

const heroStats = [
  { label: 'Profiles', value: '128+' },
  { label: 'Active meetings', value: '42' },
  { label: 'Partner agents', value: '19' }
];

function App() {
  const [posts, setPosts] = useState([]);
  const [author, setAuthor] = useState('Guest');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Loading posts...');
  const [companies, setCompanies] = useState(initialCompanies);
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const savedUser = window.localStorage.getItem('pulseboard-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'Founder' });
  const [authMessage, setAuthMessage] = useState('');

  async function loadPosts() {
    try {
      const response = await fetch(`${API_URL}/api/posts`);
      const data = await response.json();
      setPosts(data);
      setStatus(data.length ? 'Posts loaded' : 'No posts yet. Be the first to share.');
    } catch (error) {
      setStatus('Backend is offline. Start the Node server to sync feeds.');
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (user) {
      setAuthor(user.name);
    }
  }, [user]);

  async function handleAuthSubmit(event) {
    event.preventDefault();

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : { name: authForm.name, email: authForm.email, password: authForm.password, role: authForm.role };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setUser(data.user);
      window.localStorage.setItem('pulseboard-user', JSON.stringify(data.user));
      setAuthForm({ name: '', email: '', password: '', role: 'Founder' });
      setAuthMessage(authMode === 'login' ? `Welcome back, ${data.user.name}` : `Welcome aboard, ${data.user.name}`);
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  function handleLogout() {
    setUser(null);
    window.localStorage.removeItem('pulseboard-user');
    setAuthMessage('You have been signed out.');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content })
      });

      const newPost = await response.json();
      setPosts((current) => [newPost, ...current]);
      setContent('');
      setStatus('Post published');
    } catch (error) {
      setStatus('Unable to publish post right now.');
    }
  }

  function toggleMetricsSharing(companyId) {
    setCompanies((current) =>
      current.map((company) =>
        company.id === companyId
          ? {
              ...company,
              metricsSharing: company.metricsSharing === 'accepted' ? 'private' : 'accepted'
            }
          : company
      )
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <header className="hero hero-preview">
          <div className="hero-copy">
            <p className="eyebrow">PulseBoard network</p>
            <h1>Explore a smarter business network before you sign in.</h1>
            <p>Browse ranked company profiles, selective metric sharing, expert reviews, and marketplace vendor opportunities. Create an account when you’re ready to join the conversation.</p>
            <div className="hero-actions">
              <button type="button" onClick={() => setAuthMode('signup')}>Create account</button>
              <button type="button" className="secondary-action" onClick={() => setAuthMode('login')}>Sign in</button>
            </div>
            <div className="hero-stats">
              {heroStats.map((stat) => (
                <div key={stat.label} className="stat-pill">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="panel preview-grid">
          <div className="preview-card">
            <h3>Ranked company profiles</h3>
            <p>See growth, retention, pipeline health, and HubSpot activity in one view.</p>
          </div>
          <div className="preview-card">
            <h3>Selective sharing</h3>
            <p>Companies control when meetings and metrics become visible to the wider network.</p>
          </div>
          <div className="preview-card">
            <h3>Marketplace access</h3>
            <p>Discover vendors and agents through premium-friendly partner placement.</p>
          </div>
        </section>

        <section className="panel preview-shell">
          <div className="preview-snapshot">
            <p className="eyebrow">Network pulse</p>
            <h3>Trusted signal, selective visibility, and premium partner discovery.</h3>
            <p>Members can review performance without exposing sensitive metrics until the company profile opts in.</p>
          </div>
          <div className="preview-feed">
            {previewFeed.map((item) => (
              <article key={item.id} className="mini-feed-item">
                <div>
                  <strong>{item.author}</strong>
                  <p>{item.detail}</p>
                </div>
                <span>{item.time}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel auth-panel">
          <div className="auth-toggle">
            <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Sign in</button>
            <button type="button" className={authMode === 'signup' ? 'active' : ''} onClick={() => setAuthMode('signup')}>Create account</button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'signup' && (
              <label>
                Full name
                <input value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="Your company name" />
              </label>
            )}
            <label>
              Email
              <input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@company.com" />
            </label>
            <label>
              Password
              <input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="Choose a secure password" />
            </label>
            {authMode === 'signup' && (
              <label>
                Role
                <select value={authForm.role} onChange={(event) => setAuthForm({ ...authForm, role: event.target.value })}>
                  <option value="Founder">Founder</option>
                  <option value="Agent">Agent</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </label>
            )}
            <button type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>

          {authMessage && <p className="auth-message">{authMessage}</p>}
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">PulseBoard network</p>
          <h1>Trusted company profiles, expert reviews, and selective performance sharing.</h1>
          <p>Connect with founders, agents, and vendors in a private business network where visibility is earned and metrics stay permission-based.</p>
          <div className="hero-actions">
            <button type="button">Explore profiles</button>
            <button type="button" className="secondary-action">View marketplace</button>
          </div>
          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="stat-pill">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-side-card">
          <p className="eyebrow">Signed in as</p>
          <h3>{user.name}</h3>
          <p>{user.role || 'Founder'}</p>
          <button type="button" className="secondary-action" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <section className="panel spotlight">
        <div>
          <p className="eyebrow">Business model</p>
          <h2>Profiles are ranked by system signals and agent review.</h2>
          <p>Company visibility is driven by verified performance, engagement, and trusted expert commentary. Marketplace vendors are surfaced through premium placement and partner access.</p>
        </div>
        <div className="spotlight-badges">
          <span>HubSpot metrics</span>
          <span>Selective sharing</span>
          <span>Vendor marketplace</span>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Company profiles</h2>
          <span>Profile acceptance controls metric visibility</span>
        </div>
        <div className="company-grid">
          {companies.map((company) => {
            const canShare = company.metricsSharing === 'accepted';

            return (
              <article key={company.id} className="company-card">
                <div className="company-card-top">
                  <div>
                    <h3>{company.name}</h3>
                    <p>{company.summary}</p>
                  </div>
                  <div className="company-badges">
                    <span className="pill">★ {company.rating}</span>
                    <span className={`pill ${canShare ? 'pill-success' : 'pill-neutral'}`}>
                      {canShare ? 'Metrics shared' : 'Private'}
                    </span>
                  </div>
                </div>

                <div className="review-row">
                  <span className="review-pill">{company.review}</span>
                </div>

                <div className="stats-grid">
                  <div>
                    <strong>Growth</strong>
                    <span>{company.growth}</span>
                  </div>
                  <div>
                    <strong>Retention</strong>
                    <span>{company.retention}</span>
                  </div>
                  <div>
                    <strong>Pipeline</strong>
                    <span>{company.pipeline}</span>
                  </div>
                  <div>
                    <strong>HubSpot</strong>
                    <span>{company.hubspotStatus}</span>
                  </div>
                </div>

                <div className="hubspot-panel">
                  <h4>HubSpot signal</h4>
                  <ul>
                    <li>Deals: {company.hubspotMetrics.deals}</li>
                    <li>Campaigns: {company.hubspotMetrics.campaigns}</li>
                    <li>Meetings: {company.hubspotMetrics.meetings}</li>
                  </ul>
                </div>

                <button type="button" className="secondary-action" onClick={() => toggleMetricsSharing(company.id)}>
                  {canShare ? 'Restrict sharing' : 'Allow metrics sharing'}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Meetups and company sessions</h2>
          <span>Invite trusted peers, experts, and advisors</span>
        </div>
        <div className="meeting-list">
          {meetings.map((meeting) => {
            const company = companies.find((entry) => entry.id === meeting.companyId);
            const visible = company?.metricsSharing === 'accepted';

            return (
              <article key={meeting.id} className="meeting-card">
                <div>
                  <h3>{meeting.topic}</h3>
                  <p>{company?.name} · {meeting.schedule}</p>
                  <p className="meeting-host">Hosted by {meeting.host}</p>
                </div>
                <span className={`pill ${visible ? 'pill-success' : 'pill-neutral'}`}>
                  {visible ? 'Metrics shared' : 'Private'}
                </span>
                <p className="meeting-note">{visible ? 'Shared metrics are visible to approved participants.' : 'Metrics stay hidden until the company profile accepts sharing.'}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Advice and peer support</h2>
          <span>Users and company profiles can request guidance</span>
        </div>
        <div className="advice-list">
          {adviceRequests.map((request) => (
            <article key={request.id} className="advice-card">
              <h3>{request.title}</h3>
              <p>{request.detail}</p>
              <span>Requested by {request.author}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Marketplace vendors</h2>
          <span>Partner discovery and premium placement</span>
        </div>
        <div className="vendor-grid">
          {marketplaceVendors.map((vendor) => (
            <article key={vendor.name} className="vendor-card">
              <div className="vendor-top">
                <h3>{vendor.name}</h3>
                <span>{vendor.tier}</span>
              </div>
              <p>{vendor.description}</p>
              <strong>{vendor.category}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel composer">
        <h2>Create a post</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Your name" />
          </label>
          <label>
            What do you want to share?
            <textarea value={content} onChange={(event) => setContent(event.target.value)} rows="4" placeholder="Write something inspiring..." />
          </label>
          <button type="submit">Publish</button>
        </form>
      </section>

      <section className="panel feed">
        <div className="section-header">
          <h2>Community feed</h2>
          <span>{status}</span>
        </div>
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            <div className="post-meta">
              <strong>{post.author}</strong>
              <span>{new Date(post.created_at || post.createdAt).toLocaleString()}</span>
            </div>
            <p>{post.content}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default App;
