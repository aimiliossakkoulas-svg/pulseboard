import { useEffect, useState } from 'react';

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
    visibility: 'Shared metrics enabled'
  },
  {
    id: 'm2',
    companyId: 'pulse',
    topic: 'Revenue sync',
    schedule: '2026-08-09 14:30',
    visibility: 'Private until profile accepts'
  }
];

function App() {
  const [posts, setPosts] = useState([]);
  const [author, setAuthor] = useState('Guest');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Loading posts...');
  const [companies, setCompanies] = useState(initialCompanies);

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

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Company network</p>
        <h1>Ranked company profiles, selective metric sharing, and marketplace expertise.</h1>
        <p>Keep HubSpot insights as a core product feature, while giving companies control over which meetings and profile metrics are shared with the network.</p>
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
                  <span className={`pill ${canShare ? 'pill-success' : 'pill-neutral'}`}>
                    {canShare ? 'Metrics shared' : 'Private'}
                  </span>
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
          <h2>Meetings with selective sharing</h2>
          <span>Metrics visibility depends on profile acceptance</span>
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
