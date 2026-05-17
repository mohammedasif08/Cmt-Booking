import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Train, Home, Ticket, ClipboardList, Search, User, Settings, Bell, Lock, Shield, CreditCard, Wallet, Phone, Mail, HelpCircle, IdCard, LogOut, Key, Download, MapPin, Calendar, ChevronRight, ChevronDown, ChevronUp, X, CheckCircle, Check, AlertTriangle, Info, Zap, ArrowRight, ArrowLeft, Activity, Clock, FileText, Navigation, Radio, XCircle, RefreshCw, Star, Users } from '../components/Icon'
import { useBooking } from '../context/BookingContext'
import './BookingsPage.css'

const SAMPLE_BOOKINGS = [
  {
    id: 1,
    pnr: '4821903756',
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
    passengers: [
      { name: 'Rajesh Kumar', age: 34, gender: 'Male', seat: '45', berth: 'Window', status: 'CNF' },
      { name: 'Priya Kumar',  age: 29, gender: 'Female', seat: '46', berth: 'Aisle', status: 'CNF' },
    ],
    totalFare: 2330,
    status: 'UPCOMING',
    bookingDate: '24 Feb 2026',
  },
  {
    id: 2,
    pnr: '9301847562',
    trainNumber: '12621',
    trainName: 'Tamil Nadu Express',
    from: 'Chennai Central',
    fromCode: 'MAS',
    to: 'New Delhi',
    toCode: 'NDLS',
    date: '15 Jan 2026',
    departureTime: '22:00',
    arrivalTime: '07:10',
    class: '3A',
    passengers: [
      { name: 'Anand Kumar', age: 41, gender: 'Male', seat: '32', berth: 'Lower', status: 'CNF' },
    ],
    totalFare: 1565,
    status: 'COMPLETED',
    bookingDate: '10 Jan 2026',
  },
  {
    id: 3,
    pnr: '7634028195',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    from: 'Howrah',
    fromCode: 'HWH',
    to: 'New Delhi',
    toCode: 'NDLS',
    date: '05 Dec 2025',
    departureTime: '16:55',
    arrivalTime: '10:00',
    class: '2A',
    passengers: [
      { name: 'Suresh Patel', age: 52, gender: 'Male',   seat: '14', berth: 'Lower',  status: 'CNF' },
      { name: 'Neha Patel',   age: 48, gender: 'Female', seat: '15', berth: 'Upper',  status: 'CNF' },
      { name: 'Ravi Patel',   age: 22, gender: 'Male',   seat: '16', berth: 'Side Lower', status: 'CNF' },
    ],
    totalFare: 8090,
    status: 'COMPLETED',
    bookingDate: '01 Dec 2025',
  },
]

