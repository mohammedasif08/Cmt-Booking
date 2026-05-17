import './SeatMap.css'

const BL = { LB:'LOWER', MB:'MIDDLE', UB:'UPPER', SL:'SIDE\nLWR', SU:'SIDE\nUPR' }
const CL = { 1:'WINDOW', 2:'AISLE', 3:'AISLE', 4:'MIDDLE', 5:'WINDOW' }

function buildBays(classType, totalSeats) {
  const SEQ = {
    SL:  ['LB','LB','MB','MB','UB','UB','SL','SU'],
    '3A':['LB','LB','MB','MB','UB','UB','SL','SU'],
    '2A':['LB','LB','UB','UB','SL','SU'],
    '1A':['LB','UB'],
  }
  const seq = SEQ[classType]
  if (!seq) return []
  const numBays = Math.round(totalSeats / seq.length)
  const bays = []
  let n = 1
  for (let b = 0; b < numBays && n <= totalSeats; b++) {
    const bay = { id: b + 1, UB:[], MB:[], LB:[], SIDE:[] }
    for (const bt of seq) {
      if (n > totalSeats) break
      const seat = { num: n++, label: BL[bt] }
      if      (bt === 'UB') bay.UB.push(seat)
      else if (bt === 'MB') bay.MB.push(seat)
      else if (bt === 'LB') bay.LB.push(seat)
      else                  bay.SIDE.push(seat)
    }
    bays.push(bay)
  }
  return bays
}

function buildChairCols(totalSeats) {
  const numRows = Math.ceil(totalSeats / 5)
  const cols = []
  let n = 1
  for (let r = 0; r < numRows; r++) {
    const col = { id: r + 1, top: [], bottom: [] }
    for (let c = 1; c <= 5 && n <= totalSeats; c++) {
      const s = { num: n++, label: CL[c] }
      if (c <= 2) col.top.push(s)
      else        col.bottom.push(s)
    }
    cols.push(col)
  }
  return cols
}

function Seat({ num, label, status, onClick }) {
  const isBooked = status === 'booked-male' || status === 'booked-female'
  const isSelected = status === 'selected'
  return (
    <button
      className={`sm-seat sm-${status}${isSelected ? ' sm-selected' : ''}`}
      onClick={() => !isBooked && onClick(num, label)}
      disabled={isBooked}
      title={`Seat ${num} · ${label.replace('\n', ' ')}`}
    >
      <span className="sm-lbl">{label}</span>
      <span className="sm-num">
        {status === 'booked-male' ? 'M' : status === 'booked-female' ? 'F' : num}
      </span>
    </button>
  )
}

