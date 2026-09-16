import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function VillageWeatherScreen({ navigateTo, farmer }) {
  const { lang, t, speakVoice, speakVisualGuide, speakingKey } = useLanguage();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherMode, setWeatherMode] = useState('SUNNY'); // SUNNY | RAIN | THUNDERSTORM | CLOUDY

  const villageName = farmer?.village || 'Gundlapally';
  const districtName = farmer?.district || 'Warangal';

  useEffect(() => {
    fetch(`/api/weather/forecast?village=${encodeURIComponent(villageName)}&district=${encodeURIComponent(districtName)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWeatherData(data);
          if (data.currentCondition?.rainfallProbability > 20) {
            setWeatherMode('RAIN');
          } else {
            setWeatherMode('SUNNY');
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load weather forecast:', err);
        setLoading(false);
      });
  }, [villageName, districtName]);

  // Handle weather mode change and vibration on thunderstorm
  const handleSelectMode = (mode) => {
    setWeatherMode(mode);
    if (mode === 'THUNDERSTORM') {
      if ('vibrate' in navigator) {
        try { navigator.vibrate([150, 70, 180, 60, 200]); } catch (_) {}
      }
      speakVoice(lang === 'te' ? 'జాగ్రత్త! భారీ వర్షం మరియు ఉరుములు. ధాన్యం వెంటనే కప్పండి.' : 'Warning! Thunderstorm & heavy rain. Protect grain heap.');
    } else if (mode === 'RAIN') {
      speakVoice(lang === 'te' ? 'వర్షం పడే అవకాశం ఉంది. ధాన్యం ఎండబెట్టవద్దు.' : 'Rain alert. Keep grain dry.');
    } else if (mode === 'SUNNY') {
      speakVoice(lang === 'te' ? 'పూర్తి ఎండ ఉంది. ధాన్యం ఎండబెట్టడానికి చాలా మంచి రోజు.' : 'Clear sunny sky. Best day for drying grain.');
    } else if (mode === 'CLOUDY') {
      speakVoice(lang === 'te' ? 'మబ్బులు ఉన్నాయి. ఎండ తక్కువగా ఉంటుంది.' : 'Cloudy weather.');
    }
  };

  const current = weatherData?.currentCondition;
  const forecast = weatherData?.forecast || [];

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <button
          onClick={() => navigateTo('home')}
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '10px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          ← Home
        </button>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#064e3b' }}>
            📍 {villageName}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {districtName} District
          </div>
        </div>
      </div>

      {/* Visual Weather Selector Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
        <button
          onClick={() => handleSelectMode('SUNNY')}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: '12px',
            border: weatherMode === 'SUNNY' ? '2.5px solid #f59e0b' : '1px solid #cbd5e1',
            background: weatherMode === 'SUNNY' ? '#fef3c7' : '#ffffff',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: '#b45309',
            cursor: 'pointer',
            boxShadow: weatherMode === 'SUNNY' ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
          }}
        >
          ☀️ {t('clearSun')}
        </button>

        <button
          onClick={() => handleSelectMode('RAIN')}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: '12px',
            border: weatherMode === 'RAIN' ? '2.5px solid #3b82f6' : '1px solid #cbd5e1',
            background: weatherMode === 'RAIN' ? '#eff6ff' : '#ffffff',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: '#1d4ed8',
            cursor: 'pointer',
            boxShadow: weatherMode === 'RAIN' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
          }}
        >
          🌧️ {t('rainAlert')}
        </button>

        <button
          onClick={() => handleSelectMode('THUNDERSTORM')}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: '12px',
            border: weatherMode === 'THUNDERSTORM' ? '2.5px solid #ef4444' : '1px solid #cbd5e1',
            background: weatherMode === 'THUNDERSTORM' ? '#fee2e2' : '#ffffff',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: '#b91c1c',
            cursor: 'pointer',
            boxShadow: weatherMode === 'THUNDERSTORM' ? '0 2px 8px rgba(239, 68, 68, 0.3)' : 'none'
          }}
        >
          ⚡ {t('thunderstorm')}
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          Loading weather forecast for {villageName}...
        </div>
      ) : (
        <>
          {/* Card 1: Atmospheric Animated Weather Display */}
          <div
            className={`weather-screen-canvas ${
              weatherMode === 'SUNNY'
                ? 'sunny-sky-canvas'
                : weatherMode === 'THUNDERSTORM'
                ? 'thunder-flash screen-rumble'
                : 'rain-canvas'
            }`}
            style={{ padding: '1.25rem', color: '#ffffff', position: 'relative' }}
          >
            {/* Top-Right Corner Volume / Speaker Symbol */}
            <button
              className={`card-volume-btn ${speakingKey === 'weather' ? 'speaking' : ''}`}
              style={{ top: '10px', right: '10px', width: '42px', height: '42px' }}
              onClick={() => speakVisualGuide('weather')}
              aria-label="Listen Voice"
            >
              🔊
            </button>

            {/* Clear Sky Sun Glow Animation */}
            {weatherMode === 'SUNNY' && (
              <>
                <div className="sunny-radiance-circle" />
                <div style={{ position: 'relative', zIndex: 5 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ☀️ OPTIMAL CLEAR SUNSHINE • {villageName}
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: 800, margin: '6px 0', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    {current?.temperature || 31.5}°C
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="anim-sun">☀️</span> Clear Sunny Harvest Sky
                  </div>

                  <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '14px', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#e0f2fe' }}>💧 Humidity</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{current?.humidity || 52}% (Low)</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#e0f2fe' }}>☀️ Sun Drying</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fef08a' }}>Ideal (Best)</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Rain Drops Falling & Splitting on Screen */}
            {weatherMode === 'RAIN' && (
              <>
                {/* 14 Animated Falling Rain Streaks */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={`rain-${i}`}
                    className="raindrop-streak"
                    style={{
                      left: `${(i * 7.2) + 2}%`,
                      animationDelay: `${(i * 0.11) % 0.8}s`,
                      height: `${20 + (i % 3) * 6}px`
                    }}
                  />
                ))}

                {/* 5 Splitting Water Splash Rings at the bottom */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`splash-${i}`}
                    className="rain-splash-ring"
                    style={{
                      left: `${15 + i * 18}%`,
                      animationDelay: `${(i * 0.2) % 0.9}s`
                    }}
                  />
                ))}

                <div style={{ position: 'relative', zIndex: 5 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🌧️ RAINFALL IN PROGRESS • {villageName}
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: 800, margin: '6px 0', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    {current?.temperature ? (current.temperature - 3).toFixed(1) : 27.5}°C
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd' }}>
                    <span className="anim-cloud-rain">🌧️</span> Rain Falling • Drops Splitting
                  </div>

                  <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '14px', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'space-between', border: '1px solid #38bdf8' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#bae6fd' }}>🌧️ Rain Chance</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa' }}>75% (High)</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#bae6fd' }}>⚠️ Warning</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fca5a5' }}>Cover Grain</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Thunderstorm Lightning Flash & Screen Vibration */}
            {weatherMode === 'THUNDERSTORM' && (
              <>
                {/* Thunder Rain Streaks */}
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={`storm-rain-${i}`}
                    className="raindrop-streak"
                    style={{
                      left: `${(i * 5.5) + 1}%`,
                      animationDelay: `${(i * 0.08) % 0.6}s`,
                      height: `${25 + (i % 4) * 6}px`,
                      background: 'linear-gradient(180deg, #ffffff, #93c5fd)'
                    }}
                  />
                ))}

                {/* Splitting Splash Rings */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`storm-splash-${i}`}
                    className="rain-splash-ring"
                    style={{
                      left: `${10 + i * 15}%`,
                      animationDelay: `${(i * 0.15) % 0.7}s`,
                      borderColor: '#ffffff'
                    }}
                  />
                ))}

                <div style={{ position: 'relative', zIndex: 5 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⚡ THUNDERSTORM ALERT • {villageName}
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: 800, margin: '6px 0', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                    25.0°C
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#fef08a' }}>
                    ⛈️ Lightning & Rumble (Vibrating)
                  </div>

                  <div style={{ marginTop: '2.5rem', background: 'rgba(153, 27, 27, 0.7)', padding: '0.75rem', borderRadius: '14px', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'space-between', border: '1.5px solid #ef4444' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#fee2e2' }}>⚡ Storm Intensity</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fef08a' }}>Extreme ⛈️</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#fee2e2' }}>🚨 Action</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>STOP INTAKE</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 7-Day Village Future Forecast List */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#064e3b' }}>
                📅 7-Day Village Future Forecast
              </div>
              <span style={{ fontSize: '0.75rem', color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                {villageName}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {forecast.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: idx === 0 ? '#f0fdf4' : '#f8fafc',
                    borderRadius: '10px',
                    border: `1px solid ${idx === 0 ? '#bbf7d0' : '#e2e8f0'}`
                  }}
                >
                  <div style={{ minWidth: '85px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                      {day.dayName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {day.date}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, padding: '0 0.5rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{day.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                        {day.condition}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: day.rainfallProbability > 20 ? '#dc2626' : '#059669', fontWeight: 600 }}>
                        Rain: {day.rainfallProbability}% • Hum: {day.humidity}%
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#064e3b' }}>
                      {day.temperature}°C
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: day.suitability === 'HIGH' ? '#dcfce7' : day.suitability === 'MODERATE' ? '#fef9c3' : '#fee2e2',
                        color: day.suitability === 'HIGH' ? '#15803d' : day.suitability === 'MODERATE' ? '#854d0e' : '#b91c1c'
                      }}
                    >
                      {day.suitability === 'HIGH' ? '☀️ Ideal Sun' : day.suitability === 'MODERATE' ? '🌤️ Moderate' : '🌧️ Wet Risk'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grain Sun-Drying Advisory */}
          <div className="card" style={{ background: '#f0fdf4', border: '1px solid #86efac', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#166534', marginBottom: '4px' }}>
              🌾 Harvest & Drying Guidance for {villageName}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#15803d', lineHeight: '1.4' }}>
              Ensure paddy moisture is dried down to <strong>≤ 14.0%</strong> before bringing to yard.
              Days with <strong>&lt; 15% rain</strong> and <strong>&lt; 60% humidity</strong> provide the fastest sun-drying rate.
            </div>

            <button
              className="btn-green"
              onClick={() => navigateTo('book')}
              style={{ marginTop: '0.75rem', width: '100%' }}
            >
              📅 Book Procurement Slot on Clear Sun Day →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

