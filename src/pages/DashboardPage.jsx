import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function DashboardPage({
  user,
  handleLogout,
  heroStats,
  activeSection,
  setActiveSection,
  companies,
  meetingsData,
  adviceRequests,
  setAdviceRequests,
  status,
  posts,
  author,
  setAuthor,
  content,
  setContent,
  handleSubmit,
  toggleMetricsSharing,
  recommendedVendors,
  introRequests,
  token,
  apiUrl,
}) {
  const [search, setSearch] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [sharingCompanyId, setSharingCompanyId] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [adviceForm, setAdviceForm] = useState({ title: '', detail: '' });
  const [adviceSaving, setAdviceSaving] = useState(false);
  const [adviceMessage, setAdviceMessage] = useState({ type: '', text: '' });
  const [closingAdviceId, setClosingAdviceId] = useState('');
  const [offerDrafts, setOfferDrafts] = useState({});
  const [offeringAdviceId, setOfferingAdviceId] = useState('');
  const [engagements, setEngagements] = useState([]);
  const [selectedEngagementId, setSelectedEngagementId] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneAmount, setMilestoneAmount] = useState('0');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [milestoneSaving, setMilestoneSaving] = useState(false);
  const [callProvider, setCallProvider] = useState('meet');
  const [callUrl, setCallUrl] = useState('');
  const [callAgenda, setCallAgenda] = useState('');
  const [callScheduledAt, setCallScheduledAt] = useState('');
  const [callSaving, setCallSaving] = useState(false);
  const [outcomeSaving, setOutcomeSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState('');
  const [checkoutLoadingMilestoneId, setCheckoutLoadingMilestoneId] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [outcomeForm, setOutcomeForm] = useState({
    baselineGrowth: '0',
    currentGrowth: '0',
    baselineRetention: '0',
    currentRetention: '0',
    baselinePipeline: '0',
    currentPipeline: '0',
  });

  useEffect(() => {
    async function loadEngagements() {
      if (!token || !apiUrl) return;
      try {
        const response = await fetch(`${apiUrl}/api/engagements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return;
        const data = await response.json();
        setEngagements(data);
        if (!selectedEngagementId && data[0]?.id) {
          setSelectedEngagementId(data[0].id);
        }
      } catch {
        // Ignore engagement bootstrap failures in UI.
      }
    }

    loadEngagements();
  }, [token, apiUrl]);

  useEffect(() => {
    async function loadNotifications() {
      if (!token || !apiUrl) return;
      try {
        const response = await fetch(`${apiUrl}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Unable to load notifications');
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        setNotificationError(error.message || 'Unable to load notifications');
      }
    }

    loadNotifications();
  }, [token, apiUrl]);

  useEffect(() => {
    async function loadWorkspace() {
      if (!token || !apiUrl || !selectedEngagementId) return;
      setWorkspaceLoading(true);
      setWorkspaceError('');
      try {
        const response = await fetch(`${apiUrl}/api/engagements/${selectedEngagementId}/workspace`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load workspace');
        setWorkspace(data);
        const outcome = data.outcome || {};
        setOutcomeForm({
          baselineGrowth: String(outcome.baselineGrowth ?? 0),
          currentGrowth: String(outcome.currentGrowth ?? 0),
          baselineRetention: String(outcome.baselineRetention ?? 0),
          currentRetention: String(outcome.currentRetention ?? 0),
          baselinePipeline: String(outcome.baselinePipeline ?? 0),
          currentPipeline: String(outcome.currentPipeline ?? 0),
        });
      } catch (error) {
        setWorkspaceError(error.message || 'Unable to load workspace');
      } finally {
        setWorkspaceLoading(false);
      }
    }

    loadWorkspace();
  }, [selectedEngagementId, token, apiUrl]);

  async function handleLogoutClick() {
    setIsLoggingOut(true);
    try {
      await handleLogout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handlePostSubmit(event) {
    setIsPublishing(true);
    try {
      await handleSubmit(event);
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleToggleSharing(companyId) {
    setSharingCompanyId(companyId);
    try {
      await toggleMetricsSharing(companyId);
    } finally {
      setSharingCompanyId('');
    }
  }

  const filteredCompanies = companies.filter((c) =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sector.toLowerCase().includes(search.toLowerCase())
  );

  async function refreshWorkspace() {
    if (!selectedEngagementId) return;
    try {
      const response = await fetch(`${apiUrl}/api/engagements/${selectedEngagementId}/workspace`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) return;
      const data = await response.json();
      setWorkspace(data);
    } catch {
      // ignore refresh failures
    }
  }

  async function handleSendMessage() {
    if (!messageDraft.trim() || !selectedEngagementId) return;
    setMessageSending(true);
    try {
      const response = await fetch(`${apiUrl}/api/engagements/${selectedEngagementId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ channel: 'chat', body: messageDraft })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send message');
      setWorkspace((current) => ({ ...(current || {}), messages: [...(current?.messages || []), data] }));
      setMessageDraft('');
    } catch (error) {
      setWorkspaceError(error.message || 'Unable to send message');
    } finally {
      setMessageSending(false);
    }
  }

  async function handleAddMilestone() {
    if (!milestoneTitle.trim() || !selectedEngagementId) return;
    setMilestoneSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/engagements/${selectedEngagementId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: milestoneTitle,
          amount: Number(milestoneAmount) || 0,
          dueDate: milestoneDueDate || null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to add milestone');
      setWorkspace((current) => ({ ...(current || {}), milestones: [...(current?.milestones || []), data] }));
      setMilestoneTitle('');
      setMilestoneAmount('0');
      setMilestoneDueDate('');
    } catch (error) {
      setWorkspaceError(error.message || 'Unable to add milestone');
    } finally {
      setMilestoneSaving(false);
    }
  }

  async function handleMilestoneStatusChange(milestoneId, status) {
    if (!selectedEngagementId) return;
    try {
      const response = await fetch(`${apiUrl}/api/engagements/${selectedEngagementId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update milestone');
      setWorkspace((current) => ({
        ...(current || {}),
        milestones: (current?.milestones || []).map((item) => item.id === milestoneId ? data : item)
      }));
    } catch (error) {
      setWorkspaceError(error.message || 'Unable to update milestone');
    }
  }

  async function handleScheduleCall() {
    if (!selectedEngagementId || !callUrl.trim() || !callScheduledAt) return;
    setCallSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/engagements/${selectedEngagementId}/calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: callProvider,
          meetingUrl: callUrl,
          agenda: callAgenda,
          scheduledAt: new Date(callScheduledAt).toISOString()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to schedule call');
      setWorkspace((current) => ({ ...(current || {}), calls: [...(current?.calls || []), data] }));
      setCallUrl('');
      setCallAgenda('');
      setCallScheduledAt('');
    } catch (error) {
      setWorkspaceError(error.message || 'Unable to schedule call');
    } finally {
      setCallSaving(false);
    }
  }

  async function handleSaveOutcome() {
    if (!selectedEngagementId) return;
    setOutcomeSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/engagements/${selectedEngagementId}/outcome`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          baselineGrowth: Number(outcomeForm.baselineGrowth) || 0,
          currentGrowth: Number(outcomeForm.currentGrowth) || 0,
          baselineRetention: Number(outcomeForm.baselineRetention) || 0,
          currentRetention: Number(outcomeForm.currentRetention) || 0,
          baselinePipeline: Number(outcomeForm.baselinePipeline) || 0,
          currentPipeline: Number(outcomeForm.currentPipeline) || 0,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save outcomes');
      setWorkspace((current) => ({ ...(current || {}), outcome: data }));
      await refreshWorkspace();
    } catch (error) {
      setWorkspaceError(error.message || 'Unable to save outcomes');
    } finally {
      setOutcomeSaving(false);
    }
  }

  async function handleCreateCheckout(milestoneId) {
    if (!selectedEngagementId) return;
    setCheckoutLoadingMilestoneId(milestoneId);
    setCheckoutMessage('');
    try {
      const response = await fetch(`${apiUrl}/api/engagements/${selectedEngagementId}/milestones/${milestoneId}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ origin: window.location.origin })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to create checkout');
      }

      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
        setCheckoutMessage('Stripe checkout opened in a new tab.');
      } else {
        setCheckoutMessage('Payment session created in manual mode; milestone moved to funded.');
      }
      await refreshWorkspace();
    } catch (error) {
      setCheckoutMessage(error.message || 'Unable to create checkout');
    } finally {
      setCheckoutLoadingMilestoneId(null);
    }
  }

  async function markNotificationRead(notificationId) {
    try {
      const response = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to mark notification read');
      setNotifications((current) => current.map((item) => (item.id === notificationId ? data : item)));
    } catch (error) {
      setNotificationError(error.message || 'Unable to mark notification read');
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#dashboard-main-content">Skip to main content</a>
      <header className="hero hero-with-actions">
        <div className="hero-copy">
          <p className="eyebrow">PulseBoard network</p>
          <h1>Trusted company profiles, expert reviews, and selective performance sharing.</h1>
          <p>Connect with founders, agents, and vendors in a private business network where visibility is earned and metrics stay permission-based.</p>
          <div className="hero-actions">
            <button type="button" onClick={() => { setActiveSection('profiles'); document.getElementById('profiles-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore profiles</button>
            <Link to="/onboarding" className="action-link">Onboard company</Link>
            <Link to="/marketplace" className="action-link secondary-action" onClick={() => setActiveSection('marketplace')}>View marketplace</Link>
          </div>
          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="stat-pill">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-side-card">
          <p className="eyebrow">Signed in as</p>
          <h3>{user.name}</h3>
          <p>{user.role || 'Founder'}</p>
          <button type="button" className="secondary-action" onClick={handleLogoutClick} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </header>

      <main id="dashboard-main-content">

      <section className="panel spotlight">
        <div>
          <p className="eyebrow">Business model</p>
          <h2>Profiles are ranked by system signals and agent review.</h2>
          <p>Company visibility is driven by verified performance, engagement, and trusted expert commentary. Marketplace vendors are surfaced through premium placement and partner access.</p>
        </div>
        <div className="spotlight-badges">
          <span>HubSpot metrics</span>
          <span>Selective sharing</span>
          <span>Vendor marketplace</span>
        </div>
      </section>

      <section id="profiles-section" className={`panel ${activeSection === 'profiles' ? 'active-section' : ''}`}>
        <div className="section-header">
          <div>
            <p className="eyebrow">Network</p>
            <h2 className="section-title">Company profiles</h2>
          </div>
          <span className="section-meta">Ranked by verified signal</span>
        </div>
        <div className="search-bar-row">
          <input
            className="company-search-input"
            type="search"
            placeholder="Search by company name or sector…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search companies"
          />
          {search && (
            <span className="search-result-count">{filteredCompanies.length} result{filteredCompanies.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="company-grid">
          {filteredCompanies.length === 0 && (
            <p className="search-empty">No companies match &ldquo;{search}&rdquo;</p>
          )}
          {filteredCompanies.map((company) => {
            const canShare = company.metricsSharing === 'accepted';
            return (
              <article key={company.id} className="company-card social-card">
                <div className="social-card-header">
                  <div className="social-card-avatar">{company.name.charAt(0)}</div>
                  <div className="social-card-identity">
                    <h3>{company.name}</h3>
                    <span className="social-card-sector">{company.sector}</span>
                  </div>
                  <div className="social-card-rank">
                    <span className="rank-number">#{company.rank?.position || '–'}</span>
                    <span className={`rank-tier-pill ${company.rank?.tier === 'High signal' ? 'tier-high' : 'tier-emerging'}`}>{company.rank?.tier || 'Signal'}</span>
                  </div>
                </div>
                <p className="social-card-summary">{company.summary}</p>
                <div className="social-card-metrics">
                  <div className="social-metric">
                    <strong>{company.growth}</strong>
                    <span>Growth</span>
                  </div>
                  <div className="social-metric">
                    <strong>{company.retention}</strong>
                    <span>Retention</span>
                  </div>
                  <div className="social-metric">
                    <strong>{company.pipeline}</strong>
                    <span>Pipeline</span>
                  </div>
                  <div className="social-metric">
                    <strong>★ {company.rating}</strong>
                    <span>Rating</span>
                  </div>
                </div>
                <div className="social-card-footer">
                  <span className={`sharing-pill ${canShare ? 'pill-success' : 'pill-neutral'}`}>
                    {canShare ? '⬤ Metrics shared' : '⬤ Private'}
                  </span>
                  <div className="social-card-actions">
                    <button
                      type="button"
                      className="card-action-btn"
                      onClick={() => handleToggleSharing(company.id)}
                      disabled={sharingCompanyId === company.id}
                    >
                      {sharingCompanyId === company.id ? 'Updating...' : (canShare ? 'Restrict' : 'Share metrics')}
                    </button>
                    <Link to={`/company/${company.id}`} className="card-action-btn card-action-primary">View profile</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Meetups and company sessions</h2>
          <span>Invite trusted peers, experts, and advisors</span>
        </div>
        <div className="meeting-list">
          {meetingsData.map((meeting) => {
            const company = companies.find((entry) => entry.id === meeting.companyId);
            const visible = company?.metricsSharing === 'accepted';

            return (
              <article key={meeting.id} className="meeting-card">
                <div>
                  <h3>{meeting.topic}</h3>
                  <p>{company?.name} · {meeting.schedule}</p>
                  <p className="meeting-host">Hosted by {meeting.host}</p>
                </div>
                <span className={`pill ${visible ? 'pill-success' : 'pill-neutral'}`}>
                  {visible ? 'Metrics shared' : 'Private'}
                </span>
                <p className="meeting-note">{visible ? 'Shared metrics are visible to approved participants.' : 'Metrics stay hidden until the company profile accepts sharing.'}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel" id="advice-support">
        <div className="section-header">
          <div>
            <p className="eyebrow">Network action</p>
            <h2 className="section-title">Advice and peer support</h2>
          </div>
          <span className="section-meta">
            {(adviceRequests || []).filter((request) => !request.status || request.status === 'open').length} open
          </span>
        </div>

        <form
          className="advice-compose-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setAdviceMessage({ type: '', text: '' });
            setAdviceSaving(true);
            try {
              const response = await fetch(`${apiUrl}/api/advice-requests`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  title: adviceForm.title,
                  detail: adviceForm.detail
                })
              });
              const data = await response.json();
              if (!response.ok) {
                throw new Error(data.error || 'Unable to post advice request');
              }
              setAdviceRequests((current) => [data, ...(current || []).filter((item) => item.id !== data.id)]);
              setAdviceForm({ title: '', detail: '' });
              setAdviceMessage({ type: 'success', text: 'Advice request posted to the network.' });
            } catch (error) {
              setAdviceMessage({ type: 'error', text: error.message || 'Unable to post advice request.' });
            } finally {
              setAdviceSaving(false);
            }
          }}
        >
          <label>
            What do you need help with?
            <input
              value={adviceForm.title}
              required
              minLength={8}
              maxLength={160}
              onChange={(event) => setAdviceForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Need help with retention strategy"
            />
          </label>
          <label>
            Add context for peers
            <textarea
              value={adviceForm.detail}
              required
              minLength={20}
              maxLength={1000}
              rows={3}
              onChange={(event) => setAdviceForm((current) => ({ ...current, detail: event.target.value }))}
              placeholder="Share the stage you are at, what you have tried, and the kind of peer input that would help."
            />
          </label>
          <div className="advice-compose-actions">
            <button type="submit" disabled={adviceSaving}>
              {adviceSaving ? 'Posting...' : 'Ask the network'}
            </button>
          </div>
          {adviceMessage.text && (
            <p className={adviceMessage.type === 'error' ? 'error-note' : 'success-note'}>
              {adviceMessage.text}
            </p>
          )}
        </form>

        <div className="advice-list">
          {(adviceRequests || []).length === 0 && (
            <p className="advice-empty">No open advice requests yet. Be the first to ask the network.</p>
          )}
          {(adviceRequests || []).map((request) => {
            const authorLabel = request.authorName || request.author || 'Network member';
            const isOwn = user && request.authorUserId && String(request.authorUserId) === String(user.id);
            const isOpen = !request.status || request.status === 'open';
            const offers = request.offers || [];
            return (
              <article key={request.id} className="advice-card">
                <div className="advice-card-top">
                  <h3>{request.title}</h3>
                  <span className={`intro-status-badge intro-status-${isOpen ? 'pending' : 'closed'}`}>
                    {isOpen ? 'open' : 'closed'}
                  </span>
                </div>
                <p>{request.detail}</p>
                <span>Requested by {authorLabel}{request.offerCount ? ` · ${request.offerCount} offer${request.offerCount === 1 ? '' : 's'}` : ''}</span>

                {offers.length > 0 && (
                  <ul className="advice-offers-list">
                    {offers.map((offer) => (
                      <li key={offer.id}>
                        <strong>{offer.helperName}</strong>
                        <span>{offer.message}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="advice-card-actions">
                  {isOwn && isOpen && (
                    <button
                      type="button"
                      className="card-action-btn"
                      disabled={closingAdviceId === request.id}
                      onClick={async () => {
                        setClosingAdviceId(request.id);
                        try {
                          const response = await fetch(`${apiUrl}/api/advice-requests/${request.id}/close`, {
                            method: 'PATCH',
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          const data = await response.json();
                          if (!response.ok) {
                            throw new Error(data.error || 'Unable to close request');
                          }
                          setAdviceRequests((current) => (current || []).filter((item) => item.id !== request.id));
                        } catch (error) {
                          setAdviceMessage({ type: 'error', text: error.message || 'Unable to close request.' });
                        } finally {
                          setClosingAdviceId('');
                        }
                      }}
                    >
                      {closingAdviceId === request.id ? 'Closing...' : 'Mark closed'}
                    </button>
                  )}

                  {!isOwn && isOpen && request.authorUserId && (
                    <div className="advice-offer-box">
                      <label>
                        Offer help
                        <textarea
                          rows={2}
                          maxLength={1000}
                          value={offerDrafts[request.id] || ''}
                          onChange={(event) => setOfferDrafts((current) => ({
                            ...current,
                            [request.id]: event.target.value
                          }))}
                          placeholder="Share what you can help with and how to connect."
                        />
                      </label>
                      <button
                        type="button"
                        className="card-action-btn card-action-primary"
                        disabled={offeringAdviceId === request.id}
                        onClick={async () => {
                          setOfferingAdviceId(request.id);
                          setAdviceMessage({ type: '', text: '' });
                          try {
                            const response = await fetch(`${apiUrl}/api/advice-requests/${request.id}/offers`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify({ message: offerDrafts[request.id] || '' })
                            });
                            const data = await response.json();
                            if (!response.ok) {
                              throw new Error(data.error || 'Unable to offer help');
                            }
                            setAdviceRequests((current) => (current || []).map((item) => (
                              item.id === request.id ? data.request : item
                            )));
                            setOfferDrafts((current) => ({ ...current, [request.id]: '' }));
                            setAdviceMessage({ type: 'success', text: 'Offer sent. The requester will be notified.' });
                          } catch (error) {
                            setAdviceMessage({ type: 'error', text: error.message || 'Unable to offer help.' });
                          } finally {
                            setOfferingAdviceId('');
                          }
                        }}
                      >
                        {offeringAdviceId === request.id ? 'Sending...' : 'Send offer'}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Smart matching</p>
            <h2 className="section-title">Companies worth connecting with</h2>
          </div>
          <span className="section-meta">Ranked by signal strength and network compatibility</span>
        </div>
        <div className="suggested-grid">
          {companies.slice(0, 3).map((company, i) => {
            const growth = parseFloat(company.growth?.replace(/[^0-9.]/g, '') || 0);
            const retention = parseFloat(company.retention?.replace('%', '') || 0);
            const fitReasons = [
              company.rank?.tier === 'High signal' && 'High signal operator',
              growth >= 25 && `${company.growth} YoY growth`,
              retention >= 90 && `${company.retention} retention`,
              company.hubspotStatus === 'Connected' && 'HubSpot connected',
              company.metricsSharing === 'accepted' && 'Metrics open to network',
            ].filter(Boolean).slice(0, 3);
            return (
              <article key={company.id} className="suggested-card">
                <div className="suggested-top">
                  <span className="suggested-rank">#{i + 1}</span>
                  <span className="suggested-tier">{company.rank?.tier || 'Signal'}</span>
                </div>
                <h3 className="suggested-name">{company.name}</h3>
                <p className="suggested-sector">{company.sector}</p>
                <ul className="suggested-reasons">
                  {fitReasons.map((r) => <li key={r}><span aria-hidden="true">✓</span>{r}</li>)}
                </ul>
                <Link to={`/company/${company.id}`} className="action-link suggested-link">View profile</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Vendor matches</p>
            <h2 className="section-title">Recommended for top profile</h2>
          </div>
          <span className="section-meta">Ranked by fit, outcomes, and budget alignment</span>
        </div>
        <div className="vendor-grid">
          {recommendedVendors.map((vendor) => (
            <article key={vendor.id} className="vendor-card">
              <div className="vendor-top">
                <h3>{vendor.name}</h3>
                <span>{vendor.tier}</span>
              </div>
              <p>{vendor.description}</p>
              <strong>{vendor.category}</strong>
              <p className="vendor-match">Match score: {vendor.match?.score ?? 'N/A'}</p>
              <ul className="vendor-reasons">
                {(vendor.match?.reasons || []).map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {introRequests && introRequests.length > 0 && (
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Marketplace</p>
              <h2 className="section-title">My intro requests</h2>
            </div>
            <span className="section-meta">{introRequests.filter((r) => r.status === 'pending').length} pending</span>
          </div>
          <div className="intro-requests-list">
            {introRequests.map((req) => (
              <div key={req.id} className="intro-request-row">
                <div className="intro-request-info">
                  <strong>{req.vendorId}</strong>
                  {req.message && <p className="intro-request-message">&ldquo;{req.message}&rdquo;</p>}
                  <span className="intro-request-date">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`intro-status-badge intro-status-${req.status}`}>{req.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Consulting workspace</p>
            <h2 className="section-title">Engagement communication and outcomes</h2>
          </div>
          <span className="section-meta">Phase 1-3 live</span>
        </div>

        <div className="engagements-toolbar">
          <select
            value={selectedEngagementId || ''}
            onChange={(e) => setSelectedEngagementId(Number(e.target.value) || null)}
          >
            <option value="">Select engagement</option>
            {engagements.map((entry) => (
              <option key={entry.id} value={entry.id}>
                #{entry.id} {entry.title} · {entry.vendorId}
              </option>
            ))}
          </select>
          <span>{engagements.length} active engagement{engagements.length === 1 ? '' : 's'}</span>
        </div>

        {workspaceLoading && <p>Loading workspace...</p>}
        {workspaceError && <p className="error-note">{workspaceError}</p>}

        {workspace && (
          <div className="engagements-grid">
            <article className="engagement-card">
              <h3>Communication</h3>
              <div className="engagement-chat-log">
                {(workspace.messages || []).map((msg) => (
                  <div key={msg.id} className="engagement-chat-item">
                    <strong>{msg.authorName || user.name}</strong>
                    <span>{msg.channel}</span>
                    <p>{msg.body}</p>
                  </div>
                ))}
              </div>
              <textarea
                rows={3}
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                placeholder="Share a consulting note or update"
              />
              <button type="button" onClick={handleSendMessage} disabled={messageSending || !messageDraft.trim()}>
                {messageSending ? 'Sending...' : 'Send message'}
              </button>
            </article>

            <article className="engagement-card">
              <h3>Milestones and consultant fees</h3>
              <div className="engagement-milestones">
                {(workspace.milestones || []).map((m) => (
                  <div key={m.id} className="engagement-milestone-row">
                    <div>
                      <strong>{m.title}</strong>
                      <p>${m.amount.toLocaleString()} · {m.status}</p>
                    </div>
                    <select value={m.status} onChange={(e) => handleMilestoneStatusChange(m.id, e.target.value)}>
                      <option value="planned">planned</option>
                      <option value="funded">funded</option>
                      <option value="in_progress">in_progress</option>
                      <option value="submitted">submitted</option>
                      <option value="approved">approved</option>
                      <option value="paid">paid</option>
                    </select>
                    {['Founder', 'Admin'].includes(String(user.role || '')) && m.status !== 'paid' && (
                      <button
                        type="button"
                        className="card-action-btn"
                        disabled={checkoutLoadingMilestoneId === m.id}
                        onClick={() => handleCreateCheckout(m.id)}
                      >
                        {checkoutLoadingMilestoneId === m.id ? 'Creating...' : 'Create checkout'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {checkoutMessage && <p className="engagement-checkout-message">{checkoutMessage}</p>}
              <input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} placeholder="Milestone title" />
              <input type="number" min="0" value={milestoneAmount} onChange={(e) => setMilestoneAmount(e.target.value)} placeholder="Amount" />
              <input type="date" value={milestoneDueDate} onChange={(e) => setMilestoneDueDate(e.target.value)} />
              <button type="button" onClick={handleAddMilestone} disabled={milestoneSaving || !milestoneTitle.trim()}>
                {milestoneSaving ? 'Adding...' : 'Add milestone'}
              </button>
            </article>

            <article className="engagement-card">
              <h3>Calls and channels</h3>
              <div className="engagement-call-list">
                {(workspace.calls || []).map((call) => (
                  <div key={call.id} className="engagement-call-row">
                    <strong>{call.provider}</strong>
                    <p>{new Date(call.scheduledAt).toLocaleString()}</p>
                    <a href={call.meetingUrl} target="_blank" rel="noreferrer">Open call link</a>
                  </div>
                ))}
              </div>
              <select value={callProvider} onChange={(e) => setCallProvider(e.target.value)}>
                <option value="meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="other">Other</option>
              </select>
              <input value={callUrl} onChange={(e) => setCallUrl(e.target.value)} placeholder="Meeting URL" />
              <input type="datetime-local" value={callScheduledAt} onChange={(e) => setCallScheduledAt(e.target.value)} />
              <textarea rows={2} value={callAgenda} onChange={(e) => setCallAgenda(e.target.value)} placeholder="Call agenda" />
              <button type="button" onClick={handleScheduleCall} disabled={callSaving || !callUrl.trim() || !callScheduledAt}>
                {callSaving ? 'Scheduling...' : 'Schedule call'}
              </button>
            </article>

            <article className="engagement-card">
              <h3>Outcome tracking</h3>
              <div className="engagement-outcome-grid">
                <label>Baseline growth %<input type="number" value={outcomeForm.baselineGrowth} onChange={(e) => setOutcomeForm((s) => ({ ...s, baselineGrowth: e.target.value }))} /></label>
                <label>Current growth %<input type="number" value={outcomeForm.currentGrowth} onChange={(e) => setOutcomeForm((s) => ({ ...s, currentGrowth: e.target.value }))} /></label>
                <label>Baseline retention %<input type="number" value={outcomeForm.baselineRetention} onChange={(e) => setOutcomeForm((s) => ({ ...s, baselineRetention: e.target.value }))} /></label>
                <label>Current retention %<input type="number" value={outcomeForm.currentRetention} onChange={(e) => setOutcomeForm((s) => ({ ...s, currentRetention: e.target.value }))} /></label>
                <label>Baseline pipeline<input type="number" value={outcomeForm.baselinePipeline} onChange={(e) => setOutcomeForm((s) => ({ ...s, baselinePipeline: e.target.value }))} /></label>
                <label>Current pipeline<input type="number" value={outcomeForm.currentPipeline} onChange={(e) => setOutcomeForm((s) => ({ ...s, currentPipeline: e.target.value }))} /></label>
              </div>
              <p className="engagement-roi">ROI: {(workspace.outcome?.roiPercent ?? 0).toFixed(2)}%</p>
              <button type="button" onClick={handleSaveOutcome} disabled={outcomeSaving}>
                {outcomeSaving ? 'Saving...' : 'Save outcome snapshot'}
              </button>
            </article>

            <article className="engagement-card">
              <h3>Payments tab</h3>
              <div className="engagement-payment-list">
                {(!workspace.payments || workspace.payments.length === 0) && (
                  <p className="engagement-checkout-message">No payment events yet.</p>
                )}
                {(workspace.payments || []).map((payment) => (
                  <div key={payment.id} className="engagement-payment-row">
                    <div>
                      <strong>{payment.eventType.replace(/_/g, ' ')}</strong>
                      <p>{payment.provider.toUpperCase()} · {payment.status}</p>
                    </div>
                    <div className="engagement-payment-right">
                      <strong>${Number(payment.amount || 0).toLocaleString()} {payment.currency}</strong>
                      <span>{new Date(payment.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Alerts</p>
            <h2 className="section-title">Notification center</h2>
          </div>
          <span className="section-meta">{notifications.filter((n) => !n.readAt).length} unread</span>
        </div>
        {notificationError && <p className="error-note">{notificationError}</p>}
        <div className="notification-list">
          {notifications.length === 0 && <p>No notifications yet.</p>}
          {notifications.map((item) => (
            <article key={item.id} className={`notification-item${item.readAt ? ' notification-item-read' : ''}`}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div className="notification-meta">
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                {!item.readAt && (
                  <button type="button" className="card-action-btn" onClick={() => markNotificationRead(item.id)}>
                    Mark read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel composer">
        <h2>Create a post</h2>
        <form onSubmit={handlePostSubmit}>
          <label>
            Name
            <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Your name" />
          </label>
          <label>
            What do you want to share?
            <textarea value={content} onChange={(event) => setContent(event.target.value)} rows="4" placeholder="Write something inspiring..." />
          </label>
          <button type="submit" disabled={isPublishing || !content.trim()}>{isPublishing ? 'Publishing...' : 'Publish'}</button>
        </form>
      </section>

      <section className="panel feed">
        <div className="section-header">
          <h2>Community feed</h2>
          <span role="status" aria-live="polite">{status}</span>
        </div>
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            <div className="post-meta">
              <strong>{post.author}</strong>
              <span>{new Date(post.created_at || post.createdAt).toLocaleString()}</span>
            </div>
            <p>{post.content}</p>
          </article>
        ))}
      </section>
      </main>
    </div>
  );
}

export default DashboardPage;
