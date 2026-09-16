import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AuthScreen({ onAuthSuccess }) {
  const { lang, setLang, t } = useLanguage();
  const [authMode, setAuthMode] = useState('LOGIN'); // LOGIN | REGISTER
  const [step, setStep] = useState('LANG'); // LANG | FORM | SEEDED
  
  // Login inputs
  const [phoneInput, setPhoneInput] = useState('9440123456');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Register inputs
  const [regName, setRegName] = useState('K. Venkat Rao');
  const [regPhone, setRegPhone] = useState('9848011223');
  const [regVillage, setRegVillage] = useState('Gundlapally');
  const [regCrop, setRegCrop] = useState('Paddy (Samba Mahsuri)');
  const [regAadhaar, setRegAadhaar] = useState('9042-8812-4912');
  const [regPassbook, setRegPassbook] = useState('Survey #512/B (4.0 Acres)');
  const [regBank, setRegBank] = useState('SBI A/C ****9041');

  const [createdUser, setCreatedUser] = useState(null);

  const handleLoginSubmit = () => {
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'FARMER', phone: phoneInput, username: phoneInput })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const u = data.user;
          setCreatedUser({
            id: u.id,
            farmerId: u.farmerId || 'FARM-101',
            name: u.name || 'Rambabu Peddinti',
            phone: u.phone || '+91 94401 23456',
            village: u.village || 'Gundlapally',
            aadhaar: 'XXXX-XXXX-4912',
            bankAcc: 'SBI ****4821',
            passbook: 'Survey #412/A (3.5 Acres)'
          });
          setStep('SEEDED');
        }
      });
  };

  const handleRegisterSubmit = () => {
    const newFarmerId = `FARM-${Date.now().toString().slice(-4)}`;
    const newFarmerPayload = {
      farmerId: newFarmerId,
      name: regName,
      phone: regPhone,
      village: regVillage,
      district: 'Warangal',
      crop: regCrop,
      aadhaar: regAadhaar,
      bankAccount: regBank,
      landPassbook: regPassbook
    };

    fetch('/api/farmers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFarmerPayload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCreatedUser({
            id: data.farmer.id || newFarmerId,
            farmerId: newFarmerId,
            name: regName,
            phone: regPhone,
            village: regVillage,
            aadhaar: regAadhaar,
            bankAcc: regBank,
            passbook: regPassbook
          });
          setStep('SEEDED');
        }
      });
  };

  const handleComplete = () => {
    onAuthSuccess(createdUser);
  };

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {/* App Branding */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #047857, #065f46)',
            color: '#fff',
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            margin: '0 auto 0.5rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 8px 16px rgba(4, 120, 87, 0.3)'
          }}
        >
          🌾
        </div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', margin: '0 0 0.2rem 0' }}>
          {t('appTitle')}
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#047857', margin: 0, fontWeight: 600 }}>
          {t('appSubtitle')}
        </p>
      </div>

      {step === 'LANG' && (
        <div className="card" style={{ border: '2px solid #10b981' }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#064e3b', marginBottom: '1rem', textAlign: 'center' }}>
            🌐 {t('selectLang')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              style={{
                background: lang === 'te' ? '#047857' : '#ffffff',
                color: lang === 'te' ? '#ffffff' : '#047857',
                border: '2px solid #047857',
                padding: '0.85rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onClick={() => setLang('te')}
            >
              <span>తెలుగు (Telugu)</span>
              <span>🌾</span>
            </button>

            <button
              style={{
                background: lang === 'hi' ? '#047857' : '#ffffff',
                color: lang === 'hi' ? '#ffffff' : '#047857',
                border: '2px solid #047857',
                padding: '0.85rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onClick={() => setLang('hi')}
            >
              <span>हिंदी (Hindi)</span>
              <span>🌾</span>
            </button>

            <button
              style={{
                background: lang === 'en' ? '#047857' : '#ffffff',
                color: lang === 'en' ? '#ffffff' : '#047857',
                border: '2px solid #047857',
                padding: '0.85rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onClick={() => setLang('en')}
            >
              <span>English</span>
              <span>🌾</span>
            </button>
          </div>

          <button className="btn-green" style={{ marginTop: '1.25rem' }} onClick={() => setStep('FORM')}>
            {lang === 'te' ? 'కొనసాగించండి →' : lang === 'hi' ? 'आगे बढ़ें →' : 'Continue →'}
          </button>
        </div>
      )}

      {step === 'FORM' && (
        <div className="card">
          {/* Auth Mode Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '3px', marginBottom: '1rem' }}>
            <button
              style={{
                flex: 1,
                border: 'none',
                padding: '8px',
                borderRadius: '10px',
                background: authMode === 'LOGIN' ? '#047857' : 'transparent',
                color: authMode === 'LOGIN' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              onClick={() => setAuthMode('LOGIN')}
            >
              🔑 Sign In
            </button>
            <button
              style={{
                flex: 1,
                border: 'none',
                padding: '8px',
                borderRadius: '10px',
                background: authMode === 'REGISTER' ? '#047857' : 'transparent',
                color: authMode === 'REGISTER' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              onClick={() => setAuthMode('REGISTER')}
            >
              📝 Register New Farmer
            </button>
          </div>

          {authMode === 'LOGIN' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#047857', marginBottom: '4px' }}>
                MOBILE PHONE OR AADHAAR NO.
              </label>
              <input
                type="text"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="Mobile / Aadhaar (12 Digits)"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '2px solid #cbd5e1',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '1rem'
                }}
              />

              {!otpSent ? (
                <button className="btn-green" onClick={() => setOtpSent(true)}>
                  📲 Send OTP Authentication
                </button>
              ) : (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>ENTER OTP (Demo: 4912)</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="4-Digit OTP"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: '2px solid #10b981',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      margin: '0.5rem 0 1rem 0',
                      letterSpacing: '4px'
                    }}
                  />
                  <button className="btn-green" onClick={handleLoginSubmit}>
                    🔒 {t('verifyOtp')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* REGISTER NEW FARMER FORM */
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#047857', marginBottom: '2px' }}>
                FARMER FULL NAME
              </label>
              <input
                type="text"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}
              />

              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#047857', marginBottom: '2px' }}>
                MOBILE PHONE
              </label>
              <input
                type="text"
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}
              />

              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#047857', marginBottom: '2px' }}>
                VILLAGE NAME
              </label>
              <input
                type="text"
                value={regVillage}
                onChange={e => setRegVillage(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}
              />

              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#047857', marginBottom: '2px' }}>
                12-DIGIT AADHAAR NUMBER
              </label>
              <input
                type="text"
                value={regAadhaar}
                onChange={e => setRegAadhaar(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}
              />

              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#047857', marginBottom: '2px' }}>
                PATTADAR PASSBOOK (LAND SURVEY NO)
              </label>
              <input
                type="text"
                value={regPassbook}
                onChange={e => setRegPassbook(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}
              />

              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#047857', marginBottom: '2px' }}>
                BANK ACCOUNT NO. (DIRECT PAYOUT)
              </label>
              <input
                type="text"
                value={regBank}
                onChange={e => setRegBank(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: 700 }}
              />

              <button className="btn-green" onClick={handleRegisterSubmit}>
                📜 Register & Seed Aadhaar Details
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'SEEDED' && createdUser && (
        <div className="card" style={{ background: '#ecfdf5', border: '2px solid #059669' }}>
          <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
            <div style={{ fontSize: '2.5rem' }}>🏛️</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#064e3b' }}>
              {t('aadhaarSeeded')}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '2px' }}>
              Farmer ID: {createdUser.farmerId} • {createdUser.name}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: '1px solid #a7f3d0', margin: '1rem 0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700 }}>
              <span>💳</span>
              <span>{createdUser.bankAcc}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700 }}>
              <span>📜</span>
              <span>{createdUser.passbook}</span>
            </div>
          </div>

          <button className="btn-green" onClick={handleComplete}>
            🚜 Open Farmer Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
