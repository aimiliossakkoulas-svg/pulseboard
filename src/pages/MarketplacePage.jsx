import React from 'react';
import { Link } from 'react-router-dom';

function MarketplacePage({ user, vendors, handleLogout }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#marketplace-main-content">Skip to main content</a>
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">Marketplace</p>
          <h1>Discover vetted vendors and premium growth partners.</h1>
          <p>Move from profile review to operator-grade execution with partner teams that already support founders in the network.</p>
          <div className="hero-actions">
            <Link to="/app" className="action-link">Back to dashboard</Link>
          </div>
        </div>
        <div className="hero-side-card">
          <p className="eyebrow">Signed in as</p>
          <h3>{user.name}</h3>
          <p>{user.role || 'Founder'}</p>
          <button type="button" className="secondary-action" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main id="marketplace-main-content">

      <section className="panel">
        <div className="section-header">
          <h2>Marketplace vendors</h2>
          <span>Partner discovery and premium placement</span>
        </div>
        <div className="vendor-grid">
          {vendors.map((vendor) => (
            <article key={vendor.id} className="vendor-card">
              <div className="vendor-top">
                <h3>{vendor.name}</h3>
                <span>{vendor.tier}</span>
              </div>
              <p>{vendor.description}</p>
              <strong>{vendor.category}</strong>
            </article>
          ))}
        </div>
      </section>
      </main>
    </div>
  );
}

export default MarketplacePage;
