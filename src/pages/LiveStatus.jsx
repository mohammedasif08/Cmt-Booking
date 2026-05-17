import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Train, Home, Ticket, ClipboardList, Search, User, Settings, Bell, Lock, Shield, CreditCard, Wallet, Phone, Mail, HelpCircle, IdCard, LogOut, Key, Download, MapPin, Calendar, ChevronRight, ChevronDown, ChevronUp, X, CheckCircle, Check, AlertTriangle, Info, Zap, ArrowRight, ArrowLeft, Activity, Clock, FileText, Navigation, Radio, XCircle, RefreshCw, Star, Users } from '../components/Icon'
import { trains } from '../data/trains'
import './LiveStatus.css'

const POPULAR_TRAINS = [
  { number: '12301', name: 'Howrah Rajdhani Express' },
  { number: '22439', name: 'Vande Bharat Express' },
  { number: '12027', name: 'Chennai Shatabdi Express' },
  { number: '12621', name: 'Tamil Nadu Express' },
  { number: '12951', name: 'Mumbai Rajdhani Express' },
  { number: '12050', name: 'Gatimaan Express' },
]

const makeLiveData = (train) => ({
  currentStation: 'Nagpur Junction',
  currentCode: 'NGP',
  delay: 8,
  speed: Math.floor(95 + Math.random() * 60),
  lastUpdated: '3 min ago',
  distanceCovered: '742 km',
  distanceRemaining: '418 km',
  stations: [
    { name: train.from, code: train.fromCode, scheduled: train.departureTime, actual: train.departureTime, delay: 0, status: 'departed' },
    { name: 'Intermediate A', code: 'INA', scheduled: '10:30', actual: '10:35', delay: 5, status: 'departed' },
    { name: 'Nagpur Junction', code: 'NGP', scheduled: '14:00', actual: '14:08', delay: 8, status: 'current' },
    { name: 'Intermediate B', code: 'INB', scheduled: '17:30', actual: null, delay: 0, status: 'upcoming' },
    { name: train.to, code: train.toCode, scheduled: train.arrivalTime, actual: null, delay: 0, status: 'upcoming' },
  ]
})

