import React from 'react';
import { useNavigate } from 'react-router-dom';
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

function LandingPage({ heroStats, previewFeedItems }) {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <LandingHero
        onSignupClick={() => navigate('/signup')}
        onSigninClick={() => navigate('/login')}
      />

      <main id="main-content">

      <section className="panel landing-portal-strip" aria-label="Network highlights">
        <div className="landing-stats-bar">
          {heroStats.map((stat) => (
            <div key={stat.label} className="landing-stat" role="group" aria-label={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Profile card preview — community forward */}
      <section className="panel" aria-label="Ranked company profiles">
        <div className="section-header">
          <div>
            <p className="eyebrow">Partnership signal</p>
            <h2 className="section-title">Companies ready for the right introductions</h2>
          </div>
          <span className="section-meta">Ranked on verified operating context</span>
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
          <h3>Most partnership channels reward noise, not verified performance.</h3>
          <p>
            Founders and operators are forced to choose between oversharing publicly or staying invisible.
            PulseBoard keeps high-signal collaboration private until trust is established.
          </p>
        </article>
        <article className="narrative-card">
          <p className="eyebrow">The portal</p>
          <h3>Selective visibility turns company quality into warmer introductions.</h3>
          <p>
            Share growth metrics with approved peers, run focused sessions, and unlock partner access
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
                onClick={() => navigate('/signup')}
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
        <div className="hero-actions">
          <button type="button" className="cta-primary" onClick={() => navigate('/signup')}>Join the network</button>
          <button type="button" className="cta-ghost" onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </section>
      </main>
    </div>
  );
}

export default LandingPage;
