import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import './TrainCard.css'
import { Train, Star } from './Icon'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function TrainCard({ train }) {
  const navigate = useNavigate()
  const { setSelectedTrain, setSelectedClass, searchQuery } = useBooking()

  const getAvailability = (cls) => {
    const booked = (train.bookedSeats?.[cls] || []).length
    const total = train.totalSeats?.[cls] || 0
    const avail = total - booked
    return avail
  }

  const getAvailClass = (avail) => {
    if (avail > 10) return 'avail-green'
    if (avail > 0) return 'avail-orange'
    return 'avail-red'
  }

  const handleViewSeats = (cls) => {
    setSelectedTrain(train)
    setSelectedClass(cls)
    navigate(`/train/${train.id}/seats?class=${cls}`)
  }

  const typeColors = {
    'Rajdhani': '#1565C0',
    'Shatabdi': '#6A1B9A',
    'Vande Bharat': '#00796B',
    'Duronto': '#E65100',
    'Humsafar': '#558B2F',
    'Premium': '#F57F17',
    'Express': '#37474F',
    'Mail': '#37474F',
    'Special': '#4527A0',
    'Superfast': '#1B5E20',
    'SF Express': '#1B5E20',
  }

  // Backend field name mapping
  const trainType = train.trainType || train.type || 'Express'
  const fromCode = train.fromCode || train.from_code || ''
  const toCode = train.toCode || train.to_code || ''
  const fromName = train.fromStation || train.from_station || train.from || ''
  const toName = train.toStation || train.to_station || train.to || ''
  const amenities = train.amenities || []
  const rating = train.rating || '4.0'
  const days = train.days || []

  return (
    <div className="train-card">
      <div className="train-card-header">
        <div className="train-info">
          <div className="train-name-row">
            <span className="train-number">{train.trainNumber || train.train_number}</span>
            <span className="train-name">{train.trainName || train.train_name}</span>
            <span className="train-type-badge" style={{ background: typeColors[trainType] || '#37474F' }}>
              {trainType}
            </span>
          </div>
          <div className="train-days">
            {DAYS.map(d => (
              <span key={d} className={`day-pill ${days.includes(d) ? 'day-active' : 'day-inactive'}`}>
                {d.charAt(0)}
              </span>
            ))}
          </div>
        </div>
        <div className="train-rating">
          <Star size={13} color="#F59E0B" fill="#F59E0B" strokeWidth={0}/> {rating}
        </div>
      </div>

      <div className="train-timing">
        <div className="timing-block">
          <div className="timing-time">{train.departureTime || train.departure_time}</div>
          <div className="timing-station">{fromCode}</div>
          <div className="timing-station-name">{fromName}</div>
        </div>
        <div className="timing-middle">
          <div className="timing-duration">{train.duration}</div>
          <div className="timing-arrow">
            <div className="arrow-line"></div>
            <Train size={16} strokeWidth={1.5}/>
          </div>
          <div className="timing-amenities">
            {amenities.slice(0,2).map(a => <span key={a} className="amenity-tag">{a}</span>)}
          </div>
        </div>
        <div className="timing-block timing-right">
          <div className="timing-time">{train.arrivalTime || train.arrival_time}</div>
          <div className="timing-station">{toCode}</div>
          <div className="timing-station-name">{toName}</div>
        </div>
      </div>

      <div className="train-classes">
        {(train.classes || []).map(cls => {
          const avail = getAvailability(cls)
          return (
            <div key={cls} className={`class-chip ${getAvailClass(avail)}`} onClick={() => handleViewSeats(cls)}>
              <div className="class-name">{cls}</div>
              <div className="class-fare">₹{train.fare?.[cls] || 'N/A'}</div>
              <div className="class-avail">
                {avail > 0 ? `${avail} seats` : 'Waitlist'}
              </div>
              <button className="view-seats-btn">View Seats</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}