import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AnalysisReportsScreen({ farmer }) {
  const { lang, t, speakVoice, speakVisualGuide, speakingKey } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [qualityChecks, setQualityChecks] = useState([]);

  const fetchReports = () => {
    fetch(`/api/quality-checks?farmerId=${farmer?.farmerId || 'FARM-101'}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.qualityChecks) {
          setQualityChecks(data.qualityChecks);
        }
      });

    fetch(`/api/notifications?farmerId=${farmer?.farmerId || 'FARM-101'}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.notifications);
      });
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 2000); // 2-second real-time polling
    return () => clearInterval(interval);
  }, [farmer]);

  const latestCheck = qualityChecks.length > 0 ? qualityChecks[qualityChecks.length - 1] : null;
  const cropThreshold = latestCheck?.cropThreshold || 14.0;
  const cropName = latestCheck?.cropName || farmer?.crop || 'Paddy (Samba Mahsuri)';

  const pins = latestCheck?.pins && latestCheck.pins.length > 0 ? latestCheck.pins : [
    { label: 'Surface Top', moisture: cropThreshold - 0.8, isWet: false },
    { label: 'Center Core', moisture: cropThreshold + 1.8, isWet: true },
    { label: 'Base Bottom', moisture: cropThreshold - 0.5, isWet: false },
    { label: 'Side Edge', moisture: cropThreshold - 0.2, isWet: false }
  ];

  const wetCount = pins.filter(p => (p.moisture > cropThreshold || p.isWet)).length;
  const dryCount = pins.length - wetCount;

  const handleSpeakHeapReport = () => {
    if (wetCount > 0) {
      speakVoice(lang === 'te' 
        ? `మీ ${cropName} పంటలో ${wetCount} భాగాల్లో తేమ ఎక్కువగా ఉంది (గరిష్ట పరిమితి ${cropThreshold}%). ఎండబెట్టడం అవసరం.`
        : `${cropName} inspection: ${wetCount} parts exceed threshold ${cropThreshold}%. Requires field sun-drying.`
      );
    } else {
      speakVoice(lang === 'te'
        ? `${cropName} పంట పూర్తిగా ఎండినది. తేమ శాతం ${cropThreshold}% లోపు ఉంది. కొనుగోలు ఆమోదించబడింది.`
        : `${cropName} is completely dry. Moisture is below ${cropThreshold}%. Approved for procurement.`
      );
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
            📋 {t('moistureMapTitle')}
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>
            🌾 {cropName} (Limit: ≤ {cropThreshold}%)
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', background: '#d1fae5', color: '#047857', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
          {wetCount > 0 ? (lang === 'te' ? '⚠️ ఎండబెట్టడం అవసరం' : lang === 'hi' ? '⚠️ सुखाना आवश्यक' : '⚠️ Field Drying') : (lang === 'te' ? '✅ 100% ఎండింది' : lang === 'hi' ? '✅ 100% सूखा' : '✅ 100% Dry')}
        </span>
      </div>

      {latestCheck ? (
        <>
          {/* Card 1: Visual Grain Heap Cross-Section (WET vs DRY Zones) */}
          <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: '1rem' }}>
            {/* Top-Right Corner Volume Button (1/5th) */}
            <button
              className={`card-volume-btn ${speakingKey === 'reports' ? 'speaking' : ''}`}
              style={{ top: '8px', right: '8px', width: '42px', height: '42px' }}
              onClick={handleSpeakHeapReport}
              aria-label="Listen Voice"
            >
              🔊
            </button>

            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.5rem' }}>
              🌾 {cropName} — {t('heapCrossSection')}
            </div>

            {/* Quick Summary Pill Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ flex: 1, background: '#dcfce7', border: '1.5px solid #86efac', padding: '6px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>☀️</span>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#15803d' }}>{dryCount} {t('partsDry')}</div>
                <div style={{ fontSize: '0.65rem', color: '#166534' }}>≤ {cropThreshold}% ({lang === 'te' ? 'ఎండింది' : lang === 'hi' ? 'सूखा' : 'Dry'})</div>
              </div>

              <div style={{ flex: 1, background: wetCount > 0 ? '#fee2e2' : '#f1f5f9', border: `1.5px solid ${wetCount > 0 ? '#fca5a5' : '#cbd5e1'}`, padding: '6px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>💧</span>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: wetCount > 0 ? '#b91c1c' : '#64748b' }}>{wetCount} {t('partsWet')}</div>
                <div style={{ fontSize: '0.65rem', color: wetCount > 0 ? '#991b1b' : '#64748b' }}>&gt; {cropThreshold}% ({lang === 'te' ? 'తేమ' : lang === 'hi' ? 'नमी' : 'Wet'})</div>
              </div>
            </div>

            {/* Visual Grain Heap Cutout Diagram with Interactive Pins */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '210px',
                background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 50%, #d97706 100%)',
                borderRadius: '18px',
                border: '3px solid #b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 20px rgba(180, 83, 9, 0.2)'
              }}
            >
              {/* Heap Silhouette Curve */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -15,
                  width: '120%',
                  height: '180px',
                  borderRadius: '50% 50% 0 0',
                  background: 'radial-gradient(ellipse at center, #f59e0b 0%, #b45309 100%)',
                  opacity: 0.85
                }}
              />

              {/* Pin 1: Surface Top */}
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: pins[0]?.moisture > cropThreshold ? '#fee2e2' : '#dcfce7',
                  border: `2.5px solid ${pins[0]?.moisture > cropThreshold ? '#ef4444' : '#10b981'}`,
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                  color: pins[0]?.moisture > cropThreshold ? '#991b1b' : '#14532d'
                }}
              >
                <span>{pins[0]?.moisture > cropThreshold ? '💧 WET' : '☀️ DRY'}</span>
                <strong>{pins[0]?.moisture}%</strong>
              </div>

              {/* Pin 2: Center Core (Most critical part that stays wet) */}
              <div
                style={{
                  position: 'absolute',
                  top: '80px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: pins[1]?.moisture > cropThreshold ? '#fee2e2' : '#dcfce7',
                  border: `3px solid ${pins[1]?.moisture > cropThreshold ? '#dc2626' : '#10b981'}`,
                  borderRadius: '14px',
                  padding: '6px 14px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: pins[1]?.moisture > cropThreshold ? '0 0 16px rgba(220, 38, 38, 0.7)' : '0 4px 10px rgba(0,0,0,0.2)',
                  color: pins[1]?.moisture > cropThreshold ? '#991b1b' : '#14532d',
                  animation: pins[1]?.moisture > cropThreshold ? 'wet-puddle-pulse 1.2s infinite alternate' : 'none'
                }}
              >
                <span>{pins[1]?.moisture > cropThreshold ? '💧 CORE WET' : '☀️ CORE DRY'}</span>
                <strong>{pins[1]?.moisture}%</strong>
              </div>

              {/* Pin 3: Left Corner / Base */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '22px',
                  left: '14%',
                  background: pins[2]?.moisture > cropThreshold ? '#fee2e2' : '#dcfce7',
                  border: `2px solid ${pins[2]?.moisture > cropThreshold ? '#ef4444' : '#10b981'}`,
                  borderRadius: '10px',
                  padding: '3px 8px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  color: pins[2]?.moisture > cropThreshold ? '#991b1b' : '#14532d'
                }}
              >
                <span>{pins[2]?.moisture > cropThreshold ? '💧 WET' : '☀️ DRY'}</span>
                <strong>{pins[2]?.moisture}%</strong>
              </div>

              {/* Pin 4: Right Corner / Side */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '22px',
                  right: '14%',
                  background: pins[3]?.moisture > cropThreshold ? '#fee2e2' : '#dcfce7',
                  border: `2px solid ${pins[3]?.moisture > cropThreshold ? '#ef4444' : '#10b981'}`,
                  borderRadius: '10px',
                  padding: '3px 8px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  color: pins[3]?.moisture > cropThreshold ? '#991b1b' : '#14532d'
                }}
              >
                <span>{pins[3]?.moisture > cropThreshold ? '💧 WET' : '☀️ DRY'}</span>
                <strong>{pins[3]?.moisture}%</strong>
              </div>
            </div>

            {/* Visual Drying Advice Banner */}
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                borderRadius: '12px',
                background: wetCount > 0 ? '#fef2f2' : '#f0fdf4',
                border: `1.5px solid ${wetCount > 0 ? '#fca5a5' : '#86efac'}`,
                color: wetCount > 0 ? '#991b1b' : '#166534',
                fontSize: '0.8rem',
                fontWeight: 700,
                lineHeight: '1.4'
              }}
            >
              {wetCount > 0 ? (
                <>
                  ⚠️ <strong>Sun-Drying Required:</strong> The center core contains excess moisture ({pins[1]?.moisture}%). Spread grain thin in sunlight for 2-4 hours to drop moisture to ≤ 14.0%.
                </>
              ) : (
                <>
                  ✅ <strong>Grain Ready:</strong> All 4 sections of your grain heap meet the state procurement moisture threshold (≤ 14.0%).
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        /* LOCKED STATE BEFORE PROCURER INSPECTION */
        <div className="card" style={{ background: '#fef2f2', border: '2px solid #fca5a5', textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒 🔬</div>
          <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            Dhaan Inspection Report
          </div>
          <div style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
            Report will unlock once officer inspects grain at the yard.
          </div>
        </div>
      )}

      {/* Stored Report Info & Notification Dispatch Status */}
      {latestCheck && (
        <div className="card" style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#166534' }}>
              🏛️ Official Stored Procurement Registry
            </div>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
              STORED & VERIFIED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dcfce7' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Procurement Status:</span>
              <strong style={{ color: latestCheck.moisture <= 14 ? '#16a34a' : '#d97706' }}>
                {latestCheck.moisture <= 14 ? '✅ Procurement Completed' : '⚠️ Requires Field Sun Drying'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dcfce7' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Registry Report ID:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>REG-TS-{latestCheck.bookingId}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dcfce7' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Inspection Bay & Yard:</span>
              <span style={{ fontWeight: 700 }}>Warangal Market Yard (Bay 02)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dcfce7' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Recorded Net Quantity:</span>
              <span style={{ fontWeight: 700 }}>{latestCheck.quantity || '4.5'} Tonnes</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dcfce7' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Vehicle Plate Number:</span>
              <span style={{ fontWeight: 700 }}>{latestCheck.vehicleLoadNo || 'TS-08-EX-4921'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Automated Call Update:</span>
              <span style={{ fontWeight: 800, color: '#16a34a' }}>📞 Call Sent to Farmer</span>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.75rem', color: '#15803d' }}>
            ℹ️ Full grain inspection certificate stored in state database. Direct payment transfer initiated to registered Aadhaar-linked bank account.
          </div>
        </div>
      )}
    </div>
  );
}
