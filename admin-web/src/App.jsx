import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const adminTranslations = {
  te: {
    adminTitle: 'ధాన్ మిత్ర',
    stateAdmin: 'రాష్ట్ర అడ్మిన్',
    deptOfAgri: 'వ్యవసాయ మరియు పౌర సరఫరాల శాఖ',
    dashboardNav: 'డాష్‌బోర్డ్ అవలోకనం',
    analyticsNav: 'డీప్ అనలిటిక్స్ & AI',
    centersNav: 'మార్కెట్ యార్డ్ కేంద్రాలు',
    cropsNav: 'పంట నిబంధనలు & నాణ్యత',
    disbursementsNav: 'చెల్లింపుల విడుదల',
    sihFoot: 'SIH 26032 • తెలంగాణ రాష్ట్ర ప్రభుత్వ కొనుగోలు వ్యవస్థ',

    // Titles
    dashTitle: 'రాష్ట్ర వ్యవసాయ సేకరణ కమాండ్ సెంటర్',
    analyticsTitle: 'రాష్ట్ర వ్యవసాయ ఇంటెలిజెన్స్ & AI అనలిటిక్స్',
    centersTitle: 'కొనుగోలు కేంద్రాల కేటాయింపు & సామర్థ్యం',
    cropsTitle: 'వ్యవసాయ పాలసీ & నాణ్యతా నిబంధనలు',
    disbursementsTitle: 'ప్రత్యక్ష DBT ఆర్థిక చెల్లింపుల నిర్వహణ',

    // Dashboard Metrics
    totalFarmers: 'మొత్తం నమోదైన రైతులు',
    procuredGrain: 'సేకరించిన ధాన్యం పరిమాణం',
    qualityRate: 'నాణ్యత ఆమోదం రేటు',
    disbursedPayments: 'విడుదల చేసిన చెల్లింపులు',
    acrossDistricts: '4 జిల్లాల పరిధిలో',
    paddyMaizeCotton: 'వరి, మొక్కజొన్న & పత్తి',
    fieldDryingCount: 'ఎండబెట్టడం అవసరమైనవి',
    pendingTransfers: 'పెండింగ్ ప్రత్యక్ష బదిలీలు',
    live: 'లైవ్',
    reconnecting: 'తిరిగి కనెక్ట్ అవుతోంది...',
    lastUpdated: 'చివరిగా అప్‌డేట్ చేయబడింది',

    // Tables
    yardLiveCapacity: 'మార్కెట్ యార్డ్ లైవ్ సేకరణ సామర్థ్యం',
    autoRefresh: '⚡ ప్రతి 5 సెకన్లకు ఆటో-రిఫ్రెష్ అవుతుంది',
    marketYardCenter: 'మార్కెట్ యార్డ్ కేంద్రం',
    dailyCapacity: 'రోజువారీ సామర్థ్యం',
    bookedTonnage: 'బుక్ చేసిన పరిమాణం',
    remaining: 'మిగిలిన సామర్థ్యం',
    utilizationRate: 'వినియోగ శాతం',

    recentIotInspections: 'ఇటీవలి IoT ధాన్యం తేమ తనిఖీలు',
    bookingToken: 'బుకింగ్ టోకెన్',
    moisturePct: 'తేమ %',
    temp: 'ఉష్ణోగ్రత (°C)',
    humidityPct: 'తేమ శాతం %',
    gradeDecision: 'గ్రేడ్ / నిర్ణయం',
    remarks: 'వ్యాఖ్యలు / సలహా',
    gradeA: 'గ్రేడ్ A (ఆమోదించబడింది)',
    gradeB: 'గ్రేడ్ B (ఎండబెట్టడం అవసరం)'
  },

  hi: {
    adminTitle: 'धान मित्र',
    stateAdmin: 'राज्य एडमिन',
    deptOfAgri: 'कृषि एवं नागरिक आपूर्ति विभाग',
    dashboardNav: 'डैशबोर्ड अवलोकन',
    analyticsNav: 'गहन विश्लेषण एवं एआई',
    centersNav: 'मंडी खरीद केंद्र',
    cropsNav: 'फसल विनिर्देश एवं गुणवत्ता',
    disbursementsNav: 'भुगतान संवितरण',
    sihFoot: 'SIH 26032 • तेलंगाना सरकार खरीद प्रबंधन प्रणाली',

    // Titles
    dashTitle: 'राज्य कृषि खरीद कमांड सेंटर',
    analyticsTitle: 'राज्य कृषि खुफिया एवं एआई विश्लेषण',
    centersTitle: 'खरीद केंद्र आवंटन एवं क्षमता प्रबंधन',
    cropsTitle: 'कृषि नीति एवं गुणवत्ता नियम',
    disbursementsTitle: 'प्रत्यक्ष डीबीटी वित्तीय भुगतान प्रबंधन',

    // Dashboard Metrics
    totalFarmers: 'कुल पंजीकृत किसान',
    procuredGrain: 'प्राप्त अनाज की मात्रा',
    qualityRate: 'गुणवत्ता स्वीकृति दर',
    disbursedPayments: 'संवितरित प्रत्यक्ष भुगतान',
    acrossDistricts: '4 जिलों में सक्रिय',
    paddyMaizeCotton: 'धान, मक्का और कपास',
    fieldDryingCount: 'धूप में सुखाना आवश्यक',
    pendingTransfers: 'लंबित बैंक ट्रांसफर',
    live: 'लाइव',
    reconnecting: 'पुनः कनेक्ट हो रहा है...',
    lastUpdated: 'अंतिम अपडेट',

    // Tables
    yardLiveCapacity: 'खरीद मंडी लाइव क्षमता उपयोग',
    autoRefresh: '⚡ हर 5 सेकंड में स्वतः रिफ्रेश',
    marketYardCenter: 'मंडी खरीद केंद्र',
    dailyCapacity: 'दैनिक क्षमता',
    bookedTonnage: 'बुक की गई मात्रा',
    remaining: 'शेष क्षमता',
    utilizationRate: 'उपयोग दर',

    recentIotInspections: 'हालिया IoT अनाज नमी निरीक्षण',
    bookingToken: 'टोकन संख्या',
    moisturePct: 'नमी %',
    temp: 'तापमान (°C)',
    humidityPct: 'आर्द्रता %',
    gradeDecision: 'ग्रेड / निर्णय',
    remarks: 'टिप्पणी / सिफारिश',
    gradeA: 'ग्रेड A (स्वीकृत)',
    gradeB: 'ग्रेड B (सुखाना आवश्यक)'
  },

  en: {
    adminTitle: 'Dhaan Mitra',
    stateAdmin: 'State Admin',
    deptOfAgri: 'Dept of Agriculture & Civil Supplies',
    dashboardNav: 'Dashboard Overview',
    analyticsNav: 'Deep Analytics & AI',
    centersNav: 'Market Yard Centers',
    cropsNav: 'Crop Specs & Moisture',
    disbursementsNav: 'Payment Disbursements',
    sihFoot: 'SIH 26032 • Telangana Govt Procurement System',

    // Titles
    dashTitle: 'State Procurement Command Center',
    analyticsTitle: 'State Agricultural Intelligence & Analytics',
    centersTitle: 'Procurement Center Allocation',
    cropsTitle: 'Agricultural Policy & Quality Rules',
    disbursementsTitle: 'Financial Disbursal Management',

    // Dashboard Metrics
    totalFarmers: 'TOTAL REGISTERED FARMERS',
    procuredGrain: 'PROCURED GRAIN TONNAGE',
    qualityRate: 'QUALITY ACCEPTANCE RATE',
    disbursedPayments: 'DISBURSED PAYMENTS',
    acrossDistricts: 'Across 4 Districts',
    paddyMaizeCotton: 'Paddy, Maize & Cotton',
    fieldDryingCount: 'Required Field Drying',
    pendingTransfers: 'Pending Direct Transfers',
    live: 'LIVE',
    reconnecting: 'RECONNECTING...',
    lastUpdated: 'Last updated',

    // Tables
    yardLiveCapacity: 'Procurement Market Yard Live Capacity',
    autoRefresh: '⚡ Auto-refreshing every 5s',
    marketYardCenter: 'Market Yard Center',
    dailyCapacity: 'Daily Capacity',
    bookedTonnage: 'Booked Tonnage',
    remaining: 'Remaining',
    utilizationRate: 'Utilization Rate',

    recentIotInspections: 'Recent IoT Grain Moisture Inspections',
    bookingToken: 'Booking Token',
    moisturePct: 'Moisture %',
    temp: 'Temp (°C)',
    humidityPct: 'Humidity %',
    gradeDecision: 'Grade / Decision',
    remarks: 'Remarks',
    gradeA: 'Grade A (Procure)',
    gradeB: 'Grade B (Dry Required)'
  }
};

