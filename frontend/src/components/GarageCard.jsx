import React from 'react'

export function getStatus(pct, closed) {
  if (closed) return { label: 'Closed', color: '#6B7280', bg: '#F3F4F6', barColor: '#9CA3AF' }
  if (pct >= 90) return { label: 'Full',   color: '#DC2626', bg: '#FEF2F2', barColor: '#DC2626' }
  if (pct >= 70) return { label: 'Busy',   color: '#B45309', bg: '#FFFBEB', barColor: '#F59E0B' }
  return              { label: 'Open',   color: '#15803D', bg: '#F0FDF4', barColor: '#22C55E' }
}

export default function GarageCard({ garage, onClick, selected }) {
  const pct    = Math.round(garage.occupancyPct ?? 0)
  const closed = garage.closed === 1 || garage.closed === true
  const status = getStatus(pct, closed)
  const name   = garage.garage?.name ?? garage.name ?? garage.garageId ?? '—'
  const avail  = garage.available ?? 0
  const access = garage.accessTypes ? garage.accessTypes.split(',').filter(Boolean) : []

  return (
    <button
      onClick={() => onClick?.(garage)}
      style={{
        all: 'unset',
        display: 'block',
        width: '100%',
        cursor: 'pointer',
        border: selected ? '1.5px solid var(--scarlet)' : '1px solid var(--gray-border)',
        borderRadius: 10,
        padding: '12px 14px',
        background: selected ? 'var(--scarlet-dim)' : '#fff',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {/* Name + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3, color: 'var(--text)' }}>
          {name}
        </span>
        <span style={{
          flexShrink: 0,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
          padding: '2px 7px', borderRadius: 99,
          color: status.color, background: status.bg,
          textTransform: 'uppercase',
        }}>
          {status.label}
        </span>
      </div>

      {/* Bar */}
      <div style={{ marginTop: 10, height: 4, borderRadius: 99, background: 'var(--gray-border)' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${Math.min(pct, 100)}%`,
          background: status.barColor,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Stats */}
      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>
        <span>{avail} open</span>
        <span>{pct}%</span>
      </div>

      {/* Access badges */}
      {access.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
          {access.map(a => (
            <span key={a} style={{
              fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
              background: 'var(--gray-light)', color: 'var(--gray)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {a}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
