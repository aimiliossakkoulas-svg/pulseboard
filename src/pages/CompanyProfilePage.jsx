import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function CompanyProfilePage({ user, handleLogout, apiUrl }) {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiUrl}/api/companies/${companyId}/profile`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load company profile');
        }

        if (active) {
          setProfile(data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Unable to load company profile');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [apiUrl, companyId]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#company-profile-main">Skip to main content</a>
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">Company profile</p>
          <h1>{profile?.company?.name || 'Company detail view'}</h1>
          <p>View ranking logic, trust signals, related sessions, and vendor matches for this company profile.</p>
          <div className="hero-actions">
            <Link to="/app" className="action-link">Back to dashboard</Link>
            <Link to="/marketplace" className="action-link secondary-action">View marketplace</Link>
          </div>
        </div>
        <div className="hero-side-card">
          <p className="eyebrow">Signed in as</p>
          <h3>{user.name}</h3>
          <p>{user.role || 'Founder'}</p>
          <button type="button" className="secondary-action" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main id="company-profile-main">
        {loading && (
          <section className="panel">
            <p>Loading company profile...</p>
          </section>
        )}

        {!loading && error && (
          <section className="panel">
            <p className="error-note">{error}</p>
          </section>
        )}

        {!loading && !error && profile && (
          <>
            <section className="panel profile-grid">
              <article className="profile-card">
                <h2>{profile.company.name}</h2>
                <p>{profile.company.summary}</p>
                <div className="profile-badges">
                  <span className="pill">#{profile.company.rank.position} · {profile.company.rank.tier}</span>
                  <span className="pill">★ {profile.company.rating}</span>
                </div>
                <div className="stats-grid">
                  <div>
                    <strong>Sector</strong>
                    <span>{profile.company.sector}</span>
                  </div>
                  <div>
                    <strong>Growth</strong>
                    <span>{profile.company.growth}</span>
                  </div>
                  <div>
                    <strong>Retention</strong>
                    <span>{profile.company.retention}</span>
                  </div>
                  <div>
                    <strong>Pipeline</strong>
                    <span>{profile.company.pipeline}</span>
                  </div>
                </div>
              </article>

              <article className="profile-card">
                <h3>Ranking breakdown</h3>
                <p className="ranking-score">Score: {profile.company.rank.score}</p>
                <ul className="vendor-reasons">
                  <li>Profile quality: {profile.company.rank.breakdown.profileQuality}</li>
                  <li>Growth momentum: {profile.company.rank.breakdown.growthMomentum}</li>
                  <li>Engagement quality: {profile.company.rank.breakdown.engagementQuality}</li>
                  <li>Trust signal: {profile.company.rank.breakdown.trustSignal}</li>
                  <li>Peer review: {profile.company.rank.breakdown.peerReview}</li>
                </ul>
                <h4 className="profile-subtitle">Top reasons</h4>
                <ul className="vendor-reasons">
                  {profile.company.rank.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="panel">
              <div className="section-header">
                <h2>Related meetings</h2>
                <span>Session visibility follows company sharing controls</span>
              </div>
              <div className="meeting-list">
                {profile.meetings.map((meeting) => (
                  <article key={meeting.id} className="meeting-card">
                    <div>
                      <h3>{meeting.topic}</h3>
                      <p>{meeting.schedule}</p>
                      <p className="meeting-host">Hosted by {meeting.host}</p>
                    </div>
                    <span className="pill pill-neutral">{meeting.visibility}</span>
                  </article>
                ))}
                {profile.meetings.length === 0 && <p>No meetings yet for this profile.</p>}
              </div>
            </section>

            <section className="panel">
              <div className="section-header">
                <h2>Vendor matches for {profile.company.name}</h2>
                <span>Explainable matching based on fit, outcomes, compatibility, and budget alignment</span>
              </div>
              <div className="vendor-grid">
                {profile.recommendedVendors.map((vendor) => (
                  <article key={vendor.id} className="vendor-card">
                    <div className="vendor-top">
                      <h3>{vendor.name}</h3>
                      <span>{vendor.tier}</span>
                    </div>
                    <p>{vendor.description}</p>
                    <strong>{vendor.category}</strong>
                    <p className="vendor-match">Match score: {vendor.match.score}</p>
                    <ul className="vendor-reasons">
                      {vendor.match.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default CompanyProfilePage;
