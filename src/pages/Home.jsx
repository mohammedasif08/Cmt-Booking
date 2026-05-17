import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { stations } from '../data/trains'
import { useBooking } from '../context/BookingContext'
import {
  Train, MapPin, Calendar, Search, ClipboardList, IdCard,
  ArrowRight, ArrowLeftRight, AlertTriangle, Shield, Zap,
  Navigation, ChevronRight, Activity, Ticket
} from '../components/Icon'
import './Home.css'

const POPULAR_ROUTES = [
  { from: 'New Delhi', to: 'Mumbai Central', fromCode: 'NDLS', toCode: 'MMCT' },
  { from: 'Chennai Central', to: 'KSR Bengaluru', fromCode: 'MAS', toCode: 'SBC' },
  { from: 'Howrah', to: 'New Delhi', fromCode: 'HWH', toCode: 'NDLS' },
  { from: 'Mumbai CSMT', to: 'Howrah', fromCode: 'CSTM', toCode: 'HWH' },
  { from: 'New Delhi', to: 'Amritsar', fromCode: 'NDLS', toCode: 'ASR' },
  { from: 'Hyderabad', to: 'New Delhi', fromCode: 'HYB', toCode: 'NDLS' },
]

const OFFERS = [
  { code: 'FIRST50', title: '₹50 Off First Booking', desc: 'New users get flat ₹50 off', tag: 'NEW USER', color: '#00C853' },
  { code: 'RAJDHANI10', title: '10% Off Rajdhani', desc: 'Save on 2A & 1A classes', tag: 'LIMITED', color: '#E65100' },
  { code: 'VBEXPRESS', title: 'Free Upgrade on VB', desc: 'CC to EC on select routes', tag: 'PREMIUM', color: '#1565C0' },
]

const STATS = [
  { value: '50L+', label: 'Tickets Booked' },
  { value: '500+', label: 'Train Routes' },
  { value: '99.2%', label: 'Uptime' },
  { value: '60s', label: 'Avg Booking Time' },
]

