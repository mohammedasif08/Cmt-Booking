import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useBooking } from '../context/BookingContext'
import {
  Train, MapPin, Calendar, Search, ClipboardList, IdCard,
  ArrowRight, ArrowLeftRight, AlertTriangle, Shield, Zap,
  Navigation, ChevronRight, ChevronDown, ChevronUp,
  Star, Users, Ticket, Clock, CheckCircle, Phone,
  Download, Wifi, CreditCard, Activity
} from '../components/Icon'
import { stations } from '../data/trains'
import './LandingPage.css'

// ─── Popular Routes ────────────────────────────────────────────────────
const POPULAR_ROUTES = [
  { from: 'New Delhi', to: 'Mumbai Central', fromCode: 'NDLS', toCode: 'MMCT', duration: '15h 35m', fare: 1950, type: 'Rajdhani' },
  { from: 'Chennai Central', to: 'KSR Bengaluru', fromCode: 'MAS', toCode: 'SBC', duration: '5h 00m', fare: 1150, type: 'Shatabdi' },
  { from: 'Howrah', to: 'New Delhi', fromCode: 'HWH', toCode: 'NDLS', duration: '17h 05m', fare: 1850, type: 'Rajdhani' },
  { from: 'Mumbai CSMT', to: 'Howrah', fromCode: 'CSTM', toCode: 'HWH', duration: '27h 35m', fare: 1120, type: 'Mail' },
  { from: 'New Delhi', to: 'Amritsar', fromCode: 'NDLS', toCode: 'ASR', duration: '5h 50m', fare: 1045, type: 'Shatabdi' },
  { from: 'Hyderabad', to: 'New Delhi', fromCode: 'HYB', toCode: 'NDLS', duration: '27h 25m', fare: 1200, type: 'Express' },
]

// ─── Train Types ────────────────────────────────────────────────────────
const TRAIN_TYPES = [
  { name: 'Vande Bharat', icon: '🚄', desc: 'India\'s fastest semi-high-speed train with auto doors & WiFi', tag: 'Premium', color: '#1565C0' },
  { name: 'Rajdhani', icon: '🚂', desc: 'Luxury overnight express connecting major cities, meals included', tag: 'Luxury', color: '#E65100' },
  { name: 'Shatabdi', icon: '🚃', desc: 'Day intercity express with comfortable seating & meals', tag: 'Business', color: '#2E7D32' },
  { name: 'Duronto', icon: '🛤️', desc: 'Non-stop point-to-point express, fastest long-distance option', tag: 'Express', color: '#6A1B9A' },
]

// ─── Testimonials ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Mumbai', initials: 'PS', rating: 5, text: 'Booked my Delhi trip in under 2 minutes! The seat selection interface is brilliant — I could see exactly which berths were available.', route: 'Mumbai → New Delhi' },
  { name: 'Rajesh Kumar', city: 'Chennai', initials: 'RK', rating: 5, text: 'Finally an IRCTC alternative that actually works on mobile. The live train status saved me so much stress during my Bengaluru commute.', route: 'Chennai → Bengaluru' },
  { name: 'Anjali Mehta', city: 'New Delhi', initials: 'AM', rating: 5, text: 'PNR status updates are instant and the booking flow is so clean. Cancelled my old IRCTC app after using CMT for a week.', route: 'Delhi → Amritsar' },
  { name: 'Suresh Iyer', city: 'Hyderabad', initials: 'SI', rating: 4, text: 'The visual seat map is a game-changer. Chose my exact window berth in 2A coach. Service was exactly as shown.', route: 'Hyderabad → Delhi' },
]

// ─── Features ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Search size={28} strokeWidth={1.5}/>, title: 'Smart Search', desc: 'Intelligent station autocomplete. Find trains across 500+ stations instantly with real-time availability.' },
  { icon: <Ticket size={28} strokeWidth={1.5}/>, title: 'Visual Seat Map', desc: 'Pick your exact berth on an interactive coach diagram. Lower, middle, upper — your choice, every time.' },
  { icon: <Activity size={28} strokeWidth={1.5}/>, title: 'Live Train Status', desc: 'Know exactly where your train is in real-time. No more platform guessing or missed connections.' },
  { icon: <ClipboardList size={28} strokeWidth={1.5}/>, title: 'Instant PNR Status', desc: 'Check your booking status in one tap. Confirmed, RAC, waitlist — always up to date.' },
  { icon: <Shield size={28} strokeWidth={1.5}/>, title: 'Secure Booking', desc: 'Bank-grade encryption on all transactions. Aadhaar-linked accounts for verified, trusted bookings.' },
  { icon: <Zap size={28} strokeWidth={1.5}/>, title: 'Lightning Fast', desc: 'From search to confirmation in under 60 seconds. Optimized for speed on any network condition.' },
]

