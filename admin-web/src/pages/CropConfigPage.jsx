import React, { useState, useEffect } from 'react';

export default function CropConfigPage() {
  const [crops, setCrops] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ maxMoisture: '', ratePerTonne: '' });

  useEffect(() => {
    fetch('/api/crops')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCrops(data.crops);
      });
  }, []);

  const handleSave = (id) => {
    fetch(`/api/crops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maxMoisturePercentage: parseFloat(editForm.maxMoisture),
        ratePerTonne: parseFloat(editForm.ratePerTonne)
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCrops(prev => prev.map(c => c.id === id ? {
            ...c,
            maxMoisturePercentage: parseFloat(editForm.maxMoisture),
            ratePerTonne: parseFloat(editForm.ratePerTonne)
          } : c));
          setEditingId(null);
        }
      });
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Crop & Moisture Quality Rules</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
          Configure government grain procurement standards, moisture cutoffs, and Minimum Support Prices (MSP).
        </p>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Crop Name</th>
              <th>Variety</th>
              <th>Max Moisture Limit (%)</th>
              <th>Government MSP (₹ / Tonne)</th>
              <th>Drying Constant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {crops.map(crop => (
              <tr key={crop.id}>
                <td style={{ fontWeight: 700 }}>{crop.name}</td>
                <td style={{ color: '#94a3b8' }}>{crop.variety || 'A-Grade'}</td>
                <td>
                  {editingId === crop.id ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.maxMoisture}
                      onChange={e => setEditForm({ ...editForm, maxMoisture: e.target.value })}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #3b82f6',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        width: '80px'
                      }}
                    />
                  ) : (
                    <span style={{ fontWeight: 800, color: '#f59e0b' }}>
                      {crop.maxMoisturePercentage || 14.0}%
                    </span>
                  )}
                </td>
                <td>
                  {editingId === crop.id ? (
                    <input
                      type="number"
                      value={editForm.ratePerTonne}
                      onChange={e => setEditForm({ ...editForm, ratePerTonne: e.target.value })}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #3b82f6',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        width: '110px'
                      }}
                    />
                  ) : (
                    <span style={{ fontWeight: 800, color: '#10b981' }}>
                      ₹{(crop.ratePerTonne || 21830).toLocaleString('en-IN')}
                    </span>
                  )}
                </td>
                <td>0.42 %/day @ 30°C</td>
                <td>
                  {editingId === crop.id ? (
                    <button className="btn-primary" onClick={() => handleSave(crop.id)}>
                      Save Rule
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
                        setEditingId(crop.id);
                        setEditForm({
                          maxMoisture: crop.maxMoisturePercentage || 14.0,
                          ratePerTonne: crop.ratePerTonne || 21830
                        });
                      }}
                    >
                      Edit Rule
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