export const AdminLanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('dhaan_mitra_lang');
      if (saved && (saved === 'te' || saved === 'hi' || saved === 'en')) {
        return saved;
      }
    } catch (_) {}
    return 'te';
  });

  const setLang = (newLang) => {
    const valid = (newLang === 'en' || newLang === 'hi' || newLang === 'te') ? newLang : 'te';
    setLangState(valid);
    try {
      localStorage.setItem('dhaan_mitra_lang', valid);
      window.dispatchEvent(new Event('languageChange'));
    } catch (_) {}
  };

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('dhaan_mitra_lang');
        if (saved && saved !== lang && (saved === 'te' || saved === 'hi' || saved === 'en')) {
          setLangState(saved);
        }
      } catch (_) {}
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('languageChange', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('languageChange', handleStorage);
    };
  }, [lang]);

  const t = (key) => {
    return adminTranslations[lang]?.[key] || adminTranslations['te']?.[key] || adminTranslations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useAdminLanguage = () => useContext(LanguageContext);
import AnalyticsPage from './pages/AnalyticsPage';
import CenterManagementPage from './pages/CenterManagementPage';
import CropConfigPage from './pages/CropConfigPage';
import DisbursementsPage from './pages/DisbursementsPage';

function AdminLayout() {
  const { lang, setLang, t } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="brand-header">
          <div className="brand-icon">DM</div>
          <div>
            <div className="brand-title">{t('adminTitle')}</div>
            <div className="brand-badge">{t('stateAdmin')}</div>
          </div>
        </div>

        <ul className="nav-list">
          <li
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>📊</span> {t('dashboardNav')}
          </li>
          <li
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span>📈</span> {t('analyticsNav')}
          </li>
          <li
            className={`nav-item ${activeTab === 'centers' ? 'active' : ''}`}
            onClick={() => setActiveTab('centers')}
          >
            <span>🏬</span> {t('centersNav')}
          </li>
          <li
            className={`nav-item ${activeTab === 'crops' ? 'active' : ''}`}
            onClick={() => setActiveTab('crops')}
          >
            <span>🌾</span> {t('cropsNav')}
          </li>
          <li
            className={`nav-item ${activeTab === 'disbursements' ? 'active' : ''}`}
            onClick={() => setActiveTab('disbursements')}
          >
            <span>💳</span> {t('disbursementsNav')}
          </li>
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #334155', color: '#94a3b8', fontSize: '0.75rem' }}>
          {t('sihFoot')}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        <header className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="top-title">
            {activeTab === 'dashboard' && t('dashTitle')}
            {activeTab === 'analytics' && t('analyticsTitle')}
            {activeTab === 'centers' && t('centersTitle')}
            {activeTab === 'crops' && t('cropsTitle')}
            {activeTab === 'disbursements' && t('disbursementsTitle')}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Language Selector in Admin Header */}
            <div style={{
              display: 'flex',
              background: '#1e293b',
              padding: '3px',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}>
              <button
                onClick={() => setLang('te')}
                style={{
                  background: lang === 'te' ? '#047857' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '9px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLang('hi')}
                style={{
                  background: lang === 'hi' ? '#047857' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '9px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang('en')}
                style={{
                  background: lang === 'en' ? '#047857' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '9px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                English
              </button>
            </div>

            <div className="admin-user-profile">
              <div className="user-avatar">AD</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t('stateAdmin')}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('deptOfAgri')}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          {activeTab === 'dashboard' && <DashboardPage onNavigateToAnalytics={() => setActiveTab('analytics')} />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'centers' && <CenterManagementPage />}
          {activeTab === 'crops' && <CropConfigPage />}
          {activeTab === 'disbursements' && <DisbursementsPage />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AdminLanguageProvider>
      <AdminLayout />
    </AdminLanguageProvider>
  );
}
