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

function MarketplacePage({ user, vendors, companies, token, apiUrl, handleLogout, onSessionExpired }) {
  const topCompany = companies?.[0];
  const referencePipeline = topCompany?.pipeline || '$2.5M';

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [pendingRequests, setPendingRequests] = useState({});   // vendorId → request id
  const [openForm, setOpenForm] = useState(null);               // vendorId with form open
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [cancellingVendorId, setCancellingVendorId] = useState('');
  const [requestingVendorId, setRequestingVendorId] = useState('');
  const [openConsultForm, setOpenConsultForm] = useState(null);
  const [consultTitle, setConsultTitle] = useState('');
  const [consultFee, setConsultFee] = useState('2500');
  const [consultPricingModel, setConsultPricingModel] = useState('milestone');
  const [startingVendorId, setStartingVendorId] = useState('');
  const [consultMessage, setConsultMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!token) return;
    fetch(`${apiUrl}/api/intro-requests`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (r.status === 401) {
          onSessionExpired?.('Your session expired. Please sign in again.');
          return [];
        }
        return r.ok ? r.json() : [];
      })
      .then((requests) => {
        const map = {};
        requests.forEach((r) => { if (r.status === 'pending') map[r.vendorId] = r.id; });
        setPendingRequests(map);
      })
      .catch(() => {});
  }, [apiUrl, token, onSessionExpired]);

  async function handleRequestIntro(vendorId) {
    setRequestingVendorId(vendorId);
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`${apiUrl}/api/intro-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vendorId, message: formMessage }),
      });
      const data = await res.json();
      if (res.status === 401) {
        onSessionExpired?.(data.error || 'Your session expired. Please sign in again.');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to send request');
      setPendingRequests((prev) => ({ ...prev, [vendorId]: data.id }));
      setOpenForm(null);
      setFormMessage('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
      setRequestingVendorId('');
    }
  }

  async function handleCancelRequest(vendorId) {
    const requestId = pendingRequests[vendorId];
    if (!requestId) return;
    setCancellingVendorId(vendorId);
    try {
      const res = await fetch(`${apiUrl}/api/intro-requests/${requestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        onSessionExpired?.('Your session expired. Please sign in again.');
        return;
      }
      setPendingRequests((prev) => { const next = { ...prev }; delete next[vendorId]; return next; });
    } catch {
      setFormError('Unable to cancel intro request right now.');
    } finally {
      setCancellingVendorId('');
    }
  }

  async function handleLogoutClick() {
    setIsLoggingOut(true);
    try {
      await handleLogout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleStartConsultancy(vendorId) {
    setStartingVendorId(vendorId);
    setConsultMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${apiUrl}/api/engagements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vendorId,
          title: consultTitle || `Consulting engagement with ${vendorId}`,
          pricingModel: consultPricingModel,
          consultantFee: Number(consultFee) || 0,
          feeCurrency: 'USD',
          introRequestId: pendingRequests[vendorId] || null,
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        onSessionExpired?.(data.error || 'Your session expired. Please sign in again.');
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Unable to start consultancy');
      setConsultMessage({ type: 'success', text: `Engagement #${data.id} started successfully.` });
      setOpenConsultForm(null);
      setConsultTitle('');
    } catch (error) {
      setConsultMessage({ type: 'error', text: error.message || 'Unable to start consultancy' });
    } finally {
      setStartingVendorId('');
    }
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
          <button type="button" className="secondary-action" onClick={handleLogoutClick} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
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
          {filtered.length === 0 && (
            <p className="mp-empty">
              {vendors.length === 0
                ? 'No vendors are available yet. Check back soon.'
                : 'No vendors match the current filters.'}
            </p>
          )}
          {filtered.map((vendor) => {
            const impact = getPipelineImpact(vendor.category, referencePipeline);
            const isPending = Boolean(pendingRequests[vendor.id]);
            const isOpen = openForm === vendor.id;
            const isConsultOpen = openConsultForm === vendor.id;
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
                      <button
                        type="button"
                        className="mp-cancel-btn"
                        onClick={() => handleCancelRequest(vendor.id)}
                        disabled={cancellingVendorId === vendor.id}
                      >
                        {cancellingVendorId === vendor.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="cta-primary mp-request-btn"
                        disabled={requestingVendorId === vendor.id}
                        onClick={() => { setOpenForm(isOpen ? null : vendor.id); setFormError(''); setFormMessage(''); }}
                      >
                        {requestingVendorId === vendor.id ? 'Sending...' : (isOpen ? 'Close' : 'Request intro')}
                      </button>
                      <button
                        type="button"
                        className="mp-cancel-btn"
                        onClick={() => {
                          setOpenConsultForm(isConsultOpen ? null : vendor.id);
                          setConsultMessage('');
                          if (!consultTitle) setConsultTitle(`Business growth advisory with ${vendor.name}`);
                        }}
                      >
                        {isConsultOpen ? 'Close consulting' : 'Start consultancy'}
                      </button>
                    </>
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
                        disabled={submitting || requestingVendorId === vendor.id}
                        onClick={() => handleRequestIntro(vendor.id)}
                      >
                        {submitting && requestingVendorId === vendor.id ? 'Sending…' : 'Send request'}
                      </button>
                      <button type="button" className="cta-ghost" onClick={() => setOpenForm(null)} disabled={submitting && requestingVendorId === vendor.id}>Cancel</button>
                    </div>
                  </div>
                )}
                {isConsultOpen && (
                  <div className="mp-request-form">
                    <input
                      className="mp-message-input"
                      placeholder="Engagement title"
                      value={consultTitle}
                      onChange={(e) => setConsultTitle(e.target.value)}
                    />
                    <div className="mp-form-actions">
                      <input
                        className="mp-message-input"
                        type="number"
                        min="0"
                        step="100"
                        value={consultFee}
                        onChange={(e) => setConsultFee(e.target.value)}
                        placeholder="Consultant fee (USD)"
                      />
                      <select
                        className="mp-message-input"
                        value={consultPricingModel}
                        onChange={(e) => setConsultPricingModel(e.target.value)}
                      >
                        <option value="milestone">Milestone</option>
                        <option value="fixed">Fixed</option>
                        <option value="hourly">Hourly</option>
                      </select>
                    </div>
                    {consultMessage.text && (
                      <p className={consultMessage.type === 'error' ? 'error-note' : 'success-note'}>
                        {consultMessage.text}
                      </p>
                    )}
                    <div className="mp-form-actions">
                      <button
                        type="button"
                        className="cta-primary"
                        disabled={startingVendorId === vendor.id || !consultTitle.trim()}
                        onClick={() => handleStartConsultancy(vendor.id)}
                      >
                        {startingVendorId === vendor.id ? 'Starting…' : 'Start paid engagement'}
                      </button>
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