// ─── Stats ────────────────────────────────────────────────────────────────
const STATS = [
  { value: '50L+', label: 'Tickets Booked' },
  { value: '500+', label: 'Train Routes' },
  { value: '99.2%', label: 'Uptime SLA' },
  { value: '4.8★', label: 'User Rating' },
]

// ─── Offers ────────────────────────────────────────────────────────────────
const OFFERS = [
  { code: 'FIRST50', title: '₹50 Off First Booking', desc: 'New users get flat ₹50 discount on their first train ticket booking via CMT.', tag: 'New User', color: '#00C853' },
  { code: 'RAJDHANI10', title: '10% Off Rajdhani', desc: 'Book any Rajdhani Express this month and save 10% on 2A & 1A classes.', tag: 'Limited', color: '#E65100' },
  { code: 'VBEXPRESS', title: 'Free Upgrade on VB', desc: 'Book Vande Bharat CC and get complimentary upgrade to EC on select routes.', tag: 'Premium', color: '#1565C0' },
]

// ─── FAQ ──────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'How do I book a train ticket on CMT Booking?', a: 'Enter your From/To stations and date in the search box above, click Search Trains. Browse results, pick a train, choose seats on the interactive map, fill passenger details, and confirm. Done in under 60 seconds.' },
  { q: 'Can I cancel my ticket and get a refund?', a: 'Yes. Go to My Bookings, select your ticket, and tap Cancel. Refund is processed as per Railway rules — typically 48–72 hours to your original payment method.' },
  { q: 'What ID proof do I need at the station?', a: 'Any government-issued photo ID: Aadhaar, Passport, Voter ID, PAN, or Driving License. Name must match your ticket exactly.' },
  { q: 'How does the visual seat map work?', a: 'After selecting a train and class, you\'ll see an interactive coach diagram. Green seats are available — click to select yours. You can see berth types (Lower, Middle, Upper, Side-Lower, Side-Upper) and gender assignments.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. CMT uses 256-bit SSL encryption for all transactions. We never store card details — all payments are processed through PCI-DSS compliant gateways.' },
  { q: 'How do I check my PNR status?', a: 'Navigate to PNR Status from the home page or navbar. Enter your 10-digit PNR number and get instant status updates — confirmed, RAC, waitlisted, or cancelled.' },
]

