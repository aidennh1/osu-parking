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
          time: new Date(r.scrapedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pct: Math.round(r.occupancyPct),
          available: r.available,
        })))
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [garageId, hours])

  return { history, loading }
}