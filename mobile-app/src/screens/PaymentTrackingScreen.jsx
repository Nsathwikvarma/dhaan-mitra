import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentTrackingScreen({ farmer }) {
  const { lang, t, speakVoice, speakVisualGuide, speakingKey } = useLanguage();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch(`/api/payments?farmerId=${farmer?.farmerId || 'FARM-101'}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.payments?.length > 0) {
          setPayments(data.payments);
        }
      })
      .catch(() => {});
  }, [farmer]);

  const activePayment = payments.length > 0 ? payments[0] : {
    amount: 98235,
    quantity: 4.5,
    ratePerTonne: 21830,
    status: 'Processing',
    transactionReference: 'TXN-DM-849201'
  };

  const isPaid = activePayment.status === 'Paid';

  // Calculate estimated date
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 2);
  const estDateStr = estDate.toLocaleDateString(lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
          💳 {t('paymentTracking')}
        </h2>
        <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
          {isPaid ? (lang === 'te' ? '✅ జమ చేయబడింది' : lang === 'hi' ? '✅ जमा किया गया' : '✅ Transferred') : (lang === 'te' ? '⏳ జమ ప్రక్రియలో ఉంది' : lang === 'hi' ? '⏳ भुगतान प्रक्रिया में' : '⏳ Direct Transfer Processing')}
        </span>
      </div>

      {/* Card 1: Animated Money Flow & Bank Vault Transfer */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: '1rem', marginBottom: '1rem' }}>
        {/* Top-Right Corner Volume Button (1/5th) */}
        <button
          className={`card-volume-btn ${speakingKey === 'payments' ? 'speaking' : ''}`}
          style={{ position: 'absolute', top: '8px', right: '8px', width: '42px', height: '42px', zIndex: 10 }}
          onClick={() => speakVisualGuide('payments')}
          aria-label="Listen Voice"
        >
          🔊
        </button>

        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          💰 {t('moneyFlowTitle')}
        </div>

        {/* Animated Money Stream Container */}
        <div className="money-flow-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#064e3b', padding: '1rem', borderRadius: '12px' }}>
          {/* Source: Procurement Yard */}
          <div style={{ textAlign: 'center', zIndex: 5 }}>
            <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}>🌾</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a7f3d0' }}>{t('marketYard')}</div>
            <div style={{ fontSize: '0.65rem', color: '#ffffff' }}>4.5 Tonnes</div>
          </div>

          {/* Animated Flying Coins Stream */}
          <div style={{ position: 'relative', width: '130px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="flying-coin"
                style={{
                  position: 'absolute',
                  animationDelay: `${i * 0.42}s`,
                  filter: 'drop-shadow(0 0 6px #fde047)'
                }}
              >
                🪙
              </span>
            ))}
            <span style={{ color: '#34d399', fontSize: '1.2rem', fontWeight: 900 }}>➔ ➔</span>
          </div>

          {/* Destination: Farmer Bank Vault */}
          <div style={{ textAlign: 'center', zIndex: 5 }}>
            <div className="vault-bounce" style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px #fbbf24)' }}>🏦</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fef08a' }}>{t('bankVault')}</div>
            <div style={{ fontSize: '0.65rem', color: '#ffffff' }}>{t('directDbt')}</div>
          </div>
        </div>

        {/* Amount Badge */}
        <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total Approved Amount</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064e3b' }}>
              ₹ {activePayment.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>MSP Rate</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7' }}>₹2,183 / qtl</div>
          </div>
        </div>
      </div>

      {/* Card 2: Visual Transfer ETA & Government Bank Seal */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: '1rem', borderLeft: '5px solid #16a34a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '2rem' }}>🏛️</div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>GOVT OF TELANGANA / AP CIVIL SUPPLIES</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#78350f' }}>
              Expected Bank Transfer by: {estDateStr}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#b45309' }}>
              Verified by District Treasury & Agriculture Officer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}