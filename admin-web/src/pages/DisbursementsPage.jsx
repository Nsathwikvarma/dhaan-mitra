import React, { useState, useEffect } from 'react';

export default function DisbursementsPage() {
  const [payments, setPayments] = useState([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchPayments = () => {
    setIsRefreshing(true);
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPayments(data.payments);
          setLastUpdated(new Date());
        }
      })
      .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    fetchPayments();
    // Poll every 8 seconds for real-time payment status updates
    const interval = setInterval(fetchPayments, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkPaid = (id) => {
    fetch(`/api/payments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Paid' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPayments(prev => prev.map(p => p.id === id || p.bookingId === id ? { ...p, status: 'Paid', paidAt: new Date().toISOString() } : p));
        }
      });
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Farmer Payment Disbursements</h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
            Track government grain payments, approve direct transfers, and trigger automated Telugu/Hindi voice receipts.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="live-badge live-badge--connected">
            <span className={`live-dot ${isRefreshing ? 'connecting' : ''}`} />
            {isRefreshing ? 'SYNCING...' : 'LIVE'}
          </div>
          <button
            onClick={fetchPayments}
            disabled={isRefreshing}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Txn Ref</th>
              <th>Booking ID</th>
              <th>Farmer Name</th>
              <th>Quantity</th>
              <th>Rate / Tonne</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id || payment.bookingId}>
                <td style={{ fontWeight: 700, color: '#3b82f6' }}>{payment.transactionReference}</td>
                <td>{payment.bookingId}</td>
                <td style={{ fontWeight: 700 }}>{payment.farmerName}</td>
                <td>{payment.quantity} T</td>
                <td>₹{payment.ratePerTonne?.toLocaleString('en-IN')}</td>
                <td style={{ fontWeight: 800, color: '#10b981' }}>
                  ₹{payment.amount?.toLocaleString('en-IN')}
                </td>
                <td>
                  <span className={`status-badge ${payment.status === 'Paid' ? 'paid' : 'pending'}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  {payment.status !== 'Paid' ? (
                    <button className="btn-primary" onClick={() => handleMarkPaid(payment.id || payment.bookingId)}>
                      Approve & Disburse
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Paid on {new Date(payment.paidAt || Date.now()).toLocaleDateString()}
                    </span>
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
