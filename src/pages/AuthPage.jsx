import React from 'react';
import { Link } from 'react-router-dom';

function AuthPage({ mode, authForm, setAuthForm, authMessage, handleAuthSubmit }) {
  const isLogin = mode === 'login';

  return (
    <div className="auth-page">
      <div className="auth-page-brand">
        <p className="auth-brand-name">PulseBoard</p>
        <p className="auth-brand-tagline">The private network for high-signal companies.</p>
      </div>

      <div className="auth-page-card">
        <h1 className="auth-page-title">{isLogin ? 'Sign in to your account' : 'Create your account'}</h1>

        <form className="auth-page-form" onSubmit={handleAuthSubmit} noValidate>
          {!isLogin && (
            <label className="auth-field">
              <span>Full name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Your name"
                required
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
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
          </label>
          {!isLogin && (
            <label className="auth-field">
              <span>I am a</span>
              <select
                value={authForm.role}
                onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
              >
                <option value="Founder">Founder</option>
                <option value="Agent">Agent / Advisor</option>
                <option value="Vendor">Vendor / Partner</option>
              </select>
            </label>
          )}

          {authMessage && (
            <p className="auth-page-message" role="status">{authMessage}</p>
          )}

          <button type="submit" className="auth-page-submit">
            {isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-page-divider"><span>or</span></div>

        {isLogin ? (
          <Link to="/signup" className="auth-page-switch-btn">Create new account</Link>
        ) : (
          <Link to="/login" className="auth-page-switch-btn">Already have an account? Sign in</Link>
        )}
      </div>

      <p className="auth-page-back">
        <Link to="/">← Back to PulseBoard</Link>
      </p>
    </div>
  );
}

export default AuthPage;
