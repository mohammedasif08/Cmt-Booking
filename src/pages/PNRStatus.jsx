import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Train, Home, Ticket, ClipboardList, Search, User, Settings, Bell, Lock, Shield, CreditCard, Wallet, Phone, Mail, HelpCircle, IdCard, LogOut, Key, Download, MapPin, Calendar, ChevronRight, ChevronDown, ChevronUp, X, CheckCircle, Check, AlertTriangle, Info, Zap, ArrowRight, ArrowLeft, Activity, Clock, FileText, Navigation, Radio, XCircle, RefreshCw, Star, Users } from '../components/Icon'
import './PNRStatus.css'

const SAMPLE_PNR_DATA = {
  '1234567890': {
    pnr: '1234567890',
    trainNumber: '12027',
    trainName: 'Chennai Shatabdi Express',
    from: 'Chennai Central',
    fromCode: 'MAS',
    to: 'KSR Bengaluru',
    toCode: 'SBC',
    date: '28 Feb 2026',
    departureTime: '06:00',
    arrivalTime: '11:00',
    class: 'CC',
    duration: '5h 00m',
    status: 'CONFIRMED',
    chartPrepared: false,
    passengers: [
      { name: 'Rajesh Kumar', age: 34, gender: 'Male', seat: '45', berth: 'Window', status: 'CNF' },
      { name: 'Priya Kumar', age: 30, gender: 'Female', seat: '46', berth: 'Aisle', status: 'CNF' },
    ]
  },
  '9876543210': {
    pnr: '9876543210',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    from: 'Howrah',
    fromCode: 'HWH',
    to: 'New Delhi',
    toCode: 'NDLS',
    date: '01 Mar 2026',
    departureTime: '16:55',
    arrivalTime: '10:00',
    class: '2A',
    duration: '17h 05m',
    status: 'WAITLIST',
    chartPrepared: false,
    passengers: [
      { name: 'Amit Singh', age: 28, gender: 'Male', seat: 'WL/3', berth: '-', status: 'WL/3' },
    ]
  }
}

