import React from 'react';

function LandingHero({ onSignupClick, onSigninClick }) {
  return (
    <header className="landing-hero" aria-label="PulseBoard partnership portal">
      <div className="landing-hero-media" aria-hidden="true">
        <img
          className="landing-hero-image"
          src="/landing-hero-partnership.png"
          alt=""
          width="1600"
          height="900"
        />
        <div className="landing-hero-veil" />
      </div>

      <div className="landing-hero-frame">
        <nav className="landing-hero-nav" aria-label="Landing">
          <p className="landing-brand">PulseBoard</p>
          <button type="button" className="landing-nav-link" onClick={onSigninClick}>
            Sign in
          </button>
        </nav>

        <div className="landing-hero-copy">
          <h1 className="landing-h1">
            The portal for trusted
            <span className="landing-h1-accent"> company partnerships.</span>
          </h1>
          <p className="landing-subhead">
            A selective network where founders and operators prove traction, share metrics privately, and open warmer partner introductions.
          </p>
          <div className="hero-actions landing-cta-row">
            <button type="button" className="cta-primary" onClick={onSignupClick}>
              Enter the portal
            </button>
            <button type="button" className="cta-ghost" onClick={onSigninClick}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default LandingHero;
