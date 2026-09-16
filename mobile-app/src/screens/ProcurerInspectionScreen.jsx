import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ProcurerInspectionScreen({ procurer }) {
  const { lang, t, speakVoice } = useLanguage();
  const [procurerId] = useState('PROC-WARANGAL-01');

  // Workflow states
  const [viewState, setViewState] = useState('SCHEDULE'); // SCHEDULE | CAMERA | RESULTS
  const [scheduleTab, setScheduleTab] = useState('PENDING'); // PENDING | COMPLETED
  
  const [bookings, setBookings] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [photoCaptured, setPhotoCaptured] = useState(false);

  // IoT Diagnostics & Sensor Health States
  const [iotDiagnostics, setIotDiagnostics] = useState(null);
  const [nearbyIdleDevices, setNearbyIdleDevices] = useState([]);
  const [isSwitchingDevice, setIsSwitchingDevice] = useState(false);
  const [showDiagDetails, setShowDiagDetails] = useState(false);
  const [switchToast, setSwitchToast] = useState(null);

  // Random points generated on heap photo
  const [randomPins, setRandomPins] = useState([
    { id: 1, label: 'Corner Top', x: 20, y: 25, moisture: 13.5 },
    { id: 2, label: 'Center Core', x: 50, y: 45, moisture: 15.8 },
    { id: 3, label: 'Base Heap', x: 75, y: 70, moisture: 14.2 },
    { id: 4, label: 'Corner Base', x: 30, y: 75, moisture: 13.9 }
  ]);

  const [activePin, setActivePin] = useState(1);

  // Inputs on Acceptance
  const [quantityInput, setQuantityInput] = useState('4.5');
  const [vehicleLoadNo, setVehicleLoadNo] = useState('TS-08-EX-4921');

  // Reschedule slot selection on Rejection
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [probeSyncing, setProbeSyncing] = useState(false);

  // Fetch live IoT Diagnostics & Health
  const fetchIoTDiagnostics = () => {
    fetch('/api/sensors/diagnostics')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIotDiagnostics(data);
          if (data.nearbyIdleDevices) {
            setNearbyIdleDevices(data.nearbyIdleDevices);
          }
        }
      })
      .catch(console.error);
  };

  // Fetch live bookings from server
  const fetchSchedule = () => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBookings(data.bookings);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSchedule();
    fetchIoTDiagnostics();
    const interval = setInterval(() => {
      fetchSchedule();
      fetchIoTDiagnostics();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Play audio siren / warning sound on fault trigger
  const playWarningBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  };

  // Toggle IoT Fault Simulation
  const handleToggleFault = () => {
    fetch('/api/sensors/toggle-fault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faultType: 'PROBE_SHORT' })
    })
      .then(res => res.json())
      .then(data => {
        fetchIoTDiagnostics();
        if (data.isFaulty) {
          playWarningBeep();
          speakVoice(lang === 'te' 
            ? 'హెచ్చరిక! IoT సెన్సార్‌లో లోపం గుర్తించబడింది. సమీపంలోని పరికరానికి మారండి.'
            : lang === 'hi'
            ? 'चेतावनी! IoT सेंसर में खराबी का पता चला है। पास के डिवाइस पर स्विच करें।'
            : 'Warning! Critical IoT probe hardware fault detected. Please switch to an idle backup device.'
          );
        }
      });
  };

  // Switch to an idle nearby IoT device
  const handleSwitchDevice = (targetDeviceId) => {
    setIsSwitchingDevice(true);
    fetch('/api/sensors/switch-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: targetDeviceId })
    })
      .then(res => res.json())
      .then(data => {
        setIsSwitchingDevice(false);
        if (data.success) {
          setSwitchToast(`✅ ${data.message}`);
          fetchIoTDiagnostics();
          setTimeout(() => setSwitchToast(null), 5000);
          speakVoice(lang === 'te'
            ? 'IoT పరికరం విజయవంతంగా మార్చబడింది. తనిఖీని కొనసాగించండి.'
            : lang === 'hi'
            ? 'IoT डिवाइस सफलतापूर्वक बदल दिया गया है।'
            : 'IoT device paired successfully. Live inspection resumed.'
          );
        }
      })
      .catch(err => {
        setIsSwitchingDevice(false);
        console.error(err);
      });
  };

  // Filter pending vs completed inspections
  const pendingBookings = bookings.filter(b => b.status === 'Inspection Phase' || b.status === 'Pending' || !b.status);
  const completedBookings = bookings.filter(b => b.status !== 'Inspection Phase' && b.status !== 'Pending' && b.status);

  // Multi-Crop dynamic threshold
  const cropThreshold = selectedFarmer?.moistureThreshold ? parseFloat(selectedFarmer.moistureThreshold) : 14.0;
  const avgMoisture = (randomPins.reduce((s, p) => s + p.moisture, 0) / randomPins.length).toFixed(1);
  const isAccepted = parseFloat(avgMoisture) <= cropThreshold;

  const requiredDryingDays = Math.max(1, Math.ceil((parseFloat(avgMoisture) - cropThreshold) / 0.45));
  const today = new Date();
  
  const futureSlots = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + requiredDryingDays + i + 1);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = i % 2 === 0 ? '10:00 AM - 11:00 AM' : '02:00 PM - 03:00 PM';
    return {
      id: `${dateStr}_${i}`,
      date: dateStr,
      timeSlot: timeStr
    };
  });

  const handleStartInspection = (farmerItem) => {
    setSelectedFarmer(farmerItem);
    setQuantityInput(String(farmerItem.quantity || 4.5));
    setViewState('CAMERA');
    setPhotoCaptured(false);
    setSelectedSlotId(futureSlots[0].id);
  };

  const handleCapturePhoto = () => {
    setPhotoCaptured(true);
    const targetLimit = selectedFarmer?.moistureThreshold || 14.0;
    const baseVal = targetLimit - 0.6;
    const newPins = [
      { id: 1, label: 'Corner Surface', x: 25, y: 30, moisture: (baseVal + Math.random() * 2.2).toFixed(1) },
      { id: 2, label: 'Core Heap Center', x: 52, y: 48, moisture: (baseVal + 0.8 + Math.random() * 2.0).toFixed(1) },
      { id: 3, label: 'Base Layer', x: 78, y: 68, moisture: (baseVal + Math.random() * 1.8).toFixed(1) },
      { id: 4, label: 'Side Surface', x: 35, y: 72, moisture: (baseVal + Math.random() * 1.6).toFixed(1) }
    ].map(p => ({ ...p, moisture: parseFloat(p.moisture) }));

    setRandomPins(newPins);
  };

  const fetchLiveSensorForActivePin = () => {
    if (iotDiagnostics?.isFaulty) {
      playWarningBeep();
      alert(t('iotFaultWarnMsg'));
      return;
    }

    setProbeSyncing(true);
    fetch('/api/sensors/latest')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.readings) {
          const liveMoisture = data.readings.moisture;
          setRandomPins(prev => prev.map(p => p.id === activePin ? { ...p, moisture: liveMoisture } : p));
        }
      })
      .catch(console.error)
      .finally(() => setProbeSyncing(false));
  };

  const handleUpdatePinValue = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setRandomPins(prev => prev.map(p => p.id === activePin ? { ...p, moisture: num } : p));
  };

  const handleFinalSubmit = () => {
    if (iotDiagnostics?.isFaulty) {
      alert('Cannot submit inspection while IoT sensor is FAULTY! Please switch to a healthy idle backup device first.');
      return;
    }

    const chosenSlot = futureSlots.find(s => s.id === selectedSlotId) || futureSlots[0];
    const nextStatus = isAccepted ? 'Procurement Completed' : `Requires ${requiredDryingDays} Days Drying`;

    fetch('/api/quality-checks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: selectedFarmer.tokenNo,
        farmerId: selectedFarmer.farmerId,
        cropName: selectedFarmer.cropName || 'Paddy (Samba Mahsuri)',
        moisture: parseFloat(avgMoisture),
        pins: randomPins,
        vehicleLoadNo: vehicleLoadNo,
        quantity: parseFloat(quantityInput),
        remarks: isAccepted
          ? `Procurement Completed. Crop: ${selectedFarmer.cropName || 'Paddy'}, Vehicle: ${vehicleLoadNo}, Quantity: ${quantityInput} Tonnes. Approved (Avg ${avgMoisture}% ≤ ${cropThreshold}%).`
          : `Requires minimum ${requiredDryingDays} days field sun drying. Rescheduled for ${chosenSlot.date} (${chosenSlot.timeSlot}).`
      })
    })
      .then(res => res.json())
      .then(data => {
        fetch(`/api/bookings/${selectedFarmer.tokenNo}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextStatus,
            requestedDate: isAccepted ? selectedFarmer.requestedDate : chosenSlot.date,
            requestedTime: isAccepted ? selectedFarmer.requestedTime : chosenSlot.timeSlot
          })
        }).then(() => {
          fetchSchedule();
          setViewState('SCHEDULE');
          setScheduleTab('COMPLETED');
          alert(isAccepted
            ? `Procurement Completed! Token ${selectedFarmer.tokenNo} grain approved. Report stored in registry & confirmation call sent to farmer.`
            : `Drying Required. Token ${selectedFarmer.tokenNo} rescheduled. Advisory report stored & call notification sent to farmer.`
          );
        });
      });
  };

  const isFaulty = iotDiagnostics?.isFaulty;

  return (
    <div>
      {/* Toast Notification */}
      {switchToast && (
        <div style={{
          background: '#065f46',
          color: '#ffffff',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          marginBottom: '0.75rem',
          fontWeight: 800,
          fontSize: '0.85rem',
          boxShadow: '0 4px 12px rgba(6, 95, 70, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>✨</span>
          <span>{switchToast}</span>
        </div>
      )}

      {/* Procurer Identity Header */}
      <div style={{ background: '#1e293b', color: '#fff', padding: '0.85rem 1rem', borderRadius: '16px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>PROCURER ID: {procurerId}</div>
          <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{iotDiagnostics?.centerName || 'Warangal Agricultural Market Yard'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ background: isFaulty ? '#ef4444' : '#10b981', color: '#fff', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '10px', fontWeight: 800 }}>
            {iotDiagnostics?.bayName ? iotDiagnostics.bayName.split('(')[0].trim() : 'BAY 02'} LIVE
          </div>
        </div>
      </div>

      {/* 🚨 IOT HEALTH & FAULTY DETECTOR MONITOR BAR */}
      <div
        className="card"
        style={{
          border: isFaulty ? '2.5px solid #ef4444' : '1.5px solid #10b981',
          background: isFaulty ? '#fef2f2' : '#f0fdf4',
          padding: '0.75rem 0.9rem',
          marginBottom: '0.85rem',
          boxShadow: isFaulty ? '0 0 16px rgba(239, 68, 68, 0.35)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isFaulty ? '#ef4444' : '#10b981',
              display: 'inline-block',
              boxShadow: isFaulty ? '0 0 10px #ef4444' : '0 0 8px #10b981',
              animation: isFaulty ? 'pulse-danger 0.9s infinite alternate' : 'none'
            }} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isFaulty ? '#991b1b' : '#065f46', textTransform: 'uppercase' }}>
                📡 {t('iotHealthStatus') || 'IoT Sensor Health'} • {iotDiagnostics?.deviceId || 'MOISTURE-ESP32-01'}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isFaulty ? '#dc2626' : '#047857' }}>
                {isFaulty ? `🔴 ${t('iotFaulty') || 'FAULTY SENSOR DETECTED'}` : `🟢 ${t('iotHealthy') || 'Healthy & Calibrated (98%)'}`}
              </div>
            </div>
          </div>

          {/* Fault Simulation & Diagnostics Toggle Buttons */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleToggleFault}
              style={{
                background: isFaulty ? '#10b981' : '#fee2e2',
                color: isFaulty ? '#ffffff' : '#b91c1c',
                border: `1px solid ${isFaulty ? '#059669' : '#fca5a5'}`,
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
              title="Test Sensor Fault Alert"
            >
              {isFaulty ? '✨ Clear Fault' : '🧪 Test Fault'}
            </button>
            <button
              onClick={() => setShowDiagDetails(!showDiagDetails)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '4px 7px',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {showDiagDetails ? '▲ Hide' : '⚙️ Diag'}
            </button>
          </div>
        </div>

        {/* Detailed Hardware Diagnostics Drawer */}
        {showDiagDetails && iotDiagnostics && (
          <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '6px' }}>
              <div style={{ background: '#ffffff', padding: '4px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>🔋 Battery:</span> <strong>{iotDiagnostics.hardwareMetrics?.battery || 94}%</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '4px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>📶 Signal:</span> <strong>{iotDiagnostics.hardwareMetrics?.signalStrength || '92%'}</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '4px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>⚡ Health:</span> <strong style={{ color: isFaulty ? '#dc2626' : '#059669' }}>{iotDiagnostics.healthScore}%</strong>
              </div>
            </div>
            {iotDiagnostics.diagnosticChecks?.map((chk, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed #f1f5f9' }}>
                <span style={{ color: '#475569' }}>{chk.testName}</span>
                <span style={{ fontWeight: 800, color: chk.passed ? '#059669' : '#dc2626' }}>{chk.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🚨 FLASHING RED ALERT BANNER ON FAULT DETECTION */}
      {isFaulty && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
            color: '#ffffff',
            border: '2px solid #ef4444',
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '16px',
            boxShadow: '0 6px 20px rgba(185, 28, 28, 0.45)',
            animation: 'screen-shake 0.6s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ fontSize: '2rem', animation: 'pulse-danger 0.8s infinite' }}>🚨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '0.5px' }}>
                {t('iotFaultBanner') || 'CRITICAL IOT SENSOR PROBE FAULT DETECTED!'}
              </div>
              <div style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', margin: '4px 0', fontWeight: 800, color: '#fca5a5' }}>
                CODE: {iotDiagnostics?.faultDetails?.code || 'ERR_PROBE_SHORT_CIRCUIT'}
              </div>
              <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0', lineHeight: '1.4', color: '#fee2e2' }}>
                {t('iotFaultWarnMsg') || 'Capacitive probe electrode hardware fault detected. Moisture readings fluctuating abnormally (+8.2% drift). Moisture reading locked for quality safety. Switch immediately to a nearby idle backup device.'}
              </p>
            </div>
          </div>

          {/* 📍 AUTO-SUGGESTION OF NEARBY IDLE IOT DEVICES (NOT IN USE) */}
          <div style={{ marginTop: '0.85rem', background: '#ffffff', borderRadius: '12px', padding: '0.75rem', color: '#0f172a' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📍</span>
              <span>{t('nearbyIdleDevices') || 'Auto-Detected Nearby Idle IoT Devices (Not In Use):'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {nearbyIdleDevices.length > 0 ? (
                nearbyIdleDevices.slice(0, 3).map((dev) => (
                  <div
                    key={dev.deviceId}
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'transform 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                        📍 {dev.bayName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        {dev.distanceText} • ID: <strong style={{ color: '#047857' }}>{dev.deviceId}</strong>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, marginTop: '2px', display: 'flex', gap: '8px' }}>
                        <span>🟢 {t('idleStatus') || 'IDLE & READY'}</span>
                        <span>🔋 {dev.battery}%</span>
                        <span>📶 {dev.signalStrength}</span>
                      </div>
                    </div>

                    <button
                      disabled={isSwitchingDevice}
                      onClick={() => handleSwitchDevice(dev.deviceId)}
                      style={{
                        background: '#047857',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(4, 120, 87, 0.3)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isSwitchingDevice ? 'Switching...' : (t('switchToDevice') || '⚡ Switch to Device')}
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '0.5rem' }}>
                  Scanning for nearby idle devices on LoRa / Mesh...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: TODAY'S SCHEDULE LIST (PENDING VS COMPLETED TABS) */}
      {viewState === 'SCHEDULE' && (
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064e3b', margin: '0 0 0.75rem 0' }}>
            📅 {t('todaysSchedule')}
          </h3>

          {/* Pending vs Completed Schedule Tabs */}
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '12px', padding: '3px', marginBottom: '1rem' }}>
            <button
              style={{
                flex: 1,
                border: 'none',
                padding: '8px',
                borderRadius: '10px',
                background: scheduleTab === 'PENDING' ? '#047857' : 'transparent',
                color: scheduleTab === 'PENDING' ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              onClick={() => setScheduleTab('PENDING')}
            >
              📋 Pending Inspection ({pendingBookings.length})
            </button>

            <button
              style={{
                flex: 1,
                border: 'none',
                padding: '8px',
                borderRadius: '10px',
                background: scheduleTab === 'COMPLETED' ? '#047857' : 'transparent',
                color: scheduleTab === 'COMPLETED' ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              onClick={() => setScheduleTab('COMPLETED')}
            >
              ✅ Completed ({completedBookings.length})
            </button>
          </div>

          {/* LIST OF PENDING INSPECTIONS */}
          {scheduleTab === 'PENDING' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingBookings.length > 0 ? (
                pendingBookings.map((item, idx) => {
                  const itemThreshold = item.moistureThreshold || 14.0;
                  return (
                    <div key={idx} className="card" style={{ borderLeft: '5px solid #047857', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#064e3b' }}>{item.tokenNo}</span>
                        <span style={{ fontSize: '0.75rem', background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                          ⏰ {item.requestedTime || '10:00 AM'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                        {item.farmerName} ({item.farmerPhone})
                      </div>

                      {/* Multi-crop Info Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#1e293b', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid #a7f3d0' }}>
                          🌾 {item.cropName || 'Paddy'}
                        </span>
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                          Limit: ≤ {itemThreshold}%
                        </span>
                        <span style={{ color: '#64748b' }}>• Qty: <strong>{item.quantity} Tonnes</strong></span>
                      </div>

                      <button className="btn-green" onClick={() => handleStartInspection(item)}>
                        📸 {t('inspectGrain')}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem', color: '#047857' }}>
                  <div style={{ fontSize: '2rem' }}>🎉</div>
                  <div style={{ fontWeight: 800, margin: '0.5rem 0' }}>All Today's Inspections Completed!</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No pending farmer tokens in queue.</div>
                </div>
              )}
            </div>
          )}

          {/* LIST OF COMPLETED INSPECTIONS */}
          {scheduleTab === 'COMPLETED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {completedBookings.length > 0 ? (
                completedBookings.map((item, idx) => (
                  <div key={idx} className="card" style={{ borderLeft: `5px solid ${(item.status === 'Procurement Completed' || item.status === 'Accepted') ? '#10b981' : '#f59e0b'}`, padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#064e3b' }}>{item.tokenNo}</span>
                      <span style={{ background: (item.status === 'Procurement Completed' || item.status === 'Accepted') ? '#d1fae5' : '#fef3c7', color: (item.status === 'Procurement Completed' || item.status === 'Accepted') ? '#047857' : '#b45309', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {item.status === 'Accepted' ? 'Procurement Completed' : item.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                      {item.farmerName} ({item.farmerPhone})
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#475569', margin: '2px 0' }}>
                      Crop: <strong>{item.cropName || 'Paddy'}</strong> (Limit: ≤ {item.moistureThreshold || 14.0}%)
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Tested Moisture: <strong>{item.moistureAtBooking || '13.4'}%</strong> • Vehicle Load: <strong>{item.vehicleLoadNo || 'TS-08-EX-4921'}</strong>
                    </div>

                    <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📋 Report Stored in Registry</span>
                      <span>•</span>
                      <span>📞 Call Sent</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                  No completed inspections yet today.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CAMERA VIEWFINDER & RANDOM SPOT GENERATION */}
      {viewState === 'CAMERA' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
                📸 Inspection: Token {selectedFarmer?.tokenNo}
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>
                🌾 {selectedFarmer?.cropName || 'Paddy'} (Target: ≤ {cropThreshold}%)
              </div>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: 800, cursor: 'pointer' }} onClick={() => setViewState('SCHEDULE')}>
              Cancel ✖
            </button>
          </div>

          <div className="card">
            {/* Camera Viewfinder Simulation */}
            <div className="heap-photo-container">
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                🔴 LIVE CAMERA VIEW - HEAP #{selectedFarmer?.tokenNo} ({selectedFarmer?.cropName || 'Grain'})
              </div>

              {!photoCaptured ? (
                <button className="btn-green" style={{ width: '80%', background: '#047857' }} onClick={handleCapturePhoto}>
                  📷 {t('captureHeap')}
                </button>
              ) : (
                /* Generated Random Sampling Pins */
                randomPins.map(pin => (
                  <div
                    key={pin.id}
                    onClick={() => setActivePin(pin.id)}
                    style={{
                      position: 'absolute',
                      top: `${pin.y}%`,
                      left: `${pin.x}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: activePin === pin.id ? '#ffffff' : pin.moisture > cropThreshold ? '#ef4444' : '#10b981',
                      color: activePin === pin.id ? '#0f172a' : '#ffffff',
                      border: '3px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    {pin.id}
                  </div>
                ))
              )}
            </div>

            {photoCaptured && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857', marginBottom: '4px' }}>
                  📍 {t('randomPointsGenerated')} (Selected Spot #{activePin})
                </div>

                {/* IoT Meter Input Slider */}
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: '4px' }}>
                    <span>Spot #{activePin}: {randomPins.find(p => p.id === activePin)?.label}</span>
                    <span style={{ color: randomPins.find(p => p.id === activePin)?.moisture > cropThreshold ? '#dc2626' : '#059669' }}>
                      {randomPins.find(p => p.id === activePin)?.moisture}% (Cutoff: {cropThreshold}%)
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5.0"
                    max="22.0"
                    step="0.1"
                    value={randomPins.find(p => p.id === activePin)?.moisture}
                    onChange={e => handleUpdatePinValue(e.target.value)}
                    style={{ width: '100%', accentColor: '#059669' }}
                  />

                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      Active Probe: <strong>{iotDiagnostics?.deviceId || 'ESP32-01'}</strong>
                    </span>
                    <button
                      onClick={fetchLiveSensorForActivePin}
                      disabled={probeSyncing || isFaulty}
                      style={{
                        background: isFaulty ? '#fee2e2' : '#ecfdf5',
                        border: `1px solid ${isFaulty ? '#f87171' : '#10b981'}`,
                        color: isFaulty ? '#b91c1c' : '#047857',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        cursor: isFaulty ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: isFaulty ? '#ef4444' : '#10b981' }} />
                      {probeSyncing ? 'Reading...' : isFaulty ? '⚠️ Sensor Faulty' : '📡 Read Live Probe (IoT)'}
                    </button>
                  </div>
                </div>

                {/* Average Summary against Crop Standard */}
                <div style={{ background: isAccepted ? '#ecfdf5' : '#fef2f2', border: `2px solid ${isAccepted ? '#a7f3d0' : '#fca5a5'}`, padding: '0.75rem', borderRadius: '12px', margin: '0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isAccepted ? '#065f46' : '#991b1b' }}>
                      {selectedFarmer?.cropName || 'GRAIN'} AVG MOISTURE
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isAccepted ? '#047857' : '#dc2626' }}>{avgMoisture}%</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Standard Limit: ≤ {cropThreshold}%</div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.85rem', color: isAccepted ? '#047857' : '#dc2626' }}>
                    {isAccepted ? '✅ ACCEPT (PASS)' : '⚠️ REJECT (DRYING REQUIRED)'}
                  </div>
                </div>

                <button
                  className="btn-green"
                  disabled={isFaulty}
                  style={{ opacity: isFaulty ? 0.6 : 1 }}
                  onClick={() => setViewState('RESULTS')}
                >
                  Proceed to Decision & Load Logging →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: ACCEPT / REJECT WORKFLOW */}
      {viewState === 'RESULTS' && (
        <div>
          {isAccepted ? (
            /* ACCEPTANCE FLOW */
            <div className="card" style={{ background: '#ecfdf5', border: '2px solid #10b981' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>
                ✅ QUALITY APPROVED (AVG {avgMoisture}% ≤ {cropThreshold}%)
              </div>

              <div style={{ fontSize: '0.8rem', color: '#047857', marginBottom: '0.75rem', background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                Crop: <strong>{selectedFarmer?.cropName || 'Paddy'}</strong> • Farmer: <strong>{selectedFarmer?.farmerName}</strong>
              </div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#047857', marginBottom: '4px' }}>
                {t('quantityTonnes')}
              </label>
              <input
                type="number"
                step="0.1"
                value={quantityInput}
                onChange={e => setQuantityInput(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 800 }}
              />

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#047857', marginBottom: '4px' }}>
                {t('vehicleLoadNo')}
              </label>
              <input
                type="text"
                value={vehicleLoadNo}
                onChange={e => setVehicleLoadNo(e.target.value)}
                placeholder="e.g. TS-08-EX-4921"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '1rem', fontSize: '1rem', fontWeight: 800 }}
              />

              <button className="btn-green" onClick={handleFinalSubmit}>
                ✅ Submit Approval & Update Farmer Dashboard Live
              </button>
            </div>
          ) : (
            /* REJECTION / DRYING FLOW WITH TAP-TO-PICK SLOT SELECTOR */
            <div className="card" style={{ background: '#fffbeb', border: '2px solid #f59e0b' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e', marginBottom: '0.5rem' }}>
                ⚠️ FIELD SUN-DRYING REQUIRED (AVG {avgMoisture}% &gt; {cropThreshold}%)
              </div>

              <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #fde68a', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#78350f' }}>
                <div>☀️ <strong>{t('dryingDaysNeeded')}:</strong> {requiredDryingDays} Days Minimum</div>
                <div>🔒 <strong>{t('lockedDatesNote')}:</strong> Premature dates locked based on crop agronomy.</div>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#78350f', marginBottom: '0.5rem' }}>
                📅 {t('rescheduleSlot')} (Tap to Select Any Slot):
              </div>

              {/* TAP-TO-PICK SLOT SELECTOR */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '190px', overflowY: 'auto', marginBottom: '1rem' }}>
                {futureSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      style={{
                        background: isSelected ? '#ecfdf5' : '#ffffff',
                        border: isSelected ? '2px solid #047857' : '1px solid #cbd5e1',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? '#064e3b' : '#0f172a' }}>📅 {slot.date}</div>
                        <div style={{ fontSize: '0.75rem', color: isSelected ? '#059669' : '#64748b', fontWeight: 700 }}>⏰ {slot.timeSlot}</div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: isSelected ? '#047857' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#64748b'
                        }}
                      >
                        {isSelected ? '✓ Selected' : 'Tap to Pick'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button className="btn-gold" onClick={handleFinalSubmit}>
                ⚡ Book Selected Priority Slot & Update Farmer Dashboard Live
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