export default function PNRStatus() {
  const navigate = useNavigate()
  const [pnrInput, setPnrInput] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleCheck = () => {
    if (!pnrInput || pnrInput.length !== 10 || isNaN(pnrInput)) {
      setError('Please enter a valid 10-digit PNR number')
      return
    }
    setError('')
    setLoading(true)
    setSearched(false)
    setTimeout(() => {
      setResult(SAMPLE_PNR_DATA[pnrInput] || null)
      setSearched(true)
      setLoading(false)
    }, 1200)
  }

  const getStatusInfo = (status) => {
    if (status === 'CONFIRMED' || status === 'CNF') return { cls: 'cnf', label: 'Confirmed', icon: 'CNF' }
    if (status.startsWith('WL') || status === 'WAITLIST') return { cls: 'wl', label: 'Waitlisted', icon: 'WL' }
    if (status.startsWith('RAC')) return { cls: 'rac', label: 'RAC', icon: '↕' }
    return { cls: 'unk', label: status, icon: '?' }
  }

  return (
    <div className="pnr-page">
      <Navbar />

      <div className="pnr-top-bar">
        <button className="top-back" onClick={() => navigate('/')}>← Home</button>
        <div className="pnr-breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <span className="bc-sep">›</span>
          <span className="bc-active">PNR Status</span>
        </div>
      </div>

      <div className="pnr-content">
        <div className="pnr-left-panel">
          <div className="pnr-panel-card">
            <div className="pnr-panel-icon"><Ticket size={48} strokeWidth={1} color="#00C853"/></div>
            <h1 className="pnr-panel-title">PNR Status</h1>
            <p className="pnr-panel-desc">Check your booking status instantly using your 10-digit PNR number</p>

            <div className="pnr-input-group">
              <label className="pnr-label">PNR Number</label>
              <div className={"pnr-input-box" + (error ? ' pnr-input-error' : '')}>
                <input
                  className="pnr-input"
                  placeholder="Enter 10-digit PNR"
                  value={pnrInput}
                  onChange={e => { setPnrInput(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleCheck()}
                  maxLength={10}
                />
                <span className="pnr-char-count">{pnrInput.length}/10</span>
              </div>
              {error && <span className="pnr-error-msg"><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{error}</span>}
            </div>

            <button className="pnr-submit-btn" onClick={handleCheck} disabled={loading}>
              {loading
                ? <><span className="spin-ring"></span> Checking...</>
                : 'Check PNR Status'
              }
            </button>

            <div className="pnr-demo-section">
              <span className="demo-label">Try demo PNRs:</span>
              <button className="demo-chip" onClick={() => { setPnrInput('1234567890'); setError('') }}>1234567890</button>
              <button className="demo-chip" onClick={() => { setPnrInput('9876543210'); setError('') }}>9876543210</button>
            </div>
          </div>

          <div className="pnr-quick-nav">
            <div className="pqn-item" onClick={() => navigate('/live-status')}>
              <span className="pqn-icon"><Train size={20} strokeWidth={1.5}/></span>
              <div>
                <div className="pqn-title">Live Train Status</div>
                <div className="pqn-sub">Track running position</div>
              </div>
              <span className="pqn-arrow">›</span>
            </div>
            <div className="pqn-item" onClick={() => navigate('/')}>
              <span className="pqn-icon"><Ticket size={20} strokeWidth={1.5}/></span>
              <div>
                <div className="pqn-title">Book New Ticket</div>
                <div className="pqn-sub">Search & book trains</div>
              </div>
              <span className="pqn-arrow">›</span>
            </div>
            <div className="pqn-item" onClick={() => navigate('/bookings')}>
              <span className="pqn-icon"><ClipboardList size={20} strokeWidth={1.5}/></span>
              <div>
                <div className="pqn-title">My Bookings</div>
                <div className="pqn-sub">View all your tickets</div>
              </div>
              <span className="pqn-arrow">›</span>
            </div>
          </div>
        </div>

        <div className="pnr-right-panel">
          {loading && (
            <div className="pnr-loading-state">
              <div className="loading-track-anim">
                <div className="lt-track"></div>
                <div className="lt-train"><Train size={28} strokeWidth={1.3} color="#00C853"/></div>
              </div>
              <p>Fetching your booking details...</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="pnr-empty-state">
              <div className="es-icon"><Ticket size={32} strokeWidth={1} color="#ccc"/></div>
              <h3>Enter your PNR number</h3>
              <p>Your PNR is a 10-digit number found on your ticket or booking confirmation email</p>

              <div className="status-legend">
                <h4>Understanding Booking Status</h4>
                {[
                  { badge: 'CNF', cls: 'cnf', title: 'Confirmed', desc: 'Your seat is confirmed. Carry a valid ID and board the train.' },
                  { badge: 'RAC', cls: 'rac', title: 'Reservation Against Cancellation', desc: 'Shared berth. May get confirmed if a passenger cancels.' },
                  { badge: 'WL', cls: 'wl', title: 'Waitlisted', desc: 'No berth yet. Will confirm if enough passengers cancel before chart.' },
                ].map(s => (
                  <div key={s.badge} className="sl-item">
                    <span className={"sl-badge sl-" + s.cls}>{s.badge}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searched && !loading && (
            result ? (
              <div className="pnr-result-card">
                <div className={"result-header rh-" + getStatusInfo(result.status).cls}>
                  <div className="rh-left">
                    <div className="rh-pnr">PNR {result.pnr}</div>
                    <div className="rh-status-wrap">
                      <span className="rh-status-icon">{getStatusInfo(result.status).icon}</span>
                      <span className="rh-status-text">{getStatusInfo(result.status).label}</span>
                    </div>
                  </div>
                  <div className="rh-right">
                    <span className={"chart-tag " + (result.chartPrepared ? 'chart-done' : 'chart-pending')}>
                      {result.chartPrepared ? 'Chart Prepared' : 'Chart Pending'}
                    </span>
                  </div>
                </div>

                <div className="result-train-block">
                  <div className="rtb-train-id">
                    <span className="rtb-num">{result.trainNumber}</span>
                    <span className="rtb-name">{result.trainName}</span>
                    <span className="rtb-class">{result.class}</span>
                  </div>
                  <div className="rtb-journey">
                    <div className="rtb-col">
                      <div className="rtb-time">{result.departureTime}</div>
                      <div className="rtb-code">{result.fromCode}</div>
                      <div className="rtb-city">{result.from}</div>
                    </div>
                    <div className="rtb-mid">
                      <div className="rtb-dur">{result.duration}</div>
                      <div className="rtb-dashes">— — — ◆ — — —</div>
                      <div className="rtb-date">{result.date}</div>
                    </div>
                    <div className="rtb-col rtb-col-right">
                      <div className="rtb-time">{result.arrivalTime}</div>
                      <div className="rtb-code">{result.toCode}</div>
                      <div className="rtb-city">{result.to}</div>
                    </div>
                  </div>
                </div>

                <div className="result-pax-block">
                  <div className="rpb-title">Passengers</div>
                  <div className="rpb-table">
                    <div className="rpb-head">
                      <span>#</span><span>Name</span><span>Age</span><span>Gender</span><span>Seat</span><span>Status</span>
                    </div>
                    {result.passengers.map((p, i) => {
                      const si = getStatusInfo(p.status)
                      return (
                        <div key={i} className="rpb-row">
                          <span className="rpb-idx">{i+1}</span>
                          <span className="rpb-name">{p.name}</span>
                          <span>{p.age}</span>
                          <span>{p.gender}</span>
                          <span className="rpb-seat">{p.seat}</span>
                          <span className={"rpb-status rpb-" + si.cls}>{p.status}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="result-actions">
                  <button className="ra-btn-primary"><Download size={14} style={{verticalAlign:"middle",marginRight:5}}/>Download Ticket</button>
                  <button className="ra-btn-outline" onClick={() => navigate('/live-status')}><Train size={14} style={{verticalAlign:"middle",marginRight:5}}/>Track Train</button>
                  <button className="ra-btn-outline ra-danger"><X size={13} strokeWidth={2.5} style={{verticalAlign:"middle",marginRight:4}}/>Cancel Ticket</button>
                </div>
              </div>
            ) : (
              <div className="pnr-not-found">
                <div className="nf-illustration"><Search size={48} strokeWidth={1} color="#ccc"/></div>
                <h3>PNR Not Found</h3>
                <p>No booking found for PNR <code>{pnrInput}</code></p>
                <p className="nf-hint">Ensure you've entered the correct 10-digit PNR number from your ticket.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
