import React, { useState, useMemo, useEffect } from 'react'
import GarageCard, { getStatus } from './components/GarageCard'
import CapacityChart from './components/CapacityChart'
import StatBox from './components/StatBox'
import CampusMap from './components/CampusMap'
import { useGarageData, useGarageHistory } from './hooks/useGarageData'

function Dot({ color }) {
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7,
      borderRadius: '50%', background: color, marginRight: 5, flexShrink: 0,
    }} />
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function App() {
  const { garages, loading, error, lastFetch } = useGarageData()
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [tab, setTab]           = useState('map')
  const [mobileView, setMobileView] = useState('list') // 'list' | 'map' | 'detail'
  const isMobile = useIsMobile()

  const garageId = selected?.garageId ?? selected?.id
  const { history, loading: histLoading } = useGarageHistory(garageId)

  const filtered = useMemo(() => {
    return garages.filter(g => {
      const name   = (g.garage?.name ?? g.garageId ?? '').toLowerCase()
      const pct    = Math.round(g.occupancyPct ?? 0)
      const closed = g.closed === 1 || g.closed === true
      const access = g.accessTypes ?? ''
      if (search && !name.includes(search.toLowerCase())) return false
      if (filter === 'open'    && (closed || pct >= 70)) return false
      if (filter === 'busy'    && (closed || pct < 70 || pct >= 90)) return false
      if (filter === 'full'    && (closed || pct < 90)) return false
      if (filter === 'visitor' && !access.includes('visitor')) return false
      return true
    })
  }, [garages, search, filter])

  const counts = useMemo(() => ({
    open:   garages.filter(g => !(g.closed===1) && Math.round(g.occupancyPct??0) < 70).length,
    busy:   garages.filter(g => !(g.closed===1) && Math.round(g.occupancyPct??0) >= 70 && Math.round(g.occupancyPct??0) < 90).length,
    full:   garages.filter(g => !(g.closed===1) && Math.round(g.occupancyPct??0) >= 90).length,
    closed: garages.filter(g => g.closed===1).length,
  }), [garages])

  const selName   = selected?.garage?.name ?? selected?.garageId ?? '—'
  const selPct    = Math.round(selected?.occupancyPct ?? 0)
  const selClosed = selected?.closed === 1
  const selStatus = getStatus(selPct, selClosed)
  const selAvail  = selected?.available ?? 0
  const selOcc    = selected?.occupied  ?? 0
  const totalCap  = selAvail + selOcc

  const handleSelect = (g) => {
    const id    = g.garageId ?? g.id
    const selId = selected?.garageId ?? selected?.id
    if (id === selId) {
      setSelected(null)
      if (isMobile) setMobileView('list')
    } else {
      setSelected(g)
      if (isMobile) setMobileView('detail')
      else setTab('chart')
    }
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          background: 'var(--scarlet)', color: '#fff',
          padding: '0 16px', height: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>OSU Parking</span>
          <span style={{ fontSize: 10, opacity: 0.6 }}>
            {lastFetch ? lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        </header>

        {/* Summary strip */}
        <div style={{
          background: '#fff', borderBottom: '1px solid var(--gray-border)',
          padding: '0 12px', height: 34, display: 'flex', alignItems: 'center', gap: 14,
          fontSize: 11, flexShrink: 0, overflowX: 'auto',
        }}>
          {[
            { label: 'Open',   count: counts.open,   color: '#22C55E' },
            { label: 'Busy',   count: counts.busy,   color: '#F59E0B' },
            { label: 'Full',   count: counts.full,   color: '#DC2626' },
            { label: 'Closed', count: counts.closed, color: '#9CA3AF' },
          ].map(({ label, count, color }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              <Dot color={color} />
              <span style={{ fontWeight: 600 }}>{count}</span>
              <span style={{ color: 'var(--text-secondary)', marginLeft: 3 }}>{label}</span>
            </span>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

          {/* LIST view */}
          {mobileView === 'list' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid var(--gray-border)', background: '#fff' }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search garages…"
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: 13,
                    border: '1px solid var(--gray-border)', borderRadius: 7,
                    fontFamily: 'var(--font)', outline: 'none', color: 'var(--text)',
                    background: 'var(--gray-light)', boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  {['all', 'open', 'busy', 'full', 'visitor'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                      padding: '4px 10px', fontSize: 11, fontWeight: 600,
                      borderRadius: 99, cursor: 'pointer', fontFamily: 'var(--font)',
                      textTransform: 'capitalize',
                      border: filter === f ? '1.5px solid var(--scarlet)' : '1px solid var(--gray-border)',
                      background: filter === f ? 'var(--scarlet-dim)' : 'transparent',
                      color: filter === f ? 'var(--scarlet)' : 'var(--text-secondary)',
                    }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
                {loading && <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', marginTop: 32 }}>Loading…</p>}
                {error   && <p style={{ color: 'var(--red)', fontSize: 12, textAlign: 'center', marginTop: 32 }}>Backend not reachable.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filtered.map((g, i) => (
                    <GarageCard
                      key={g.id ?? g.garageId ?? i}
                      garage={g}
                      onClick={handleSelect}
                      selected={selected && (selected.garageId === g.garageId || selected.id === g.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MAP view */}
          {mobileView === 'map' && (
            <div style={{ height: '100%', position: 'relative' }}>
              <CampusMap garages={garages} selected={selected} onSelect={handleSelect} />
              {selected && (
                <div style={{
                  position: 'absolute', bottom: 70, left: 12, right: 12,
                  background: '#fff', borderRadius: 10, padding: '10px 14px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {selAvail} available · {selPct}% full
                    </div>
                  </div>
                  <button onClick={() => setMobileView('detail')} style={{
                    background: 'var(--scarlet)', color: '#fff', border: 'none',
                    borderRadius: 6, padding: '6px 12px', fontSize: 12,
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap',
                  }}>Details →</button>
                </div>
              )}
            </div>
          )}

          {/* DETAIL view */}
          {mobileView === 'detail' && selected && (
            <div style={{ height: '100%', overflowY: 'auto', padding: '16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <button onClick={() => setMobileView('list')} style={{
                  background: 'transparent', border: '1px solid var(--gray-border)',
                  borderRadius: 6, padding: '5px 10px', fontSize: 12,
                  cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text-secondary)',
                }}>← Back</button>
                <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selName}</h1>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                  color: selStatus.color, background: selStatus.bg,
                  textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                }}>{selStatus.label}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                <StatBox label="Available" value={selAvail} color="var(--green)" />
                <StatBox label="Occupied"  value={selOcc} />
                <StatBox label="Capacity"  value={totalCap} sub={`${selPct}% full`} />
              </div>
              <div style={{
                background: '#fff', border: '1px solid var(--gray-border)',
                borderRadius: 12, padding: '14px 12px',
              }}>
                <CapacityChart history={history} loading={histLoading} garageName={selName} />
              </div>
              {selected.scrapedAt && (
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10 }}>
                  Last updated {new Date(selected.scrapedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <nav style={{
          height: 54, background: '#fff', borderTop: '1px solid var(--gray-border)',
          display: 'flex', flexShrink: 0,
        }}>
          {[
            { key: 'list', label: '☰ List' },
            { key: 'map',  label: '🗺 Map' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setMobileView(key)} style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font)',
              color: mobileView === key ? 'var(--scarlet)' : 'var(--text-secondary)',
              borderTop: mobileView === key ? '2px solid var(--scarlet)' : '2px solid transparent',
            }}>{label}</button>
          ))}
        </nav>
      </div>
    )
  }

  // ── DESKTOP LAYOUT (unchanged) ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      <header style={{
        background: 'var(--scarlet)', color: '#fff',
        padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>OSU Parking</span>
          <span style={{ fontSize: 11, opacity: 0.6 }}>
            {garages.length} garages · {lastFetch ? lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 7, padding: 2, gap: 2 }}>
          {['map', 'chart'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              border: 'none', borderRadius: 5, padding: '4px 14px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
              textTransform: 'capitalize',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? 'var(--scarlet)' : 'rgba(255,255,255,0.85)',
              transition: 'all 0.15s',
            }}>
              {t === 'map' ? '🗺 Map' : '📊 Chart'}
            </button>
          ))}
        </div>
        <a href="https://github.com/aidennh1" target="_blank" rel="noreferrer"
          style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 500 }}>
          github.com/aidennh1
        </a>
      </header>

      <div style={{
        background: '#fff', borderBottom: '1px solid var(--gray-border)',
        padding: '0 24px', height: 38, display: 'flex', alignItems: 'center', gap: 20,
        fontSize: 12, flexShrink: 0,
      }}>
        {[
          { label: 'Open',   count: counts.open,   color: '#22C55E' },
          { label: 'Busy',   count: counts.busy,   color: '#F59E0B' },
          { label: 'Full',   count: counts.full,   color: '#DC2626' },
          { label: 'Closed', count: counts.closed, color: '#9CA3AF' },
        ].map(({ label, count, color }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <Dot color={color} />
            <span style={{ fontWeight: 600 }}>{count}</span>
            <span style={{ color: 'var(--text-secondary)', marginLeft: 3 }}>{label}</span>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: 288, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--gray-border)', background: '#fff', flexShrink: 0,
        }}>
          <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid var(--gray-border)' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search garages…"
              style={{
                width: '100%', padding: '7px 10px', fontSize: 12,
                border: '1px solid var(--gray-border)', borderRadius: 7,
                fontFamily: 'var(--font)', outline: 'none', color: 'var(--text)',
                background: 'var(--gray-light)',
              }}
            />
            <div style={{ display: 'flex', gap: 4, marginTop: 7, flexWrap: 'wrap' }}>
              {['all', 'open', 'busy', 'full', 'visitor'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '3px 9px', fontSize: 10, fontWeight: 600,
                  borderRadius: 99, cursor: 'pointer', fontFamily: 'var(--font)',
                  textTransform: 'capitalize', letterSpacing: '0.03em',
                  border: filter === f ? '1.5px solid var(--scarlet)' : '1px solid var(--gray-border)',
                  background: filter === f ? 'var(--scarlet-dim)' : 'transparent',
                  color: filter === f ? 'var(--scarlet)' : 'var(--text-secondary)',
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
            {loading && <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', marginTop: 32 }}>Loading…</p>}
            {error   && <p style={{ color: 'var(--red)', fontSize: 12, textAlign: 'center', marginTop: 32 }}>Backend not reachable.<br/>Make sure Spring Boot is running.</p>}
            {!loading && !error && filtered.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, textAlign: 'center', marginTop: 32 }}>No garages match.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {filtered.map((g, i) => (
                <GarageCard
                  key={g.id ?? g.garageId ?? i}
                  garage={g}
                  onClick={handleSelect}
                  selected={selected && (selected.garageId === g.garageId || selected.id === g.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {tab === 'map' && (
            <div style={{ flex: 1, position: 'relative' }}>
              <CampusMap garages={garages} selected={selected} onSelect={handleSelect} />
              {selected && (
                <div style={{
                  position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                  background: '#fff', borderRadius: 10, padding: '10px 16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000,
                  display: 'flex', alignItems: 'center', gap: 16, minWidth: 280,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{selName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {selAvail} available · {selPct}% full
                    </div>
                  </div>
                  <span style={{
                    marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                    padding: '3px 9px', borderRadius: 99,
                    color: selStatus.color, background: selStatus.bg,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{selStatus.label}</span>
                  <button onClick={() => setTab('chart')} style={{
                    background: 'var(--scarlet)', color: '#fff', border: 'none',
                    borderRadius: 6, padding: '5px 10px', fontSize: 11,
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap',
                  }}>View Chart →</button>
                </div>
              )}
            </div>
          )}

          {tab === 'chart' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {selected ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>{selName}</h1>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99,
                          color: selStatus.color, background: selStatus.bg,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>{selStatus.label}</span>
                        {selected.accessTypes && selected.accessTypes.split(',').filter(Boolean).map(a => (
                          <span key={a} style={{
                            fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                            background: 'var(--gray-light)', color: 'var(--gray)',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>{a}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setTab('map')} style={{
                      background: 'transparent', border: '1px solid var(--gray-border)',
                      borderRadius: 6, padding: '5px 10px', fontSize: 11,
                      cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text-secondary)',
                    }}>← Map</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                    <StatBox label="Available" value={selAvail} color="var(--green)" />
                    <StatBox label="Occupied"  value={selOcc} />
                    <StatBox label="Capacity"  value={totalCap} sub={`${selPct}% full`} />
                  </div>
                  <div style={{
                    background: '#fff', border: '1px solid var(--gray-border)',
                    borderRadius: 12, padding: '18px 18px 14px',
                  }}>
                    <CapacityChart history={history} loading={histLoading} garageName={selName} />
                  </div>
                  {selected.scrapedAt && (
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10 }}>
                      Last updated {new Date(selected.scrapedAt).toLocaleString()}
                    </p>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', marginTop: 80 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🅿️</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Select a garage from the list or map to see details
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}