// ─── Main Component ───────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const { setSearchQuery } = useBooking()

  // Search state
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])
  const [error, setError] = useState('')
  const fromRef = useRef(null)
  const toRef = useRef(null)

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null)

  // Counters animation state
  const [countersVisible, setCountersVisible] = useState(false)
  const statsRef = useRef(null)

  const filterStations = (query) => {
    if (!query || query.length < 2) return []
    return stations.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6)
  }

  const handleSearch = () => {
    if (!from || !to || !date) {
      setError('Please fill all fields to search trains')
      return
    }
    if (from === to) {
      setError('From and To stations cannot be the same')
      return
    }
    setError('')
    setSearchQuery({ from, to, date })
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`)
  }

  const handleRouteClick = (route) => {
    setFrom(route.from)
    setTo(route.to)
    setSearchQuery({ from: route.from, to: route.to, date })
    if (date) {
      navigate(`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${date}`)
    } else {
      // Scroll to search and focus date
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setFromSuggestions([])
      if (toRef.current && !toRef.current.contains(e.target)) setToSuggestions([])
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // IntersectionObserver for stats section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCountersVisible(true) },
      { threshold: 0.4 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="landing-page">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-hero-grid" />
          <div className="lp-hero-glow lp-glow-green" />
          <div className="lp-hero-glow lp-glow-blue" />
          <div className="lp-hero-tracks">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="lp-track-line" style={{ animationDelay: `${i * 0.8}s` }} />
            ))}
          </div>
        </div>

        <div className="lp-hero-content">
          {/* Left: headline */}
          <div className="lp-hero-text">
            <div className="lp-hero-badge">
              <Train size={14} color="#00C853" strokeWidth={2} />
              <span>IRCTC Authorised Platform</span>
            </div>
            <h1 className="lp-hero-headline">
              Book Train Tickets<br />
              <span className="lp-headline-accent">Instantly Across India</span>
            </h1>
            <p className="lp-hero-sub">
              From Rajdhani to Vande Bharat — search, compare, and book any train in under 60 seconds. Visual seat selection, live status, PNR tracking, all in one place.
            </p>
            <div className="lp-hero-ctas">
              <button className="lp-btn-primary" onClick={() => { window.scrollTo({ top: 420, behavior: 'smooth' }) }}>
                <Search size={17} strokeWidth={2.2} /> Search Trains
              </button>
              <button className="lp-btn-ghost" onClick={() => navigate('/pnr-status')}>
                <ClipboardList size={17} strokeWidth={2} /> Check PNR Status
              </button>
            </div>
            <div className="lp-hero-trust">
              {STATS.map((s, i) => (
                <div key={i} className="lp-trust-item">
                  <span className="lp-trust-value">{s.value}</span>
                  <span className="lp-trust-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Search Card */}
          <div className="lp-search-card">
            <div className="lp-search-card-header">
              <h2 className="lp-search-title">BOOK TICKET</h2>
              <p className="lp-search-subtitle">Find and book the best trains</p>
            </div>

            <div className="lp-search-form">
              {/* From */}
              <div className="lp-input-group" ref={fromRef}>
                <label className="lp-input-label">
                  <Navigation size={12} color="#00C853" strokeWidth={2} /> FROM STATION
                </label>
                <input
                  className="lp-search-input"
                  placeholder="City or Station"
                  value={from}
                  onChange={e => { setFrom(e.target.value); setFromSuggestions(filterStations(e.target.value)) }}
                />
                {fromSuggestions.length > 0 && (
                  <div className="lp-suggestions">
                    {fromSuggestions.map(s => (
                      <div key={s.code} className="lp-suggestion-item"
                        onClick={() => { setFrom(s.name); setFromSuggestions([]) }}>
                        <span className="lp-stn-code">{s.code}</span>
                        <span className="lp-stn-name">{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap */}
              <button className="lp-swap-btn"
                onClick={() => { const t = from; setFrom(to); setTo(t) }}
                title="Swap stations">
                <ArrowLeftRight size={16} strokeWidth={2.2} />
              </button>

              {/* To */}
              <div className="lp-input-group" ref={toRef}>
                <label className="lp-input-label">
                  <MapPin size={12} color="#00C853" strokeWidth={2} /> TO STATION
                </label>
                <input
                  className="lp-search-input"
                  placeholder="City or Station"
                  value={to}
                  onChange={e => { setTo(e.target.value); setToSuggestions(filterStations(e.target.value)) }}
                />
                {toSuggestions.length > 0 && (
                  <div className="lp-suggestions">
                    {toSuggestions.map(s => (
                      <div key={s.code} className="lp-suggestion-item"
                        onClick={() => { setTo(s.name); setToSuggestions([]) }}>
                        <span className="lp-stn-code">{s.code}</span>
                        <span className="lp-stn-name">{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date + Search */}
              <div className="lp-date-search-row">
                <div className="lp-input-group lp-date-group">
                  <label className="lp-input-label">
                    <Calendar size={12} color="#00C853" strokeWidth={2} /> DATE OF JOURNEY
                  </label>
                  <input
                    className="lp-search-input"
                    type="date"
                    min={today}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <button className="lp-search-btn" onClick={handleSearch}>
                  <Search size={18} strokeWidth={2.5} />
                  <span>Search</span>
                </button>
              </div>

              {error && (
                <div className="lp-error">
                  <AlertTriangle size={14} strokeWidth={2} />
                  {error}
                </div>
              )}
            </div>

            {/* Quick popular routes inside card */}
            <div className="lp-card-quick-routes">
              <span className="lp-card-quick-label">Popular:</span>
              {[
                { from: 'New Delhi', to: 'Mumbai Central' },
                { from: 'Chennai Central', to: 'KSR Bengaluru' },
                { from: 'Howrah', to: 'New Delhi' },
              ].map((r, i) => (
                <button key={i} className="lp-quick-chip"
                  onClick={() => {
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

        {/* Scroll indicator */}
        <div className="lp-scroll-hint" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <span>Explore More</span>
          <div className="lp-scroll-arrow">
            <ChevronDown size={20} strokeWidth={2} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          QUICK ACCESS CARDS
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-quick-access">
        <div className="lp-container">
          <div className="lp-quick-grid">
            <div className="lp-quick-card lp-quick-pnr" onClick={() => navigate('/pnr-status')}>
              <div className="lp-quick-icon"><ClipboardList size={32} strokeWidth={1.4} /></div>
              <div>
                <div className="lp-quick-title">PNR Status</div>
                <div className="lp-quick-desc">Check booking status instantly</div>
              </div>
              <ChevronRight size={18} color="#9E9E9E" />
            </div>
            <div className="lp-quick-card lp-quick-live" onClick={() => navigate('/live-status')}>
              <div className="lp-quick-icon"><Train size={32} strokeWidth={1.4} /></div>
              <div>
                <div className="lp-quick-title">Live Train Status</div>
                <div className="lp-quick-desc">Real-time location of any train</div>
              </div>
              <ChevronRight size={18} color="#9E9E9E" />
            </div>
            <div className="lp-quick-card lp-quick-bookings" onClick={() => navigate('/bookings')}>
              <div className="lp-quick-icon"><Ticket size={32} strokeWidth={1.4} /></div>
              <div>
                <div className="lp-quick-title">My Bookings</div>
                <div className="lp-quick-desc">View and manage your tickets</div>
              </div>
              <ChevronRight size={18} color="#9E9E9E" />
            </div>
            <div className="lp-quick-card lp-quick-aadhaar" onClick={() => navigate('/link-aadhaar')}>
              <div className="lp-quick-icon"><IdCard size={32} strokeWidth={1.4} /></div>
              <div>
                <div className="lp-quick-title">Link Aadhaar</div>
                <div className="lp-quick-desc">Verify and secure your account</div>
              </div>
              <ChevronRight size={18} color="#9E9E9E" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          POPULAR ROUTES
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">Routes</div>
            <h2 className="lp-section-title">Popular Train Routes</h2>
            <p className="lp-section-sub">India's most booked corridors. Click any route to start booking.</p>
          </div>
          <div className="lp-routes-grid">
            {POPULAR_ROUTES.map((route, i) => (
              <div key={i} className="lp-route-card" onClick={() => handleRouteClick(route)}>
                <div className="lp-route-type-badge" style={{ background: route.type === 'Rajdhani' ? '#FFF3E0' : route.type === 'Shatabdi' ? '#E8F5E9' : '#F3E5F5', color: route.type === 'Rajdhani' ? '#E65100' : route.type === 'Shatabdi' ? '#2E7D32' : '#6A1B9A' }}>
                  {route.type}
                </div>
                <div className="lp-route-stations">
                  <div className="lp-route-station">
                    <span className="lp-route-code">{route.fromCode}</span>
                    <span className="lp-route-name">{route.from}</span>
                  </div>
                  <div className="lp-route-line">
                    <div className="lp-route-dot lp-route-dot-start" />
                    <div className="lp-route-track" />
                    <div className="lp-route-train-icon"><Train size={16} color="#00C853" strokeWidth={2} /></div>
                    <div className="lp-route-track" />
                    <div className="lp-route-dot lp-route-dot-end" />
                  </div>
                  <div className="lp-route-station lp-route-station-right">
                    <span className="lp-route-code">{route.toCode}</span>
                    <span className="lp-route-name">{route.to}</span>
                  </div>
                </div>
                <div className="lp-route-meta">
                  <span className="lp-route-duration"><Clock size={13} strokeWidth={2} /> {route.duration}</span>
                  <span className="lp-route-fare">From ₹{route.fare.toLocaleString()}</span>
                </div>
                <button className="lp-route-book-btn">
                  Check Availability <ArrowRight size={14} strokeWidth={2.2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES / WHY CHOOSE US
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-features-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">Features</div>
            <h2 className="lp-section-title">Why Choose CMT Booking?</h2>
            <p className="lp-section-sub">Built for Indian railways. Designed for Indian travellers.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((feat, i) => (
              <div key={i} className="lp-feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="lp-feature-icon">{feat.icon}</div>
                <h3 className="lp-feature-title">{feat.title}</h3>
                <p className="lp-feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRAIN TYPES
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-train-types-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">Trains</div>
            <h2 className="lp-section-title">Explore Train Categories</h2>
            <p className="lp-section-sub">From economy to luxury — every journey covered.</p>
          </div>
          <div className="lp-train-types-grid">
            {TRAIN_TYPES.map((type, i) => (
              <div key={i} className="lp-train-type-card" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="lp-train-type-emoji">{type.icon}</div>
                <div className="lp-train-type-tag" style={{ background: `${type.color}18`, color: type.color }}>
                  {type.tag}
                </div>
                <h3 className="lp-train-type-name">{type.name}</h3>
                <p className="lp-train-type-desc">{type.desc}</p>
                <button className="lp-train-type-btn" style={{ color: type.color }}
                  onClick={e => { e.stopPropagation(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                  Search {type.name} <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS COUNTER SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-stats-section" ref={statsRef}>
        <div className="lp-container">
          <div className={`lp-stats-grid ${countersVisible ? 'lp-stats-visible' : ''}`}>
            <div className="lp-stat-item">
              <div className="lp-stat-value">50L+</div>
              <div className="lp-stat-label">Tickets Booked</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">500+</div>
              <div className="lp-stat-label">Train Routes</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">99.2%</div>
              <div className="lp-stat-label">Booking Success Rate</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">60s</div>
              <div className="lp-stat-label">Average Booking Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OFFERS / PROMOTIONS
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">Offers</div>
            <h2 className="lp-section-title">Exclusive Deals & Promotions</h2>
            <p className="lp-section-sub">Save more on every journey with CMT exclusive offers.</p>
          </div>
          <div className="lp-offers-grid">
            {OFFERS.map((offer, i) => (
              <div key={i} className="lp-offer-card">
                <div className="lp-offer-tag" style={{ background: `${offer.color}1a`, color: offer.color }}>
                  {offer.tag}
                </div>
                <h3 className="lp-offer-title">{offer.title}</h3>
                <p className="lp-offer-desc">{offer.desc}</p>
                <div className="lp-offer-code-row">
                  <div className="lp-offer-code" style={{ border: `1.5px dashed ${offer.color}`, color: offer.color }}>
                    {offer.code}
                  </div>
                  <button className="lp-offer-use-btn" style={{ background: offer.color }}
                    onClick={() => navigate('/login')}>
                    Use Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-testimonials-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">Reviews</div>
            <h2 className="lp-section-title">What Travellers Say</h2>
            <p className="lp-section-sub">Trusted by millions of Indian railway passengers.</p>
          </div>
          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="lp-testimonial-card">
                <div className="lp-testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} color={j < t.rating ? '#F59E0B' : '#E0E0E0'}
                      fill={j < t.rating ? '#F59E0B' : 'none'} strokeWidth={1.5} />
                  ))}
                </div>
                <p className="lp-testimonial-text">"{t.text}"</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-meta">{t.city} · {t.route}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-how-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">Process</div>
            <h2 className="lp-section-title">Book in 4 Simple Steps</h2>
            <p className="lp-section-sub">Train booking has never been this straightforward.</p>
          </div>
          <div className="lp-steps-grid">
            {[
              { step: '01', icon: <Search size={28} strokeWidth={1.5}/>, title: 'Search Trains', desc: 'Enter your origin, destination, and date. Get instant results with live availability.', action: 'Start Search', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
              { step: '02', icon: <Ticket size={28} strokeWidth={1.5}/>, title: 'Pick Your Seat', desc: 'Use the visual seat map to choose your exact berth — window, lower, upper, or side.', action: 'How it works', onClick: () => navigate('/help') },
              { step: '03', icon: <Users size={28} strokeWidth={1.5}/>, title: 'Add Passengers', desc: 'Enter passenger details and preferences. Supports up to 6 passengers per booking.', action: null, onClick: null },
              { step: '04', icon: <CheckCircle size={28} strokeWidth={1.5}/>, title: 'Confirm & Go', desc: 'Secure payment, instant PNR, and digital ticket. Ready to board in under 60 seconds.', action: 'Book Now', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
            ].map((step, i) => (
              <div key={i} className="lp-step-card">
                <div className="lp-step-number">{step.step}</div>
                <div className="lp-step-icon">{step.icon}</div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
                {step.action && (
                  <button className="lp-step-action" onClick={step.onClick}>
                    {step.action} <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-cta-section">
        <div className="lp-cta-bg">
          <div className="lp-cta-pattern" />
        </div>
        <div className="lp-container lp-cta-inner">
          <div className="lp-cta-text">
            <h2 className="lp-cta-title">Ready to Book Your Journey?</h2>
            <p className="lp-cta-sub">Join 50 lakh+ travellers who book train tickets smarter with CMT.</p>
          </div>
          <div className="lp-cta-actions">
            <button className="lp-cta-btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Search size={18} strokeWidth={2.2} /> Search Trains Now
            </button>
            <button className="lp-cta-btn-ghost" onClick={() => navigate('/register')}>
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          APP DOWNLOAD SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-app-section">
        <div className="lp-container">
          <div className="lp-app-inner">
            <div className="lp-app-text">
              <div className="lp-section-tag">Mobile App</div>
              <h2 className="lp-section-title lp-app-title">CMT on Your Phone</h2>
              <p className="lp-app-desc">
                Download the CMT Booking app for the fastest train booking experience on mobile. PNR status, live train tracking, and seat selection — all in your pocket.
              </p>
              <div className="lp-app-features">
                {[
                  'Offline PNR lookup',
                  'Push notification alerts',
                  'Face ID / fingerprint login',
                  'One-tap rebooking',
                ].map((f, i) => (
                  <div key={i} className="lp-app-feature-item">
                    <CheckCircle size={16} color="#00C853" strokeWidth={2.5} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="lp-app-badges">
                <button className="lp-app-badge" onClick={() => navigate('/help')}>
                  <Download size={20} strokeWidth={1.8} />
                  <div>
                    <div className="lp-badge-sub">Download on the</div>
                    <div className="lp-badge-main">App Store</div>
                  </div>
                </button>
                <button className="lp-app-badge" onClick={() => navigate('/help')}>
                  <Download size={20} strokeWidth={1.8} />
                  <div>
                    <div className="lp-badge-sub">Get it on</div>
                    <div className="lp-badge-main">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="lp-app-visual">
              <div className="lp-phone-mockup">
                <div className="lp-phone-screen">
                  <div className="lp-phone-navbar">
                    <div className="lp-phone-logo">
                      <Train size={14} color="#00C853" strokeWidth={2} />
                      <span>CMT</span>
                    </div>
                  </div>
                  <div className="lp-phone-hero-card">
                    <div className="lp-phone-card-title">BOOK TICKET</div>
                    <div className="lp-phone-input">New Delhi</div>
                    <div className="lp-phone-swap">⇅</div>
                    <div className="lp-phone-input">Mumbai Central</div>
                    <div className="lp-phone-search-btn">Search Trains</div>
                  </div>
                  <div className="lp-phone-train-result">
                    <div className="lp-phone-train-name">Mumbai Rajdhani</div>
                    <div className="lp-phone-train-meta">17:00 → 08:35 · 3A ₹1,950</div>
                    <div className="lp-phone-avail">AVAILABLE</div>
                  </div>
                  <div className="lp-phone-train-result lp-phone-result-2">
                    <div className="lp-phone-train-name">Vande Bharat Express</div>
                    <div className="lp-phone-train-meta">06:00 → 14:00 · CC ₹1,765</div>
                    <div className="lp-phone-avail">AVAILABLE</div>
                  </div>
                </div>
              </div>
              <div className="lp-phone-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="lp-section lp-faq-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">FAQ</div>
            <h2 className="lp-section-title">Frequently Asked Questions</h2>
            <p className="lp-section-sub">Quick answers to common traveller questions.</p>
          </div>
          <div className="lp-faq-grid">
            <div className="lp-faq-list">
              {FAQS.map((faq, i) => (
                <div key={i} className={`lp-faq-item ${openFaq === i ? 'lp-faq-open' : ''}`}>
                  <button className="lp-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    <div className="lp-faq-icon">
                      {openFaq === i ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="lp-faq-answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="lp-faq-sidebar">
              <div className="lp-faq-help-card">
                <div className="lp-faq-help-icon"><Phone size={32} strokeWidth={1.5} /></div>
                <h3>Still need help?</h3>
                <p>Our support team is available 24/7 to assist with any booking queries.</p>
                <button className="lp-faq-help-btn" onClick={() => navigate('/help')}>
                  Visit Help Center <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              </div>
              <div className="lp-faq-links-card">
                <div className="lp-faq-link" onClick={() => navigate('/pnr-status')}>
                  <ClipboardList size={18} strokeWidth={2} /> Check PNR Status
                  <ChevronRight size={16} color="#9E9E9E" />
                </div>
                <div className="lp-faq-link" onClick={() => navigate('/live-status')}>
                  <Activity size={18} strokeWidth={2} /> Live Train Status
                  <ChevronRight size={16} color="#9E9E9E" />
                </div>
                <div className="lp-faq-link" onClick={() => navigate('/bookings')}>
                  <Ticket size={18} strokeWidth={2} /> My Bookings
                  <ChevronRight size={16} color="#9E9E9E" />
                </div>
                <div className="lp-faq-link" onClick={() => navigate('/settings')}>
                  <Shield size={18} strokeWidth={2} /> Account Settings
                  <ChevronRight size={16} color="#9E9E9E" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">

          {/* Brand */}
          <div className="lp-footer-col lp-footer-brand">
            <div className="lp-footer-logo">
              <Train size={20} color="#00C853" style={{ verticalAlign: 'middle', marginRight: 8 }} />
              CMT Booking
            </div>
            <p className="lp-footer-tagline">
              Connect My Train — India's fastest train booking experience. IRCTC authorised partner for seamless railway ticketing.
            </p>
            <div className="lp-footer-badges">
              <span className="lp-footer-badge"><Shield size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Secure</span>
              <span className="lp-footer-badge"><Zap size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Instant</span>
              <span className="lp-footer-badge">Made in India 🇮🇳</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lp-footer-col">
            <h4 className="lp-footer-heading">Quick Links</h4>
            <ul className="lp-footer-links">
              <li onClick={() => navigate('/home')}>Home</li>
              <li onClick={() => navigate('/pnr-status')}>PNR Status</li>
              <li onClick={() => navigate('/live-status')}>Live Train Status</li>
              <li onClick={() => navigate('/bookings')}>My Bookings</li>
              <li onClick={() => navigate('/link-aadhaar')}>Link Aadhaar</li>
              <li onClick={() => navigate('/help')}>Help & Support</li>
            </ul>
          </div>

          {/* Train Types */}
          <div className="lp-footer-col">
            <h4 className="lp-footer-heading">Train Types</h4>
            <ul className="lp-footer-links">
              {['Rajdhani Express', 'Vande Bharat Express', 'Shatabdi Express', 'Duronto Express', 'Gatimaan Express', 'Humsafar Express'].map((name, i) => (
                <li key={i} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{name}</li>
              ))}
            </ul>
          </div>

          {/* Popular Routes */}
          <div className="lp-footer-col">
            <h4 className="lp-footer-heading">Popular Routes</h4>
            <ul className="lp-footer-links">
              {[
                { from: 'New Delhi', to: 'Mumbai Central', label: 'Delhi → Mumbai' },
                { from: 'Chennai Central', to: 'KSR Bengaluru', label: 'Chennai → Bengaluru' },
                { from: 'Howrah', to: 'New Delhi', label: 'Kolkata → Delhi' },
                { from: 'New Delhi', to: 'Amritsar', label: 'Delhi → Amritsar' },
                { from: 'Hyderabad', to: 'New Delhi', label: 'Hyderabad → Delhi' },
                { from: 'Mumbai CSMT', to: 'Howrah', label: 'Mumbai → Kolkata' },
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

        <div className="lp-footer-bottom">
          <div className="lp-footer-bottom-left">© 2026 CMT Booking. All rights reserved.</div>
          <div className="lp-footer-bottom-right">
            <span onClick={() => navigate('/help')}>Privacy Policy</span>
            <span onClick={() => navigate('/help')}>Terms of Service</span>
            <span onClick={() => navigate('/help')}>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
