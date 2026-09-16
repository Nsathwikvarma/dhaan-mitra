import React, { useState, useEffect } from 'react';

export default function VoiceAlertsScreen({ farmer }) {
  const [language, setLanguage] = useState('te');
  const [notifications, setNotifications] = useState([]);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    fetch(`/api/notifications?farmerId=${farmer?.farmerId || 'FARM-101'}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.notifications);
      });
  }, [farmer]);

  const handleSimulateCall = () => {
    fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmerId: farmer?.farmerId || 'FARM-101',
        farmerName: farmer?.name || 'Rambabu Peddinti',
        phone: farmer?.phone || '+91 94401 23456',
        language: language,
        type: 'SLOT_REMINDER',
        channel: 'VOICE_CALL',
        metadata: {
          crop: 'Paddy (Samba Mahsuri)',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM - 11:00 AM',
          center: 'Warangal Agricultural Market Yard'
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(prev => [data.notification, ...prev]);
        }
      });
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b', margin: '0 0 0.5rem 0' }}>
        🗣️ Non-Smartphone Voice Call Alerts
      </h2>
      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>
        Automated interactive Dabba-Phone voice alerts transmitted in Telugu, Hindi, and English.
      </p>

      {/* Language Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '10px',
            border: '1px solid #059669',
            background: language === 'te' ? '#059669' : '#ffffff',
            color: language === 'te' ? '#ffffff' : '#059669',
            fontWeight: 800
          }}
          onClick={() => setLanguage('te')}
        >
          తెలుగు (Telugu)
        </button>

        <button
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '10px',
            border: '1px solid #059669',
            background: language === 'hi' ? '#059669' : '#ffffff',
            color: language === 'hi' ? '#ffffff' : '#059669',
            fontWeight: 800
          }}
          onClick={() => setLanguage('hi')}
        >
          हिंदी (Hindi)
        </button>

        <button
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '10px',
            border: '1px solid #059669',
            background: language === 'en' ? '#059669' : '#ffffff',
            color: language === 'en' ? '#ffffff' : '#059669',
            fontWeight: 800
          }}
          onClick={() => setLanguage('en')}
        >
          English
        </button>
      </div>

      <button className="btn-green" style={{ marginBottom: '1rem' }} onClick={handleSimulateCall}>
        📞 Simulate Automated Dabba-Phone Call
      </button>

      {/* Notifications List */}
      <div className="card">
        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#0f172a' }}>
          VOICE ALERT LOG HISTORY
        </div>

        {notifications.map((n, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.75rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857' }}>
                {n.channel || 'VOICE CALL'} • {n.type}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {new Date(n.sentAt).toLocaleTimeString()}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: '1.4' }}>
              {n.messageText?.[language] || n.messageText?.te || n.messageText?.en || n.audioText}
            </div>

            {/* Audio Waveform Simulator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
              <button
                style={{
                  background: '#047857',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.7rem'
                }}
                onClick={() => setPlayingId(playingId === idx ? null : idx)}
              >
                {playingId === idx ? '⏸' : '▶'}
              </button>
              <div style={{ flex: 1, height: '12px', background: '#d1fae5', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 4px', gap: '2px' }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: playingId === idx ? `${Math.sin(i + Date.now()/200) * 50 + 50}%` : '40%',
                      background: '#059669',
                      borderRadius: '2px',
                      transition: 'height 0.1s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
