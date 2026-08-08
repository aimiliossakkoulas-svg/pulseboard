import React from 'react';

function LandingHero({ heroStats, onSignupClick, onSigninClick }) {
  return (
    <header className="hero landing-hero">
      <div className="landing-hero-bg" aria-hidden="true">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
        <div className="landing-grid-overlay" />
      </div>

      <div className="landing-hero-content">
        <div className="landing-hero-inner">
          <p className="eyebrow landing-fade-in" style={{ animationDelay: '0ms' }}>PulseBoard &mdash; Private business network</p>
          <h1 className="landing-h1 landing-fade-in" style={{ animationDelay: '80ms' }}>
            Reputation is the new
            <br />
            <span className="landing-h1-accent landing-h1-shimmer">unfair advantage.</span>
          </h1>
          <p className="landing-subhead landing-fade-in" style={{ animationDelay: '160ms' }}>
            PulseBoard is where high-signal founders, operators, and partners build verified credibility,
            share performance selectively, and discover the right people at the right moment.
            No noise. No vanity metrics. Just trust.
          </p>
          <div className="hero-actions landing-cta-row landing-fade-in" style={{ animationDelay: '240ms' }}>
            <button type="button" className="social-btn social-btn-signup social-btn-lg" onClick={onSignupClick}>Sign up</button>
            <button type="button" className="social-btn social-btn-login social-btn-lg" onClick={onSigninClick}>Log in</button>
          </div>
        </div>

        <div className="landing-hero-visual landing-fade-in" style={{ animationDelay: '320ms' }} aria-hidden="true">
          <div className="landing-visual-ring landing-visual-ring-outer" />
          <div className="landing-visual-ring landing-visual-ring-inner" />
          <div className="landing-visual-core">
            <span className="landing-visual-score">94</span>
            <span className="landing-visual-label">Trust score</span>
          </div>
          <div className="landing-visual-node landing-visual-node-1"><span>Rank #1</span></div>
          <div className="landing-visual-node landing-visual-node-2"><span>Verified</span></div>
          <div className="landing-visual-node landing-visual-node-3"><span>Private</span></div>
        </div>
      </div>

      <div className="landing-stats-bar landing-fade-in" style={{ animationDelay: '400ms' }} aria-label="Network highlights">
        {heroStats.map((stat, i) => (
          <div key={stat.label} className="landing-stat" role="group" aria-label={stat.label} style={{ animationDelay: `${480 + i * 60}ms` }}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

export default LandingHero;