// ─── Download ticket as a printable HTML page ────────────────────────────────
function downloadTicket(booking) {
  const paxRows = booking.passengers.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.age || '—'}</td>
      <td>${p.gender || '—'}</td>
      <td>${p.seat}</td>
      <td>${p.berth || booking.class}</td>
      <td style="color:#00C853;font-weight:700">${p.status}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>CMT Ticket — PNR ${booking.pnr}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#f0f0f0; display:flex; justify-content:center; padding:40px 20px; }
    .ticket { background:white; width:700px; border-radius:16px; overflow:hidden; box-shadow:0 8px 40px rgba(0,0,0,0.15); }
    .ticket-top { background:#0d1117; color:white; padding:28px 32px; }
    .brand { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
    .brand-icon { font-size:28px; }
    .brand-name { font-size:20px; font-weight:900; color:#00C853; }
    .brand-tag { font-size:10px; color:rgba(255,255,255,0.5); letter-spacing:1.5px; text-transform:uppercase; }
    .status-pill { background:#00C853; color:white; font-size:11px; font-weight:800; padding:4px 14px; border-radius:50px; letter-spacing:1px; margin-left:auto; }
    .route { display:flex; align-items:center; justify-content:space-between; margin:0 0 20px; }
    .station { text-align:center; }
    .stn-time { font-size:28px; font-weight:900; color:white; }
    .stn-code { font-size:14px; font-weight:700; color:#00C853; letter-spacing:2px; margin:4px 0; }
    .stn-city { font-size:12px; color:rgba(255,255,255,0.6); }
    .route-mid { flex:1; text-align:center; color:rgba(255,255,255,0.3); font-size:12px; }
    .route-train { font-size:18px; margin:4px 0; }
    .route-dur { font-size:11px; color:rgba(255,255,255,0.5); }
    .meta-row { display:flex; gap:24px; flex-wrap:wrap; }
    .meta-item label { font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:3px; }
    .meta-item span { font-size:13px; font-weight:600; color:white; }
    .meta-item .pnr-val { color:#00C853; font-size:15px; font-weight:900; letter-spacing:2px; }
    .divider { display:flex; align-items:center; background:#f8f8f8; padding:0 0; }
    .notch { width:24px; height:24px; background:#f0f0f0; border-radius:50%; flex-shrink:0; }
    .dash-line { flex:1; border-top:2px dashed #ddd; margin:0 8px; }
    .ticket-body { padding:28px 32px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#f8f9fa; color:#666; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; padding:10px 12px; text-align:left; }
    td { padding:10px 12px; border-bottom:1px solid #f0f0f0; color:#1a1a1a; }
    tr:last-child td { border-bottom:none; }
    .footer-row { display:flex; justify-content:space-between; align-items:flex-end; margin-top:28px; padding-top:20px; border-top:1px solid #f0f0f0; }
    .fare-box { }
    .fare-label { font-size:11px; color:#999; text-transform:uppercase; letter-spacing:1px; }
    .fare-amount { font-size:28px; font-weight:900; color:#0d1117; }
    .note { font-size:11px; color:#999; max-width:300px; line-height:1.5; text-align:right; }
    .qr-placeholder { width:80px; height:80px; background:#0d1117; border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; text-align:center; line-height:1.4; }
    @media print { body { background:white; padding:0; } .ticket { box-shadow:none; border-radius:0; width:100%; } }
  </style>
</head>
<body>
<div class="ticket">
  <div class="ticket-top">
    <div class="brand">
      <span style="display:inline-flex"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16"/><circle cx="9" cy="14.5" r="0.5" fill="#00C853"/><circle cx="15" cy="14.5" r="0.5" fill="#00C853"/></svg></span>
      <div>
        <div class="brand-name">CMT Booking</div>
        <div class="brand-tag">Connect My Train</div>
      </div>
      <span class="status-pill">CONFIRMED</span>
    </div>

    <div class="route">
      <div class="station">
        <div class="stn-time">${booking.departureTime}</div>
        <div class="stn-code">${booking.fromCode}</div>
        <div class="stn-city">${booking.from}</div>
      </div>
      <div class="route-mid">
        <div class="route-train">————◆————</div>
        <div class="route-dur">${booking.trainName}</div>
        <div class="route-dur">${booking.trainNumber}</div>
      </div>
      <div class="station" style="text-align:right">
        <div class="stn-time">${booking.arrivalTime}</div>
        <div class="stn-code">${booking.toCode}</div>
        <div class="stn-city">${booking.to}</div>
      </div>
    </div>

    <div class="meta-row">
      <div class="meta-item"><label>PNR Number</label><span class="pnr-val">${booking.pnr}</span></div>
      <div class="meta-item"><label>Date</label><span>${booking.date}</span></div>
      <div class="meta-item"><label>Class</label><span>${booking.class}</span></div>
      <div class="meta-item"><label>Booked On</label><span>${booking.bookingDate}</span></div>
    </div>
  </div>

  <div class="divider">
    <div class="notch"></div>
    <div class="dash-line"></div>
    <div class="notch"></div>
  </div>

  <div class="ticket-body">
    <table>
      <thead>
        <tr>
          <th>#</th><th>Passenger Name</th><th>Age</th><th>Gender</th><th>Seat</th><th>Berth</th><th>Status</th>
        </tr>
      </thead>
      <tbody>${paxRows}</tbody>
    </table>

    <div class="footer-row">
      <div class="fare-box">
        <div class="fare-label">Total Fare Paid</div>
        <div class="fare-amount">₹${booking.totalFare}</div>
      </div>
      <div>
        <div class="qr-placeholder">QR Code<br/>Show to TTE</div>
      </div>
      <div class="note">
        Carry valid Govt. photo ID during journey.<br/>
        Arrive 30 mins before departure.<br/>
        This is a computer-generated ticket.
      </div>
    </div>
  </div>
</div>
<script>window.onload = () => window.print()</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `CMT_Ticket_${booking.pnr}.html`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Cancel modal ─────────────────────────────────────────────────────────────
function CancelModal({ booking, onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  const refundAmt = Math.round(booking.totalFare * 0.85)

  return (
    <div className="cancel-overlay" onClick={onClose}>
      <div className="cancel-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-header">
          <div className="cm-icon"><AlertTriangle size={28} color="#E65100"/></div>
          <h2 className="cm-title">Cancel Ticket</h2>
          <button className="cm-close" onClick={onClose}><X size={15} strokeWidth={2.5}/></button>
        </div>

        <div className="cm-body">
          <div className="cm-train-info">
            <div className="cmti-name">{booking.trainName}</div>
            <div className="cmti-route">{booking.fromCode} → {booking.toCode} &nbsp;|&nbsp; {booking.date}</div>
            <div className="cmti-pnr">PNR: <strong>{booking.pnr}</strong></div>
          </div>

          <div className="cm-refund-box">
            <div className="cmr-row">
              <span>Ticket Amount</span>
              <span>₹{booking.totalFare}</span>
            </div>
            <div className="cmr-row">
              <span>Cancellation Charge (15%)</span>
              <span className="cmr-deduct">− ₹{booking.totalFare - refundAmt}</span>
            </div>
            <div className="cmr-row cmr-total">
              <span>Refund Amount</span>
              <span className="cmr-green">₹{refundAmt}</span>
            </div>
            <div className="cmr-note">Refund will be credited within 5–7 business days</div>
          </div>

          <div className="cm-reason">
            <label className="cm-reason-label">Reason for cancellation (optional)</label>
            <select className="cm-reason-select" value={reason} onChange={e => setReason(e.target.value)}>
              <option value="">Select a reason</option>
              <option>Change of plans</option>
              <option>Booked wrong train / date</option>
              <option>Medical emergency</option>
              <option>Travel not required</option>
              <option>Other</option>
            </select>
          </div>

          <div className="cm-pax-list">
            <div className="cm-pax-label">Passengers to cancel</div>
            {booking.passengers.map((p, i) => (
              <div key={i} className="cm-pax-item">
                <span className="cmp-name">{p.name}</span>
                <span className="cmp-seat">Seat {p.seat}</span>
                <span className="cmp-status">Will be cancelled</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cm-footer">
          <button className="cm-btn-keep" onClick={onClose}>Keep Ticket</button>
          <button className="cm-btn-cancel" onClick={() => onConfirm(booking.pnr)}>
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingsPage() {
  const navigate = useNavigate()
  const { bookingDetails, selectedTrain, cancelBooking, isBookingCancelled } = useBooking()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)   // booking object
  const [cancelledLocal, setCancelledLocal] = useState([]) // track in-session cancels
  const [cancelSuccess, setCancelSuccess] = useState(null) // PNR of last cancelled

  // Merge session booking
  const allBookings = bookingDetails && selectedTrain
    ? [{
        id: 0,
        pnr: bookingDetails.pnr,
        trainNumber: selectedTrain.trainNumber,
        trainName: selectedTrain.trainName,
        from: selectedTrain.from,
        fromCode: selectedTrain.fromCode,
        to: selectedTrain.to,
        toCode: selectedTrain.toCode,
        date: 'Upcoming',
        departureTime: selectedTrain.departureTime,
        arrivalTime: selectedTrain.arrivalTime,
        class: 'Selected',
        passengers: (bookingDetails.passengers || []).map(p => ({
          name: p.name || 'Passenger',
          age: p.age,
          gender: p.gender,
          seat: p.seatNum,
          berth: p.berth || 'N/A',
          status: 'CNF'
        })),
        totalFare: bookingDetails.totalAmount,
        status: cancelledLocal.includes(bookingDetails.pnr) ? 'CANCELLED' : 'UPCOMING',
        bookingDate: 'Today',
      }, ...SAMPLE_BOOKINGS.map(b => ({
        ...b,
        status: cancelledLocal.includes(b.pnr) ? 'CANCELLED' : b.status
      }))]
    : SAMPLE_BOOKINGS.map(b => ({
        ...b,
        status: cancelledLocal.includes(b.pnr) ? 'CANCELLED' : b.status
      }))

  const upcomingBookings  = allBookings.filter(b => b.status === 'UPCOMING')
  const completedBookings = allBookings.filter(b => b.status === 'COMPLETED')
  const cancelledBookings = allBookings.filter(b => b.status === 'CANCELLED')

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings
    : activeTab === 'completed' ? completedBookings
    : cancelledBookings

  const getStatusColor = (status) => {
    if (status === 'UPCOMING')  return 'booking-upcoming'
    if (status === 'COMPLETED') return 'booking-completed'
    if (status === 'CANCELLED') return 'booking-cancelled'
    return ''
  }

  const handleConfirmCancel = async (pnr) => {
    // Optimistically update UI immediately
    setCancelledLocal(prev => [...prev, pnr])
    setCancelModal(null)
    setCancelSuccess(pnr)
    setActiveTab('cancelled')
    setTimeout(() => setCancelSuccess(null), 4000)
    // Call backend to unlock seats (async — context handles errors gracefully)
    await cancelBooking(pnr)
  }

  return (
    <div className="bookings-page">
      <Navbar />

      {/* Cancel Modal */}
      {cancelModal && (
        <CancelModal
          booking={cancelModal}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelModal(null)}
        />
      )}

      {/* Cancel success toast */}
      {cancelSuccess && (
        <div className="cancel-toast">
          Ticket cancelled. Refund initiated for PNR {cancelSuccess}.
        </div>
      )}

      <div className="bookings-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h1 className="bookings-title">My Bookings</h1>
      </div>

      {/* TABS */}
      <div className="bookings-tabs-wrapper">
        <div className="bookings-tabs">
          {[
            { id: 'upcoming',  label: 'Upcoming',  count: upcomingBookings.length },
            { id: 'completed', label: 'Completed', count: completedBookings.length },
            { id: 'cancelled', label: 'Cancelled', count: cancelledBookings.length },
          ].map(tab => (
            <button
              key={tab.id}
              className={`bookings-tab ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="bookings-body">
        {displayBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="nb-icon"><Ticket size={48} strokeWidth={1} color="#ccc"/></div>
            <h3>No {activeTab} bookings</h3>
            <p>You don't have any {activeTab} train bookings.</p>
            <button className="nb-book-btn" onClick={() => navigate('/')}>Book a Train</button>
          </div>
        ) : (
          <div className="bookings-list">
            {displayBookings.map(booking => (
              <div key={booking.id} className={`booking-card ${getStatusColor(booking.status)}`}>
                <div className="booking-card-header" onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}>
                  <div className="bch-left">
                    <div className="bch-train-row">
                      <span className="bch-num">{booking.trainNumber}</span>
                      <span className="bch-name">{booking.trainName}</span>
                      <span className={`bch-status-badge ${getStatusColor(booking.status)}`}>{booking.status}</span>
                    </div>
                    <div className="bch-route-row">
                      <span className="bch-station">{booking.departureTime} {booking.fromCode}</span>
                      <span className="bch-arrow">→</span>
                      <span className="bch-station">{booking.arrivalTime} {booking.toCode}</span>
                      <span className="bch-date">{booking.date}</span>
                    </div>
                    <div className="bch-pnr-row">
                      <span className="bch-pnr-label">PNR:</span>
                      <span className="bch-pnr-val">{booking.pnr}</span>
                      <span className="bch-class">{booking.class}</span>
                      <span className="bch-pax">{booking.passengers.length} Passenger{booking.passengers.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="bch-right">
                    <div className="bch-fare">₹{booking.totalFare}</div>
                    <div className="bch-expand">{expandedBooking === booking.id ? '▲' : '▼'}</div>
                  </div>
                </div>

                {expandedBooking === booking.id && (
                  <div className="booking-expanded">
                    <div className="be-route-detail">
                      <div className="berd-station">
                        <div className="berd-time">{booking.departureTime}</div>
                        <div className="berd-code">{booking.fromCode}</div>
                        <div className="berd-city">{booking.from}</div>
                      </div>
                      <div className="berd-middle">
                        <div className="berd-line"></div>
                        <Train size={18} strokeWidth={1.5}/>
                        <div className="berd-line"></div>
                      </div>
                      <div className="berd-station berd-right">
                        <div className="berd-time">{booking.arrivalTime}</div>
                        <div className="berd-code">{booking.toCode}</div>
                        <div className="berd-city">{booking.to}</div>
                      </div>
                    </div>

                    <div className="be-passengers">
                      <h4 className="be-pax-title">Passengers</h4>
                      {booking.passengers.map((p, i) => (
                        <div key={i} className="be-pax-item">
                          <span className="be-pax-num">{i + 1}</span>
                          <span className="be-pax-name">{p.name}</span>
                          <span className="be-pax-seat">Seat {p.seat}</span>
                          <span className={`be-pax-status ${booking.status === 'CANCELLED' ? 'be-cancel' : 'be-cnf'}`}>
                            {booking.status === 'CANCELLED' ? 'CXL' : p.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="be-booking-meta">
                      <span>Booked on: {booking.bookingDate}</span>
                      <span>Class: {booking.class}</span>
                      <span>Total: ₹{booking.totalFare}</span>
                    </div>

                    <div className="be-actions">
                      {booking.status !== 'CANCELLED' && (
                        <button
                          className="bea-btn bea-primary"
                          onClick={() => downloadTicket(booking)}
                        >
                          <Download size={15} style={{verticalAlign:"middle",marginRight:6}}/> Download Ticket
                        </button>
                      )}
                      <button className="bea-btn bea-secondary" onClick={() => navigate('/pnr-status')}><Search size={15} style={{verticalAlign:"middle",marginRight:6}}/> Check PNR</button>
                      <button className="bea-btn bea-secondary" onClick={() => navigate('/live-status')}><Train size={15} style={{verticalAlign:"middle",marginRight:6}}/> Track Train</button>
                      {booking.status === 'UPCOMING' && (
                        <button
                          className="bea-btn bea-cancel"
                          onClick={() => setCancelModal(booking)}
                        >
                          <X size={13} strokeWidth={2.5} style={{verticalAlign:"middle",marginRight:4}}/> Cancel Ticket
                        </button>
                      )}
                      {booking.status === 'CANCELLED' && (
                        <div className="bea-cancelled-note">
                          This ticket has been cancelled. Refund processing.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
