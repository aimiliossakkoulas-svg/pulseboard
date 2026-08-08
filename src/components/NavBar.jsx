import React from 'react';
import { Link } from 'react-router-dom';

function NavBar({ user, onSignupClick, onSigninClick, onLogout }) {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <div className="site-nav-inner">
        <Link to={user ? '/app' : '/'} className="site-nav-brand">
          <span className="site-nav-logo" aria-hidden="true">◆</span>
          PulseBoard
        </Link>

        {user ? (
          <div className="site-nav-actions">
            <Link to="/app" className="site-nav-link">Dashboard</Link>
            <Link to="/marketplace" className="site-nav-link">Marketplace</Link>
            <Link to="/onboarding" className="site-nav-link">Onboard</Link>
            <span className="site-nav-user">{user.name}</span>
            <button type="button" className="site-nav-btn" onClick={onLogout}>Log out</button>
          </div>
        ) : (
          <div className="site-nav-actions">
            <button type="button" className="site-nav-btn site-nav-btn-ghost" onClick={onSigninClick}>Sign in</button>
            <button type="button" className="site-nav-btn site-nav-btn-primary" onClick={onSignupClick}>Join network</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
