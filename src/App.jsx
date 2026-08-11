import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import CompanyOnboardingPage from './pages/CompanyOnboardingPage';
import AuthPage from './pages/AuthPage';
import {
  adviceRequests,
  fallbackCompanies,
  fallbackFeed,
  fallbackMeetings,
  fallbackVendors,
  heroStats
} from './data/networkData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USER_STORAGE_KEY = 'companyboard-user';
const TOKEN_STORAGE_KEY = 'companyboard-token';
const LEGACY_USER_STORAGE_KEY = 'pulseboard-user';
const LEGACY_TOKEN_STORAGE_KEY = 'pulseboard-token';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [author, setAuthor] = useState('Guest');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Loading posts...');
  const [companies, setCompanies] = useState(fallbackCompanies);
  const [vendors, setVendors] = useState(fallbackVendors);
  const [recommendedVendors, setRecommendedVendors] = useState(fallbackVendors.map((vendor) => ({
    ...vendor,
    match: {
      score: 0,
      reasons: ['Recommendations will load after profiles are ranked.']
    }
  })));
  const [meetingsData, setMeetingsData] = useState(fallbackMeetings);
  const [previewFeedItems, setPreviewFeedItems] = useState(fallbackFeed);
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }

      const legacyUser = window.localStorage.getItem(LEGACY_USER_STORAGE_KEY);
      if (!legacyUser) {
        return null;
      }

      const parsedLegacyUser = JSON.parse(legacyUser);
      window.localStorage.setItem(USER_STORAGE_KEY, legacyUser);
      window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
      return parsedLegacyUser;
    } catch {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return '';
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      return savedToken;
    }

    const legacyToken = window.localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
    if (!legacyToken) {
      return '';
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, legacyToken);
    window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    return legacyToken;
  });
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Founder',
    companyName: '',
    companyDomain: '',
    linkedinCompanyUrl: ''
  });
  const [authMessage, setAuthMessage] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('profiles');
  const [introRequests, setIntroRequests] = useState([]);

  useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');

    const pageMeta = {
      '/': {
        title: 'CompanyBoard | Trusted Company Network',
        description: 'Discover ranked company profiles, selective metrics sharing, and premium partner discovery on CompanyBoard.'
      },
      '/login': {
        title: 'Sign In | CompanyBoard',
        description: 'Sign in to CompanyBoard to access trusted company profiles and private network insights.'
      },
      '/signup': {
        title: 'Create Account | CompanyBoard',
        description: 'Join CompanyBoard to share company metrics selectively and connect with vetted growth partners.'
      },
      '/app': {
        title: 'Dashboard | CompanyBoard',
        description: 'Track company profiles, peer activity, and advisory opportunities in your CompanyBoard dashboard.'
      },
      '/marketplace': {
        title: 'Marketplace | CompanyBoard',
        description: 'Browse premium vendors and growth operators in the CompanyBoard marketplace.'
      },
      '/company': {
        title: 'Company Profile | CompanyBoard',
        description: 'Inspect company trust signals, ranking logic, and matched vendors on CompanyBoard.'
      },
      '/onboarding': {
        title: 'Company Onboarding | CompanyBoard',
        description: 'Create your company profile and submit baseline metrics for trusted ranking.'
      }
    };

    const selection = location.pathname.startsWith('/company/')
      ? pageMeta['/company']
      : (pageMeta[location.pathname] || pageMeta['/']);
    document.title = selection.title;

    if (metaDescription) {
      metaDescription.setAttribute('content', selection.description);
    }
  }, [location.pathname]);

  async function loadPosts() {
    try {
      const response = await fetch(`${API_URL}/api/posts`);
      const data = await response.json();
      setPosts(data);
      setStatus(data.length ? 'Posts loaded' : 'No posts yet. Be the first to share.');
    } catch (error) {
      setStatus('Backend is offline. Start the Node server to sync feeds.');
    }
  }

  useEffect(() => {
    loadPosts();
    loadNetworkData();
  }, []);

  useEffect(() => {
    if (user) {
      setAuthor(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/signup') {
      setAuthMode('signup');
    }
    if (location.pathname === '/login' || location.pathname === '/') {
      setAuthMode('login');
    }
  }, [location.pathname]);

  useEffect(() => {
    let isActive = true;

    async function hydrateSession() {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const data = await response.json();
        if (!isActive) {
          return;
        }

        const nextUser = data?.user || null;
        setUser(nextUser);
        if (nextUser) {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setUser(null);
        setToken('');
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      }
    }

    hydrateSession();

    return () => {
      isActive = false;
    };
  }, [token]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthSubmitting(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : {
            name: authForm.name,
            email: authForm.email,
            password: authForm.password,
            role: authForm.role,
            companyName: authForm.companyName,
            companyDomain: authForm.companyDomain,
            linkedinCompanyUrl: authForm.linkedinCompanyUrl
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      const nextUser = data?.user || null;
      const nextToken = data?.token || '';
      setUser(nextUser);
      setToken(nextToken);
      if (nextUser) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
      if (nextToken) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      setAuthForm({
        name: '',
        email: '',
        password: '',
        role: 'Founder',
        companyName: '',
        companyDomain: '',
        linkedinCompanyUrl: ''
      });
      const isSignup = authMode === 'signup';
      setAuthMessage(isSignup ? `Welcome aboard, ${data.user.name}` : `Welcome back, ${data.user.name}`);
      navigate(isSignup ? '/onboarding' : '/app');
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleLogout() {
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        // Ignore network errors while logging out locally.
      }
    }

    setUser(null);
    setToken('');
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    setAuthMessage('You have been signed out.');
    navigate('/');
  }

  function handleSessionExpired(message = 'Your session expired. Please sign in again.') {
    setUser(null);
    setToken('');
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    setAuthMessage(message);
    navigate('/login');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ author, content })
      });

      const newPost = await response.json();
      if (response.status === 401) {
        handleSessionExpired(newPost.error || 'Your session expired. Please sign in again.');
        return;
      }

      if (response.ok) {
        setPosts((current) => [newPost, ...current]);
        setContent('');
        setStatus('Post published');
      } else {
        setStatus(newPost.error || 'Unable to publish post right now.');
      }
    } catch (error) {
      setStatus('Unable to publish post right now.');
    }
  }

  async function loadNetworkData() {
    try {
      const [companiesRes, vendorsRes, meetingsRes, feedRes] = await Promise.all([
        fetch(`${API_URL}/api/companies/ranked`),
        fetch(`${API_URL}/api/vendors`),
        fetch(`${API_URL}/api/meetings`),
        fetch(`${API_URL}/api/feed`)
      ]);

      let preferredCompanyId = '';

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
        preferredCompanyId = companiesData[0]?.id || '';
      }

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData);
      }

      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        setMeetingsData(meetingsData);
      }

      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setPreviewFeedItems(feedData);
      }

      if (preferredCompanyId) {
        const recommendedRes = await fetch(`${API_URL}/api/vendors/recommended/${preferredCompanyId}`);
        if (recommendedRes.ok) {
          const recommendedData = await recommendedRes.json();
          setRecommendedVendors(recommendedData);
        }
      }

      if (token) {
        const introRes = await fetch(`${API_URL}/api/intro-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (introRes.ok) {
          setIntroRequests(await introRes.json());
        }
      }
    } catch (error) {
      console.warn('Failed to load network data', error);
    }
  }

  async function toggleMetricsSharing(companyId) {
    try {
      const response = await fetch(`${API_URL}/api/companies/${companyId}/share`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const updatedCompany = await response.json();

      if (response.status === 401) {
        handleSessionExpired(updatedCompany.error || 'Your session expired. Please sign in again.');
        return;
      }

      if (!response.ok) {
        setStatus(updatedCompany.error || 'Unable to update sharing status.');
        return;
      }

      setCompanies((current) =>
        current.map((company) =>
          company.id === companyId ? updatedCompany : company
        )
      );
    } catch (error) {
      setStatus('Unable to update company sharing status.');
    }
  }

  if (!user) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              heroStats={heroStats}
              previewFeedItems={previewFeedItems}
            />
          }
        />
        <Route
          path="/login"
          element={
            <AuthPage
              mode="login"
              authForm={authForm}
              setAuthForm={setAuthForm}
              authMessage={authMessage}
              handleAuthSubmit={handleAuthSubmit}
              authSubmitting={authSubmitting}
              apiUrl={API_URL}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <AuthPage
              mode="signup"
              authForm={authForm}
              setAuthForm={setAuthForm}
              authMessage={authMessage}
              handleAuthSubmit={handleAuthSubmit}
              authSubmitting={authSubmitting}
              apiUrl={API_URL}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route
        path="/app"
        element={
          <DashboardPage
            user={user}
            handleLogout={handleLogout}
            heroStats={heroStats}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            companies={companies}
            meetingsData={meetingsData}
            adviceRequests={adviceRequests}
            status={status}
            posts={posts}
            author={author}
            setAuthor={setAuthor}
            content={content}
            setContent={setContent}
            handleSubmit={handleSubmit}
            toggleMetricsSharing={toggleMetricsSharing}
            recommendedVendors={recommendedVendors}
            introRequests={introRequests}
            token={token}
            apiUrl={API_URL}
          />
        }
      />
      <Route
        path="/marketplace"
        element={
          <MarketplacePage
            user={user}
            vendors={vendors}
            companies={companies}
            token={token}
            apiUrl={API_URL}
            handleLogout={handleLogout}
          />
        }
      />
      <Route
        path="/company/:companyId"
        element={
          <CompanyProfilePage
            user={user}
            handleLogout={handleLogout}
            apiUrl={API_URL}
            token={token}
          />
        }
      />
      <Route
        path="/onboarding"
        element={
          <CompanyOnboardingPage
            user={user}
            handleLogout={handleLogout}
            apiUrl={API_URL}
            token={token}
          />
        }
      />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export default App;
