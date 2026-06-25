import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

export function useGarageData() {
  const [garages, setGarages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/garages`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        setGarages(data)
        setLastFetch(new Date())
        setError(null)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGarages()
    const id = setInterval(fetchGarages, 60000)
    return () => clearInterval(id)
  }, [])

  return { garages, loading, error, lastFetch }
}

export function useGarageHistory(garageId, hours = 24) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!garageId) return

    setLoading(true)

    fetch(`${API_URL}/api/garages/${garageId}/history?hours=${hours}`)
      .then(r => r.json())
      .then(data => {
        setHistory(data.map(r => ({
          time: new Date(r.scrapedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          pct: Math.round(r.occupancyPct),
          available: r.available
        })))
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [garageId, hours])

  return { history, loading }
}