export default function LiveStatus() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleQueryChange = (e) => {
    const v = e.target.value
    setQuery(v)
    if (v.length >= 2) {
      setSuggestions(trains.filter(t =>
        t.trainNumber.includes(v) || t.trainName.toLowerCase().includes(v.toLowerCase())
      ).slice(0, 6))
    } else {
      setSuggestions([])
    }
  }

  const doSearch = (t) => {
    setQuery(t.trainName + ' · ' + t.trainNumber)
    setSuggestions([])
    setLoading(true)
    setSearched(false)
    setTimeout(() => {
      setResult({ train: t, live: makeLiveData(t) })
      setSearched(true)
      setLoading(false)
    }, 1400)
  }

  const handleSearch = () => {
    if (!query) return
    const t = trains.find(t => t.trainNumber === query.trim() || t.trainName.toLowerCase().includes(query.toLowerCase()))
    if (t) doSearch(t)
    else { setResult(null); setSearched(true) }
  }

  return (
    <div className="live-page">
      <Navbar />

      <div className="live-top-bar">
        <button className="top-back" onClick={() => navigate('/')}>← Home</button>
        <div className="live-breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <span>›</span>
          <span className="bc-active">Live Train Status</span>
        </div>
      </div>

      <div className="live-search-hero">
        <div className="lsh-inner">
          <div className="lsh-text">
            <div className="lsh-badge">
              <span className="live-pulse"></span> LIVE TRACKING
            </div>
            <h1>Where is your train right now?</h1>
            <p>Real-time position, delay info & station-by-station status</p>
          </div>

          <div className="live-search-bar">
            <div className="lsb-wrap">
              <span className="lsb-icon"><Search size={18} strokeWidth={1.8}/></span>
              <input
                className="lsb-input"
                placeholder="Train name or number (e.g. 12301 or Rajdhani)"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              {query && <button className="lsb-clear" onClick={() => { setQuery(''); setSuggestions([]); setResult(null); setSearched(false) }}><X size={14} strokeWidth={2.5}/></button>}
              {suggestions.length > 0 && (
                <div className="lsb-suggestions">
                  {suggestions.map(t => (
                    <div key={t.id} className="lsb-sug" onClick={() => doSearch(t)}>
                      <div className="lsbs-left">
                        <span className="lsbs-num">{t.trainNumber}</span>
                        <span className="lsbs-name">{t.trainName}</span>
                      </div>
                      <span className="lsbs-route">{t.fromCode} → {t.toCode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="lsb-btn" onClick={handleSearch} disabled={loading}>
              {loading ? <span className="spin-ring"></span> : 'Track Train'}
            </button>
          </div>
        </div>
      </div>

      <div className="live-content">
        {loading && (
          <div className="live-loading">
            <div className="live-loader">
              <div className="loader-train"><Train size={36} strokeWidth={1.3} color="#00C853"/></div>
              <div className="loader-dots"><span></span><span></span><span></span></div>
            </div>
            <p>Fetching live position...</p>
          </div>
        )}

        {!loading && searched && !result && (
          <div className="live-not-found">
            <div><Search size={36} strokeWidth={1} color="#ccc"/></div>
            <h3>Train not found</h3>
            <p>Try entering a train number like <strong>12301</strong> or search by name</p>
          </div>
        )}

        {!loading && result && (
          <div className="live-result">
            {/* LIVE STATUS HEADER */}
            <div className="lr-header">
              <div className="lrh-train">
                <div className="lrh-badge">{result.train.trainNumber}</div>
                <div className="lrh-info">
                  <div className="lrh-name">{result.train.trainName}</div>
                  <div className="lrh-route">{result.train.fromCode} → {result.train.toCode}</div>
                </div>
              </div>
              <div className="lrh-live-tag">
                <span className="live-pulse"></span>
                Live
              </div>
            </div>

            {/* STATS ROW */}
            <div className="live-stats">
              <div className="ls-card ls-location">
                <div className="ls-card-icon"><MapPin size={22} strokeWidth={1.5}/></div>
                <div className="ls-card-label">Current Location</div>
                <div className="ls-card-val">{result.live.currentStation}</div>
                <div className="ls-card-sub">{result.live.currentCode}</div>
              </div>
              <div className={"ls-card " + (result.live.delay > 0 ? 'ls-delayed' : 'ls-ontime')}>
                <div className="ls-card-icon">{result.live.delay > 0 ? <Clock size={22} strokeWidth={1.5}/> : <CheckCircle size={22} color="#00C853" strokeWidth={1.5}/>}</div>
                <div className="ls-card-label">Running Status</div>
                <div className="ls-card-val">{result.live.delay > 0 ? result.live.delay + ' min late' : 'On Time'}</div>
                <div className="ls-card-sub">{result.live.delay > 0 ? 'Delayed' : 'On schedule'}</div>
              </div>
              <div className="ls-card ls-speed">
                <div className="ls-card-icon"><Activity size={22} strokeWidth={1.5}/></div>
                <div className="ls-card-label">Speed</div>
                <div className="ls-card-val">{result.live.speed} <span className="ls-unit">km/h</span></div>
                <div className="ls-card-sub">Approximate</div>
              </div>
              <div className="ls-card ls-dist">
                <div className="ls-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/><line x1="8" y1="6" x2="8" y2="18" strokeDasharray="2 3"/><line x1="12" y1="6" x2="12" y2="18" strokeDasharray="2 3"/><line x1="16" y1="6" x2="16" y2="18" strokeDasharray="2 3"/></svg></div>
                <div className="ls-card-label">Distance</div>
                <div className="ls-card-val">{result.live.distanceCovered}</div>
                <div className="ls-card-sub">{result.live.distanceRemaining} remaining</div>
              </div>
            </div>

            {/* STATION TIMELINE */}
            <div className="live-timeline-card">
              <div className="ltc-header">
                <h3>Station-by-Station Status</h3>
                <span className="ltc-updated">Updated {result.live.lastUpdated}</span>
              </div>
              <div className="ltc-list">
                {result.live.stations.map((s, i) => (
                  <div key={i} className={"ltc-item ltc-" + s.status}>
                    <div className="ltc-indicator">
                      <div className="ltci-dot"></div>
                      {i < result.live.stations.length - 1 && <div className="ltci-line"></div>}
                    </div>
                    <div className="ltc-body">
                      <div className="ltcb-top">
                        <span className="ltcb-station">{s.name}</span>
                        <span className="ltcb-code">{s.code}</span>
                        {s.status === 'current' && <span className="ltcb-current-tag">● At Station</span>}
                      </div>
                      <div className="ltcb-times">
                        <span className="ltcb-sch">Scheduled: {s.scheduled}</span>
                        {s.actual && (
                          <span className={"ltcb-act " + (s.delay > 0 ? 'ltcb-late' : 'ltcb-good')}>
                            Actual: {s.actual} {s.delay > 0 && <span className="delay-badge">+{s.delay}m</span>}
                          </span>
                        )}
                        {s.status === 'upcoming' && <span className="ltcb-upcoming">Not yet reached</span>}
                      </div>
                    </div>
                    <div className="ltc-status">
                      {s.status === 'departed' && <span className="lts-dep">Departed</span>}
                      {s.status === 'current' && <span className="lts-cur">Train Here</span>}
                      {s.status === 'upcoming' && <span className="lts-upc">Upcoming</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="ltc-disclaimer">
                Live data is indicative. Actual timings may vary due to operational factors.
              </div>
            </div>
          </div>
        )}

        {/* POPULAR TRAINS */}
        {!searched && !loading && (
          <div className="popular-section">
            <h2>Popular trains to track</h2>
            <div className="popular-grid">
              {POPULAR_TRAINS.map(t => {
                const trainObj = trains.find(tr => tr.trainNumber === t.number)
                return (
                  <div key={t.number} className="popular-card" onClick={() => trainObj && doSearch(trainObj)}>
                    <div className="pc-num">{t.number}</div>
                    <div className="pc-name">{t.name}</div>
                    {trainObj && <div className="pc-route">{trainObj.fromCode} → {trainObj.toCode}</div>}
                    <div className="pc-cta">Track Now →</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
