import React from 'react'

export default function StatBox({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--gray-border)',
      borderRadius: 10,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? 'var(--text)', fontFamily: 'var(--mono)' }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}
