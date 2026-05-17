import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Train, Home, Download, Mail, Phone, Check, Clock, Calendar, ClipboardList } from '../components/Icon'
import { useBooking } from '../context/BookingContext'
import './BookingConfirmation.css'

// ── Pure JS QR generator (no API, no CDN, works offline) ────────────────────
function buildQRSVG(text, px = 180) {
  // Reed-Solomon tables
  const gexp = new Array(512), glog = new Array(256)
  let a = 1
  for (let i = 0; i < 255; i++) {
    gexp[i] = a; glog[a] = i
    a <<= 1; if (a & 0x100) a ^= 0x11d
  }
  for (let i = 255; i < 512; i++) gexp[i] = gexp[i - 255]
  const mul = (a, b) => (a && b) ? gexp[(glog[a] + glog[b]) % 255] : 0
  const ecPoly = (n) => {
    let p = [1]
    for (let i = 0; i < n; i++) {
      const q = [1, gexp[i]], r = new Array(p.length + 1).fill(0)
      for (let j = 0; j < p.length; j++) for (let k = 0; k < q.length; k++) r[j+k] ^= mul(p[j], q[k])
      p = r
    }
    return p
  }

  // Pick version
  const L = text.length
  const ver = L <= 17 ? 1 : L <= 32 ? 2 : L <= 53 ? 3 : L <= 78 ? 4 : L <= 106 ? 5 : L <= 134 ? 6 : 7
  const tcw = [26,44,70,100,134,172,196][ver-1]
  const ecn = [10,16,26,36,48,64,72][ver-1]
  const dcw = tcw - ecn
  const sz  = ver * 4 + 17

  // Byte-mode encoding
  const bytes = Array.from(text).map(c => c.charCodeAt(0))
  const bits = []
  const pb = (v, n) => { for (let i = n-1; i >= 0; i--) bits.push((v>>i)&1) }
  pb(0b0100, 4); pb(bytes.length, 8)
  bytes.forEach(b => pb(b, 8))
  pb(0, 4)
  while (bits.length % 8) bits.push(0)
  const data = []
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0; for (let j = 0; j < 8; j++) b = (b<<1)|(bits[i+j]||0); data.push(b)
  }
  while (data.length < dcw) data.push(data.length%2 ? 0x11 : 0xEC)

  // Error correction
  const gen = ecPoly(ecn)
  const msg = [...data, ...new Array(ecn).fill(0)]
  for (let i = 0; i < data.length; i++) {
    const c = msg[i]; if (!c) continue
    for (let j = 0; j < gen.length; j++) msg[i+j] ^= mul(gen[j], c)
  }
  const all = [...data, ...msg.slice(data.length, data.length+ecn)]

  // Matrix
  const M = Array.from({length: sz}, () => new Array(sz).fill(null))
  const set = (r, c, v) => { if (r>=0&&r<sz&&c>=0&&c<sz) M[r][c] = v }

  // Finder pattern helper
  const finder = (tr, tc) => {
    for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
      const v = dr>=0&&dr<=6&&dc>=0&&dc<=6
        ? (dr===0||dr===6||dc===0||dc===6||(dr>=2&&dr<=4&&dc>=2&&dc<=4))
        : false
      set(tr+dr, tc+dc, v)
    }
  }
  finder(0,0); finder(0,sz-7); finder(sz-7,0)

  // Alignment pattern (ver >= 2)
  if (ver >= 2) {
    const apos = [[],[],[6,22],[6,26],[6,30],[6,34],[6,22,38]][ver-1] || []
    for (const r of apos) for (const c of apos) {
      if (M[r][c] !== null) continue
      for (let dr=-2;dr<=2;dr++) for (let dc=-2;dc<=2;dc++)
        set(r+dr,c+dc,dr===0&&dc===0||Math.abs(dr)===2||Math.abs(dc)===2)
    }
  }

  // Timing
  for (let i = 8; i < sz-8; i++) {
    if (M[6][i]===null) M[6][i] = i%2===0
    if (M[i][6]===null) M[i][6] = i%2===0
  }
  M[sz-8][8] = true // dark module

  // Format info (ECC=M mask=0 → bits 101010000010010 XOR 101010000010010)
  const fmt=[1,0,1,0,1,0,0,0,0,0,1,0,0,1,0]
  const fp1=[[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0]]
  const fp2=[[sz-1,8],[sz-2,8],[sz-3,8],[sz-4,8],[sz-5,8],[sz-6,8],[sz-7,8],[8,sz-8],[8,sz-7],[8,sz-6],[8,sz-5],[8,sz-4],[8,sz-3],[8,sz-2],[8,sz-1]]
  fp1.forEach(([r,c],i)=>M[r][c]=!!fmt[i])
  fp2.forEach(([r,c],i)=>M[r][c]=!!fmt[i])

  // Data bits
  const stream = all.flatMap(b => Array.from({length:8},(_,i)=>(b>>(7-i))&1))
  let bi = 0, up = true
  for (let col = sz-1; col >= 0; col -= 2) {
    if (col === 6) col--
    for (let row = 0; row < sz; row++) {
      const r = up ? sz-1-row : row
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc
        if (M[r][c] === null) {
          const bit = bi < stream.length ? stream[bi++] : 0
          M[r][c] = ((r+c)%2===0) ? !bit : !!bit // mask pattern 0
        }
      }
    }
    up = !up
  }

  // Render SVG
  const cs = px / (sz + 2), off = cs
  let rects = ''
  for (let r = 0; r < sz; r++)
    for (let c = 0; c < sz; c++)
      if (M[r][c]) rects += `<rect x="${(off+c*cs).toFixed(1)}" y="${(off+r*cs).toFixed(1)}" width="${cs.toFixed(1)}" height="${cs.toFixed(1)}" fill="#0d1117"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}"><rect width="${px}" height="${px}" fill="white"/>${rects}</svg>`
}

