import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TrainCard from '../components/TrainCard'
import { Calendar, Settings, X, Train } from '../components/Icon'
import './SearchResults.css'

const BASE_URL = 'http://localhost:8000/api'

const CLASS_OPTIONS = ['SL','3A','2A','1A','CC','EC']
const DEPARTURE_RANGES = [
  { label:'Morning (6AM–12PM)', start:6, end:12 },
  { label:'Afternoon (12PM–6PM)', start:12, end:18 },
  { label:'Evening (6PM–12AM)', start:18, end:24 },
  { label:'Night (12AM–6AM)', start:0, end:6 },
]

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const date = searchParams.get('date') || ''

  const [results, setResults] = useState([])
  const [filtered, setFiltered] = useState([])
  const [sortBy, setSortBy] = useState('Default')
  const [availOnly, setAvailOnly] = useState(false)
  const [selectedClasses, setSelectedClasses] = useState([])
  const [selectedDep, setSelectedDep] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ✅ Backend API call — static trains import remove panninom
  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `${BASE_URL}/search/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        )
        if (!response.ok) throw new Error('Server error')
        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError('Backend connect aagala. Django server running ah check pannu.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    if (from && to) fetchTrains()
  }, [from, to])

  useEffect(() => {
    let res = [...results]

    if (availOnly) {
      res = res.filter(t => t.classes.some(cls => {
        const avail = (t.totalSeats[cls] || 0) - (t.bookedSeats[cls] || []).length
        return avail > 0
      }))
    }

    if (selectedClasses.length > 0) {
      res = res.filter(t => t.classes.some(c => selectedClasses.includes(c)))
    }

    if (selectedDep.length > 0) {
      res = res.filter(t => {
        const hour = parseInt(t.departureTime.split(':')[0])
        return selectedDep.some(r => hour >= r.start && hour < r.end)
      })
    }

    if (sortBy === 'Departure') res.sort((a,b) => a.departureTime.localeCompare(b.departureTime))
    else if (sortBy === 'Arrival') res.sort((a,b) => a.arrivalTime.localeCompare(b.arrivalTime))
    else if (sortBy === 'Duration') res.sort((a,b) => a.duration.localeCompare(b.duration))
    else if (sortBy === 'Price') {
      res.sort((a,b) => {
        const minA = Math.min(...Object.values(a.fare))
        const minB = Math.min(...Object.values(b.fare))
        return minA - minB
      })
    } else if (sortBy === 'Availability') {
      res.sort((a,b) => {
        const availA = a.classes.reduce((s,c) => s + ((a.totalSeats[c]||0) - (a.bookedSeats[c]||[]).length), 0)
        const availB = b.classes.reduce((s,c) => s + ((b.totalSeats[c]||0) - (b.bookedSeats[c]||[]).length), 0)
        return availB - availA
      })
    }

    setFiltered(res)
  }, [results, availOnly, selectedClasses, selectedDep, sortBy])

  const toggleClass = (c) => {
    setSelectedClasses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const toggleDep = (r) => {
    setSelectedDep(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }

  return (
    <div className="search-results">
      <Navbar />
      <div className="results-header">
        <div className="route-display">
          <span className="route-from-big">{from}</span>
          <span className="route-arrow-big">→</span>
          <span className="route-to-big">{to}</span>
        </div>
        <div className="results-meta">
          {date && (
            <span className="date-display">
              <Calendar size={13} style={{verticalAlign:'middle',marginRight:4}}/>
              {new Date(date+'T00:00:00').toLocaleDateString('en-IN', {
                weekday:'short', day:'numeric', month:'short', year:'numeric'
              })}
            </span>
          )}
          <span className="count-badge">{filtered.length} Trains Found</span>
        </div>
      </div>

      <div className="results-body">
        {/* MOBILE FILTER TOGGLE */}
        <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
          <Settings size={15} style={{verticalAlign:'middle',marginRight:6}}/> Filters {selectedClasses.length + selectedDep.length + (availOnly ? 1 : 0) > 0 && `(${selectedClasses.length + selectedDep.length + (availOnly ? 1 : 0)})`}
        </button>

        <aside className={`filters-sidebar ${showFilters ? 'filters-open' : ''}`}>
          <div className="filter-section">
            <h3 className="filter-heading">Availability</h3>
            <label className="filter-checkbox">
              <input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} />
              Available Only
            </label>
          </div>

          <div className="filter-section">
            <h3 className="filter-heading">Ticket Class</h3>
            {CLASS_OPTIONS.map(c => (
              <label key={c} className="filter-checkbox">
                <input type="checkbox" checked={selectedClasses.includes(c)} onChange={() => toggleClass(c)} />
                {c === 'SL' ? 'Sleeper (SL)' : c === '3A' ? 'AC 3 Tier (3A)' : c === '2A' ? 'AC 2 Tier (2A)' : c === '1A' ? 'AC First Class (1A)' : c === 'CC' ? 'AC Chair Car (CC)' : 'Executive Chair (EC)'}
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h3 className="filter-heading">Departure Time</h3>
            {DEPARTURE_RANGES.map(r => (
              <label key={r.label} className="filter-checkbox">
                <input type="checkbox" checked={selectedDep.includes(r)} onChange={() => toggleDep(r)} />
                {r.label}
              </label>
            ))}
          </div>

          {(selectedClasses.length > 0 || selectedDep.length > 0 || availOnly) && (
            <button className="clear-filters-btn" onClick={() => { setSelectedClasses([]); setSelectedDep([]); setAvailOnly(false) }}>
              <X size={13} strokeWidth={2.5} style={{verticalAlign:'middle',marginRight:4}}/> Clear All Filters
            </button>
          )}
        </aside>

        <main className="trains-list">
          <div className="sort-bar">
            <span className="sort-label">Sort by:</span>
            {['Default','Availability','Duration','Departure','Arrival','Price'].map(s => (
              <button key={s} className={`sort-btn ${sortBy === s ? 'sort-active' : ''}`} onClick={() => setSortBy(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="no-results">
              <h2>Loading...</h2>
              <p>Trains fetch pannurom, kொஞ்சம் wait pannu...</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="no-results">
              <div className="no-results-icon"><Train size={48} strokeWidth={1} color="#ccc"/></div>
              <h2>Connection Error</h2>
              <p>{error}</p>
            </div>
          )}

          {/* No results */}
          {!loading && !error && filtered.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon"><Train size={48} strokeWidth={1} color="#ccc"/></div>
              <h2>No Trains Found</h2>
              <p>No trains available from <b>{from}</b> to <b>{to}</b>.</p>
              <p>Try different stations or check popular routes on the home page.</p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && filtered.map(train => (
            <TrainCard key={train.id} train={train} />
          ))}
        </main>
      </div>
    </div>
  )
}