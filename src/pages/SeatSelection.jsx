import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Train, AlertTriangle, X } from '../components/Icon'
import SeatMap from '../components/SeatMap'
import { trains } from '../data/trains'
import { useBooking } from '../context/BookingContext'
import './SeatSelection.css'

const BERTH_FULL = {
  LB:'Lower Berth', MB:'Middle Berth', UB:'Upper Berth',
  SL:'Side Lower', SU:'Side Upper'
}

/* ── IRCTC coach config ───────────────────────────────────────────────────── */
const COACH_CFG = {
  SL:  { prefix:'S',  count:8, label:'Sleeper Class' },
  '3A':{ prefix:'B',  count:5, label:'AC 3 Tier' },
  '2A':{ prefix:'A',  count:3, label:'AC 2 Tier' },
  '1A':{ prefix:'H',  count:1, label:'AC First Class' },
  CC:  { prefix:'CC', count:5, label:'AC Chair Car' },
  EC:  { prefix:'EC', count:2, label:'Executive Chair Car' },
}

/* ── Per-coach booked seats (deterministic from master) ─────────────────── */
function getCoachBookings(masterBooked, masterGender, coachIdx, coachTotal) {
  if (coachIdx === 0) return { booked: masterBooked, gender: masterGender }
  const seed = coachIdx * 7
  const booked = [], gender = {}
  const limit = Math.floor(masterBooked.length * Math.max(0.2, 0.5 - coachIdx * 0.1))
  for (let i = 0; i < masterBooked.length && booked.length < limit; i++) {
    const s = ((masterBooked[i] + seed * (coachIdx + 1)) % coachTotal) + 1
    if (!booked.includes(s)) { booked.push(s); gender[s] = (i + coachIdx) % 2 === 0 ? 'M' : 'F' }
  }
  return { booked, gender }
}

