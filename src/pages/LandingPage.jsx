import React from 'react';
import LandingHero from '../components/landing/LandingHero';

const PREVIEW_COMPANIES = [
  { rank: 1, name: 'Nova Insights', sector: 'Analytics', growth: '+35%', retention: '94%', tier: 'High signal', score: 81.6 },
  { rank: 2, name: 'Alpha Labs', sector: 'SaaS', growth: '+28%', retention: '91%', tier: 'High signal', score: 80.1 },
  { rank: 3, name: 'Pulse Commerce', sector: 'E-commerce', growth: '+19%', retention: '87%', tier: 'Emerging', score: 63.2 },
];

const MEMBERSHIP_TIERS = [
  {
    name: 'Starter',
    price: 'Free',
    badge: 'tier-free',
    description: 'Get your profile on the network and start building credibility.',
    features: ['Company profile & ranking', 'Network feed access', '3 metric uploads / month', 'Marketplace browse'],
  },
  {
    name: 'Growth',
    price: '$49 / mo',
    badge: 'tier-growth',
    highlight: true,
    description: 'Full visibility controls, richer metrics, and warm partner introductions.',
    features: ['Unlimited metric uploads', 'Selective sharing controls', 'Priority ranking placement', 'Vendor match recommendations', 'HubSpot & Stripe integrations'],
  },
  {
    name: 'Partner',
    price: '$149 / mo',
    badge: 'tier-partner',
    description: 'Featured placement, deal tracking, and full analytics for serious operators.',
    features: ['Featured profile placement', 'Deal & intro tracking', 'Advanced network analytics', 'Custom cohort access', 'Dedicated network manager'],
  },
];

