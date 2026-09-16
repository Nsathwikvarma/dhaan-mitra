import React, { useState, useEffect } from 'react';

export default function CenterManagementPage() {
  const [centers, setCenters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [capacityInput, setCapacityInput] = useState('');

  useEffect(() => {
    fetch('/api/centers')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCenters(data.centers);
      });
  }, []);

  const handleSaveCapacity = (id) => {
    const newCap = parseFloat(capacityInput);
    if (isNaN(newCap) || newCap <= 0) return;

    fetch(`/api/centers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyCapacity: newCap })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCenters(prev => prev.map(c => c.id === id ? { ...c, dailyCapacity: newCap } : c));
          setEditingId(null);
        }
      });
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Procurement Center Management</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
          Configure daily yard intake limits, moisture testing bays, and district assignments across centers.
        </p>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Center ID</th>
              <th>Center Name</th>
              <th>District</th>
              <th>State</th>
              <th>Daily Intake Limit (Tonnes)</th>
              <th>Operational Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {centers.map(center => (
              <tr key={center.id}>
                <td style={{ fontWeight: 700, color: '#3b82f6' }}>{center.id}</td>
                <td style={{ fontWeight: 700 }}>{center.name}</td>
                <td>{center.district}</td>
                <td>Telangana</td>
                <td>
                  {editingId === center.id ? (
                    <input
                      type="number"
                      value={capacityInput}
                      onChange={e => setCapacityInput(e.target.value)}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #3b82f6',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        width: '90px'
                      }}
                    />
                  ) : (
                    <span style={{ fontWeight: 800 }}>{center.dailyCapacity} Tonnes</span>
                  )}
                </td>
                <td>
                  <span className="status-badge accepted">ACTIVE OPERATIONAL</span>
                </td>
                <td>
                  {editingId === center.id ? (
                    <button className="btn-primary" onClick={() => handleSaveCapacity(center.id)}>
                      Save Limit
                    </button>
                  ) : (
                    <button
                      style={{
                        background: 'transparent',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      onClick={() => {
                        setEditingId(center.id);
                        setCapacityInput(center.dailyCapacity);
                      }}
                    >
                      Edit Capacity
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
