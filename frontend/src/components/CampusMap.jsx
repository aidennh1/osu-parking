import React, { useEffect, useRef } from 'react'

const GARAGE_COORDS = {
  '12th-avenue':          [39.99714045416173, -83.0157519659122],
  '9th-avenue-east':      [39.993860186000774, -83.01544331050003],
  '9th-avenue-west':      [39.99339885502473, -83.01451762045006],
  'safeauto':             [39.993472122380695, -83.01701100409191],
  'medical-center':       [39.994058897130046, -83.02083534169734],
  'old-cannon':           [39.992213481801365, -83.01843968925374],
  'neil-avenue':          [39.99835048850955, -83.01703902737422],
  '11th-avenue':          [39.99529285834091, -83.01261862542654],
  'ohio-union-north':     [39.99910360566908, -83.00894785000442],
  'ohio-union-south':     [39.99849540636019, -83.00838995056685],
  'gateway':              [39.993733881494784, -83.00513739661086],
  'tuttle':               [40.00290637688402, -83.01720552912063],
  'northwest':            [40.00307642913302, -83.01606690213261],
  'arps':                 [40.00290304002004, -83.00980648863862],
  'lane-avenue':          [40.00740580076016, -83.01798786349768],
  'west-lane-avenue':     [40.00744030803757, -83.01848368992324],
  'james-outpatient-care':[40.00125549494826, -83.03521106349818],
}

function getColor(pct, closed) {
  if (closed) return '#9CA3AF'
  if (pct >= 90) return '#DC2626'
  if (pct >= 70) return '#F59E0B'
  return '#22C55E'
}

function makeIconHtml(color, isSelected) {
  const size = isSelected ? 18 : 14
  return `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};
    border:${isSelected ? '3px solid #BA0C2F' : '2px solid #fff'};
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
    cursor:pointer;
  "></div>`
}

export default function CampusMap({ garages, selected, onSelect }) {
  const mapRef     = useRef(null)
  const leafletRef = useRef(null)
  const markersRef = useRef({})   // id -> { marker, color }
  const garagesRef = useRef([])
  const onSelectRef = useRef(onSelect)

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  // Init map once
  useEffect(() => {
    if (leafletRef.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = window.L
      const map = L.map(mapRef.current, {
        center: [40.0024, -83.0185],
        zoom: 15,
        zoomControl: true,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap', maxZoom: 19,
      }).addTo(map)
      leafletRef.current = map

      // Place markers with current garages data
      placeMarkers(L, map, garagesRef.current, null)
    }
    document.head.appendChild(script)

    return () => {
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null }
    }
  }, [])

  // Update markers when garages data arrives (first load)
  useEffect(() => {
    garagesRef.current = garages
    const L = window.L
    if (!L || !leafletRef.current) return
    placeMarkers(L, leafletRef.current, garages, selected)
  }, [garages])

  // Update icon styles when selection changes — don't recreate markers
  useEffect(() => {
    const L = window.L
    if (!L || !leafletRef.current) return

    Object.entries(markersRef.current).forEach(([id, { marker, color }]) => {
      const selId = selected?.garageId ?? selected?.id ?? null
      const isSelected = id === selId
      const icon = L.divIcon({
        className: '',
        html: makeIconHtml(color, isSelected),
        iconSize:   [isSelected ? 18 : 14, isSelected ? 18 : 14],
        iconAnchor: [isSelected ? 9  : 7,  isSelected ? 9  : 7],
      })
      marker.setIcon(icon)
    })
  }, [selected])

  function placeMarkers(L, map, garages, sel) {
    // Clear existing
    Object.values(markersRef.current).forEach(({ marker }) => marker.remove())
    markersRef.current = {}

    garages.forEach(g => {
      const id     = g.garageId ?? g.id ?? ''
      const coords = GARAGE_COORDS[id]
      if (!coords) return

      const pct    = Math.round(g.occupancyPct ?? 0)
      const closed = g.closed === 1
      const color  = getColor(pct, closed)
      const name   = g.garage?.name ?? id
      const selId  = sel?.garageId ?? sel?.id ?? null
      const isSelected = id === selId

      const icon = L.divIcon({
        className: '',
        html: makeIconHtml(color, isSelected),
        iconSize:   [isSelected ? 18 : 14, isSelected ? 18 : 14],
        iconAnchor: [isSelected ? 9  : 7,  isSelected ? 9  : 7],
      })

      const marker = L.marker(coords, { icon })
        .addTo(map)
        .bindTooltip(`<b>${name}</b><br>${pct}% full · ${g.available ?? 0} open`, {
          direction: 'top', offset: [0, -8],
        })
        .on('click', () => onSelectRef.current(g))

      markersRef.current[id] = { marker, color }
    })
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}