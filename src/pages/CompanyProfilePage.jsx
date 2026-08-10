import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const METRIC_KEYS = [
  { key: 'growth_percent', label: 'Growth (%)', placeholder: '42' },
  { key: 'retention_percent', label: 'Retention (%)', placeholder: '88' },
  { key: 'pipeline_millions', label: 'Pipeline ($M)', placeholder: '2.4' },
  { key: 'deals_active', label: 'Active deals', placeholder: '12' },
  { key: 'campaigns_live', label: 'Live campaigns', placeholder: '5' },
  { key: 'meetings_quarter', label: 'Meetings this quarter', placeholder: '18' },
];

const EMPTY_METRICS = Object.fromEntries(METRIC_KEYS.map(({ key }) => [key, '']));

function CompanyProfilePage({ user, handleLogout, apiUrl, token }) {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  const [metricValues, setMetricValues] = useState(EMPTY_METRICS);
  const [sourceType, setSourceType] = useState('manual');
  const [metricsSubmitting, setMetricsSubmitting] = useState(false);
  const [metricsMessage, setMetricsMessage] = useState({ type: '', text: '' });

  const [editForm, setEditForm] = useState({
    sector: '',
    summary: '',
    metricsSharing: 'private'
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });

  const canEdit = Boolean(
    user
    && (
      String(user.role || '') === 'Admin'
      || (user.companyId && String(user.companyId) === String(companyId))
    )
  );

  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/companies/${companyId}/profile`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load company profile');
      }

      setProfile(data);
      setEditForm({
        sector: data.company?.sector || '',
        summary: data.company?.summary || '',
        metricsSharing: data.company?.metricsSharing || 'private'
      });
    } catch (requestError) {
      setError(requestError.message || 'Unable to load company profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiUrl}/api/companies/${companyId}/profile`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load company profile');
        }

        if (active) {
          setProfile(data);
          setEditForm({
            sector: data.company?.sector || '',
            summary: data.company?.summary || '',
            metricsSharing: data.company?.metricsSharing || 'private'
          });
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Unable to load company profile');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [apiUrl, companyId]);

  async function handleProfileSave(event) {
    event.preventDefault();
    setEditMessage({ type: '', text: '' });
    setEditSaving(true);

    try {
      const response = await fetch(`${apiUrl}/api/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sector: editForm.sector,
          summary: editForm.summary,
          metricsSharing: editForm.metricsSharing
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update profile');
      }

      setProfile(data);
      setEditMessage({ type: 'success', text: 'Profile updated.' });
    } catch (saveError) {
      setEditMessage({ type: 'error', text: saveError.message || 'Unable to update profile.' });
    } finally {
      setEditSaving(false);
    }
  }

  async function handleMetricsSubmit(e) {
    e.preventDefault();
    setMetricsMessage({ type: '', text: '' });

    const metrics = METRIC_KEYS
      .filter(({ key }) => metricValues[key] !== '')
      .map(({ key }) => ({ metricKey: key, metricValue: Number(metricValues[key]) }));

    if (!metrics.length) {
      setMetricsMessage({ type: 'error', text: 'Enter at least one metric value.' });
      return;
    }

    setMetricsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/companies/${companyId}/metrics/${sourceType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verificationStatus: 'self-reported',
          confidenceScore: 0.7,
          metrics,
          capturedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit metrics');
      setMetricValues(EMPTY_METRICS);
      setMetricsMessage({ type: 'success', text: 'Metrics submitted and ranking updated.' });
      await loadProfile();
    } catch (err) {
      setMetricsMessage({ type: 'error', text: err.message });
    } finally {
      setMetricsSubmitting(false);
    }
  }

  const completion = profile?.completion;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#company-profile-main">Skip to main content</a>
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">Company profile</p>
          <h1>{profile?.company?.name || 'Company detail view'}</h1>
          <p>View ranking logic, trust signals, related sessions, and vendor matches for this company profile.</p>
          <div className="hero-actions">
            <Link to="/app" className="action-link">Back to dashboard</Link>
            <Link to="/marketplace" className="action-link secondary-action">View marketplace</Link>
          </div>
        </div>
        <div className="hero-side-card">
          <p className="eyebrow">Signed in as</p>
          <h3>{user.name}</h3>
          <p>{user.role || 'Founder'}</p>
          <button type="button" className="secondary-action" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main id="company-profile-main">
        {loading && (
          <section className="panel">
            <p>Loading company profile...</p>
          </section>
        )}

        {!loading && error && (
          <section className="panel">
            <p className="error-note">{error}</p>
          </section>
        )}

        {!loading && !error && profile && (
          <>
            {completion && (
              <section className="panel">
                <div className="section-header">
                  <h2>Profile completion</h2>
                  <span>{completion.filled} of {completion.total} · {completion.percent}%</span>
                </div>
                <ul className="completion-checklist" aria-label="Profile completion checklist">
                  {completion.checklist.map((item) => (
                    <li key={item.key} className={item.complete ? 'is-complete' : ''}>
                      <span className="completion-marker" aria-hidden="true">{item.complete ? '✓' : '○'}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="panel profile-grid">
              <article className="profile-card">
                <h2>{profile.company.name}</h2>
                <p>{profile.company.summary}</p>
                <div className="profile-badges">
                  <span className="pill">#{profile.company.rank.position} · {profile.company.rank.tier}</span>
                  <span className="pill">★ {profile.company.rating}</span>
                </div>
                <div className="stats-grid">
                  <div>
                    <strong>Sector</strong>
                    <span>{profile.company.sector}</span>
                  </div>
                  <div>
                    <strong>Growth</strong>
                    <span>{profile.company.growth}</span>
                  </div>
                  <div>
                    <strong>Retention</strong>
                    <span>{profile.company.retention}</span>
                  </div>
                  <div>
                    <strong>Pipeline</strong>
                    <span>{profile.company.pipeline}</span>
                  </div>
                </div>
              </article>

              <article className="profile-card">
                <h3>Ranking breakdown</h3>
                <p className="ranking-score">Score: {profile.company.rank.score}</p>
                <ul className="vendor-reasons">
                  <li>Profile quality: {profile.company.rank.breakdown.profileQuality}</li>
                  <li>Growth momentum: {profile.company.rank.breakdown.growthMomentum}</li>
                  <li>Engagement quality: {profile.company.rank.breakdown.engagementQuality}</li>
                  <li>Trust signal: {profile.company.rank.breakdown.trustSignal}</li>
                  <li>Peer review: {profile.company.rank.breakdown.peerReview}</li>
                </ul>
                <h4 className="profile-subtitle">Top reasons</h4>
                <ul className="vendor-reasons">
                  {profile.company.rank.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </article>
            </section>

            {canEdit && (
              <section className="panel">
                <div className="section-header">
                  <h2>Edit profile</h2>
                  <span>Update sector, summary, and sharing visibility</span>
                </div>
                <form className="profile-edit-form" onSubmit={handleProfileSave}>
                  <label>
                    Sector
                    <input
                      value={editForm.sector}
                      required
                      maxLength={100}
                      onChange={(event) => setEditForm((current) => ({ ...current, sector: event.target.value }))}
                    />
                  </label>
                  <label className="profile-edit-wide">
                    Summary
                    <textarea
                      value={editForm.summary}
                      required
                      minLength={20}
                      maxLength={500}
                      rows={4}
                      onChange={(event) => setEditForm((current) => ({ ...current, summary: event.target.value }))}
                    />
                  </label>
                  <label>
                    Sharing visibility
                    <select
                      value={editForm.metricsSharing}
                      onChange={(event) => setEditForm((current) => ({ ...current, metricsSharing: event.target.value }))}
                    >
                      <option value="private">Private</option>
                      <option value="accepted">Shared</option>
                    </select>
                  </label>
                  <div className="profile-edit-actions">
                    <button type="submit" disabled={editSaving}>
                      {editSaving ? 'Saving...' : 'Save profile changes'}
                    </button>
                  </div>
                  {editMessage.text && (
                    <p className={editMessage.type === 'error' ? 'error-note' : 'success-note'}>
                      {editMessage.text}
                    </p>
                  )}
                </form>
              </section>
            )}

            <section className="panel">
              <div className="section-header">
                <h2>Related meetings</h2>
                <span>Session visibility follows company sharing controls</span>
              </div>
              <div className="meeting-list">
                {profile.meetings.map((meeting) => (
                  <article key={meeting.id} className="meeting-card">
                    <div>
                      <h3>{meeting.topic}</h3>
                      <p>{meeting.schedule}</p>
                      <p className="meeting-host">Hosted by {meeting.host}</p>
                    </div>
                    <span className="pill pill-neutral">{meeting.visibility}</span>
                  </article>
                ))}
                {profile.meetings.length === 0 && <p>No meetings yet for this profile.</p>}
              </div>
            </section>

            <section className="panel">
              <div className="section-header">
                <h2>Vendor matches for {profile.company.name}</h2>
                <span>Explainable matching based on fit, outcomes, compatibility, and budget alignment</span>
              </div>
              <div className="vendor-grid">
                {profile.recommendedVendors.map((vendor) => (
                  <article key={vendor.id} className="vendor-card">
                    <div className="vendor-top">
                      <h3>{vendor.name}</h3>
                      <span>{vendor.tier}</span>
                    </div>
                    <p>{vendor.description}</p>
                    <strong>{vendor.category}</strong>
                    <p className="vendor-match">Match score: {vendor.match.score}</p>
                    <ul className="vendor-reasons">
                      {vendor.match.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
            <section className="panel">
              <div className="section-header">
                <h2>Upload metrics</h2>
                <span>Submitted data updates the ranking score immediately</span>
              </div>
              <form className="metrics-upload-form" onSubmit={handleMetricsSubmit} noValidate>
                <div className="metrics-source-row">
                  <label htmlFor="sourceType">Source</label>
                  <select
                    id="sourceType"
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                  >
                    <option value="manual">Manual</option>
                    <option value="csv">CSV</option>
                    <option value="quickbooks">QuickBooks</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="stripe">Stripe</option>
                  </select>
                </div>
                <div className="metrics-fields-grid">
                  {METRIC_KEYS.map(({ key, label, placeholder }) => (
                    <div key={key} className="metric-field">
                      <label htmlFor={key}>{label}</label>
                      <input
                        id={key}
                        type="number"
                        placeholder={placeholder}
                        value={metricValues[key]}
                        onChange={(e) => setMetricValues((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                {metricsMessage.text && (
                  <p className={metricsMessage.type === 'error' ? 'error-note' : 'success-note'}>
                    {metricsMessage.text}
                  </p>
                )}
                <button type="submit" disabled={metricsSubmitting}>
                  {metricsSubmitting ? 'Submitting…' : 'Submit metrics'}
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default CompanyProfilePage;
