import React from 'react';
import { Link } from 'react-router-dom';

function LandingHero({ heroStats, onSignupClick, onSigninClick }) {
  return (
    <header className="hero hero-preview">
      <div className="hero-copy">
        <p className="eyebrow">PulseBoard network</p>
        <h1>Explore a smarter business network before you sign in.</h1>
        <p>
          Browse ranked company profiles, selective metric sharing, expert reviews, and marketplace vendor
          opportunities.
          Create an account when you are ready to join the conversation.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="action-link" onClick={onSignupClick}>Create account</Link>
          <Link to="/login" className="action-link secondary-action" onClick={onSigninClick}>Sign in</Link>
        </div>
        <div className="hero-stats" aria-label="Network highlights">
          {heroStats.map((stat) => (
            <div key={stat.label} className="stat-pill" role="group" aria-label={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export default LandingHero;