export default function Home() {
  const navigate = useNavigate()
  const { setSearchQuery, user } = useBooking()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])
  const [error, setError] = useState('')
  const fromRef = useRef(null)
  const toRef = useRef(null)

  const filterStations = (query) => {
    if (!query || query.length < 2) return []
    return stations.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6)
  }

  const handleSearch = () => {
    if (!from || !to || !date) { setError('Please fill all fields to search trains'); return }
    if (from === to) { setError('From and To stations cannot be the same'); return }
    setError('')
    setSearchQuery({ from, to, date })
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`)
  }

  const handleRouteClick = (route) => {
    setFrom(route.from); setTo(route.to)
    setSearchQuery({ from: route.from, to: route.to, date })
    if (date) navigate(`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${date}`)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handler = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setFromSuggestions([])
      if (toRef.current && !toRef.current.contains(e.target)) setToSuggestions([])
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="home">
      <Navbar />

      {/* HERO + SEARCH */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-greeting">
            <div className="hero-badge">
              <Train size={13} color="#00C853" strokeWidth={2} />
              <span>IRCTC Authorised Platform</span>
            </div>
            <h1 className="hero-headline">
              {user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Book Train Tickets Instantly'}
            </h1>
            <p className="hero-sub">Search from 500+ routes · Visual seat selection · Instant PNR</p>
          </div>

          <div className="booking-card">
            <h2 className="booking-title">BOOK TICKET</h2>
            <p className="booking-subtitle">Fastest train booking across India</p>

            <div className="search-form">
              <div className="input-row">
                <div className="input-group" ref={fromRef}>
                  <label className="input-label"><Navigation size={13} color="#00C853" strokeWidth={2}/> From</label>
                  <input
                    className="search-input"
                    placeholder="From Station / City"
                    value={from}
                    onChange={e => { setFrom(e.target.value); setFromSuggestions(filterStations(e.target.value)) }}
                  />
                  {fromSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {fromSuggestions.map(s => (
                        <div key={s.code} className="suggestion-item" onClick={() => { setFrom(s.name); setFromSuggestions([]) }}>
                          <span className="stn-code">{s.code}</span>
                          <span className="stn-name">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="swap-btn" onClick={() => { const t = from; setFrom(to); setTo(t) }}>
                  <ArrowLeftRight size={18}/>
                </div>

                <div className="input-group" ref={toRef}>
                  <label className="input-label"><MapPin size={13} color="#00C853" strokeWidth={2}/> To</label>
                  <input
                    className="search-input"
                    placeholder="To Station / City"
                    value={to}
                    onChange={e => { setTo(e.target.value); setToSuggestions(filterStations(e.target.value)) }}
                  />
                  {toSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {toSuggestions.map(s => (
                        <div key={s.code} className="suggestion-item" onClick={() => { setTo(s.name); setToSuggestions([]) }}>
                          <span className="stn-code">{s.code}</span>
                          <span className="stn-name">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="date-search-row">
                <div className="input-group date-group">
                  <label className="input-label"><Calendar size={13} color="#00C853" strokeWidth={2}/> Date of Journey</label>
                  <input
                    className="search-input"
                    type="date"
                    min={today}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <button className="search-btn" onClick={handleSearch}>
                  <Search size={16} strokeWidth={2.2}/> Search Trains
                </button>
              </div>

              {error && (
                <div className="error-msg">
                  <AlertTriangle size={15} style={{verticalAlign:'middle',marginRight:6}}/>
                  {error}
                </div>
              )}
            </div>

            <div className="card-quick-routes">
              <span className="cqr-label">Popular:</span>
              {[
                { from: 'New Delhi', to: 'Mumbai Central' },
                { from: 'Chennai Central', to: 'KSR Bengaluru' },
                { from: 'Howrah', to: 'New Delhi' },
              ].map((r, i) => (
                <button key={i} className="cqr-chip" onClick={() => {
                  setFrom(r.from); setTo(r.to)
                  setSearchQuery({ from: r.from, to: r.to, date })
                  if (date) navigate(`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}&date=${date}`)
                }}>
                  {r.from.split(' ')[0]} → {r.to.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      {/* <div className="stats-strip">
        {STATS.map((s, i) => (
          <div key={i} className="stat-item">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div> */}

      {/* QUICK ACCESS */}
      <section className="quick-links">
        <div className="quick-card" onClick={() => navigate('/pnr-status')}>
          <div className="quick-icon"><ClipboardList size={30} strokeWidth={1.5}/></div>
          <div className="quick-title">PNR Status</div>
          <div className="quick-desc">Track your booking instantly</div>
          <ChevronRight size={16} color="#9E9E9E" style={{marginTop:8}}/>
        </div>
        <div className="quick-card" onClick={() => navigate('/live-status')}>
          <div className="quick-icon"><Activity size={30} strokeWidth={1.5}/></div>
          <div className="quick-title">Live Train Status</div>
          <div className="quick-desc">Real-time location of any train</div>
          <ChevronRight size={16} color="#9E9E9E" style={{marginTop:8}}/>
        </div>
        {user ? (
          <div className="quick-card" onClick={() => navigate('/bookings')}>
            <div className="quick-icon"><Ticket size={30} strokeWidth={1.5}/></div>
            <div className="quick-title">My Bookings</div>
            <div className="quick-desc">View and manage your tickets</div>
            <ChevronRight size={16} color="#9E9E9E" style={{marginTop:8}}/>
          </div>
        ) : (
          <div className="quick-card" onClick={() => navigate('/link-aadhaar')}>
            <div className="quick-icon"><IdCard size={30} strokeWidth={1.5}/></div>
            <div className="quick-title">Link Aadhaar</div>
            <div className="quick-desc">Link Aadhaar with your IRCTC account</div>
            <ChevronRight size={16} color="#9E9E9E" style={{marginTop:8}}/>
          </div>
        )}
      </section>

      {/* OFFERS */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="section-header">
            <h2 className="section-title">Exclusive Offers</h2>
            <span className="section-badge">Limited Time</span>
          </div>
          <div className="offers-row">
            {OFFERS.map((offer, i) => (
              <div key={i} className="offer-card">
                <div className="offer-tag" style={{background: `${offer.color}18`, color: offer.color}}>{offer.tag}</div>
                <div className="offer-title">{offer.title}</div>
                <div className="offer-desc">{offer.desc}</div>
                <div className="offer-code-row">
                  <div className="offer-code" style={{borderColor: offer.color, color: offer.color}}>{offer.code}</div>
                  <button className="offer-use-btn" style={{background: offer.color}} onClick={() => navigate(user ? '/' : '/login')}>
                    Use Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR ROUTES */}
      <section className="home-section home-section-alt">
        <div className="home-section-inner">
          <div className="section-header">
            <h2 className="section-title">Popular Routes</h2>
            <span className="section-badge">Most Booked</span>
          </div>
          <div className="routes-grid">
            {POPULAR_ROUTES.map((r, i) => (
              <div key={i} className="route-card" onClick={() => handleRouteClick(r)}>
                <div className="route-stations">
                  <div className="route-stn">
                    <span className="route-code">{r.fromCode}</span>
                    <span className="route-name">{r.from.split(' ')[0]}</span>
                  </div>
                  <div className="route-arrow-line">
                    <div className="ral-dot"/>
                    <div className="ral-line"/>
                    <Train size={14} color="#00C853" strokeWidth={2}/>
                    <div className="ral-line"/>
                    <div className="ral-dot"/>
                  </div>
                  <div className="route-stn route-stn-right">
                    <span className="route-code">{r.toCode}</span>
                    <span className="route-name">{r.to.split(' ')[0]}</span>
                  </div>
                </div>
                <div className="route-footer">
                  <span className="route-full">{r.from} → {r.to}</span>
                  <ArrowRight size={14} color="#00C853" strokeWidth={2.5}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGN UP CTA (guests only) */}
      {!user && (
        <section className="home-cta-section">
          <div className="home-cta-inner">
            <div className="hci-text">
              <h2>New to CMT Booking?</h2>
              <p>Create a free account to save bookings, get offers, and book faster.</p>
            </div>
            <div className="hci-actions">
              <button className="hci-btn-primary" onClick={() => navigate('/register')}>Create Free Account</button>
              <button className="hci-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-col footer-brand-col">
            <div className="footer-logo"><Train size={20} color="#00C853" style={{verticalAlign:'middle',marginRight:8}}/> CMT Booking</div>
            <p className="footer-tagline">Connect My Train — India's fastest<br/>train booking experience.</p>
            <div className="footer-badges">
              <span className="badge"><Shield size={11} style={{verticalAlign:'middle',marginRight:4}}/>Secure</span>
              <span className="badge"><Zap size={11} style={{verticalAlign:'middle',marginRight:4}}/>Instant</span>
              <span className="badge">Made in India 🇮🇳</span>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li onClick={() => navigate('/')}>Home</li>
              <li onClick={() => navigate('/pnr-status')}>PNR Status</li>
              <li onClick={() => navigate('/live-status')}>Live Train Status</li>
              <li onClick={() => navigate('/bookings')}>My Bookings</li>
              <li onClick={() => navigate('/link-aadhaar')}>Link Aadhaar</li>
              <li onClick={() => navigate('/help')}>Help & Support</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Train Types</h4>
            <ul className="footer-links">
              {['Rajdhani Express','Vande Bharat Express','Shatabdi Express','Duronto Express','Gatimaan Express','Tamil Nadu Exp.'].map((name, i) => (
                <li key={i} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{name}</li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Popular Routes</h4>
            <ul className="footer-links">
              {[
                { from:'New Delhi', to:'Mumbai Central', label:'Delhi → Mumbai' },
                { from:'Chennai Central', to:'KSR Bengaluru', label:'Chennai → Bengaluru' },
                { from:'Howrah', to:'New Delhi', label:'Kolkata → Delhi' },
                { from:'New Delhi', to:'Amritsar', label:'Delhi → Amritsar' },
                { from:'Hyderabad', to:'New Delhi', label:'Hyderabad → Delhi' },
                { from:'Mumbai CSMT', to:'Howrah', label:'Mumbai → Kolkata' },
              ].map((r, i) => (
                <li key={i} onClick={() => {
                  setFrom(r.from); setTo(r.to)
                  setSearchQuery({ from: r.from, to: r.to, date })
                  if (date) navigate(`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}&date=${date}`)
                  else window.scrollTo({ top: 0, behavior: 'smooth' })
                }}>{r.label}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-bottom-left">© 2026 CMT Booking. All rights reserved.</div>
          <div className="footer-bottom-right">
            <span onClick={() => navigate('/help')}>Privacy Policy</span>
            <span onClick={() => navigate('/help')}>Terms of Service</span>
            <span onClick={() => navigate('/help')}>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
