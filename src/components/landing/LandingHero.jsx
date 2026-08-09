import React from 'react';
import { Link } from 'react-router-dom';

function LandingHero({ heroStats, onSignupClick, onSigninClick }) {
  return (
    <header className="hero landing-hero">
      <div className="landing-hero-inner">
        <p className="eyebrow">PulseBoard &mdash; Private business network</p>
        <h1 className="landing-h1">
          Reputation is the new
          <br />
          <span className="landing-h1-accent">unfair advantage.</span>
        </h1>
        <p className="landing-subhead">
          PulseBoard is where high-signal founders, operators, and partners build verified credibility,
          share performance selectively, and discover the right people at the right moment.
          No noise. No vanity metrics. Just trust.
        </p>
        <div className="hero-actions landing-cta-row">
          <button type="button" className="cta-primary" onClick={onSignupClick}>Join the network</button>
          <button type="button" className="cta-ghost" onClick={onSigninClick}>Sign in</button>
        </div>
      </div>
      <div className="landing-stats-bar" aria-label="Network highlights">
        {heroStats.map((stat) => (
          <div key={stat.label} className="landing-stat" role="group" aria-label={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

export default LandingHero;
