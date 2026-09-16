import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import AuthScreen from './screens/AuthScreen';
import FarmerHomeScreen from './screens/FarmerHomeScreen';
import SlotBookingScreen from './screens/SlotBookingScreen';
import PaymentTrackingScreen from './screens/PaymentTrackingScreen';
import AnalysisReportsScreen from './screens/AnalysisReportsScreen';
import ProcurerInspectionScreen from './screens/ProcurerInspectionScreen';
import VillageWeatherScreen from './screens/VillageWeatherScreen';
import VoiceChatbotModal from './components/VoiceChatbotModal';
import './styles/mobile.css';

/* ------------------------------------------------------------------
 * Detect which portal we're on from the URL path
 * /farmer   → locked to FARMER role
 * /procurer → locked to PROCURER role
 * anything else → show role switcher (legacy /mobile behaviour)
 * ------------------------------------------------------------------ */
function detectPortalRole() {
  const path = window.location.pathname;
  if (path.startsWith('/farmer')) return 'FARMER';
  if (path.startsWith('/procurer')) return 'PROCURER';
  return null; // show switcher
}

/* ------------------------------------------------------------------
 * Role Selection Landing Page (shown when no role locked by URL)
 * ------------------------------------------------------------------ */
function RoleLandingPage() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #064e3b 0%, #065f46 40%, #047857 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Top Language Switcher Bar on Landing Page */}
      <div style={{
        display: 'flex',
        background: 'rgba(0,0,0,0.3)',
        padding: '4px',
        borderRadius: '20px',
        gap: '4px',
        marginBottom: '1.5rem',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <button
          onClick={() => setLang('te')}
          style={{
            background: lang === 'te' ? '#10b981' : 'transparent',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          తెలుగు
        </button>
        <button
          onClick={() => setLang('hi')}
          style={{
            background: lang === 'hi' ? '#10b981' : 'transparent',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          हिंदी
        </button>
        <button
          onClick={() => setLang('en')}
          style={{
            background: lang === 'en' ? '#10b981' : 'transparent',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          English
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3.2rem', marginBottom: '0.4rem' }}>🌾</div>
        <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '0.5px' }}>
          {t('appTitle')}
        </h1>
        <p style={{ color: '#a7f3d0', fontSize: '0.92rem', marginTop: '0.4rem', fontWeight: 600 }}>
          {t('appSubtitle')}
        </p>
      </div>

      <p style={{ color: '#d1fae5', fontSize: '1.05rem', marginBottom: '1.5rem', fontWeight: 700, textAlign: 'center' }}>
        {t('whoAreYou')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '340px' }}>
        <a
          href="/farmer"
          style={{
            background: '#ffffff',
            color: '#064e3b',
            borderRadius: '18px',
            padding: '1.15rem 1.4rem',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 6px 22px rgba(0,0,0,0.3)',
            transition: 'transform 0.15s'
          }}
        >
          <span style={{ fontSize: '2.2rem' }}>👨‍🌾</span>
          <div>
            <div style={{ fontWeight: 800 }}>{t('farmerRoleTitle')}</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#047857', marginTop: '3px' }}>
              {t('farmerRoleDesc')}
            </div>
          </div>
        </a>

        <a
          href="/procurer"
          style={{
            background: 'rgba(255,255,255,0.14)',
            color: '#ffffff',
            borderRadius: '18px',
            padding: '1.15rem 1.4rem',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1.5px solid rgba(255,255,255,0.35)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.15s'
          }}
        >
          <span style={{ fontSize: '2.2rem' }}>🏬</span>
          <div>
            <div style={{ fontWeight: 800 }}>{t('procurerRoleTitle')}</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#a7f3d0', marginTop: '3px' }}>
              {t('procurerRoleDesc')}
            </div>
          </div>
        </a>

        <a
          href="/admin"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: '#d1fae5',
            borderRadius: '18px',
            padding: '1rem 1.4rem',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.98rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 800 }}>{t('adminRoleTitle')}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 500, color: '#6ee7b7', marginTop: '3px' }}>
              {t('adminRoleDesc')}
            </div>
          </div>
        </a>
      </div>

      <p style={{ color: '#6ee7b7', fontSize: '0.75rem', marginTop: '2.5rem', textAlign: 'center', fontWeight: 600 }}>
        {t('telanganaGovtFoot')}
      </p>
    </div>
  );
}

