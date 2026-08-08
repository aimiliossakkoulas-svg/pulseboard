import React from 'react';
import { Link } from 'react-router-dom';

function DashboardPage({
  user,
  handleLogout,
  heroStats,
  activeSection,
  setActiveSection,
  companies,
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
  recommendedVendors
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#dashboard-main-content">Skip to main content</a>
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">PulseBoard network</p>
          <h1>Trusted company profiles, expert reviews, and selective performance sharing.</h1>
          <p>Connect with founders, agents, and vendors in a private business network where visibility is earned and metrics stay permission-based.</p>
          <div className="hero-actions">
            <button type="button" onClick={() => setActiveSection('profiles')}>Explore profiles</button>
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

      <section className={`panel ${activeSection === 'profiles' ? 'active-section' : ''}`}>
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
                    <span className="pill">#{company.rank?.position || '-'} · {company.rank?.tier || 'Signal'}</span>
                    <span className="pill">★ {company.rating}</span>
                    <span className={`pill ${canShare ? 'pill-success' : 'pill-neutral'}`}>
                      {canShare ? 'Metrics shared' : 'Private'}
                    </span>
                  </div>
                </div>

                {company.rank && (
                  <div className="ranking-block">
                    <strong>Rank score: {company.rank.score}</strong>
                    <ul>
                      {company.rank.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

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

                <button type="button" className="secondary-action" aria-label={`${canShare ? 'Restrict' : 'Allow'} metrics sharing for ${company.name}`} onClick={() => toggleMetricsSharing(company.id)}>
                  {canShare ? 'Restrict sharing' : 'Allow metrics sharing'}
                </button>
                <Link to={`/company/${company.id}`} className="action-link company-link">View profile details</Link>
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
          <h2>Recommended vendors for top profile</h2>
          <span>Ranked by fit, outcomes, service compatibility, availability, and budget alignment</span>
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