export default function SeatMap({
  classType, totalSeats,
  bookedSeats = [], seatGender = {},
  selectedSeats = [], onSeatClick,
  flipped = false,
}) {
  const getStatus = (num) => {
    if (selectedSeats.includes(num)) return 'selected'
    if (bookedSeats.includes(num)) return seatGender[num] === 'F' ? 'booked-female' : 'booked-male'
    return 'available'
  }

  /* ══ CHAIR CAR ══════════════════════════════════════════════════════════ */
  if (classType === 'CC' || classType === 'EC') {
    let cols = buildChairCols(totalSeats)
    if (flipped) cols = [...cols].reverse()

    const labels = (
      <div className={`sm-labels ${flipped ? 'sm-labels-right' : ''}`}>
        <div className="sm-lc sm-lc-window">WINDOW</div>
        <div className="sm-lc sm-lc-aisle">AISLE</div>
        <div className="sm-gap sm-adiv-gap" />
        <div className="sm-lc sm-lc-aisle">AISLE</div>
        <div className="sm-lc sm-lc-middle">MIDDLE</div>
        <div className="sm-lc sm-lc-window">WINDOW</div>
      </div>
    )

    const scrollContent = (
      <div className="sm-scroll">
        {flipped
          ? <div className="sm-door-bar">◀ DOOR</div>
          : <div className="sm-engine-bar">ENGINE ▶</div>}
        <div className="sm-grid">
          {cols.map(col => (
            <div key={col.id} className="sm-col">
              <div className="sm-group">
                {col.top.map(s => (
                  <Seat key={s.num} num={s.num} label={s.label}
                        status={getStatus(s.num)} onClick={onSeatClick} />
                ))}
              </div>
              <div className="sm-adiv" />
              <div className="sm-group">
                {col.bottom.map(s => (
                  <Seat key={s.num} num={s.num} label={s.label}
                        status={getStatus(s.num)} onClick={onSeatClick} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {flipped
          ? <div className="sm-engine-bar">ENGINE ▶</div>
          : <div className="sm-door-bar">◀ DOOR</div>}
      </div>
    )

    return (
      <div className="sm-wrap">
        {flipped ? <>{scrollContent}{labels}</> : <>{labels}{scrollContent}</>}
      </div>
    )
  }

  /* ══ BERTH CLASSES ══════════════════════════════════════════════════════ */
  let bays = buildBays(classType, totalSeats)
  if (flipped) bays = [...bays].reverse()

  const hasMB   = classType === 'SL' || classType === '3A'
  const hasSide = classType !== '1A'

  const labels = (
    <div className={`sm-labels ${flipped ? 'sm-labels-right' : ''}`}>
      <div className="sm-lc sm-lc-upper">UPPER</div>
      <div className="sm-lc sm-lc-upper">UPPER</div>
      {hasMB && <>
        <div className="sm-gap sm-gdiv-gap" />
        <div className="sm-lc sm-lc-middle">MIDDLE</div>
        <div className="sm-lc sm-lc-middle">MIDDLE</div>
      </>}
      <div className="sm-gap sm-gdiv-gap" />
      <div className="sm-lc sm-lc-lower">LOWER</div>
      <div className="sm-lc sm-lc-lower">LOWER</div>
      {hasSide && <>
        <div className="sm-gap sm-sdiv-gap" />
        <div className="sm-lc sm-lc-side">SIDE LWR</div>
        <div className="sm-lc sm-lc-side">SIDE UPR</div>
      </>}
    </div>
  )

  const scrollContent = (
    <div className="sm-scroll">
      {flipped
        ? <div className="sm-door-bar">◀ DOOR</div>
        : <div className="sm-engine-bar">ENGINE ▶</div>}
      <div className="sm-grid">
        {bays.map(bay => (
          <div key={bay.id} className="sm-col">
            <div className="sm-group">
              {bay.UB.map(s => (
                <Seat key={s.num} num={s.num} label={s.label}
                      status={getStatus(s.num)} onClick={onSeatClick} />
              ))}
            </div>
            {hasMB && <>
              <div className="sm-gdiv" />
              <div className="sm-group">
                {bay.MB.map(s => (
                  <Seat key={s.num} num={s.num} label={s.label}
                        status={getStatus(s.num)} onClick={onSeatClick} />
                ))}
              </div>
            </>}
            <div className="sm-gdiv" />
            <div className="sm-group">
              {bay.LB.map(s => (
                <Seat key={s.num} num={s.num} label={s.label}
                      status={getStatus(s.num)} onClick={onSeatClick} />
              ))}
            </div>
            {hasSide && bay.SIDE.length > 0 && <>
              <div className="sm-sdiv" />
              <div className="sm-group">
                {bay.SIDE.map(s => (
                  <Seat key={s.num} num={s.num} label={s.label}
                        status={getStatus(s.num)} onClick={onSeatClick} />
                ))}
              </div>
            </>}
          </div>
        ))}
      </div>
      {flipped
        ? <div className="sm-engine-bar">ENGINE ▶</div>
        : <div className="sm-door-bar">◀ DOOR</div>}
    </div>
  )

  return (
    <div className="sm-wrap">
      {flipped ? <>{scrollContent}{labels}</> : <>{labels}{scrollContent}</>}
    </div>
  )
}
