import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--gray-border)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, color: 'var(--scarlet)' }}>{payload[0].value}% occupied</div>
      {payload[0].payload.available != null && (
        <div style={{ color: 'var(--text-secondary)' }}>{payload[0].payload.available} spaces open</div>
      )}
    </div>
  )
}

export default function CapacityChart({ history, garageName, loading }) {
  if (loading) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
        Loading history…
      </div>
    )
  }

  if (!history?.length) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
        No history yet — check back after a few polls.
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        24-hour occupancy
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={history} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="scarletGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#BA0C2F" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#BA0C2F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 2" strokeWidth={1} />
          <ReferenceLine y={90} stroke="#DC2626" strokeDasharray="4 2" strokeWidth={1} />
          <Area
            type="monotone" dataKey="pct"
            stroke="#BA0C2F" strokeWidth={2}
            fill="url(#scarletGrad)"
            dot={false} activeDot={{ r: 4, fill: '#BA0C2F' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 20, height: 1.5, background: '#F59E0B', display: 'inline-block' }} /> Busy (70%)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 20, height: 1.5, background: '#DC2626', display: 'inline-block' }} /> Full (90%)
        </span>
      </div>
    </div>
  )
}
