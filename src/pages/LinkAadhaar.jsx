import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Train, Home, Ticket, ClipboardList, Search, User, Settings, Bell, Lock, Shield, CreditCard, Wallet, Phone, Mail, HelpCircle, IdCard, LogOut, Key, Download, MapPin, Calendar, ChevronRight, ChevronDown, ChevronUp, X, CheckCircle, Check, AlertTriangle, Info, Zap, ArrowRight, ArrowLeft, Activity, Clock, FileText, Navigation, Radio, XCircle, RefreshCw, Star, Users } from '../components/Icon'
import { useBooking } from '../context/BookingContext'
import './LinkAadhaar.css'

const STEPS = { INTRO: 'intro', ENTER: 'enter', OTP: 'otp', SUCCESS: 'success' }

export default function LinkAadhaar() {
  const navigate = useNavigate()
  const { user, login } = useBooking()

  const [step, setStep] = useState(STEPS.INTRO)
  const [aadhaar, setAadhaar] = useState('')
  const [consent, setConsent] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  const startTimer = () => {
    setTimer(30)
    const iv = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(iv); return 0 } return t - 1 })
    }, 1000)
  }

  // Format Aadhaar as XXXX XXXX XXXX
  const formatAadhaar = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 12)
    return digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' ')
    )
  }

  const handleAadhaarChange = (e) => {
    const formatted = formatAadhaar(e.target.value)
    setAadhaar(formatted)
    setErrors({})
  }

  const handleSendOtp = () => {
    const digits = aadhaar.replace(/\s/g, '')
    if (digits.length !== 12) {
      setErrors({ aadhaar: 'Enter a valid 12-digit Aadhaar number' }); return
    }
    if (!consent) {
      setErrors({ consent: 'Please give your consent to proceed' }); return
    }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(STEPS.OTP)
      startTimer()
    }, 1200)
  }

  const handleOtpChange = (val, i) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) document.getElementById('aadhotp-' + (i + 1))?.focus()
  }

  const handleOtpKey = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById('aadhotp-' + (i - 1))?.focus()
    }
  }

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length < 6) { setErrors({ otp: 'Enter the 6-digit OTP' }); return }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (user) login({ ...user, aadhaarLinked: true })
      setStep(STEPS.SUCCESS)
    }, 1200)
  }

  const maskedAadhaar = aadhaar.replace(/\d(?=[\d ]{4})/g, '✱').replace(/  /g, ' ')

  return (
    <div className="aadhaar-page">
      <Navbar />

      <div className="aadhaar-top-bar">
        <button className="aadhaar-back" onClick={() => navigate('/')}>← Back to Home</button>
        <div className="aadhaar-breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <span>›</span>
          <span className="bc-active">Link Aadhaar</span>
        </div>
      </div>

      <div className="aadhaar-layout">

        {/* ── LEFT INFO COLUMN ── */}
        <aside className="aadhaar-info-col">
          <div className="aic-why-card">
            <div className="aic-why-header">
              <span className="aic-why-icon"></span>
              <h3>Why link Aadhaar?</h3>
            </div>
            <div className="aic-why-items">
              {[
                { icon: <Zap size={18} strokeWidth={1.8}/>, title: 'Tatkal Bookings', desc: 'Mandatory from July 2024 for Tatkal quota tickets.' },
                { icon: <IdCard size={18} strokeWidth={1.8}/>, title: 'Identity Verification', desc: 'Ensures each IRCTC account is tied to a real individual.' },
                { icon: <Shield size={18} strokeWidth={1.8}/>, title: 'Fraud Prevention', desc: 'Protects against fake bookings and ticket touting.' },
                { icon: <CheckCircle size={18} color="#00C853" strokeWidth={1.8}/>, title: 'One-time Process', desc: 'Link once on IRCTC — benefits apply across all authorised partners.' },
              ].map((it, i) => (
                <div key={i} className="aic-why-item">
                  <span className="aiw-icon">{it.icon}</span>
                  <div>
                    <strong>{it.title}</strong>
                    <p>{it.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="aic-privacy-card">
            <div className="aic-priv-header">
              <Lock size={14} style={{verticalAlign:"middle",marginRight:6}}/>
              <strong>Your privacy is protected</strong>
            </div>
            <ul className="aic-priv-list">
              <li>Aadhaar number is masked in all displays</li>
              <li>Verification uses UIDAI's official OTP system</li>
              <li>We store only a masked reference — never the full number</li>
              <li>Compliant with UIDAI & IRCTC regulations</li>
            </ul>
          </div>

          {step !== STEPS.SUCCESS && (
            <div className="aic-irctc-note">
              <Info size={16} color="#E65100"/>
              <div>
                <strong>Linking happens on IRCTC</strong>
                <p>CMT Booking initiates the process, but the actual Aadhaar link is stored securely with your IRCTC account.</p>
              </div>
            </div>
          )}
        </aside>

        {/* ── MAIN FORM COLUMN ── */}
        <main className="aadhaar-main-col">

          {/* PROGRESS STEPS */}
          <div className="aadhaar-steps">
            {[
              { id: STEPS.INTRO, label: 'Overview' },
              { id: STEPS.ENTER, label: 'Enter Aadhaar' },
              { id: STEPS.OTP, label: 'Verify OTP' },
              { id: STEPS.SUCCESS, label: 'Done' },
            ].map((s, i) => {
              const stepOrder = [STEPS.INTRO, STEPS.ENTER, STEPS.OTP, STEPS.SUCCESS]
              const cur = stepOrder.indexOf(step)
              const idx = stepOrder.indexOf(s.id)
              const done = idx < cur
              const active = idx === cur
              return (
                <div key={s.id} className={"aas-item" + (active ? ' aas-active' : done ? ' aas-done' : '')}>
                  <div className="aas-dot">{done ? <Check size={13} strokeWidth={3}/> : i + 1}</div>
                  <span className="aas-label">{s.label}</span>
                  {i < 3 && <div className="aas-line"></div>}
                </div>
              )
            })}
          </div>

          {/* ─ STEP: INTRO ─ */}
          {step === STEPS.INTRO && (
            <div className="aadhaar-card" key="intro">
              <div className="aac-visual">
                <div className="aac-card-mockup">
                  <div className="acm-top">
                    <div className="acm-logo">UIDAI</div>
                    <div className="acm-india">भारत INDIA</div>
                  </div>
                  <div className="acm-chip">
                    <div className="chip-lines">
                      {[...Array(4)].map((_, i) => <div key={i} className="chip-line"></div>)}
                    </div>
                  </div>
                  <div className="acm-number">XXXX XXXX XXXX</div>
                  <div className="acm-label">Aadhaar</div>
                </div>
                <div className="aac-link-arrow">→</div>
                <div className="aac-irctc-badge">
                  <span className="aac-irctc-icon"><Train size={18} strokeWidth={1.5}/></span>
                  <div className="aac-irctc-text">
                    <strong>IRCTC</strong>
                    <span>Account</span>
                  </div>
                </div>
              </div>

              <h2>Link Aadhaar with IRCTC</h2>
              <p className="aac-desc">Connect your Aadhaar to your IRCTC account in 3 quick steps. This is a one-time process required for Tatkal bookings and identity verification.</p>

              <div className="aac-steps-mini">
                {[
                  { num: '1', text: 'Enter your 12-digit Aadhaar number' },
                  { num: '2', text: 'Verify with OTP sent to Aadhaar-linked mobile' },
                  { num: '3', text: 'Linking complete — book Tatkal anytime!' },
                ].map(s => (
                  <div key={s.num} className="aac-mini-step">
                    <span className="ams-num">{s.num}</span>
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>

              <button className="aadhaar-cta-btn" onClick={() => setStep(STEPS.ENTER)}>
                Start Linking →
              </button>

              <p className="aac-disclaimer">
                By proceeding, you consent to share your Aadhaar details for identity verification as per UIDAI guidelines.
              </p>
            </div>
          )}

          {/* ─ STEP: ENTER AADHAAR ─ */}
          {step === STEPS.ENTER && (
            <div className="aadhaar-card" key="enter">
              <div className="aac-step-badge">Step 1 of 2</div>
              <h2>Enter your Aadhaar number</h2>
              <p className="aac-desc">Your 12-digit Aadhaar number is printed on your Aadhaar card. An OTP will be sent to your Aadhaar-registered mobile number.</p>

              <div className="aadhaar-field">
                <label>Aadhaar Number</label>
                <div className={"aadhaar-input-wrap" + (errors.aadhaar ? ' ai-error' : '')}>
                  <span className="ai-icon"><IdCard size={24} strokeWidth={1.5}/></span>
                  <input
                    type="text"
                    className="aadhaar-input"
                    placeholder="XXXX  XXXX  XXXX"
                    value={aadhaar}
                    onChange={handleAadhaarChange}
                    autoFocus
                    inputMode="numeric"
                  />
                  <span className="ai-count">{aadhaar.replace(/\s/g, '').length}/12</span>
                </div>
                {errors.aadhaar && <span className="aadhaar-err"><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{errors.aadhaar}</span>}
                <span className="aadhaar-hint">Enter the 12-digit number on your Aadhaar card</span>
              </div>

              <label className={"aadhaar-consent" + (errors.consent ? ' consent-err' : '')}>
                <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); setErrors({}) }} />
                <span>I voluntarily give consent to share my Aadhaar details for identity verification with IRCTC/UIDAI. I understand this is required for Tatkal bookings.</span>
              </label>
              {errors.consent && <span className="aadhaar-err" style={{marginTop: '-8px', display: 'block'}}><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{errors.consent}</span>}

              <button className="aadhaar-cta-btn" onClick={handleSendOtp} disabled={loading}>
                {loading ? <><span className="spin-ring"></span> Sending OTP...</> : 'Send OTP to Registered Mobile →'}
              </button>

              <button className="aadhaar-back-step" onClick={() => { setStep(STEPS.INTRO); setErrors({}) }}>
                ← Back
              </button>
            </div>
          )}

          {/* ─ STEP: OTP ─ */}
          {step === STEPS.OTP && (
            <div className="aadhaar-card" key="otp">
              <div className="aac-step-badge">Step 2 of 2</div>
              <h2>Verify your Aadhaar</h2>
              <p className="aac-desc">
                A 6-digit OTP has been sent to the mobile number registered with Aadhaar ending in <strong>XX{aadhaar.replace(/\s/g,'').slice(-2)}</strong>.
              </p>

              <div className="aac-masked-aadhaar">
                <span className="ama-icon"><IdCard size={24} strokeWidth={1.5}/></span>
                <span>{maskedAadhaar}</span>
              </div>

              <div className="aadhaar-field">
                <label>Enter OTP</label>
                <div className="aadhaar-otp-boxes">
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      id={'aadhotp-' + i}
                      type="tel"
                      maxLength={1}
                      className={"aadhaar-otp-box" + (errors.otp ? ' aotp-err' : '') + (v ? ' aotp-filled' : '')}
                      value={v}
                      onChange={e => handleOtpChange(e.target.value, i)}
                      onKeyDown={e => handleOtpKey(e, i)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                {errors.otp && <span className="aadhaar-err"><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{errors.otp}</span>}
              </div>

              <div className="aadhaar-resend">
                {timer > 0
                  ? <span>Resend OTP in <strong>{timer}s</strong></span>
                  : <button className="resend-btn" onClick={() => { setOtp(['','','','','','']); startTimer() }}>Resend OTP</button>
                }
              </div>

              <button className="aadhaar-cta-btn" onClick={handleVerify} disabled={loading || otp.join('').length < 6}>
                {loading ? <><span className="spin-ring"></span> Verifying...</> : 'Verify & Link Aadhaar'}
              </button>

              <button className="aadhaar-back-step" onClick={() => { setStep(STEPS.ENTER); setErrors({}) }}>
                ← Change Aadhaar number
              </button>

              <div className="aadhaar-demo-hint">Demo: enter any 6 digits to complete verification</div>
            </div>
          )}

          {/* ─ STEP: SUCCESS ─ */}
          {step === STEPS.SUCCESS && (
            <div className="aadhaar-card aadhaar-success-card" key="success">
              <div className="aas-checkmark">
                <div className="check-circle">
                  <Check size={14} strokeWidth={3}/>
                </div>
              </div>

              <h2>Aadhaar Linked Successfully!</h2>
              <p className="aac-desc">Your Aadhaar has been verified and linked to your IRCTC account. You can now book Tatkal tickets without any restrictions.</p>

              <div className="success-details">
                <div className="sd-row">
                  <span className="sd-label">Aadhaar</span>
                  <span className="sd-val">{maskedAadhaar}</span>
                </div>
                <div className="sd-row">
                  <span className="sd-label">Status</span>
                  <span className="sd-status"><Check size={12} strokeWidth={3} style={{marginRight:3}}/>Linked</span>
                </div>
                {user?.irctcId && (
                  <div className="sd-row">
                    <span className="sd-label">IRCTC ID</span>
                    <span className="sd-val">{user.irctcId}</span>
                  </div>
                )}
              </div>

              <div className="success-unlocked">
                <div className="su-title">You can now access:</div>
                <div className="su-items">
                  <div className="su-item"><Zap size={13} style={{verticalAlign:"middle",marginRight:4}}/>Tatkal Quota Bookings</div>
                  <div className="su-item"><Ticket size={13} style={{verticalAlign:"middle",marginRight:4}}/>Premium Tatkal Tickets</div>
                  <div className="su-item"><CheckCircle size={13} color="#00C853" strokeWidth={2} style={{verticalAlign:"middle",marginRight:4}}/>Full Identity Verification</div>
                </div>
              </div>

              <div className="success-actions">
                <button className="aadhaar-cta-btn" onClick={() => navigate('/')}>
                  <Train size={15} style={{verticalAlign:"middle",marginRight:6}}/> Book a Train Now
                </button>
                <button className="aadhaar-outline-btn" onClick={() => navigate('/bookings')}>
                  View My Bookings
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
