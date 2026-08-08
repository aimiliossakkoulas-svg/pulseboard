import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CompanyCardSkeleton from '../components/CompanyCardSkeleton';

function DashboardPage({
  user,
  handleLogout,
  heroStats,
  activeSection,
  setActiveSection,
  companies,
  companiesLoading,
  meetingsData,
  adviceRequests,
  status,
  posts,
  author,
  setAuthor,
  content,
  setContent,
  handleSubmit,
  toggleMetricsSharing,
  recommendedVendors,
  introRequests,
}) {
  const [search, setSearch] = useState('');

  const filteredCompanies = companies.filter((c) =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sector.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#dashboard-main-content">Skip to main content</a>
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">PulseBoard network</p>
          <h1>Trusted company profiles, expert reviews, and selective performance sharing.</h1>
          <p>Connect with founders, agents, and vendors in a private business network where visibility is earned and metrics stay permission-based.</p>
          <div className="hero-actions">
            <button type="button" onClick={() => { setActiveSection('profiles'); document.getElementById('profiles-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore profiles</button>
            <Link to="/onboarding" className="action-link">Onboard company</Link>
            <Link to="/marketplace" className="action-link secondary-action" onClick={() => setActiveSection('marketplace')}>View marketplace</Link>
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

      <main id="dashboard-main-content">

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

      <section id="profiles-section" className={`panel ${activeSection === 'profiles' ? 'active-section' : ''}`}>
        <div className="section-header">
          <div>
            <p className="eyebrow">Network</p>
            <h2 className="section-title">Company profiles</h2>
          </div>
          <span className="section-meta">Ranked by verified signal</span>
        </div>
        <div className="search-bar-row">
          <input
            className="company-search-input"
            type="search"
            placeholder="Search by company name or sector…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search companies"
          />
          {search && (
            <span className="search-result-count">{filteredCompanies.length} result{filteredCompanies.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="company-grid">
          {companiesLoading && (
            <>
              <CompanyCardSkeleton />
              <CompanyCardSkeleton />
              <CompanyCardSkeleton />
            </>
          )}
          {!companiesLoading && filteredCompanies.length === 0 && (
            <p className="search-empty">
              {search.trim()
                ? <>No companies match &ldquo;{search}&rdquo;</>
                : 'No company profiles available yet.'}
            </p>
          )}
          {!companiesLoading && filteredCompanies.map((company) => {
            const canShare = company.metricsSharing === 'accepted';
            return (
              <article key={company.id} className="company-card social-card">
                <div className="social-card-header">
                  <div className="social-card-avatar">{company.name.charAt(0)}</div>
                  <div className="social-card-identity">
                    <h3>{company.name}</h3>
                    <span className="social-card-sector">{company.sector}</span>
                  </div>
                  <div className="social-card-rank">
                    <span className="rank-number">#{company.rank?.position || '–'}</span>
                    <span className={`rank-tier-pill ${company.rank?.tier === 'High signal' ? 'tier-high' : 'tier-emerging'}`}>{company.rank?.tier || 'Signal'}</span>
                  </div>
                </div>
                <p className="social-card-summary">{company.summary}</p>
                <div className="social-card-metrics">
                  <div className="social-metric">
                    <strong>{company.growth}</strong>
                    <span>Growth</span>
                  </div>
                  <div className="social-metric">
                    <strong>{company.retention}</strong>
                    <span>Retention</span>
                  </div>
                  <div className="social-metric">
                    <strong>{company.pipeline}</strong>
                    <span>Pipeline</span>
                  </div>
                  <div className="social-metric">
                    <strong>★ {company.rating}</strong>
                    <span>Rating</span>
                  </div>
                </div>
                <div className="social-card-footer">
                  <span className={`sharing-pill ${canShare ? 'pill-success' : 'pill-neutral'}`}>
                    {canShare ? '⬤ Metrics shared' : '⬤ Private'}
                  </span>
                  <div className="social-card-actions">
                    <button type="button" className="card-action-btn" onClick={() => toggleMetricsSharing(company.id)}>
                      {canShare ? 'Restrict' : 'Share metrics'}
                    </button>
                    <Link to={`/company/${company.id}`} className="card-action-btn card-action-primary">View profile</Link>
                  </div>
                </div>
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
          {meetingsData.map((meeting) => {
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
          <div>
            <p className="eyebrow">Smart matching</p>
            <h2 className="section-title">Companies worth connecting with</h2>
          </div>
          <span className="section-meta">Ranked by signal strength and network compatibility</span>
        </div>
        <div className="suggested-grid">
          {companiesLoading ? (
            [0, 1, 2].map((i) => (
              <article key={i} className="suggested-card skeleton-card" aria-hidden="true">
                <div className="skeleton skeleton-text skeleton-text-xs" style={{ width: '40%' }} />
                <div className="skeleton skeleton-text skeleton-text-lg" />
                <div className="skeleton skeleton-text skeleton-text-sm" />
                <div className="skeleton skeleton-text skeleton-text-block" />
              </article>
            ))
          ) : companies.slice(0, 3).map((company, i) => {
            const growth = parseFloat(company.growth?.replace(/[^0-9.]/g, '') || 0);
            const retention = parseFloat(company.retention?.replace('%', '') || 0);
            const fitReasons = [
              company.rank?.tier === 'High signal' && 'High signal operator',
              growth >= 25 && `${company.growth} YoY growth`,
              retention >= 90 && `${company.retention} retention`,
              company.hubspotStatus === 'Connected' && 'HubSpot connected',
              company.metricsSharing === 'accepted' && 'Metrics open to network',
            ].filter(Boolean).slice(0, 3);
            return (
              <article key={company.id} className="suggested-card">
                <div className="suggested-top">
                  <span className="suggested-rank">#{i + 1}</span>
                  <span className="suggested-tier">{company.rank?.tier || 'Signal'}</span>
                </div>
                <h3 className="suggested-name">{company.name}</h3>
                <p className="suggested-sector">{company.sector}</p>
                <ul className="suggested-reasons">
                  {fitReasons.map((r) => <li key={r}><span aria-hidden="true">✓</span>{r}</li>)}
                </ul>
                <Link to={`/company/${company.id}`} className="action-link suggested-link">View profile</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Vendor matches</p>
            <h2 className="section-title">Recommended for top profile</h2>
          </div>
          <span className="section-meta">Ranked by fit, outcomes, and budget alignment</span>
        </div>
        <div className="vendor-grid">
          {recommendedVendors.map((vendor) => (
            <article key={vendor.id} className="vendor-card">
              <div className="vendor-top">
                <h3>{vendor.name}</h3>
                <span>{vendor.tier}</span>
              </div>
              <p>{vendor.description}</p>
              <strong>{vendor.category}</strong>
              <p className="vendor-match">Match score: {vendor.match?.score ?? 'N/A'}</p>
              <ul className="vendor-reasons">
                {(vendor.match?.reasons || []).map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {introRequests && introRequests.length > 0 && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Marketplace</p>
              <h2 className="section-title">My intro requests</h2>
            </div>
            <span className="section-meta">{introRequests.filter((r) => r.status === 'pending').length} pending</span>
          </div>
          <div className="intro-requests-list">
            {introRequests.map((req) => (
              <div key={req.id} className="intro-request-row">
                <div className="intro-request-info">
                  <strong>{req.vendorId}</strong>
                  {req.message && <p className="intro-request-message">&ldquo;{req.message}&rdquo;</p>}
                  <span className="intro-request-date">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`intro-status-badge intro-status-${req.status}`}>{req.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

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
          <span role="status" aria-live="polite">{status}</span>
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
      </main>
    </div>
  );
}

export default DashboardPage;
