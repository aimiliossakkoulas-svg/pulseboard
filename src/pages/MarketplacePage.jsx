import React from 'react';
import { Link } from 'react-router-dom';

const VENDOR_IMPACT = {
  'HubSpot automation':    { low: 0.10, high: 0.18, label: 'projected pipeline conversion lift' },
  'Revenue operations':    { low: 0.15, high: 0.22, label: 'projected pipeline uplift' },
  'Marketing operations':  { low: 0.08, high: 0.18, label: 'projected pipeline generated' },
};

function parsePipelineValue(str) {
  const match = str?.replace(/[$,]/g, '').match(/([\d.]+)([MKB]?)/i);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  const u = match[2]?.toUpperCase();
  return u === 'M' ? n * 1e6 : u === 'K' ? n * 1e3 : u === 'B' ? n * 1e9 : n;
}

function formatMoney(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

function getPipelineImpact(category, pipelineStr) {
  const rule = VENDOR_IMPACT[category];
  if (!rule) return null;
  const base = parsePipelineValue(pipelineStr);
  if (!base) return null;
  return {
    range: `${formatMoney(base * rule.low)}\u2013${formatMoney(base * rule.high)}`,
    label: rule.label,
  };
}

function MarketplacePage({ user, vendors, companies, handleLogout }) {
  const topCompany = companies?.[0];
  const referencePipeline = topCompany?.pipeline || '$2.5M';

  return (
    <div className="app-shell">
      <a className="skip-link" href="#marketplace-main-content">Skip to main content</a>
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">Marketplace</p>
          <h1>Vendors that move the pipeline, not just the conversation.</h1>
          <p>Every partner here is matched on fit, delivery record, and sector compatibility. See projected pipeline impact before you connect.</p>
          <div className="hero-actions">
            <Link to="/app" className="action-link">Back to dashboard</Link>
          </div>
        </div>
        <div className="hero-side-card">
          <p className="eyebrow">Signed in as</p>
          <h3>{user.name}</h3>
          <p>{user.role || 'Founder'}</p>
          <button type="button" className="secondary-action" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main id="marketplace-main-content">

      {topCompany && (
        <section className="panel mp-context-bar">
          <div className="mp-context-left">
            <p className="eyebrow">Pipeline benchmark</p>
            <p className="mp-context-note">Impact estimates below are based on <strong>{topCompany.name}</strong>’s current pipeline of <strong>{referencePipeline}</strong> — the top-ranked profile in your network.</p>
          </div>
          <div className="mp-context-stats">
            <div className="mp-context-stat">
              <strong>{topCompany.growth}</strong>
              <span>Current growth</span>
            </div>
            <div className="mp-context-stat">
              <strong>{topCompany.retention}</strong>
              <span>Retention</span>
            </div>
            <div className="mp-context-stat">
              <strong>#{topCompany.rank?.position}</strong>
              <span>Network rank</span>
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Partner network</p>
            <h2 className="section-title">Vetted vendors and growth operators</h2>
          </div>
          <span className="section-meta">Matched on fit, outcomes, and sector compatibility</span>
        </div>
        <div className="mp-vendor-grid">
          {vendors.map((vendor) => {
            const impact = getPipelineImpact(vendor.category, referencePipeline);
            return (
              <article key={vendor.id} className="mp-vendor-card">
                <div className="mp-vendor-top">
                  <div>
                    <h3 className="mp-vendor-name">{vendor.name}</h3>
                    <span className="mp-vendor-category">{vendor.category}</span>
                  </div>
                  <span className="mp-tier-badge">{vendor.tier}</span>
                </div>
                <p className="mp-vendor-desc">{vendor.description}</p>
                {impact && (
                  <div className="mp-impact-box">
                    <span className="mp-impact-label">{impact.label}</span>
                    <strong className="mp-impact-range">{impact.range}</strong>
                  </div>
                )}
                <button type="button" className="mp-connect-btn">Request intro</button>
              </article>
            );
          })}
        </div>
      </section>

      </main>
    </div>
  );
}

export default MarketplacePage;
