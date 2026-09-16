import React, { useState, useEffect } from 'react';
import {
  ProcurementBarChart,
  QualityDonutChart,
  CropDistributionChart,
  YardHeatmap
} from './AnalyticsCharts';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  useEffect(() => {
    fetch('/api/stream')
      .then(() => {})
      .catch(() => {});

    // Read initial data from REST API or EventSource
    const es = new EventSource('/api/stream');
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        setData(payload);
      } catch (_) {}
    };

    return () => es.close();
  }, []);

  const metrics = data?.metrics || {
    totalRegisteredFarmers: 128,
    totalBookedQuantity: 281,
    acceptedCount: 42,
    rejectedCount: 3,
    totalDisbursedPayment: 6245000,
    pendingPaymentCount: 4
  };

  const centers = data?.centersSummary || [
    { id: 'PROC-001', name: 'Nalgonda Main Market Yard', district: 'Nalgonda', dailyCapacity: 100, bookedQuantity: 82, remainingCapacity: 18, utilizationPercentage: 82 },
    { id: 'PROC-002', name: 'Miryalaguda Agri Procurement Center', district: 'Nalgonda', dailyCapacity: 120, bookedQuantity: 95, remainingCapacity: 25, utilizationPercentage: 79 },
    { id: 'PROC-003', name: 'Suryapet Rice Mandi', district: 'Suryapet', dailyCapacity: 80, bookedQuantity: 44, remainingCapacity: 36, utilizationPercentage: 55 },
    { id: 'PROC-004', name: 'Khammam Central Grain Terminal', district: 'Khammam', dailyCapacity: 150, bookedQuantity: 60, remainingCapacity: 90, utilizationPercentage: 40 }
  ];

  const districtData = [
    { district: 'Nalgonda', farmers: 58, tonnage: 177, yards: 2, passRate: '96%', avgMoisture: '12.8%' },
    { district: 'Suryapet', farmers: 34, tonnage: 44, yards: 1, passRate: '91%', avgMoisture: '13.4%' },
    { district: 'Khammam', farmers: 26, tonnage: 60, yards: 1, passRate: '94%', avgMoisture: '13.1%' },
    { district: 'Warangal', farmers: 10, tonnage: 28, yards: 1, passRate: '88%', avgMoisture: '14.2%' }
  ];

  const filteredDistricts = selectedDistrict === 'ALL'
    ? districtData
    : districtData.filter(d => d.district === selectedDistrict);

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
            📊 State Agricultural Intelligence & Deep Analytics
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
            Comprehensive data visualizations across district procurement, grain moisture distributions, and MSP disbursements.
          </p>
        </div>

        {/* District Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Filter District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <option value="ALL">All Districts (Telangana)</option>
            <option value="Nalgonda">Nalgonda</option>
            <option value="Suryapet">Suryapet</option>
            <option value="Khammam">Khammam</option>
            <option value="Warangal">Warangal</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span>TOTAL PROCUREMENT</span>
            <span>🌾</span>
          </div>
          <div className="metric-value">{metrics.totalBookedQuantity} <span style={{ fontSize: '1rem' }}>Tonnes</span></div>
          <div className="metric-sub">Across 4 Active Districts</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>QUALITY PASS RATE</span>
            <span>🔬</span>
          </div>
          <div className="metric-value" style={{ color: '#10b981' }}>
            {Math.round(((metrics.acceptedCount || 42) / ((metrics.acceptedCount || 42) + (metrics.rejectedCount || 3))) * 100)}%
          </div>
          <div className="metric-sub">Moisture ≤ 14% FCI Standard</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>PAYMENTS DISBURSED</span>
            <span>💰</span>
          </div>
          <div className="metric-value">₹{(metrics.totalDisbursedPayment / 100000).toFixed(2)} L</div>
          <div className="metric-sub">Direct Bank DBT Transfers</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>FARMER ENGAGEMENT</span>
            <span>👨‍🌾</span>
          </div>
          <div className="metric-value">{metrics.totalRegisteredFarmers}</div>
          <div className="metric-sub">Slot-verified Cultivators</div>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
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

      {/* Charts Grid Row 2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <CropDistributionChart />
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">🏛️ District-wise Procurement Breakdown</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
                District comparative performance and moisture compliance
              </p>
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>District</th>
                <th>Farmers</th>
                <th>Tonnage</th>
                <th>Avg Moisture</th>
                <th>Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistricts.map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 800, color: '#3b82f6' }}>{d.district}</td>
                  <td>{d.farmers}</td>
                  <td style={{ fontWeight: 700 }}>{d.tonnage} T</td>
                  <td>{d.avgMoisture}</td>
                  <td>
                    <span style={{
                      fontWeight: 800,
                      color: parseInt(d.passRate) >= 90 ? '#10b981' : '#f59e0b'
                    }}>
                      {d.passRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Congestion Heatmap */}
      <div style={{ marginBottom: '1.5rem' }}>
        <YardHeatmap centers={centers} />
      </div>
    </div>
  );
}
