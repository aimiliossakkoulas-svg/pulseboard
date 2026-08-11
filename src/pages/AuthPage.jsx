import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const COMPANY_BOUND_ROLES = new Set(['Founder', 'Vendor', 'Employee', 'Admin']);

function AuthPage({ mode, authForm, setAuthForm, authMessage, handleAuthSubmit, authSubmitting = false, apiUrl }) {
  const isLogin = mode === 'login';
  const requiresCompanyIdentity = COMPANY_BOUND_ROLES.has(authForm.role);
  const [syncingLinkedin, setSyncingLinkedin] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  async function handleLinkedinSync() {
    if (!authForm.linkedinCompanyUrl?.trim() || !apiUrl) {
      setSyncMessage('Add your LinkedIn company URL first.');
      return;
    }

    setSyncingLinkedin(true);
    setSyncMessage('');

    try {
      const response = await fetch(`${apiUrl}/api/company-sync/linkedin-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinCompanyUrl: authForm.linkedinCompanyUrl,
          companyName: authForm.companyName
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to sync from LinkedIn');
      }

      setAuthForm({
        ...authForm,
        companyName: data.companyName || authForm.companyName,
        companyDomain: data.companyDomain || authForm.companyDomain
      });
      setSyncMessage('LinkedIn preview synced. Review company name/domain before sign up.');
    } catch (error) {
      setSyncMessage(error.message || 'Unable to sync from LinkedIn');
    } finally {
      setSyncingLinkedin(false);
    }
  }

  return (
    <div className="auth-page auth-page-facebook">
      <div className="auth-page-shell">
        <section className="auth-page-social-panel auth-fb-left" aria-label="Network activity preview">
          <p className="auth-fb-logo">CompanyBoard</p>
          <h1 className="auth-social-title">CompanyBoard helps you connect and share with trusted operators.</h1>
          <p className="auth-brand-tagline">See what your peer network is shipping, what metrics are moving, and who is ready to collaborate right now.</p>

          <div className="auth-fb-graphic" aria-hidden="true">
            <div className="auth-fb-node auth-fb-node-a">M</div>
            <div className="auth-fb-node auth-fb-node-b">J</div>
            <div className="auth-fb-node auth-fb-node-c">P</div>
            <div className="auth-fb-node auth-fb-node-d">A</div>
            <div className="auth-fb-line auth-fb-line-ab"></div>
            <div className="auth-fb-line auth-fb-line-ac"></div>
            <div className="auth-fb-line auth-fb-line-bd"></div>
            <div className="auth-fb-line auth-fb-line-cd"></div>
          </div>
        </section>

        <section className="auth-page-card auth-fb-card" aria-label={isLogin ? 'Sign in panel' : 'Create account panel'}>
          <h2 className="auth-page-title">{isLogin ? 'Log in to CompanyBoard' : 'Create a new account'}</h2>

          <form className="auth-page-form" onSubmit={handleAuthSubmit} noValidate>
            {!isLogin && (
              <label className="auth-field">
                <span>Full name</span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                  disabled={authSubmitting}
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                />
              </label>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                disabled={authSubmitting}
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder={isLogin ? 'Your password' : 'Min. 8 characters'}
                minLength={8}
                required
                disabled={authSubmitting}
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </label>
            {!isLogin && (
              <label className="auth-field">
                <span>I am a</span>
                <select
                  value={authForm.role}
                  disabled={authSubmitting}
                  onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                >
                  <option value="Founder">Founder</option>
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                  <option value="Agent">Agent / Advisor</option>
                  <option value="Vendor">Vendor / Partner</option>
                </select>
              </label>
            )}

            {!isLogin && (
              <label className="auth-field">
                <span>Company name</span>
                <input
                  type="text"
                  placeholder="Alpha Labs"
                  required={requiresCompanyIdentity}
                  disabled={authSubmitting || syncingLinkedin}
                  value={authForm.companyName}
                  onChange={(e) => setAuthForm({ ...authForm, companyName: e.target.value })}
                />
              </label>
            )}

            {!isLogin && (
              <label className="auth-field">
                <span>Company domain</span>
                <input
                  type="text"
                  placeholder="alphalabs.com"
                  required={requiresCompanyIdentity}
                  disabled={authSubmitting || syncingLinkedin}
                  value={authForm.companyDomain}
                  onChange={(e) => setAuthForm({ ...authForm, companyDomain: e.target.value })}
                />
              </label>
            )}

            {!isLogin && (
              <div className="auth-linkedin-sync-wrap">
                <label className="auth-field">
                  <span>LinkedIn company URL (optional)</span>
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/company/alpha-labs"
                    disabled={authSubmitting || syncingLinkedin}
                    value={authForm.linkedinCompanyUrl}
                    onChange={(e) => setAuthForm({ ...authForm, linkedinCompanyUrl: e.target.value })}
                  />
                </label>
                <button
                  type="button"
                  className="auth-page-switch-btn"
                  onClick={handleLinkedinSync}
                  disabled={authSubmitting || syncingLinkedin || !authForm.linkedinCompanyUrl?.trim()}
                >
                  {syncingLinkedin ? 'Syncing...' : 'Sync company from LinkedIn'}
                </button>
                {syncMessage && <p className="auth-linkedin-sync-message">{syncMessage}</p>}
                {!requiresCompanyIdentity && (
                  <p className="auth-linkedin-sync-message">Agents can sign up without a company claim.</p>
                )}
              </div>
            )}

            {authMessage && (
              <p className="auth-page-message" role="alert" aria-live="assertive">{authMessage}</p>
            )}

            <button type="submit" className="auth-page-submit auth-fb-submit" disabled={authSubmitting}>
              {authSubmitting ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Log in' : 'Sign up')}
            </button>
          </form>

          {isLogin && (
            <>
              <div className="auth-page-divider"><span>or</span></div>
              <Link to="/signup" aria-disabled={authSubmitting} className="auth-page-switch-btn auth-fb-create-btn">Create new account</Link>
            </>
          )}

          {!isLogin && (
            <p className="auth-fb-alt-link">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          )}

          <p className="auth-page-back">
            <Link to="/">Back to landing</Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default AuthPage;
