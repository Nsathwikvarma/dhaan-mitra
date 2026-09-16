import React from 'react';

// 1. Bar Chart: Procurement Tonnage by Center
export function ProcurementBarChart({ centers = [] }) {
  const maxCapacity = Math.max(...centers.map(c => c.dailyCapacity || 100), 100);

  return (
    <div className="admin-card" style={{ height: '100%' }}>
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">📈 Procurement Volume vs Capacity by Yard</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
            Current booked tonnage vs total allocated capacity (Tonnes)
          </p>
        </div>
        <span className="stream-tag">⚡ Live Yard Data</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
        {centers.map(center => {
          const bookedPct = Math.min(100, Math.round(((center.bookedQuantity || 0) / (center.dailyCapacity || 100)) * 100));
          const isHigh = bookedPct >= 85;
          const isMed = bookedPct >= 65 && bookedPct < 85;
          const barColor = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';

          return (
            <div key={center.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                  {center.name} ({center.district || 'Telangana'})
                </span>
                <span style={{ fontWeight: 800, color: barColor }}>
                  {center.bookedQuantity || 0} / {center.dailyCapacity} T ({bookedPct}%)
                </span>
              </div>
              <div style={{
                height: '14px',
                background: '#334155',
                borderRadius: '7px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${bookedPct}%`,
                  background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
                  borderRadius: '7px',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 2. Donut Chart: Grain Quality Acceptance vs Moisture Drying
export function QualityDonutChart({ acceptedCount = 42, rejectedCount = 3 }) {
  const total = acceptedCount + rejectedCount || 1;
  const acceptedPct = Math.round((acceptedCount / total) * 100);
  const rejectedPct = 100 - acceptedPct;

  // SVG circle calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const acceptedStroke = (acceptedPct / 100) * circumference;
  const rejectedStroke = (rejectedPct / 100) * circumference;

  return (
    <div className="admin-card" style={{ height: '100%' }}>
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">🔬 IoT Quality & Moisture Gate</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
            Automatic AI & Moisture Sensor Grading Ratio
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '1.25rem 0', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
          <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            {/* Background circle */}
            <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#334155" strokeWidth="20" />
            {/* Accepted segment (Emerald) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="20"
              strokeDasharray={`${acceptedStroke} ${circumference}`}
              strokeDashoffset="0"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
            {/* Rejected / Drying segment (Amber/Red) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="20"
              strokeDasharray={`${rejectedStroke} ${circumference}`}
              strokeDashoffset={`-${acceptedStroke}`}
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{acceptedPct}%</span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>ACCEPTED</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Grade A / Procured ({acceptedCount})
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Moisture ≤ 14% (FCI standard)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Field Drying Required ({rejectedCount})
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Moisture &gt; 14% (Advised sun-dry)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Crop-wise Breakdown Bar chart
export function CropDistributionChart() {
  const cropStats = [
    { name: 'Paddy (Grade A)', tonnage: 145, pct: 52, msp: '₹2,320/Qtl', color: '#10b981' },
    { name: 'Paddy (Common)', tonnage: 82, pct: 29, msp: '₹2,300/Qtl', color: '#3b82f6' },
    { name: 'Maize (Makka)', tonnage: 34, pct: 12, msp: '₹2,090/Qtl', color: '#f59e0b' },
    { name: 'Cotton (Long Staple)', tonnage: 20, pct: 7, msp: '₹7,521/Qtl', color: '#8b5cf6' }
  ];

  return (
    <div className="admin-card" style={{ height: '100%' }}>
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">🌾 Crop Variety Procurement Mix</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
            Share of commodities scheduled across all mandis
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {cropStats.map((crop, idx) => (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                {crop.name} <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>• MSP {crop.msp}</span>
              </span>
              <span style={{ fontWeight: 800, color: crop.color }}>
                {crop.tonnage} T ({crop.pct}%)
              </span>
            </div>
            <div style={{ height: '10px', background: '#334155', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${crop.pct}%`,
                background: crop.color,
                borderRadius: '5px',
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Heatmap Matrix for Yard Overload Risk
export function YardHeatmap({ centers = [] }) {
  const getRiskStatus = (utilization) => {
    if (utilization >= 90) return { label: 'CRITICAL (OVERLOAD)', bg: '#ef444422', border: '#ef4444', text: '#fca5a5' };
    if (utilization >= 75) return { label: 'HIGH TRAFFIC', bg: '#f59e0b22', border: '#f59e0b', text: '#fcd34d' };
    return { label: 'OPTIMAL FLOW', bg: '#10b98122', border: '#10b981', text: '#6ee7b7' };
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">🌡️ Mandi Yard Congestion & Weather Risk Matrix</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
            Automated load-balancing indicator to prevent farmer queue build-up and rain spoilage
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
      }}>
        {centers.map(center => {
          const risk = getRiskStatus(center.utilizationPercentage || 0);
          return (
            <div
              key={center.id}
              style={{
                background: risk.bg,
                border: `1.5px solid ${risk.border}`,
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>{center.name}</span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: risk.border,
                  color: '#ffffff'
                }}>
                  {risk.label}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                📍 {center.district || 'Telangana'} • Daily Max: {center.dailyCapacity} Tonnes
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: risk.text }}>
                  {center.utilizationPercentage}%
                </span>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  {center.remainingCapacity}T available
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