function MainApp() {
  const { lang, setLang, t } = useLanguage();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Detect portal role from URL
  const portalRole = detectPortalRole();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('dhaan_mitra_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {}
    return {
      id: 'FARM-101',
      farmerId: 'FARM-101',
      name: 'Rambabu Peddinti',
      phone: '+91 94401 23456',
      village: 'Gundlapally',
      aadhaar: 'XXXX-XXXX-4912',
      bankAcc: 'SBI ****4821',
      passbook: 'Survey #412/A (3.5 Acres)'
    };
  });

  const [role, setRole] = useState(() => {
    if (portalRole) return portalRole;
    return localStorage.getItem('dhaan_mitra_role') || 'FARMER';
  });

  const [currentTab, setCurrentTab] = useState(() => {
    const r = portalRole || localStorage.getItem('dhaan_mitra_role') || 'FARMER';
    return r === 'FARMER' ? 'home' : 'inspect';
  });

  useEffect(() => {
    if (portalRole && role !== portalRole) {
      setRole(portalRole);
      setCurrentTab(portalRole === 'FARMER' ? 'home' : 'inspect');
    }
  }, [portalRole]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    try { localStorage.setItem('dhaan_mitra_user', JSON.stringify(userData)); } catch (e) {}
  };

  const handleRoleChange = (newRole) => {
    if (portalRole) return;
    setRole(newRole);
    try { localStorage.setItem('dhaan_mitra_role', newRole); } catch (e) {}
    setCurrentTab(newRole === 'FARMER' ? 'home' : 'inspect');
  };

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div>
      {/* Mobile Header Bar */}
      <header className="mobile-header">
        <div className="mobile-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: '#ffffff', color: '#064e3b', width: '32px', height: '32px',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}>
              🌾
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', letterSpacing: '0.5px' }}>
                {t('appTitle')}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#a7f3d0', fontWeight: 700 }}>
                {portalRole === 'FARMER'
                  ? (lang === 'te' ? '👨‍🌾 రైతు పోర్టల్' : lang === 'hi' ? '👨‍🌾 किसान पोर्टल' : '👨‍🌾 Farmer Portal')
                  : portalRole === 'PROCURER'
                    ? (lang === 'te' ? '🏬 కొనుగోలుదారు పోర్టల్' : lang === 'hi' ? '🏬 खरीददार पोर्टल' : '🏬 Procurer Portal')
                    : (lang === 'te' ? 'తెలంగాణ కొనుగోలు వ్యవస్థ' : 'Telangana Procurement')}
              </div>
            </div>
          </div>

          {/* Controls: Voice + 3-Language Selector + Switch Account */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {role === 'FARMER' && (
              <button
                style={{
                  background: 'rgba(255,255,255,0.25)', color: '#ffffff',
                  border: '1.5px solid rgba(255,255,255,0.4)', padding: '4px 7px',
                  borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                }}
                onClick={() => setIsChatbotOpen(true)}
                title="Open DhaanVaani Voice Assistant"
              >
                <span>🎙️</span>
                <span>వాయిస్</span>
              </button>
            )}

            {/* Language Selector 3-pill group */}
            <div style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.25)',
              padding: '2px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.25)'
            }}>
              <button
                style={{
                  background: lang === 'te' ? '#ffffff' : 'transparent',
                  color: lang === 'te' ? '#064e3b' : '#ffffff',
                  border: 'none',
                  padding: '3px 6px',
                  borderRadius: '7px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                onClick={() => setLang('te')}
                title="తెలుగు"
              >
                తెలుగు
              </button>
              <button
                style={{
                  background: lang === 'hi' ? '#ffffff' : 'transparent',
                  color: lang === 'hi' ? '#064e3b' : '#ffffff',
                  border: 'none',
                  padding: '3px 6px',
                  borderRadius: '7px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                onClick={() => setLang('hi')}
                title="हिंदी"
              >
                हिंदी
              </button>
              <button
                style={{
                  background: lang === 'en' ? '#ffffff' : 'transparent',
                  color: lang === 'en' ? '#064e3b' : '#ffffff',
                  border: 'none',
                  padding: '3px 6px',
                  borderRadius: '7px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                onClick={() => setLang('en')}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Only show role switcher when NOT locked by URL */}
            {!portalRole && (
              <div className="role-switcher">
                <button className={`role-btn ${role === 'FARMER' ? 'active' : ''}`} onClick={() => handleRoleChange('FARMER')}>
                  {lang === 'te' ? 'రైతు' : lang === 'hi' ? 'किसान' : 'Farmer'}
                </button>
                <button className={`role-btn ${role === 'PROCURER' ? 'active' : ''}`} onClick={() => handleRoleChange('PROCURER')}>
                  {lang === 'te' ? 'కొనుగోలుదారు' : lang === 'hi' ? 'खरीदार' : 'Procurer'}
                </button>
              </div>
            )}

            <button
              style={{
                background: 'rgba(255,255,255,0.15)', color: '#fef08a', border: 'none',
                padding: '4px 6px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer'
              }}
              title="Switch / Change Account"
              onClick={() => {
                if (window.confirm(lang === 'te' ? 'వేరే ఖాతాకు మారాలా?' : lang === 'hi' ? 'खाता बदलें?' : 'Switch farmer account?')) {
                  localStorage.removeItem('dhaan_mitra_user');
                  setUser(null);
                }
              }}
            >
              🔄
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen Body */}
      <main className="mobile-body">
        {role === 'FARMER' ? (
          <>
            {currentTab === 'home' && <FarmerHomeScreen navigateTo={tab => setCurrentTab(tab)} farmer={user} openChatbot={() => setIsChatbotOpen(true)} />}
            {currentTab === 'weather' && <VillageWeatherScreen navigateTo={tab => setCurrentTab(tab)} farmer={user} />}
            {currentTab === 'book' && <SlotBookingScreen navigateTo={tab => setCurrentTab(tab)} farmer={user} />}
            {currentTab === 'payments' && <PaymentTrackingScreen farmer={user} />}
            {currentTab === 'reports' && <AnalysisReportsScreen farmer={user} />}
          </>
        ) : (
          <ProcurerInspectionScreen procurer={user} />
        )}
      </main>

      {/* Floating DhaanVaani Orb Button for Farmers */}
      {role === 'FARMER' && (
        <button
          className="floating-voice-orb"
          onClick={() => setIsChatbotOpen(true)}
          title="Open DhaanVaani"
          aria-label="DhaanVaani"
        >
          <span className="orb-icon">🎙️</span>
          <span className="orb-label">DhaanVaani</span>
        </button>
      )}

      {/* DhaanVaani Voice Chatbot Modal */}
      <VoiceChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        farmer={user}
        onUpdateFarmer={handleAuthSuccess}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav-bar">
        {role === 'FARMER' ? (
          <>
            <div className={`nav-tab ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>
              <span className="nav-tab-icon">🏠</span>
              <span>{t('navHome')}</span>
            </div>
            <div className={`nav-tab ${currentTab === 'book' ? 'active' : ''}`} onClick={() => setCurrentTab('book')}>
              <span className="nav-tab-icon">📅</span>
              <span>{t('navBook')}</span>
            </div>
            <div className={`nav-tab ${currentTab === 'payments' ? 'active' : ''}`} onClick={() => setCurrentTab('payments')}>
              <span className="nav-tab-icon">💳</span>
              <span>{t('navPayments')}</span>
            </div>
            <div className={`nav-tab ${currentTab === 'reports' ? 'active' : ''}`} onClick={() => setCurrentTab('reports')}>
              <span className="nav-tab-icon">📋</span>
              <span>{t('navReports')}</span>
            </div>
          </>
        ) : (
          <div className="nav-tab active">
            <span className="nav-tab-icon">📸</span>
            <span>{t('grainHeapInspection')}</span>
          </div>
        )}
      </nav>
    </div>
  );
}

export default function App() {
  const portalRole = detectPortalRole();
  const isLanding = !portalRole && (
    window.location.pathname === '/' ||
    window.location.pathname === '/mobile' ||
    window.location.pathname === '/mobile/'
  );

  return (
    <LanguageProvider>
      {isLanding ? (
        <RoleLandingPage />
      ) : (
        <div className="mobile-device-wrapper">
          <MainApp />
        </div>
      )}
    </LanguageProvider>
  );
}