function LandingPage({ heroStats, previewFeedItems, authMode, setAuthMode, authForm, setAuthForm, authMessage, handleAuthSubmit }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <LandingHero
        heroStats={heroStats}
        onSignupClick={() => setAuthMode('signup')}
        onSigninClick={() => setAuthMode('login')}
      />

      <main id="main-content">

      {/* Profile card preview — community forward */}
      <section className="panel" aria-label="Ranked company profiles">
        <div className="section-header">
          <div>
            <p className="eyebrow">Network rankings</p>
            <h2 className="section-title">Top profiles in the network</h2>
          </div>
          <span className="section-meta">Updated in real time based on verified signal</span>
        </div>
        <div className="lp-company-grid">
          {PREVIEW_COMPANIES.map((c) => (
            <article key={c.rank} className="lp-company-card">
              <div className="lp-card-top">
                <span className="lp-rank">#{c.rank}</span>
                <span className={`lp-tier-badge ${c.badge || ''}`}>{c.tier}</span>
              </div>
              <h3 className="lp-company-name">{c.name}</h3>
              <p className="lp-sector">{c.sector}</p>
              <div className="lp-metrics-row">
                <div className="lp-metric">
                  <span className="lp-metric-value">{c.growth}</span>
                  <span className="lp-metric-label">Growth</span>
                </div>
                <div className="lp-metric">
                  <span className="lp-metric-value">{c.retention}</span>
                  <span className="lp-metric-label">Retention</span>
                </div>
                <div className="lp-metric">
                  <span className="lp-metric-value">{c.score}</span>
                  <span className="lp-metric-label">Score</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Live network feed */}
      <section className="panel preview-shell" aria-label="Network activity">
        <div className="preview-snapshot">
          <p className="eyebrow">Live activity</p>
          <h2 className="section-title">What the network is doing right now</h2>
          <p>Members share milestones, open meetings, and selective metrics in real time. You control what you see and who sees you.</p>
        </div>
        <div className="preview-feed">
          {previewFeedItems.map((item) => (
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

      {/* Vision narrative */}
      <section className="panel narrative-grid" aria-label="Why PulseBoard">
        <article className="narrative-card">
          <p className="eyebrow">The problem</p>
          <h3>Most business networks reward noise, not verified performance.</h3>
          <p>
            Founders and operators are forced to choose between oversharing publicly or staying invisible.
            PulseBoard keeps high-signal collaboration private until trust is established.
          </p>
        </article>
        <article className="narrative-card">
          <p className="eyebrow">The shift</p>
          <h3>Selective visibility turns profile quality into a compounding advantage.</h3>
          <p>
            Share growth metrics with approved peers, run focused sessions, and unlock premium partner access
            based on reputation and real operating context — not follower count.
          </p>
        </article>
      </section>

      {/* Proof strip */}
      <section className="panel proof-strip" aria-label="Network trust indicators">
        <div className="proof-item">
          <strong>91%</strong>
          <span>Average retention across top-ranked profiles</span>
        </div>
        <div className="proof-item">
          <strong>3.2x</strong>
          <span>Faster partner discovery vs open marketplace search</span>
        </div>
        <div className="proof-item">
          <strong>42</strong>
          <span>Active expert-led sessions this month</span>
        </div>
      </section>

      {/* Membership tiers */}
      <section className="panel" aria-label="Membership plans">
        <div className="section-header">
          <div>
            <p className="eyebrow">Membership</p>
            <h2 className="section-title">Choose how you show up</h2>
          </div>
          <span className="section-meta">Upgrade or downgrade at any time</span>
        </div>
        <div className="membership-grid">
          {MEMBERSHIP_TIERS.map((tier) => (
            <article key={tier.name} className={`membership-card${tier.highlight ? ' membership-card-highlight' : ''}`}>
              <div className="membership-card-top">
                <span className={`membership-badge ${tier.badge}`}>{tier.name}</span>
                <strong className="membership-price">{tier.price}</strong>
              </div>
              <p className="membership-desc">{tier.description}</p>
              <ul className="membership-features">
                {tier.features.map((f) => (
                  <li key={f}><span className="feature-check" aria-hidden="true">✓</span>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className={tier.highlight ? 'cta-primary membership-cta' : 'cta-ghost membership-cta'}
                onClick={() => setAuthMode('signup')}
              >
                Get started
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="panel steps-grid" aria-label="How PulseBoard works">
        <article className="step-card">
          <span className="step-index">01</span>
          <h3>Build your profile</h3>
          <p>Add company context, growth priorities, and optional benchmark metrics to establish your presence.</p>
        </article>
        <article className="step-card">
          <span className="step-index">02</span>
          <h3>Control your visibility</h3>
          <p>Decide exactly when your performance data is visible to peers, vendors, and the wider network.</p>
        </article>
        <article className="step-card">
          <span className="step-index">03</span>
          <h3>Unlock partnerships</h3>
          <p>Get matched with execution partners and advisors based on verified signal, not cold outreach.</p>
        </article>
      </section>

      {/* Final CTA */}
      <section className="panel final-cta" aria-label="Call to action">
        <div>
          <p className="eyebrow">Ready to join?</p>
          <h3>Build your trusted profile and access the private growth network.</h3>
          <p>Start free. Upgrade your visibility and partner access as your profile matures.</p>
        </div>
        <div className="hero-actions social-auth-row">
          <button type="button" className="social-btn social-btn-signup social-btn-lg" onClick={() => setAuthMode('signup')}>Sign up</button>
          <button type="button" className="social-btn social-btn-login social-btn-lg" onClick={() => setAuthMode('login')}>Log in</button>
        </div>
      </section>

      <section className="panel auth-panel">
        <div className="auth-toggle">
          <button type="button" className={`social-btn ${authMode === 'login' ? 'social-btn-signup' : 'social-btn-login'}`} aria-pressed={authMode === 'login'} onClick={() => setAuthMode('login')}>Log in</button>
          <button type="button" className={`social-btn ${authMode === 'signup' ? 'social-btn-signup' : 'social-btn-login'}`} aria-pressed={authMode === 'signup'} onClick={() => setAuthMode('signup')}>Sign up</button>
        </div>

        <form onSubmit={handleAuthSubmit} className="auth-form" aria-label={authMode === 'login' ? 'Sign in form' : 'Create account form'}>
          {authMode === 'signup' && (
            <label>
              Full name
              <input value={authForm.name} autoComplete="name" required={authMode === 'signup'} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="Your company name" />
            </label>
          )}
          <label>
            Email
            <input type="email" value={authForm.email} autoComplete="email" required onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@company.com" />
          </label>
          <label>
            Password
            <input type="password" value={authForm.password} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={8} required onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="Choose a secure password" />
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
          <button type="submit" className="social-btn social-btn-signup social-btn-lg auth-submit-btn">{authMode === 'login' ? 'Log in' : 'Sign up'}</button>
        </form>

        {authMessage && <p className="auth-message" role="status" aria-live="polite">{authMessage}</p>}
      </section>
      </main>
    </div>
  );
}

export default LandingPage;