// React component — renders QR inline using dangerouslySetInnerHTML
function QRCode({ value, size = 110 }) {
  const svg = buildQRSVG(value, size)
  return <div dangerouslySetInnerHTML={{ __html: svg }} style={{ display: 'block', lineHeight: 0, borderRadius: 8, overflow: 'hidden' }} />
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return 'N/A'
  try { return new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' }) }
  catch { return d }
}
function formatDateTime(ts) {
  try { return new Date(ts || Date.now()).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) }
  catch { return String(ts) }
}

// ── The ticket HTML string for download (self-contained, no internet needed) ─
function buildTicketHTML({ pnr, selectedTrain, selectedClass, passengers, totalAmount,
  travelDateFormatted, travelDate, bookingTimeFormatted, freeCancellation, travelInsurance, qrSVG }) {

  const paxRows = (passengers || []).map((p, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${p.name || 'Passenger '+(i+1)}</strong></td>
      <td>${p.age||'—'}</td>
      <td>${p.gender||'—'}</td>
      <td><strong>${p.seatNum}</strong></td>
      <td>${p.berth||selectedClass}</td>
      <td style="color:#00C853;font-weight:800">✓ CNF</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>CMT Ticket — PNR ${pnr}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Sora',Segoe UI,sans-serif;background:#eef0f4;display:flex;justify-content:center;padding:40px 20px}
  .ticket{background:white;width:720px;border-radius:20px;overflow:hidden;box-shadow:0 12px 60px rgba(0,0,0,.18)}
  .top{background:#0d1117;color:white;padding:28px 36px}
  .brand{display:flex;align-items:center;gap:12px;margin-bottom:20px}
  .bname{font-size:20px;font-weight:900;color:#00C853}
  .bsub{font-size:9px;color:rgba(255,255,255,.35);letter-spacing:2px;text-transform:uppercase}
  .badge{margin-left:auto;background:#00C853;color:#0d1117;font-size:11px;font-weight:800;padding:5px 16px;border-radius:50px;letter-spacing:1.5px}
  .route{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
  .stn .t{font-size:32px;font-weight:900;color:white;line-height:1}
  .stn .c{font-size:13px;font-weight:700;color:#00C853;letter-spacing:3px;margin:6px 0 3px}
  .stn .n{font-size:11px;color:rgba(255,255,255,.45)}
  .rmid{flex:1;text-align:center;padding:0 16px;color:rgba(255,255,255,.25);font-size:13px}
  .rmid .arrow{font-size:18px;letter-spacing:3px;color:rgba(255,255,255,.2)}
  .rmid .rname{font-size:12px;color:rgba(255,255,255,.55);margin:4px 0}
  .rmid .dur{font-size:11px;color:#00C853;font-weight:700}
  .meta{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .mi label{display:block;font-size:9px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px}
  .mi span{font-size:13px;font-weight:700;color:white}
  .pnr-val{color:#00C853!important;font-size:15px!important;letter-spacing:2px!important}
  .divider{display:flex;align-items:center;background:white}
  .notch{width:26px;height:26px;background:#eef0f4;border-radius:50%;flex-shrink:0;margin:-13px 0}
  .dash{flex:1;border-top:2.5px dashed #e0e0e0;margin:0 10px}
  .body{padding:24px 36px 28px}
  .sec{font-size:10px;font-weight:800;color:#bbb;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
  table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px}
  th{padding:10px 12px;text-align:left;font-size:10px;font-weight:800;color:#aaa;letter-spacing:1px;text-transform:uppercase;background:#f9f9f9}
  td{padding:10px 12px;border-bottom:1px solid #f3f3f3;color:#1a1a1a}
  tr:last-child td{border-bottom:none}
  .foot{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding-top:18px;border-top:2px dashed #eee}
  .fare-lbl{font-size:9px;font-weight:800;color:#aaa;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px}
  .fare-amt{font-size:34px;font-weight:900;color:#0d1117;line-height:1}
  .fare-sub{font-size:11px;color:#bbb;margin-top:4px}
  .bkmeta{font-size:11px;color:#999;line-height:2;margin-top:10px}
  .bkmeta strong{color:#444;font-weight:700}
  .qr-wrap{display:flex;flex-direction:column;align-items:center;gap:6px}
  .qr-lbl{font-size:9px;font-weight:800;color:#0d1117;letter-spacing:2px;text-transform:uppercase}
  .notes p{font-size:11px;color:#aaa;line-height:1.9}
  .notes p::before{content:'• ';color:#00C853}
  .wm{text-align:center;padding:12px;border-top:1px solid #f0f0f0;font-size:9px;color:#ccc;letter-spacing:1.5px}
  @media print{body{background:white;padding:0}.ticket{box-shadow:none;border-radius:0;width:100%}}
</style>
</head>
<body>
<div class="ticket">
  <div class="top">
    <div class="brand">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00C853" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="3" width="16" height="14" rx="3"/>
        <path d="M4 11h16M8 3v8M16 3v8M7 17l-2 4M17 17l2 4"/>
        <circle cx="9" cy="14.5" r="0.5" fill="#00C853"/>
        <circle cx="15" cy="14.5" r="0.5" fill="#00C853"/>
      </svg>
      <div><div class="bname">CMT Booking</div><div class="bsub">Connect My Train</div></div>
      <span class="badge">✓ CONFIRMED</span>
    </div>
    <div class="route">
      <div class="stn">
        <div class="t">${selectedTrain.departureTime}</div>
        <div class="c">${selectedTrain.fromCode}</div>
        <div class="n">${selectedTrain.from}</div>
      </div>
      <div class="rmid">
        <div class="arrow">————◆————</div>
        <div class="rname">${selectedTrain.trainName} · ${selectedTrain.trainNumber}</div>
        <div class="dur">${selectedTrain.duration}</div>
      </div>
      <div class="stn" style="text-align:right">
        <div class="t">${selectedTrain.arrivalTime}</div>
        <div class="c">${selectedTrain.toCode}</div>
        <div class="n">${selectedTrain.to}</div>
      </div>
    </div>
    <div class="meta">
      <div class="mi"><label>PNR Number</label><span class="pnr-val">${pnr}</span></div>
      <div class="mi"><label>Travel Date</label><span>${travelDateFormatted}</span></div>
      <div class="mi"><label>Class</label><span>${selectedClass}</span></div>
      <div class="mi"><label>Passengers</label><span>${(passengers||[]).length} Adult${(passengers||[]).length>1?'s':''}</span></div>
    </div>
  </div>
  <div class="divider"><div class="notch"></div><div class="dash"></div><div class="notch"></div></div>
  <div class="body">
    <div class="sec">Passenger Details</div>
    <table>
      <thead><tr><th>#</th><th>Passenger Name</th><th>Age</th><th>Gender</th><th>Seat</th><th>Berth</th><th>Status</th></tr></thead>
      <tbody>${paxRows}</tbody>
    </table>
    <div class="foot">
      <div>
        <div class="fare-lbl">Total Fare Paid</div>
        <div class="fare-amt">₹${totalAmount}</div>
        <div class="fare-sub">via IRCTC Payment Gateway</div>
        <div class="bkmeta">
          <div><strong>Travel Date:</strong> ${travelDateFormatted}</div>
          <div><strong>Departure:</strong> ${selectedTrain.departureTime} from ${selectedTrain.from}</div>
          <div><strong>Arrival:</strong> ${selectedTrain.arrivalTime} at ${selectedTrain.to}</div>
          <div><strong>Booked On:</strong> ${bookingTimeFormatted}</div>
          ${freeCancellation?'<div><strong>Free Cancellation:</strong> Active</div>':''}
          ${travelInsurance?'<div><strong>Travel Insurance:</strong> Active</div>':''}
        </div>
      </div>
      <div class="qr-wrap">
        <div style="border:3px solid #0d1117;border-radius:10px;overflow:hidden;padding:6px;background:white">
          ${qrSVG}
        </div>
        <div class="qr-lbl">Scan to Verify · Show to TTE</div>
      </div>
      <div class="notes">
        <div class="sec" style="margin-bottom:8px">Important</div>
        <p>Carry valid Govt. photo ID during journey</p>
        <p>Arrive 30 mins before departure</p>
        <p>Chart prepared 4 hours before departure</p>
        <p>Computer-generated ticket — valid with PNR</p>
        ${freeCancellation?'<p>Free cancellation before chart preparation</p>':''}
      </div>
    </div>
  </div>
  <div class="wm">CMT BOOKING — CONNECT MY TRAIN — COMPUTER GENERATED TICKET — NOT VALID WITHOUT PNR VERIFICATION</div>
</div>
<script>window.onload = () => window.print()</script>
</body>
</html>`
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BookingConfirmation() {
  const navigate = useNavigate()
  const { selectedTrain, selectedClass, bookingDetails, searchQuery, sendBookingEmail } = useBooking()
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowCheck(true), 100)
    if (bookingDetails) sendBookingEmail(bookingDetails)
  }, [])

  if (!selectedTrain || !bookingDetails) {
    return (
      <div className="confirm-page">
        <Navbar />
        <div className="no-booking">
          <h2>No booking found</h2>
          <button className="home-btn" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    )
  }

  const { pnr, email, phone, passengers, totalAmount, freeCancellation, travelInsurance, bookedAt } = bookingDetails
  const travelDate = bookingDetails.journeyDate || bookingDetails.journey_date || searchQuery?.date
  const travelDateFormatted = formatDate(travelDate)
  const bookingTimeFormatted = formatDateTime(bookedAt || bookingDetails.created_at)

  // QR encodes all key journey info
  const qrData = `PNR:${pnr}|TRAIN:${selectedTrain.trainNumber}|FROM:${selectedTrain.fromCode}|TO:${selectedTrain.toCode}|DATE:${travelDate||'N/A'}|DEP:${selectedTrain.departureTime}|ARR:${selectedTrain.arrivalTime}|CLASS:${selectedClass}|PAX:${(passengers||[]).length}`

  // Build QR SVG once — reuse for both on-screen and download
  const qrSVG = buildQRSVG(qrData, 130)

  const handleDownload = () => {
    const html = buildTicketHTML({
      pnr, selectedTrain, selectedClass, passengers, totalAmount,
      travelDateFormatted, travelDate, bookingTimeFormatted,
      freeCancellation, travelInsurance,
      qrSVG // embedded SVG — no internet needed
    })
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `CMT_Ticket_${pnr}.html`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="confirm-page">
      <Navbar />
      <div className="confirm-body">
        <div className={`success-banner ${showCheck ? 'success-visible' : ''}`}>
          <div className="check-circle">
            <Check size={32} color="white" strokeWidth={3}/>
          </div>
          <h1 className="success-title">Booking Confirmed!</h1>
          <p className="success-sub">Your train tickets have been booked successfully</p>
          <div className="pnr-display">
            <span className="pnr-label">PNR Number</span>
            <span className="pnr-number">{pnr}</span>
          </div>
        </div>

        <div className="confirm-grid">
          {/* TICKET CARD */}
          <div className="ticket-card">
            <div className="ticket-header">
              <div className="ticket-brand"><Train size={16} color="#00C853" style={{verticalAlign:'middle',marginRight:6}}/>CMT Booking</div>
              <div className="ticket-status">CONFIRMED</div>
            </div>

            <div className="ticket-route">
              <div className="ticket-station">
                <div className="tick-time">{selectedTrain.departureTime}</div>
                <div className="tick-code">{selectedTrain.fromCode}</div>
                <div className="tick-city">{selectedTrain.from}</div>
              </div>
              <div className="ticket-middle">
                <div className="tick-dur">{selectedTrain.duration}</div>
                <div className="tick-arrow">————◆————</div>
                <div className="tick-class">{selectedClass} Class</div>
              </div>
              <div className="ticket-station tick-right">
                <div className="tick-time">{selectedTrain.arrivalTime}</div>
                <div className="tick-code">{selectedTrain.toCode}</div>
                <div className="tick-city">{selectedTrain.to}</div>
              </div>
            </div>

            {/* DATE & TIME ROW */}
            <div className="ticket-datetime-row">
              <div className="tick-dt-item">
                <Calendar size={13} color="#00C853" style={{marginRight:5,verticalAlign:'middle'}}/>
                <span className="tick-dt-label">Travel Date:</span>
                <span className="tick-dt-val">{travelDateFormatted}</span>
              </div>
              <div className="tick-dt-item">
                <Clock size={13} color="#00C853" style={{marginRight:5,verticalAlign:'middle'}}/>
                <span className="tick-dt-label">Booked On:</span>
                <span className="tick-dt-val">{bookingTimeFormatted}</span>
              </div>
            </div>

            <div className="ticket-details-row">
              <div className="tick-detail"><span className="tick-det-label">Train</span><span className="tick-det-value">{selectedTrain.trainName}</span></div>
              <div className="tick-detail"><span className="tick-det-label">Train No.</span><span className="tick-det-value">{selectedTrain.trainNumber}</span></div>
              <div className="tick-detail"><span className="tick-det-label">Travel Date</span><span className="tick-det-value">{travelDateFormatted}</span></div>
              <div className="tick-detail"><span className="tick-det-label">PNR</span><span className="tick-det-value tick-pnr">{pnr}</span></div>
            </div>

            <div className="ticket-divider">
              <div className="tick-notch left"></div>
              <div className="tick-dashes"></div>
              <div className="tick-notch right"></div>
            </div>

            {/* PASSENGERS */}
            <div className="passengers-table">
              <div className="pax-table-header">
                <span>Name</span><span>Age</span><span>Gender</span><span>Seat</span><span>Berth</span><span>Status</span>
              </div>
              {(passengers||[]).map((p,i) => (
                <div key={i} className="pax-table-row">
                  <span className="pax-name">{p.name||'Passenger '+(i+1)}</span>
                  <span>{p.age||'-'}</span>
                  <span>{p.gender||'-'}</span>
                  <span className="pax-seat-num">{p.seatNum}</span>
                  <span>{p.berth||selectedClass}</span>
                  <span className="pax-status"><Check size={11} strokeWidth={3} style={{marginRight:3}}/>CNF</span>
                </div>
              ))}
            </div>

            {/* QR — on screen (inline SVG, works always) */}
            <div className="qr-section">
              <div className="qr-box">
                <div dangerouslySetInnerHTML={{ __html: qrSVG }} style={{ lineHeight: 0, borderRadius: 8, overflow: 'hidden', border: '2.5px solid #0d1117', padding: 6 }} />
                <div className="qr-label">Scan to Verify · Show to TTE</div>
              </div>
              <div className="qr-info">
                <p>Show this QR code to the Ticket Examiner</p>
                <p>PNR: <strong>{pnr}</strong></p>
                <p>Travel Date: <strong>{travelDateFormatted}</strong></p>
                <p>Dep: <strong>{selectedTrain.departureTime}</strong> · Arr: <strong>{selectedTrain.arrivalTime}</strong></p>
                <p>Amount Paid: <strong>₹{totalAmount}</strong></p>
                {freeCancellation && <p className="feature-tag"><Check size={12} strokeWidth={3} style={{marginRight:4}}/> Free Cancellation Active</p>}
                {travelInsurance && <p className="feature-tag"><Check size={12} strokeWidth={3} style={{marginRight:4}}/> Travel Insurance Active</p>}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="confirm-right">
            <div className="notify-card">
              <div className="notify-icon"><Mail size={24} strokeWidth={1.5} color="#00C853"/></div>
              <p>Booking details sent to <strong>{email||'your email'}</strong></p>
            </div>
            <div className="notify-card">
              <div className="notify-icon"><Phone size={24} strokeWidth={1.5} color="#00C853"/></div>
              <p>SMS & WhatsApp sent to <strong>{phone||'your phone'}</strong></p>
            </div>

            <div className="amount-card">
              <div className="amount-label">Total Amount Paid</div>
              <div className="amount-value">₹{totalAmount}</div>
              <div className="amount-mode">Payment via IRCTC Gateway</div>
            </div>

            {/* JOURNEY INFO */}
            <div className="journey-summary-card">
              <div className="js-title"><Clock size={14} color="#00C853" style={{marginRight:6}}/>Journey Info</div>
              <div className="js-row"><span>Travel Date</span><strong>{travelDateFormatted}</strong></div>
              <div className="js-row"><span>Departure</span><strong>{selectedTrain.departureTime}</strong></div>
              <div className="js-row"><span>Arrival</span><strong>{selectedTrain.arrivalTime}</strong></div>
              <div className="js-row"><span>Duration</span><strong>{selectedTrain.duration}</strong></div>
              <div className="js-row"><span>Booked On</span><strong>{bookingTimeFormatted}</strong></div>
            </div>

            <div className="action-buttons">
              <button className="action-btn action-primary" onClick={handleDownload}>
                <Download size={15} style={{verticalAlign:'middle',marginRight:6}}/> Download Ticket
              </button>
              <button className="action-btn action-secondary" onClick={() => navigate('/')}>
                <Home size={15} style={{verticalAlign:'middle',marginRight:6}}/> Back to Home
              </button>
              <button className="action-btn action-secondary" onClick={() => navigate('/bookings')}>
                <ClipboardList size={15} style={{verticalAlign:'middle',marginRight:6}}/> View All Bookings
              </button>
            </div>

            <div className="important-info">
              <h4>Important Information</h4>
              <ul>
                <li>Carry a valid photo ID proof during journey</li>
                <li>Arrive at the station 30 minutes before departure</li>
                <li>Chart is prepared 4 hours before departure</li>
                {freeCancellation && <li>Cancellation possible before chart preparation</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