export default function SeatSelection() {
  const { trainId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setSelectedTrain, setSelectedClass, setSelectedSeats, setTotalFare, searchQuery } = useBooking()

  const initialClass = searchParams.get('class') || ''
  const train = trains.find(t => t.id === parseInt(trainId))

  const [activeClass,      setActiveClass]      = useState(initialClass || (train?.classes[0] || ''))
  const [activeCoachIdx,   setActiveCoachIdx]   = useState(null)   // null = ALL
  const [selectedSeatNums, setSelectedSeatNums] = useState([])
  const [selectedBerths,   setSelectedBerths]   = useState({})
  const [selectedCoachMap, setSelectedCoachMap] = useState({})     // seatNum → coachName
  const [toast,            setToast]            = useState('')

  useEffect(() => {
    if (train) { setSelectedTrain(train); setSelectedClass(activeClass) }
  }, [train, activeClass])

  useEffect(() => {
    setSelectedSeatNums([]); setSelectedBerths({}); setSelectedCoachMap({})
    setActiveCoachIdx(null)
  }, [activeClass])

  useEffect(() => {
    setSelectedSeatNums([]); setSelectedBerths({}); setSelectedCoachMap({})
  }, [activeCoachIdx])

  if (!train) return (
    <div className="seat-page"><Navbar />
      <div className="not-found"><h2>Train not found</h2>
        <button onClick={() => navigate('/')}>Go Home</button></div></div>
  )

  const fare       = train.fare[activeClass]       || 0
  const totalSeats = train.totalSeats[activeClass] || 0
  const masterB    = train.bookedSeats[activeClass] || []
  const masterG    = train.seatGender[activeClass]  || {}
  const cfg        = COACH_CFG[activeClass] || { prefix:'S', count:1, label:'Coach' }
  const coaches    = Array.from({ length: cfg.count }, (_, i) => `${cfg.prefix}${i + 1}`)

  // Build data for every coach
  const coachData = coaches.map((name, i) => {
    const { booked, gender } = getCoachBookings(masterB, masterG, i, totalSeats)
    return { name, idx: i, booked, gender, avail: totalSeats - booked.length }
  })
  const totalAvail = coachData.reduce((s, c) => s + c.avail, 0)

  const handleSeatClick = (seatNum, berth, coachName) => {
    const key = `${coachName}:${seatNum}`
    if (selectedSeatNums.includes(key)) {
      setSelectedSeatNums(p => p.filter(s => s !== key))
      setSelectedBerths(p => { const n={...p}; delete n[key]; return n })
      setSelectedCoachMap(p => { const n={...p}; delete n[key]; return n })
    } else {
      if (selectedSeatNums.length >= 6) {
        setToast('Maximum 6 seats per booking'); setTimeout(() => setToast(''), 3000); return
      }
      setSelectedSeatNums(p => [...p, key])
      setSelectedBerths(p => ({ ...p, [key]: berth }))
      setSelectedCoachMap(p => ({ ...p, [key]: coachName }))
    }
  }

  const totalFareAmt = selectedSeatNums.length * fare

  const handleProceed = () => {
    if (!selectedSeatNums.length) {
      setToast('Please select at least one seat'); setTimeout(() => setToast(''), 3000); return
    }
    const seatsWithBerths = selectedSeatNums.map(key => {
      const [coach, num] = key.split(':')
      return { num: parseInt(num), coach, berth: selectedBerths[key], fare }
    })
    setSelectedSeats(seatsWithBerths); setTotalFare(totalFareAmt)
    setSelectedClass(activeClass); navigate('/passenger-details')
  }

  const typeColor = {
    'Rajdhani':'#1565C0','Shatabdi':'#6A1B9A','Vande Bharat':'#00796B',
    'Duronto':'#E65100','Humsafar':'#558B2F','Express':'#37474F',
    'Mail':'#37474F','Special':'#4CAF50','Superfast':'#E65100',
    'Premium':'#F9A825', default:'#37474F'
  }

  return (
    <div className="seat-page">
      <Navbar />

      {toast && (
        <div className="toast-notification">
          <AlertTriangle size={14} style={{verticalAlign:'middle',marginRight:6}}/>{toast}
        </div>
      )}

      {/* HEADER */}
      <div className="seat-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="header-train-info">
          <span className="header-train-num">{train.trainNumber}</span>
          <span className="header-train-name">{train.trainName}</span>
          <span className="header-type-badge" style={{ background: typeColor[train.type] || typeColor.default }}>
            {train.type}
          </span>
        </div>
        <div className="header-route">
          <span>{train.departureTime} {train.fromCode}</span>
          <span className="header-dur">— {train.duration} —</span>
          <span>{train.arrivalTime} {train.toCode}</span>
        </div>
      </div>

      <div className="seat-page-body">
        <div className="seat-main">

          {/* CLASS TABS */}
          <div className="class-tabs">
            {train.classes.map(cls => {
              const cc = COACH_CFG[cls] || { count:1 }
              const ts = train.totalSeats[cls] || 0
              const mb = train.bookedSeats[cls] || []
              const mg = train.seatGender[cls]  || {}
              let avail = 0
              for (let i=0;i<cc.count;i++) {
                const { booked } = getCoachBookings(mb,mg,i,ts)
                avail += ts - booked.length
              }
              return (
                <button key={cls}
                  className={`class-tab ${activeClass===cls?'class-tab-active':''}`}
                  onClick={() => setActiveClass(cls)}>
                  <span className="tab-cls">{cls}</span>
                  <span className="tab-fare">₹{train.fare[cls]}</span>
                  <span className={`tab-avail ${avail>10?'av-green':avail>0?'av-orange':'av-red'}`}>
                    {avail>0?`${avail} avail`:'WL'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* COACH TABS — ALL + individual */}
          <div className="coach-selector-wrap">
            <span className="coach-selector-label">Coach:</span>
            <div className="coach-tabs">
              {/* ALL tab */}
              <button
                className={`coach-tab ${activeCoachIdx===null?'coach-tab-active':''}`}
                onClick={() => setActiveCoachIdx(null)}
              >
                <span className="coach-tab-name">ALL</span>
                <span className={`coach-tab-avail ${totalAvail>20?'av-green':totalAvail>5?'av-orange':'av-red'}`}>
                  {totalAvail} seats
                </span>
              </button>

              {/* Individual coach tabs */}
              {coachData.map((c, i) => (
                <button key={c.name}
                  className={`coach-tab ${activeCoachIdx===i?'coach-tab-active':''}`}
                  onClick={() => setActiveCoachIdx(i)}
                >
                  <span className="coach-tab-name">{c.name}</span>
                  <span className={`coach-tab-avail ${c.avail>20?'av-green':c.avail>5?'av-orange':'av-red'}`}>
                    {c.avail} seats
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* COACH INFO BAR */}
          <div className="coach-info-bar">
            <div className="coach-info-left">
              <span className="coach-name">
                {activeCoachIdx === null
                  ? `All Coaches (${coaches.join(', ')}) — ${cfg.label}`
                  : `Coach ${coaches[activeCoachIdx]} — ${cfg.label}`}
              </span>
              <span className="avail-count">
                {activeCoachIdx === null ? totalAvail : coachData[activeCoachIdx].avail} seats available
              </span>
            </div>
            <div className="fare-display">₹{fare} / seat</div>
          </div>

          {/* LEGEND */}
          <div className="seat-legend">
            {['Available','Booked (Male)','Booked (Female)','Selected'].map((lbl,i) => (
              <div key={lbl} className="legend-item">
                <div className={`legend-box legend-${['available','male','female','selected'][i]}`}></div>
                <span>{lbl}</span>
              </div>
            ))}
          </div>

          {/* MULTI-COACH HORIZONTAL TRAIN VIEW */}
          <div className="multi-coach-scroll">
            <div className="multi-coach-wrap">

              {/* ENGINE cap */}
              <div className="train-engine-cap">
                <div className="train-engine-svg">
                  <svg width="48" height="80" viewBox="0 0 48 80" fill="none">
                    {/* Engine body */}
                    <rect x="4" y="18" width="40" height="50" rx="6" fill="#37474F"/>
                    {/* Cab window */}
                    <rect x="10" y="24" width="28" height="18" rx="3" fill="#90A4AE"/>
                    <rect x="13" y="27" width="10" height="12" rx="2" fill="#B2EBF2"/>
                    <rect x="25" y="27" width="10" height="12" rx="2" fill="#B2EBF2"/>
                    {/* Nose / front */}
                    <path d="M4 24 Q4 14 14 10 L34 10 Q44 14 44 24Z" fill="#455A64"/>
                    {/* Headlight */}
                    <circle cx="24" cy="13" r="4" fill="#FFF9C4" stroke="#F9A825" strokeWidth="1.5"/>
                    {/* Wheels */}
                    <circle cx="12" cy="68" r="8" fill="#546E7A" stroke="#37474F" strokeWidth="2"/>
                    <circle cx="36" cy="68" r="8" fill="#546E7A" stroke="#37474F" strokeWidth="2"/>
                    <circle cx="12" cy="68" r="3" fill="#90A4AE"/>
                    <circle cx="36" cy="68" r="3" fill="#90A4AE"/>
                    {/* Coupling hook on right */}
                    <rect x="42" y="42" width="6" height="5" rx="1" fill="#78909C"/>
                  </svg>
                  <span className="train-cap-label">ENGINE</span>
                </div>
              </div>

              {/* All coaches with chain connectors between them */}
              {coachData.map((c, i) => {
                const isActive = activeCoachIdx === null || activeCoachIdx === i
                const coachSelected = selectedSeatNums
                  .filter(k => k.startsWith(`${c.name}:`))
                  .map(k => parseInt(k.split(':')[1]))

                return (
                  <div key={c.name} style={{ display:'flex', flexDirection:'row', alignItems:'stretch' }}>

                    {/* Chain coupling BEFORE each coach */}
                    <div className="coach-chain">
                      <div className="coach-chain-line" />
                      <div className="coach-chain-knuckle" />
                    </div>

                    {/* Coach block */}
                    <div className={`coach-block ${isActive ? 'coach-block-active' : 'coach-block-dimmed'}`}>
                      <div className="coach-block-label">
                        <span className="coach-block-name">{c.name}</span>
                        <span className="coach-block-avail">{c.avail} avail</span>
                      </div>
                      <div className={`coach-map-wrap ${!isActive ? 'coach-map-disabled' : ''}`}>
                        <SeatMap
                          classType={activeClass}
                          totalSeats={totalSeats}
                          bookedSeats={c.booked}
                          seatGender={c.gender}
                          selectedSeats={coachSelected}
                          flipped={i % 2 === 1}
                          onSeatClick={isActive ? (num, berth) => handleSeatClick(num, berth, c.name) : () => {}}
                        />
                      </div>
                      {!isActive && (
                        <div className="coach-dim-overlay">
                          <span className="coach-dim-label">{c.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* GUARD / BRAKE VAN cap */}
              <div className="coach-chain">
                <div className="coach-chain-line" />
                <div className="coach-chain-knuckle" />
              </div>
              <div className="train-guard-cap">
                <div className="train-guard-svg">
                  <svg width="44" height="80" viewBox="0 0 44 80" fill="none">
                    <rect x="2" y="18" width="40" height="50" rx="6" fill="#455A64"/>
                    <rect x="6" y="24" width="32" height="18" rx="3" fill="#78909C"/>
                    <rect x="8" y="26" width="12" height="14" rx="2" fill="#B2EBF2"/>
                    <rect x="24" y="26" width="12" height="14" rx="2" fill="#B2EBF2"/>
                    {/* Rear rounded end */}
                    <path d="M40 24 Q40 14 30 10 L14 10 Q4 14 4 24Z" fill="#546E7A"/>
                    {/* Rear light */}
                    <circle cx="22" cy="13" r="4" fill="#FFCDD2" stroke="#E57373" strokeWidth="1.5"/>
                    <circle cx="12" cy="68" r="8" fill="#546E7A" stroke="#37474F" strokeWidth="2"/>
                    <circle cx="32" cy="68" r="8" fill="#546E7A" stroke="#37474F" strokeWidth="2"/>
                    <circle cx="12" cy="68" r="3" fill="#90A4AE"/>
                    <circle cx="32" cy="68" r="3" fill="#90A4AE"/>
                  </svg>
                  <span className="train-cap-label">GUARD</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <aside className="booking-summary">
          <h3 className="summary-title">Booking Summary</h3>
          <div className="summary-train">
            <div className="sum-train-name">{train.trainName}</div>
            <div className="sum-train-num">#{train.trainNumber}</div>
          </div>
          <div className="summary-route">
            <div className="sum-station">
              <div className="sum-time">{train.departureTime}</div>
              <div className="sum-code">{train.fromCode}</div>
              <div className="sum-city">{train.from}</div>
            </div>
            <div className="sum-arrow">
              <div className="sum-line"></div>
              <Train size={18} strokeWidth={1.5}/>
              <div className="sum-line"></div>
            </div>
            <div className="sum-station sum-right">
              <div className="sum-time">{train.arrivalTime}</div>
              <div className="sum-code">{train.toCode}</div>
              <div className="sum-city">{train.to}</div>
            </div>
          </div>

          <div className="summary-class-info">
            <span className="sum-label">Class:</span>
            <span className="sum-value">{activeClass}</span>
          </div>
          <div className="summary-class-info">
            <span className="sum-label">Coach:</span>
            <span className="sum-value">
              {activeCoachIdx === null ? 'All' : coaches[activeCoachIdx]}
            </span>
          </div>
          {searchQuery.date && (
            <div className="summary-class-info">
              <span className="sum-label">Date:</span>
              <span className="sum-value">
                {new Date(searchQuery.date+'T00:00:00').toLocaleDateString('en-IN',
                  {day:'numeric',month:'short',year:'numeric'})}
              </span>
            </div>
          )}

          <div className="summary-divider"></div>

          <div className="selected-seats-section">
            <h4 className="selected-heading">Selected Seats ({selectedSeatNums.length}/6)</h4>
            {selectedSeatNums.length === 0 ? (
              <p className="no-seats-msg">Click on available seats to select</p>
            ) : (
              <div className="selected-list">
                {selectedSeatNums.map(key => {
                  const [coach, num] = key.split(':')
                  return (
                    <div key={key} className="selected-seat-item">
                      <div className="sel-seat-info">
                        <span className="sel-seat-num">{coach}/{num}</span>
                        <span className="sel-berth">
                          {BERTH_FULL[selectedBerths[key]] || selectedBerths[key] || ''}
                        </span>
                      </div>
                      <div className="sel-fare">₹{fare}</div>
                      <button className="remove-seat"
                        onClick={() => handleSeatClick(parseInt(num), selectedBerths[key], coach)}>
                        <X size={12} strokeWidth={2.5}/>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="summary-divider"></div>

          <div className="fare-breakdown">
            <div className="fare-row">
              <span>Base Fare × {selectedSeatNums.length}</span>
              <span>₹{totalFareAmt}</span>
            </div>
            <div className="fare-row fare-service">
              <span>Service Fee</span>
              <span>₹{selectedSeatNums.length > 0 ? 20 : 0}</span>
            </div>
            <div className="fare-total">
              <span>Total Amount</span>
              <span>₹{totalFareAmt + (selectedSeatNums.length > 0 ? 20 : 0)}</span>
            </div>
          </div>

          <button
            className={`proceed-btn ${!selectedSeatNums.length ? 'proceed-disabled' : ''}`}
            onClick={handleProceed}
          >
            {selectedSeatNums.length === 0
              ? 'Select Seats to Continue'
              : `Proceed to Book (${selectedSeatNums.length} seat${selectedSeatNums.length > 1 ? 's' : ''})`}
          </button>
        </aside>
      </div>
    </div>
  )
}
