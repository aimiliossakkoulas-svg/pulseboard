import React from 'react';
import LandingHero from '../components/landing/LandingHero';

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

      <section className="panel preview-grid">
        <div className="preview-card">
          <h3>Ranked company profiles</h3>
          <p>See growth, retention, pipeline health, and HubSpot activity in one view.</p>
        </div>
        <div className="preview-card">
          <h3>Selective sharing</h3>
          <p>Companies control when meetings and metrics become visible to the wider network.</p>
        </div>
        <div className="preview-card">
          <h3>Marketplace access</h3>
          <p>Discover vendors and agents through premium-friendly partner placement.</p>
        </div>
      </section>

      <section className="panel preview-shell">
        <div className="preview-snapshot">
          <p className="eyebrow">Network pulse</p>
          <h3>Trusted signal, selective visibility, and premium partner discovery.</h3>
          <p>Members can review performance without exposing sensitive metrics until the company profile opts in.</p>
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

      <section className="panel narrative-grid" aria-label="Why PulseBoard">
        <article className="narrative-card">
          <p className="eyebrow">The problem</p>
          <h3>Most business communities reward noise instead of verified performance.</h3>
          <p>
            Founders and operators are forced to choose between sharing too much publicly or staying invisible.
            PulseBoard keeps high-signal collaboration private until trust is earned.
          </p>
        </article>
        <article className="narrative-card">
          <p className="eyebrow">The shift</p>
          <h3>Turn profile quality into an advantage with selective visibility controls.</h3>
          <p>
            Share growth metrics with approved peers, run focused meetings, and unlock premium vendor access based on
            reputation and contribution.
          </p>
        </article>
      </section>

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

      <section className="panel steps-grid" aria-label="How PulseBoard works">
        <article className="step-card">
          <span className="step-index">01</span>
          <h3>Set up your profile</h3>
          <p>Add company context, growth priorities, and optional benchmark metrics.</p>
        </article>
        <article className="step-card">
          <span className="step-index">02</span>
          <h3>Control your visibility</h3>
          <p>Decide exactly when your performance data is visible to peers and vendors.</p>
        </article>
        <article className="step-card">
          <span className="step-index">03</span>
          <h3>Unlock premium partnerships</h3>
          <p>Connect with trusted operators and execution partners based on proven outcomes.</p>
        </article>
      </section>

      <section className="panel final-cta" aria-label="Call to action">
        <div>
          <p className="eyebrow">Ready to join?</p>
          <h3>Build your trusted profile and access the private growth network.</h3>
          <p>Start with a free account. Upgrade visibility and partner access as your profile matures.</p>
        </div>
        <div className="hero-actions">
          <button type="button" onClick={() => setAuthMode('signup')}>Create account</button>
          <button type="button" className="secondary-action" onClick={() => setAuthMode('login')}>Sign in</button>
        </div>
      </section>

      <section className="panel auth-panel">
        <div className="auth-toggle">
          <button type="button" className={authMode === 'login' ? 'active' : ''} aria-pressed={authMode === 'login'} onClick={() => setAuthMode('login')}>Sign in</button>
          <button type="button" className={authMode === 'signup' ? 'active' : ''} aria-pressed={authMode === 'signup'} onClick={() => setAuthMode('signup')}>Create account</button>
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
          <button type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>

        {authMessage && <p className="auth-message" role="status" aria-live="polite">{authMessage}</p>}
      </section>
      </main>
    </div>
  );
}

export default LandingPage;
