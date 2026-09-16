import React, { useState, useEffect, useRef } from 'react';
import { ProcurementBarChart, QualityDonutChart, CropDistributionChart, YardHeatmap } from './AnalyticsCharts';

// Flash hook: triggers a brief CSS animation when a value changes
function useFlash(value) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (JSON.stringify(prev.current) !== JSON.stringify(value)) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return flash;
}

function MetricCard({ label, value, displayValue, icon, sub }) {
  const flash = useFlash(value);
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <div className={`metric-value${flash ? ' value-flash' : ''}`}>{displayValue}</div>
      <div className="metric-sub">{sub}</div>
    </div>
  );
}

export default function DashboardPage({ onNavigateToAnalytics }) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const esRef = useRef(null);

  useEffect(() => {
    function connect() {
      const es = new EventSource('/api/stream');
      esRef.current = es;

      es.onopen = () => setConnected(true);

      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          setData(payload);
          setLastUpdated(new Date());
          setConnected(true);
        } catch (_) {}
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        setTimeout(connect, 5000);
      };
    }

    connect();
    return () => { if (esRef.current) esRef.current.close(); };
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '2rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="live-dot connecting" />
        Connecting to live data stream...
      </div>
    );
  }

  const metrics = data.metrics || {};
  const centers = data.centersSummary || [];
  const recentQuality = data.recentQualityChecks || [];

  const acceptanceRate = metrics.acceptedCount + metrics.rejectedCount > 0
    ? `${Math.round((metrics.acceptedCount / (metrics.acceptedCount + metrics.rejectedCount)) * 100)}%`
    : '94%';

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>State Agricultural Dashboard</h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
            Real-time procurement metrics, moisture spot testing, and market yard utilization across Telangana State.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
          <div className={`live-badge ${connected ? 'live-badge--connected' : 'live-badge--disconnected'}`}>
            <span className={`live-dot${connected ? '' : ' connecting'}`} />
            {connected ? 'LIVE' : 'RECONNECTING...'}
          </div>
          {lastUpdated && (
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Last updated {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          label="TOTAL REGISTERED FARMERS"
          icon="🧑‍🌾"
          value={metrics.totalRegisteredFarmers}
          displayValue={metrics.totalRegisteredFarmers}
          sub="Across 4 Districts"
        />
        <MetricCard
          label="PROCURED GRAIN TONNAGE"
          icon="🌾"
          value={metrics.totalBookedQuantity}
          displayValue={<>{metrics.totalBookedQuantity} <span style={{ fontSize: '1rem' }}>Tonnes</span></>}
          sub="Paddy, Maize & Cotton"
        />
        <MetricCard
          label="QUALITY ACCEPTANCE RATE"
          icon="✅"
          value={acceptanceRate}
          displayValue={acceptanceRate}
          sub={`${metrics.rejectedCount} Required Field Drying`}
        />
        <MetricCard
          label="DISBURSED PAYMENTS"
          icon="💳"
          value={metrics.totalDisbursedPayment}
          displayValue={`₹${(metrics.totalDisbursedPayment / 100000).toFixed(2)} L`}
          sub={`${metrics.pendingPaymentCount} Pending Direct Transfers`}
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <ProcurementBarChart centers={centers} />
        <QualityDonutChart
          acceptedCount={metrics.acceptedCount || 42}
          rejectedCount={metrics.rejectedCount || 3}
        />
      </div>

      {/* Yard Heatmap & Risk */}
      <div style={{ marginBottom: '1.5rem' }}>
        <YardHeatmap centers={centers} />
      </div>

      {/* Yard Capacities */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Procurement Market Yard Live Capacity</h2>
          <span className="stream-tag">⚡ Auto-refreshing every 5s</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Market Yard Center</th>
              <th>Daily Capacity</th>
              <th>Booked Tonnage</th>
              <th>Remaining</th>
              <th>Utilization Rate</th>
            </tr>
          </thead>
          <tbody>
            {centers.map(center => (
              <tr key={center.id}>
                <td style={{ fontWeight: 700 }}>{center.name}</td>
                <td>{center.dailyCapacity} T</td>
                <td>{center.bookedQuantity} T</td>
                <td>{center.remainingCapacity} T</td>
                <td style={{ width: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="progress-bar-bg" style={{ flex: 1 }}>
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${center.utilizationPercentage}%`, transition: 'width 0.8s ease' }}
                      />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{center.utilizationPercentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent IoT Moisture Inspections */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Recent IoT Grain Moisture Inspections</h2>
          <span className="stream-tag">⚡ Auto-refreshing every 5s</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking Token</th>
              <th>Moisture %</th>
              <th>Temp (°C)</th>
              <th>Humidity %</th>
              <th>Grade / Decision</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {recentQuality.map((qc, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 700, color: '#3b82f6' }}>{qc.bookingId}</td>
                <td style={{ fontWeight: 800, color: qc.moisture > 14 ? '#ef4444' : '#10b981' }}>
                  {qc.moisture}%
                </td>
                <td>{qc.temperature}°C</td>
                <td>{qc.humidity}%</td>
                <td>
                  <span className={`status-badge ${qc.moisture > 14 ? 'rejected' : 'accepted'}`}>
                    {qc.grade || (qc.moisture > 14 ? 'Grade B (Dry Required)' : 'Grade A (Procure)')}
                  </span>
                </td>
                <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{qc.remarks || qc.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
