import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function SlotBookingScreen({ navigateTo, farmer }) {
  const { lang, t, speakVoice, speakVisualGuide, speakingKey } = useLanguage();
  const today = new Date();
  const currentMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const [availableCrops, setAvailableCrops] = useState([
    { id: 'crop-1', name: 'Paddy (Samba Mahsuri)', maxMoisturePercentage: 14.0, ratePerTonne: 21830, icon: '🌾' },
    { id: 'crop-2', name: 'Paddy (BPT 5204 / Telangana Sona)', maxMoisturePercentage: 13.5, ratePerTonne: 22030, icon: '🌾' },
    { id: 'crop-3', name: 'Maize (Hybrid Yellow)', maxMoisturePercentage: 14.5, ratePerTonne: 20900, icon: '🌽' },
    { id: 'crop-4', name: 'Wheat (Sharbati / Lokwan)', maxMoisturePercentage: 12.0, ratePerTonne: 22750, icon: '🌾' },
    { id: 'crop-5', name: 'Cotton (Long Staple / Kapas)', maxMoisturePercentage: 8.0, ratePerTonne: 70200, icon: '⚪' },
    { id: 'crop-6', name: 'Soybean (Yellow)', maxMoisturePercentage: 12.0, ratePerTonne: 46000, icon: '🫘' },
    { id: 'crop-7', name: 'Bengal Gram / Chana', maxMoisturePercentage: 10.0, ratePerTonne: 54400, icon: '🌱' },
    { id: 'crop-8', name: 'Red Gram / Tur (Arhar)', maxMoisturePercentage: 10.0, ratePerTonne: 70000, icon: '🥣' },
    { id: 'crop-9', name: 'Groundnut (Pods)', maxMoisturePercentage: 8.0, ratePerTonne: 63770, icon: '🥜' }
  ]);

  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [crop, setCrop] = useState(farmer?.crop || 'Paddy (Samba Mahsuri)');
  const [quantity, setQuantity] = useState('4.5');
  const [time, setTime] = useState('10:00 AM - 11:00 AM');
  const [recommendation, setRecommendation] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    fetch('/api/crops')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.crops && data.crops.length > 0) {
          setAvailableCrops(data.crops);
        }
      })
      .catch(console.error);
  }, []);

  const selectedCropObj = availableCrops.find(c => c.name === crop) || availableCrops[0] || {};
  const cropLimit = selectedCropObj.maxMoisturePercentage || selectedCropObj.moistureThreshold || 14.0;
  const cropMsp = selectedCropObj.ratePerTonne || 21830;

  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  const handleEvaluateDate = (dayNum) => {
    setSelectedDay(dayNum);
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestedDate: dateStr,
        requestedTime: time,
        crop,
        expectedQuantity: parseFloat(quantity)
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecommendation(data);
        }
      });
  };

  const handleConfirmBooking = () => {
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmerId: farmer?.farmerId || 'FARM-101',
        farmerName: farmer?.name || 'Rambabu Peddinti',
        farmerPhone: farmer?.phone || '+91 94401 23456',
        cropId: selectedCropObj.id || 'crop-1',
        cropName: crop,
        moistureThreshold: cropLimit,
        quantity: parseFloat(quantity),
        requestedDate: formattedDate,
        requestedTime: time,
        language: lang === 'visual' ? 'te' : lang
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBookingSuccess(data.booking);
          speakVisualGuide('call_sent');
        }
      });
  };

  if (bookingSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        {/* Animated Phone Calling & Success */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '3.5rem', animation: 'screen-shake 0.8s infinite' }}>
            📱 📞
          </div>
          <div style={{ position: 'absolute', top: -10, right: -15, fontSize: '1.8rem', animation: 'volume-sound-pulse 1s infinite alternate' }}>
            ⚡ 🔊
          </div>
        </div>

        <h2 style={{ color: '#064e3b', fontWeight: 800, margin: '0.25rem 0' }}>
          ✅ {t('confirmBooking') || 'Booking Confirmed!'}
        </h2>

        <div className="card" style={{ textAlign: 'left', background: '#ecfdf5', border: '2px solid #a7f3d0' }}>
          <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 800 }}>PROCUREMENT TOKEN</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#064e3b', margin: '2px 0' }}>
            {bookingSuccess.tokenNo}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#065f46', lineHeight: '1.6' }}>
            <div><strong>🌾 Crop:</strong> {bookingSuccess.cropName}</div>
            <div><strong>📍 Yard:</strong> {bookingSuccess.centerName}</div>
            <div><strong>📅 Date:</strong> {bookingSuccess.requestedDate}</div>
            <div><strong>⏰ Slot:</strong> {bookingSuccess.requestedTime}</div>
          </div>

          {/* Confirmation: CALL SENT by default */}
          <div style={{ marginTop: '1rem', background: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <span style={{ background: '#059669', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px' }}>
                STATUS: CALL SENT 📞
              </span>
              <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 700 }}>
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#064e3b', fontWeight: 700 }}>
              Automated confirmation voice call sent by default to farmer's mobile ({farmer?.phone || '+91 94401 23456'}).
            </div>
            <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px' }}>
              Token #{bookingSuccess.tokenNo} transmitted. Call confirmation registered.
            </div>
          </div>
        </div>

        <button className="btn-green" onClick={() => navigateTo('home')}>
          🏠 {t('returnHome')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b', margin: '0 0 0.5rem 0' }}>
        📅 {t('bookSlot')}
      </h2>

      {/* Multi-Crop Selection & Standards Card */}
      <div className="card" style={{ borderLeft: '5px solid #047857' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#047857', marginBottom: '6px' }}>
          🌾 {t('cropSelection') || 'SELECT AGRICULTURAL CROP & QUANTITY'}
        </label>
        
        <select
          value={crop}
          onChange={e => setCrop(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #059669', marginBottom: '0.65rem', fontSize: '0.95rem', fontWeight: 800, background: '#f0fdf4', color: '#064e3b' }}
        >
          {availableCrops.map(c => (
            <option key={c.id || c.name} value={c.name}>
              {c.icon || '🌾'} {c.name}
            </option>
          ))}
        </select>

        {/* Dynamic Crop Specs Ribbon */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '130px', background: '#ecfdf5', padding: '6px 10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 800 }}>TARGET MOISTURE CUTOFF</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#065f46' }}>≤ {cropLimit}%</div>
          </div>
          <div style={{ flex: 1, minWidth: '130px', background: '#fef3c7', padding: '6px 10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '0.68rem', color: '#92400e', fontWeight: 800 }}>GOVT MSP RATE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#b45309' }}>₹{cropMsp.toLocaleString('en-IN')} / T</div>
          </div>
        </div>

        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
          {t('quantityTonnes')}
        </label>
        <input
          type="number"
          step="0.5"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder="Quantity in Tonnes (e.g. 4.5)"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}
        />
      </div>

      {/* Current Month Calendar Grid with Visual Weather Predictions */}
      <div className="card" style={{ position: 'relative' }}>
        {/* Top-Right Corner Volume / Speaker Symbol */}
        <button
          className={`card-volume-btn ${speakingKey === 'slot_booking' ? 'speaking' : ''}`}
          style={{ top: '10px', right: '10px', width: '42px', height: '42px' }}
          onClick={() => speakVisualGuide('slot_booking')}
          aria-label="Listen Voice"
        >
          🔊
        </button>

        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#064e3b', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🗓️ {currentMonthName}</span>
        </div>

        {/* Visual Weather Legend for Farmers */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <span className="anim-sun">☀️</span> {t('safeSunny')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <span className="anim-cloud-rain">🌧️</span> {t('rainWet')}
          </span>
        </div>

        {/* Days Grid with Animated Sun ☀️ and Rain Clouds 🌧️ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = selectedDay === dayNum;
            const isPast = dayNum < today.getDate();
            const isRainDay = (dayNum % 4 === 0 || dayNum % 7 === 0);

            return (
              <button
                key={dayNum}
                disabled={isPast}
                onClick={() => {
                  handleEvaluateDate(dayNum);
                  if (isRainDay) {
                    speakVisualGuide('rain_day');
                  } else {
                    speakVisualGuide('sunny_day');
                  }
                }}
                style={{
                  padding: '0.45rem 2px',
                  borderRadius: '12px',
                  border: isSelected
                    ? '2.5px solid #047857'
                    : isRainDay
                    ? '1.5px solid #93c5fd'
                    : '1.5px solid #86efac',
                  background: isSelected
                    ? (isRainDay ? '#1e3a8a' : '#047857')
                    : isPast
                    ? '#f1f5f9'
                    : isRainDay
                    ? '#eff6ff'
                    : '#f0fdf4',
                  color: isSelected ? '#ffffff' : isPast ? '#94a3b8' : '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  boxShadow: isSelected ? '0 4px 10px rgba(0,0,0,0.2)' : 'none',
                  transition: 'transform 0.15s ease'
                }}
              >
                <span>{dayNum}</span>
                {!isPast && (
                  isRainDay ? (
                    <span className="anim-cloud-rain" style={{ fontSize: '1.1rem' }}>🌧️</span>
                  ) : (
                    <span className="anim-sun" style={{ fontSize: '1.1rem' }}>☀️</span>
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        <button className="btn-green" onClick={() => handleEvaluateDate(selectedDay)}>
          🌤️ Fetch Live Weather & AI Advisory for Selected Date
        </button>
      </div>

      {/* Live Location Weather Forecast & AI Advisory Overlay */}
      {recommendation && (
        <div className="card" style={{ background: '#f0fdf4', border: '2px solid #a7f3d0' }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#064e3b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🌤️ Weather Report for {crop} ({formattedDate})</span>
            <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>
              Score: {recommendation.evaluation.totalScore || recommendation.evaluation.score}/100
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{recommendation.weather.temperature}°C Sunny</div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Rain Probability: {recommendation.weather.rainfallProbability}%</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e40af' }}>Humidity: {recommendation.weather.humidity}%</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Yard Intake: Normal</div>
            </div>
          </div>

          {/* AI Advisory Box */}
          <div style={{ background: '#fffbeb', padding: '0.75rem', borderRadius: '10px', border: '1px solid #fde68a', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b45309' }}>🤖 {t('aiAdvice')} ({crop})</div>
            <div style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '2px' }}>
              {recommendation.weather.rainfallProbability > 20
                ? `⚠️ Rain risk detected. Damp weather may slow down ${crop} drying (Standard limit: ≤ ${cropLimit}%). Consider waiting for clear sun.`
                : `✅ Clear sun forecast! Optimal conditions to deliver ${crop} within target moisture standard (≤ ${cropLimit}%).`}
            </div>
          </div>

          {/* Farmer Decision Note */}
          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, marginBottom: '0.75rem', fontStyle: 'italic' }}>
            🌾 {t('farmerDecisionNote')}
          </div>

          <button className="btn-green" onClick={handleConfirmBooking}>
            ✅ {t('confirmBooking')}
          </button>
        </div>
      )}
    </div>
  );
}

