import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { Train, Shield, Check, AlertTriangle, Phone, User, Ticket, Key, Lock } from '../components/Icon'
import './AuthPage.css'

const STEPS = { PHONE: 'phone', OTP: 'otp', REGISTER: 'register', IRCTC: 'irctc' }

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useBooking()

  // Get redirect target from ?redirect= query param
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/'

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [step, setStep] = useState(STEPS.PHONE)

  // Fields
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [irctcId, setIrctcId] = useState('')
  const [irctcPass, setIrctcPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [timer, setTimer] = useState(0)

  // Countdown for OTP resend
  const startTimer = () => {
    setTimer(30)
    const iv = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(iv); return 0 } return t - 1 })
    }, 1000)
  }

  const validatePhone = () => {
    if (!phone || phone.length !== 10 || isNaN(phone)) {
      setErrors({ phone: 'Enter a valid 10-digit mobile number' }); return false
    }
    return true
  }

  const handleSendOtp = () => {
    if (!validatePhone()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOtpSent(true)
      setStep(STEPS.OTP)
      startTimer()
    }, 1200)
  }

  const handleOtpChange = (val, i) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) {
      document.getElementById('otp-' + (i + 1))?.focus()
    }
  }

  const handleOtpKey = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById('otp-' + (i - 1))?.focus()
    }
  }

  const handleVerifyOtp = () => {
    const code = otp.join('')
    if (code.length < 6) { setErrors({ otp: 'Enter the 6-digit OTP' }); return }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (mode === 'register') setStep(STEPS.REGISTER)
      else setStep(STEPS.IRCTC)
    }, 1000)
  }

  const handleRegisterNext = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Full name is required'
    if (!email.trim() || !email.includes('@')) errs.email = 'Enter a valid email address'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(STEPS.IRCTC)
  }

  const handleFinish = () => {
    const errs = {}
    if (!irctcId.trim()) errs.irctcId = 'IRCTC User ID is required'
    if (!irctcPass.trim()) errs.irctcPass = 'Password is required'
    if (!agreed) errs.agreed = 'Please accept the terms to continue'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      login({
        name: name || 'User',
        phone,
        email,
        irctcId,
        aadhaarLinked: false
      })
      navigate(redirectTo)
    }, 1200)
  }

  const stepLabels = mode === 'login'
    ? ['Mobile', 'Verify OTP', 'IRCTC Login']
    : ['Mobile', 'Verify OTP', 'Your Details', 'IRCTC Login']

  const stepIndex = {
    [STEPS.PHONE]: 0,
    [STEPS.OTP]: 1,
    [STEPS.REGISTER]: mode === 'login' ? 2 : 2,
    [STEPS.IRCTC]: mode === 'login' ? 2 : 3,
  }[step]

  return (
    <div className="auth-page">
      {/* LEFT PANEL — visual brand side */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <button className="auth-logo" onClick={() => navigate('/')}>
            <span className="auth-logo-icon"><Train size={28} color="#00C853" strokeWidth={1.5}/></span>
            <div>
              <div className="auth-logo-name">CMT Booking</div>
              <div className="auth-logo-sub">Connect My Train</div>
            </div>
          </button>

          <div className="auth-left-content">
            <div className="auth-train-visual">
              <div className="atv-track"></div>
              <div className="atv-train"><Train size={48} strokeWidth={1.2} color="#00C853"/></div>
              <div className="atv-tracks">
                {[...Array(8)].map((_, i) => <div key={i} className="atv-tie"></div>)}
              </div>
            </div>

            <h2>Your journey starts here</h2>
            <p>Book train tickets, track your train live, and manage all your travel in one place.</p>

            <div className="auth-perks">
              {[
                { icon: <Check size={13} strokeWidth={3} color='#00C853'/>, text: 'Instant seat confirmation' },
                { icon: <Check size={13} strokeWidth={3} color='#00C853'/>, text: 'Visual coach & berth selector' },
                { icon: <Check size={13} strokeWidth={3} color='#00C853'/>, text: 'Live train tracking' },
                { icon: <Check size={13} strokeWidth={3} color='#00C853'/>, text: 'Free cancellation option' },
                { icon: <Check size={13} strokeWidth={3} color='#00C853'/>, text: 'IRCTC Authorised Partner' },
              ].map((p, i) => (
                <div key={i} className="auth-perk">
                  <span className="perk-check">{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-left-footer">
            <Shield size={13} style={{verticalAlign:"middle",marginRight:4}}/> Secured by 256-bit SSL encryption
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — form side */}
      <div className="auth-right">
        <div className="auth-right-inner">

          {/* TOP BACK */}
          <button className="auth-back-home" onClick={() => navigate('/')}>← Back to Home</button>

          {/* REDIRECT CONTEXT BANNER */}
          {redirectTo !== '/' && (
            <div className="auth-redirect-banner">
              <span className="arb-icon">🔒</span>
              <div>
                <div className="arb-title">Sign in to complete your booking</div>
                <div className="arb-sub">Your passenger details and seat selection have been saved. You'll return right where you left off.</div>
              </div>
            </div>
          )}

          {/* MODE TOGGLE */}
          <div className="auth-mode-toggle">
            <button
              className={"amt-btn" + (mode === 'login' ? ' amt-active' : '')}
              onClick={() => { setMode('login'); setStep(STEPS.PHONE); setOtp(['','','','','','']); setErrors({}) }}
            >Sign In</button>
            <button
              className={"amt-btn" + (mode === 'register' ? ' amt-active' : '')}
              onClick={() => { setMode('register'); setStep(STEPS.PHONE); setOtp(['','','','','','']); setErrors({}) }}
            >Create Account</button>
          </div>

          {/* STEP INDICATOR */}
          <div className="auth-steps">
            {stepLabels.map((label, i) => (
              <div key={i} className={"auth-step" + (i === stepIndex ? ' step-active' : i < stepIndex ? ' step-done' : '')}>
                <div className="auth-step-dot">
                  {i < stepIndex ? <Check size={13} strokeWidth={3}/> : i + 1}
                </div>
                <div className="auth-step-label">{label}</div>
                {i < stepLabels.length - 1 && <div className="auth-step-line"></div>}
              </div>
            ))}
          </div>

          {/* ── STEP: PHONE ── */}
          {step === STEPS.PHONE && (
            <div className="auth-form-card" key="phone">
              <div className="afc-icon"><Phone size={28} strokeWidth={1.3} color="#00C853"/></div>
              <h3>Enter your mobile number</h3>
              <p>We'll send you a 6-digit OTP to verify</p>

              <div className="afc-field">
                <label>Mobile Number</label>
                <div className={"phone-input-wrap" + (errors.phone ? ' field-error' : '')}>
                  <span className="phone-prefix">+91</span>
                  <div className="phone-divider"></div>
                  <input
                    type="tel"
                    className="phone-input"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    maxLength={10}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g,'')); setErrors({}) }}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    autoFocus
                  />
                </div>
                {errors.phone && <span className="field-err-msg"><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{errors.phone}</span>}
              </div>

              <button className="auth-cta-btn" onClick={handleSendOtp} disabled={loading}>
                {loading ? <><span className="spin-ring"></span> Sending OTP...</> : 'Send OTP →'}
              </button>

              <div className="auth-note">
                By continuing, you agree to our <span className="auth-link">Terms of Service</span> and <span className="auth-link">Privacy Policy</span>
              </div>
            </div>
          )}

          {/* ── STEP: OTP ── */}
          {step === STEPS.OTP && (
            <div className="auth-form-card" key="otp">
              <div className="afc-icon"><Lock size={28} strokeWidth={1.3} color="#00C853"/></div>
              <h3>Verify your number</h3>
              <p>Enter the 6-digit OTP sent to <strong>+91 {phone}</strong></p>

              <div className="afc-field">
                <label>Enter OTP</label>
                <div className="otp-boxes">
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      id={'otp-' + i}
                      type="tel"
                      maxLength={1}
                      className={"otp-box" + (errors.otp ? ' otp-err' : '') + (v ? ' otp-filled' : '')}
                      value={v}
                      onChange={e => handleOtpChange(e.target.value, i)}
                      onKeyDown={e => handleOtpKey(e, i)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                {errors.otp && <span className="field-err-msg"><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{errors.otp}</span>}
              </div>

              <div className="otp-resend">
                {timer > 0
                  ? <span className="resend-timer">Resend OTP in <strong>{timer}s</strong></span>
                  : <button className="resend-btn" onClick={() => { startTimer(); setOtp(['','','','','','']) }}>Resend OTP</button>
                }
              </div>

              <button className="auth-cta-btn" onClick={handleVerifyOtp} disabled={loading || otp.join('').length < 6}>
                {loading ? <><span className="spin-ring"></span> Verifying...</> : 'Verify & Continue →'}
              </button>

              <button className="auth-back-step" onClick={() => { setStep(STEPS.PHONE); setErrors({}) }}>
                ← Change number
              </button>

              <div className="auth-demo-hint">
                Demo: enter any 6 digits to proceed
              </div>
            </div>
          )}

          {/* ── STEP: REGISTER DETAILS ── */}
          {step === STEPS.REGISTER && mode === 'register' && (
            <div className="auth-form-card" key="register">
              <div className="afc-icon"><User size={28} strokeWidth={1.3} color="#00C853"/></div>
              <h3>Tell us about you</h3>
              <p>We'll use this for your bookings and ticket delivery</p>

              <div className="afc-field">
                <label>Full Name <span className="req">*</span></label>
                <input
                  className={"afc-input" + (errors.name ? ' field-error' : '')}
                  placeholder="As on your ID proof"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors({}) }}
                  autoFocus
                />
                {errors.name && <span className="field-err-msg"><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{errors.name}</span>}
              </div>

              <div className="afc-field">
                <label>Email Address <span className="req">*</span></label>
                <input
                  type="email"
                  className={"afc-input" + (errors.email ? ' field-error' : '')}
                  placeholder="For booking confirmations"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors({}) }}
                />
                {errors.email && <span className="field-err-msg"><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{errors.email}</span>}
              </div>

              <button className="auth-cta-btn" onClick={handleRegisterNext}>
                Continue →
              </button>

              <button className="auth-back-step" onClick={() => { setStep(STEPS.OTP); setErrors({}) }}>
                ← Back
              </button>
            </div>
          )}

          {/* ── STEP: IRCTC LOGIN ── */}
          {step === STEPS.IRCTC && (
            <div className="auth-form-card" key="irctc">
              <div className="afc-icon"><Ticket size={28} strokeWidth={1.3} color="#00C853"/></div>
              <h3>Link your IRCTC account</h3>
              <p>CMT Booking is an IRCTC Authorised Partner. Your IRCTC credentials are required to book tickets.</p>

              <div className="irctc-notice">
                <Lock size={13} style={{verticalAlign:"middle",marginRight:4}}/>
                <div>
                  <strong>Your credentials are safe</strong>
                  <p>We use 256-bit SSL. Passwords are never stored on our servers.</p>
                </div>
              </div>

              <div className="afc-field">
                <label>IRCTC User ID <span className="req">*</span></label>
                <input
                  className={"afc-input" + (errors.irctcId ? ' field-error' : '')}
                  placeholder="Case-sensitive IRCTC username"
                  value={irctcId}
                  onChange={e => { setIrctcId(e.target.value); setErrors({}) }}
                  autoFocus
                />
                {errors.irctcId && <span className="field-err-msg"><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{errors.irctcId}</span>}
                <span className="field-hint"><AlertTriangle size={12} style={{verticalAlign:"middle",marginRight:4}}/>IRCTC User ID is case-sensitive</span>
              </div>

              <div className="afc-field">
                <label>IRCTC Password <span className="req">*</span></label>
                <div className={"pass-wrap" + (errors.irctcPass ? ' field-error' : '')}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="pass-input"
                    placeholder="Your IRCTC password"
                    value={irctcPass}
                    onChange={e => { setIrctcPass(e.target.value); setErrors({}) }}
                  />
                  <button className="pass-toggle" type="button" onClick={() => setShowPass(s => !s)}>
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.irctcPass && <span className="field-err-msg"><AlertTriangle size={13} style={{verticalAlign:"middle",marginRight:4}}/>{errors.irctcPass}</span>}
              </div>

              <label className={"agree-wrap" + (errors.agreed ? ' agree-err' : '')}>
                <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors({}) }} />
                <span>I agree to the <span className="auth-link">Terms & Conditions</span> and authorise CMT Booking to book tickets via IRCTC on my behalf.</span>
              </label>
              {errors.agreed && <span className="field-err-msg" style={{marginTop: '-8px', display: 'block'}}><AlertTriangle size={13} style={{verticalAlign:'middle',marginRight:4}}/>{errors.agreed}</span>}

              <button className="auth-cta-btn" onClick={handleFinish} disabled={loading}>
                {loading ? <><span className="spin-ring"></span> Signing in...</> : mode === 'register' ? 'Create Account' : 'Sign In'}
              </button>

              <button className="auth-back-step" onClick={() => { setStep(mode === 'register' ? STEPS.REGISTER : STEPS.OTP); setErrors({}) }}>
                ← Back
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
