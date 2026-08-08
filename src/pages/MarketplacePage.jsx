import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const VENDOR_IMPACT = {
  'HubSpot automation':    { low: 0.10, high: 0.18, label: 'pipeline conversion lift' },
  'Revenue operations':    { low: 0.15, high: 0.22, label: 'pipeline uplift' },
  'Marketing operations':  { low: 0.08, high: 0.18, label: 'pipeline generated' },
};

const ALL_CATEGORIES = ['All', 'HubSpot automation', 'Revenue operations', 'Marketing operations'];
const ALL_TIERS = ['All', 'Featured partner', 'Premium access', 'Preferred vendor'];

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

function MarketplacePage({ user, vendors, companies, token, apiUrl, handleLogout }) {
  const topCompany = companies?.[0];
  const referencePipeline = topCompany?.pipeline || '$2.5M';

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [pendingRequests, setPendingRequests] = useState({});   // vendorId → request id
  const [openForm, setOpenForm] = useState(null);               // vendorId with form open
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${apiUrl}/api/intro-requests`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then((requests) => {
        const map = {};
        requests.forEach((r) => { if (r.status === 'pending') map[r.vendorId] = r.id; });
        setPendingRequests(map);
      })
      .catch(() => {});
  }, [apiUrl, token]);

  async function handleRequestIntro(vendorId) {
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`${apiUrl}/api/intro-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vendorId, message: formMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send request');
      setPendingRequests((prev) => ({ ...prev, [vendorId]: data.id }));
      setOpenForm(null);
      setFormMessage('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelRequest(vendorId) {
    const requestId = pendingRequests[vendorId];
    if (!requestId) return;
    try {
      await fetch(`${apiUrl}/api/intro-requests/${requestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingRequests((prev) => { const next = { ...prev }; delete next[vendorId]; return next; });
    } catch {}
  }

  const filtered = vendors.filter((v) => {
    if (categoryFilter !== 'All' && v.category !== categoryFilter) return false;
    if (tierFilter !== 'All' && v.tier !== tierFilter) return false;
    return true;
  });

  return (
    <div className="app-shell">
      <a className="skip-link" href="#marketplace-main-content">Skip to main content</a>
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">Marketplace</p>
          <h1>Vendors that move the pipeline, not just the conversation.</h1>
          <p>Every partner is matched on fit, delivery record, and sector compatibility. See projected pipeline impact before you connect.</p>
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
            <p className="mp-context-note">Impact estimates are based on <strong>{topCompany.name}</strong>&apos;s current pipeline of <strong>{referencePipeline}</strong> &mdash; the top-ranked profile in your network.</p>
          </div>
          <div className="mp-context-stats">
            <div className="mp-context-stat"><strong>{topCompany.growth}</strong><span>Growth</span></div>
            <div className="mp-context-stat"><strong>{topCompany.retention}</strong><span>Retention</span></div>
            <div className="mp-context-stat"><strong>#{topCompany.rank?.position || '—'}</strong><span>Rank</span></div>
          </div>
        </section>
      )}

      <div className="mp-layout">
        <aside className="mp-sidebar">
          <div className="mp-filter-group">
            <p className="mp-filter-label">Category</p>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`mp-filter-btn${categoryFilter === cat ? ' mp-filter-active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="mp-filter-group">
            <p className="mp-filter-label">Tier</p>
            {ALL_TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                className={`mp-filter-btn${tierFilter === tier ? ' mp-filter-active' : ''}`}
                onClick={() => setTierFilter(tier)}
              >
                {tier}
              </button>
            ))}
          </div>
          <p className="mp-filter-count">{filtered.length} of {vendors.length} vendors</p>
        </aside>

        <div className="mp-list">
          {filtered.length === 0 && <p className="mp-empty">No vendors match the current filters.</p>}
          {filtered.map((vendor) => {
            const impact = getPipelineImpact(vendor.category, referencePipeline);
            const isPending = Boolean(pendingRequests[vendor.id]);
            const isOpen = openForm === vendor.id;
            return (
              <article key={vendor.id} className="mp-list-row">
                <div className="mp-list-main">
                  <div className="mp-list-identity">
                    <div>
                      <h3 className="mp-list-name">{vendor.name}</h3>
                      <span className="mp-vendor-category">{vendor.category}</span>
                    </div>
                    <span className="mp-tier-badge">{vendor.tier}</span>
                  </div>
                  <p className="mp-list-desc">{vendor.description}</p>
                  {impact && (
                    <div className="mp-impact-inline">
                      <span className="mp-impact-label">{impact.label}</span>
                      <strong className="mp-impact-range">{impact.range}</strong>
                    </div>
                  )}
                </div>
                <div className="mp-list-actions">
                  {isPending ? (
                    <>
                      <span className="mp-pending-badge">Intro requested</span>
                      <button type="button" className="mp-cancel-btn" onClick={() => handleCancelRequest(vendor.id)}>Cancel</button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="cta-primary mp-request-btn"
                      onClick={() => { setOpenForm(isOpen ? null : vendor.id); setFormError(''); setFormMessage(''); }}
                    >
                      {isOpen ? 'Close' : 'Request intro'}
                    </button>
                  )}
                </div>
                {isOpen && !isPending && (
                  <div className="mp-request-form">
                    <textarea
                      className="mp-message-input"
                      rows={3}
                      placeholder={`Tell ${vendor.name} why you'd like to connect (optional)`}
                      value={formMessage}
                      maxLength={1000}
                      onChange={(e) => setFormMessage(e.target.value)}
                    />
                    {formError && <p className="error-note">{formError}</p>}
                    <div className="mp-form-actions">
                      <button
                        type="button"
                        className="cta-primary"
                        disabled={submitting}
                        onClick={() => handleRequestIntro(vendor.id)}
                      >
                        {submitting ? 'Sending…' : 'Send request'}
                      </button>
                      <button type="button" className="cta-ghost" onClick={() => setOpenForm(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      </main>
    </div>
  );
}

export default MarketplacePage;
