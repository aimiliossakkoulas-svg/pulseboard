import React from 'react';
import { Link } from 'react-router-dom';

function LandingHero({ heroStats, onSignupClick, onSigninClick }) {
  return (
    <header className="hero landing-hero">
      <div className="landing-hero-layout">
        <div className="landing-hero-inner">
          <p className="eyebrow">CompanyBoard &mdash; Private business network</p>
          <h1 className="landing-h1">
            Turn visibility into
            <br />
            <span className="landing-h1-accent">real collaboration.</span>
          </h1>
          <p className="landing-subhead">
            Discover credible companies, connect with the right people, and build partnerships grounded in trust,
            fit, and shared value. CompanyBoard helps serious operators find the right collaborators without the noise.
          </p>
          <div className="hero-actions landing-cta-row">
            <button type="button" className="cta-primary" onClick={onSignupClick}>Join the network</button>
            <button type="button" className="cta-ghost" onClick={onSigninClick}>Sign in</button>
          </div>

          <div className="landing-trust-block" aria-label="Trust signals">
            <div className="landing-trust-icon" aria-hidden="true">&#9670;</div>
            <div className="landing-trust-copy">
              <strong>Credible partner network</strong>
              <span>Profiles ranked on real signal, trusted context, and fit — not follower counts or empty noise.</span>
            </div>
          </div>
        </div>

        <aside className="landing-hero-graphic" aria-label="CompanyBoard network graph preview">
          <div className="graph-ring graph-ring-large"></div>
          <div className="graph-ring graph-ring-medium"></div>
          <div className="graph-ring graph-ring-small"></div>
          <div className="graph-node graph-node-center">PB</div>
          <div className="graph-node graph-node-1">M</div>
          <div className="graph-node graph-node-2">J</div>
          <div className="graph-node graph-node-3">P</div>
          <div className="graph-node graph-node-4">A</div>
          <span className="graph-link graph-link-1"></span>
          <span className="graph-link graph-link-2"></span>
          <span className="graph-link graph-link-3"></span>
          <span className="graph-link graph-link-4"></span>
          <span className="graph-link graph-link-5"></span>
        </aside>
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
