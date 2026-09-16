import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function FarmerHomeScreen({ navigateTo, farmer, openChatbot }) {
  const { lang, t, speakVoice, speakVisualGuide, speakTokenDetails, speakingKey } = useLanguage();
  const [booking, setBooking] = useState(null);
  const [weather, setWeather] = useState(null);
  const [hasInspection, setHasInspection] = useState(false);

  // Real-time polling to sync updates from Procurer live!
  useEffect(() => {
    const fetchLatestBooking = () => {
      fetch(`/api/bookings?farmerId=${farmer?.farmerId || 'FARM-101'}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.bookings.length > 0) {
            const lastBooking = data.bookings[data.bookings.length - 1];
            setBooking(lastBooking);
            // Inspection report unlocks as soon as procurer changes status from initial phase
            const isDone = lastBooking.status !== 'Inspection Phase' && lastBooking.status !== 'Pending';
            setHasInspection(isDone);
          }
        })
        .catch(err => console.log('Polling error:', err));
    };

    fetchLatestBooking();
    const interval = setInterval(fetchLatestBooking, 2000); // 2 second live polling

    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centerId: 'PROC-001' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setWeather(data.weather);
      });

    return () => clearInterval(interval);
  }, [farmer]);

  const handleCardClick = (tab, voiceMsg) => {
    speakVoice(voiceMsg);
    if (tab === 'reports' && !hasInspection) {
      alert(t('reportLockedNote'));
      return;
    }
    navigateTo(tab);
  };

  return (
    <div>
      {/* Farmers Green Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b, #047857)',
          padding: '1.1rem 1.25rem',
          borderRadius: '20px',
          color: '#ffffff',
          marginBottom: '1rem',
          boxShadow: '0 8px 16px rgba(6, 78, 59, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🌾 {t('appTitle')} • {farmer?.village || 'Gundlapally'}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0' }}>
            {lang === 'te' ? 'నమస్కారం' : lang === 'hi' ? 'नमस्ते' : 'Namaste'}, {farmer?.name || 'Rambabu Peddinti'}!
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', fontWeight: 700 }}>
              ✅ {t('aadhaarSeeded')}
            </div>
            <div style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#064e3b', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', fontWeight: 800 }}>
              🌾 {farmer?.crop || 'Paddy (Samba Mahsuri)'}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            color: '#064e3b',
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          🧑‍🌾
        </div>
      </div>

      {/* DhaanVaani Hero Card - Direct Voice Slot Booking */}
      <div 
        className="voice-hero-card" 
        onClick={openChatbot}
        title="Tap to speak with DhaanVaani Voice Assistant"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#ffffff', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
              🎙️
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 800, textTransform: 'uppercase' }}>
                🌾 {lang === 'te' ? 'ధాన్ వాణి వాయిస్' : lang === 'hi' ? 'धानवाणी वॉयस' : 'DhaanVaani Voice'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {t('dhaanVaaniTag')}
              </div>
            </div>
          </div>
          <div style={{ background: '#10b981', color: '#ffffff', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{t('talkBtn')}</span>
            <span>➤</span>
          </div>
        </div>
        <div style={{ marginTop: '0.65rem', background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: '10px', fontSize: '0.73rem', color: '#ecfdf5', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>💡</span>
          <span>{t('voiceHint')}</span>
        </div>
      </div>

      {/* Active Token Card - UPDATES REAL-TIME & READ ALOUD */}
      {booking && (
        <div
          className="card"
          style={{
            position: 'relative',
            borderLeft: '6px solid #10b981',
            background: 'linear-gradient(135deg, #ffffff, #f0fdf4)',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)'
          }}
        >
          {/* Read Aloud Speaker Button (1/5th size) */}
          <button
            className={`card-volume-btn ${speakingKey === 'token_' + booking.tokenNo ? 'speaking' : ''}`}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '44px',
              height: '44px',
              zIndex: 10
            }}
            onClick={() => speakTokenDetails(booking)}
            aria-label="Read Token Aloud"
            title="Listen to Token Details"
          >
            🔊
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '50px' }}>
            <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              {t('activeToken')}
            </span>
          </div>

          <div style={{ marginTop: '0.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#064e3b', letterSpacing: '0.5px' }}>
              {booking.tokenNo}
            </span>
            <span
              style={{
                background: (booking.status === 'Procurement Completed' || booking.status === 'Accepted') ? '#d1fae5' : booking.status.includes('Drying') ? '#fee2e2' : '#fef3c7',
                color: (booking.status === 'Procurement Completed' || booking.status === 'Accepted') ? '#047857' : booking.status.includes('Drying') ? '#dc2626' : '#b45309',
                padding: '3px 10px',
                borderRadius: '14px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: '1px solid currentColor'
              }}
            >
              {booking.status === 'Accepted' || booking.status === 'Procurement Completed' ? `✅ ${t('procurementCompleted')}` : booking.status}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '4px', background: '#ffffff', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div>🌾 <strong>Crop:</strong> {booking.cropName || 'Paddy (Samba Mahsuri)'} (Qty: {booking.quantity || 4.5} T)</div>
            <div>📍 <strong>{t('yard')}:</strong> {booking.centerName}</div>
            <div>📅 <strong>{t('scheduledDate')}:</strong> {booking.requestedDate}</div>
            <div>⏰ <strong>{t('slot')}:</strong> {booking.requestedTime}</div>
          </div>
        </div>
      )}

      {/* 2-in-Everything Visual Language Cards Grid */}
      <div className="visual-2card-grid">
        {/* Card 1: Slot Booking */}
        <div
          className="visual-big-card"
          onClick={() => navigateTo('book')}
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=400&q=80")'
          }}
        >
          {/* 1/5th Top-Right Corner Volume / Speaker Symbol */}
          <button
            className={`card-volume-btn ${speakingKey === 'slot_booking' ? 'speaking' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              speakVisualGuide('slot_booking');
            }}
            aria-label="Listen Voice"
          >
            🔊
          </button>

          <div className="visual-card-footer">
            <div className="visual-card-hero-icon">🌾 📅</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
              {t('bookSlot')}
            </div>
          </div>
        </div>

        {/* Card 2: Village Weather */}
        <div
          className="visual-big-card"
          onClick={() => navigateTo('weather')}
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=400&q=80")'
          }}
        >
          {/* 1/5th Top-Right Corner Volume / Speaker Symbol */}
          <button
            className={`card-volume-btn ${speakingKey === 'weather' ? 'speaking' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              speakVisualGuide('weather');
            }}
            aria-label="Listen Voice"
          >
            🔊
          </button>

          <div className="visual-card-footer">
            <div className="visual-card-hero-icon">🌤️ 🌧️</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
              {t('weatherReport')}
            </div>
          </div>
        </div>
      </div>

      <div className="visual-2card-grid">
        {/* Card 3: Quality & Moisture Inspection (Wet vs Dry) */}
        <div
          className="visual-big-card"
          onClick={() => {
            if (!hasInspection) {
              speakVoice(lang === 'te' ? 'తనిఖీ పూర్తయిన తర్వాత ఈ నివేదిక కనిపిస్తుంది' : 'Report unlocks after inspection');
              alert(t('reportLockedNote'));
              return;
            }
            navigateTo('reports');
          }}
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=400&q=80")',
            filter: !hasInspection ? 'grayscale(0.35)' : 'none'
          }}
        >
          {/* 1/5th Top-Right Corner Volume / Speaker Symbol */}
          <button
            className={`card-volume-btn ${speakingKey === 'reports' ? 'speaking' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              speakVisualGuide('reports');
            }}
            aria-label="Listen Voice"
          >
            🔊
          </button>

          <div className="visual-card-footer">
            <div className="visual-card-hero-icon">
              {hasInspection ? '📋 🔬' : '🔒 🔬'}
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
              {t('analysisReports')}
            </div>
          </div>
        </div>

        {/* Card 4: Payment Status (Direct Bank Cash Transfer) */}
        <div
          className="visual-big-card"
          onClick={() => navigateTo('payments')}
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80")'
          }}
        >
          {/* 1/5th Top-Right Corner Volume / Speaker Symbol */}
          <button
            className={`card-volume-btn ${speakingKey === 'payments' ? 'speaking' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              speakVisualGuide('payments');
            }}
            aria-label="Listen Voice"
          >
            🔊
          </button>

          <div className="visual-card-footer">
            <div className="visual-card-hero-icon">💳 💰</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
              {t('paymentTracking')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
