import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CompanyOnboardingPage({ user, handleLogout, apiUrl, token }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    sector: '',
    summary: '',
    sourceType: 'manual',
    metricsSharing: 'private',
    verificationStatus: 'self-reported',
    confidenceScore: '0.75',
    growthPercent: '',
    retentionPercent: '',
    pipelineMillions: '',
    dealsActive: '',
    campaignsLive: '',
    meetingsQuarter: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    const metrics = [
      { metricKey: 'growth_percent', metricValue: Number(form.growthPercent || 0) },
      { metricKey: 'retention_percent', metricValue: Number(form.retentionPercent || 0) },
      { metricKey: 'pipeline_millions', metricValue: Number(form.pipelineMillions || 0) },
      { metricKey: 'deals_active', metricValue: Number(form.dealsActive || 0) },
      { metricKey: 'campaigns_live', metricValue: Number(form.campaignsLive || 0) },
      { metricKey: 'meetings_quarter', metricValue: Number(form.meetingsQuarter || 0) }
    ];

    try {
      const response = await fetch(`${apiUrl}/api/companies/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          companyName: form.companyName,
          sector: form.sector,
          summary: form.summary,
          sourceType: form.sourceType,
          metricsSharing: form.metricsSharing,
          verificationStatus: form.verificationStatus,
          confidenceScore: Number(form.confidenceScore),
          metrics
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to create company profile');
      }

      setMessage('Company onboarding saved. Redirecting to profile...');
      navigate(`/company/${data.company.id}`);
    } catch (submitError) {
      setError(submitError.message || 'Unable to onboard company.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#onboarding-main">Skip to main content</a>
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">Company onboarding</p>
          <h1>Create your company profile and baseline metrics.</h1>
          <p>Start with self-reported or QuickBooks-sourced values. You can update these anytime and add other sources later.</p>
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

      <main id="onboarding-main">
        <section className="panel onboarding-panel">
          <h2>Company details</h2>
          <form onSubmit={handleSubmit} className="onboarding-form">
            <label>
              Company name
              <input value={form.companyName} required minLength={2} maxLength={255} onChange={(event) => updateField('companyName', event.target.value)} placeholder="Acme Growth Labs" />
            </label>
            <label>
              Sector
              <input value={form.sector} required maxLength={100} onChange={(event) => updateField('sector', event.target.value)} placeholder="SaaS, E-commerce, Fintech" />
            </label>
            <label className="onboarding-wide">
              Summary
              <textarea value={form.summary} required minLength={20} maxLength={500} rows={4} onChange={(event) => updateField('summary', event.target.value)} placeholder="Describe what your company does, the stage you are at, and why partners should connect." />
            </label>

            <label>
              Metric source
              <select value={form.sourceType} onChange={(event) => updateField('sourceType', event.target.value)}>
                <option value="manual">Manual</option>
                <option value="quickbooks">QuickBooks</option>
                <option value="csv">CSV</option>
                <option value="hubspot">HubSpot</option>
                <option value="stripe">Stripe</option>
              </select>
            </label>

            <label>
              Verification status
              <select value={form.verificationStatus} onChange={(event) => updateField('verificationStatus', event.target.value)}>
                <option value="self-reported">Self-reported</option>
                <option value="reviewed">Reviewed</option>
                <option value="verified">Verified</option>
              </select>
            </label>

            <label>
              Confidence score (0-1)
              <input type="number" min="0" max="1" step="0.01" value={form.confidenceScore} onChange={(event) => updateField('confidenceScore', event.target.value)} />
            </label>

            <label>
              Metrics visibility
              <select value={form.metricsSharing} onChange={(event) => updateField('metricsSharing', event.target.value)}>
                <option value="private">Private — hide metrics from the network</option>
                <option value="accepted">Shared with network — show growth, retention, pipeline</option>
              </select>
              <span className="field-hint">
                Private keeps numbers hidden from other members. Shared makes them visible and improves trust ranking.
              </span>
            </label>

            <label>
              Growth %
              <input type="number" step="0.1" value={form.growthPercent} onChange={(event) => updateField('growthPercent', event.target.value)} placeholder="28" />
            </label>
            <label>
              Retention %
              <input type="number" step="0.1" value={form.retentionPercent} onChange={(event) => updateField('retentionPercent', event.target.value)} placeholder="91" />
            </label>
            <label>
              Pipeline (millions)
              <input type="number" step="0.01" value={form.pipelineMillions} onChange={(event) => updateField('pipelineMillions', event.target.value)} placeholder="2.4" />
            </label>
            <label>
              Active deals
              <input type="number" step="1" value={form.dealsActive} onChange={(event) => updateField('dealsActive', event.target.value)} placeholder="18" />
            </label>
            <label>
              Live campaigns
              <input type="number" step="1" value={form.campaignsLive} onChange={(event) => updateField('campaignsLive', event.target.value)} placeholder="7" />
            </label>
            <label>
              Meetings this quarter
              <input type="number" step="1" value={form.meetingsQuarter} onChange={(event) => updateField('meetingsQuarter', event.target.value)} placeholder="24" />
            </label>

            <div className="onboarding-actions onboarding-wide">
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create company profile'}</button>
            </div>
          </form>

          {message && <p className="auth-message" role="status" aria-live="polite">{message}</p>}
          {error && <p className="error-note" role="alert">{error}</p>}
        </section>
      </main>
    </div>
  );
}

export default CompanyOnboardingPage;
