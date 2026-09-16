import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PriorityRescheduleScreen({ navigateTo }) {
  const { lang, t } = useLanguage();
  const [moisture, setMoisture] = useState('16.8');
  const [targetMoisture] = useState('14.0');
  const [calculation, setCalculation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleCalculateDrying = () => {
    fetch('/api/recommendations/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        measuredMoisture: parseFloat(moisture),
        targetMoisture: parseFloat(targetMoisture),
        village: 'Gundlapally'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCalculation(data);
        }
      });
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400e', margin: '0 0 0.5rem 0' }}>
        ⚡ Field Sun-Drying & Rescheduling
      </h2>
      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>
        Calculates estimated minimum sun-drying days, locks out premature dates, and lets you select your preferred future slot.
      </p>

      <div className="card" style={{ borderLeft: '5px solid #f59e0b' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
          MEASURED GRAIN MOISTURE %
        </label>
        <input
          type="number"
          step="0.1"
          value={moisture}
          onChange={e => setMoisture(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}
        />

        <button className="btn-gold" onClick={handleCalculateDrying}>
          ☀️ Calculate Drying Days & Lock Dates
        </button>
      </div>

      {calculation && (
        <div className="card" style={{ background: '#fffbeb', border: '2px solid #fde68a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e' }}>SUN-DRYING CALCULATOR REPORT</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#78350f', margin: '0.25rem 0' }}>
            {calculation.requiredDryingDays} Days Minimum Required
          </div>

          <div style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '1rem' }}>
            <div>☀️ <strong>Estimated Drying Rate:</strong> {calculation.dryingRatePerDay}% per day</div>
            <div>🔒 <strong>Date Lockout:</strong> Premature dates locked. Earliest allowed: {calculation.earliestAllowedDate}.</div>
          </div>

          {/* DISPLAY ALL POSSIBLE SLOTS AFTER REQUIRED DRYING DAYS */}
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857', marginBottom: '0.5rem' }}>
            {t('rescheduleSlot')} (Select Date):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
            {calculation.prioritySlots?.map((slot, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  background: selectedSlot === slot ? '#ecfdf5' : '#ffffff',
                  border: selectedSlot === slot ? '2px solid #047857' : '1px solid #fcd34d',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#064e3b' }}>📅 {slot.date}</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>⏰ {slot.timeSlot} • Priority Slot</div>
                </div>
                <button
                  style={{
                    background: selectedSlot === slot ? '#047857' : '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {selectedSlot === slot ? '✓ Selected' : 'Select Slot'}
                </button>
              </div>
            ))}
          </div>

          {selectedSlot && (
            <button
              className="btn-green"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                alert(`Priority Slot Confirmed for ${selectedSlot.date} at ${selectedSlot.timeSlot}! Audio Call Sent.`);
                navigateTo('home');
              }}
            >
              ✅ Confirm Selected Reschedule Slot & Alert Farmer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
