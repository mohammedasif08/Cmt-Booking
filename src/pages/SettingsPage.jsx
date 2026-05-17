import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { User, Bell, Lock, Palette, Shield, Train, Settings, Key, LogOut, IdCard, CreditCard, Wallet, Mail, Phone, Ticket, Gift, Fingerprint, Smartphone, Globe, DollarSign, Target, BarChart, TrendingUp, FileText, Trash, Users, Seat, Coffee, LinkIcon, Star, MessageSquare, XCircle, RefreshCw, Download, Check, AlertTriangle, Info, ChevronRight, X, Clock, Monitor, ClipboardList, Camera } from '../components/Icon'
import { useBooking } from '../context/BookingContext'
import './SettingsPage.css'

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <div className={`toggle ${on ? 'toggle-on' : ''}`} onClick={() => onChange(!on)}>
      <div className="toggle-thumb" />
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <div className="settings-section">
      <div className="ss-heading">
        <span className="ss-icon">{icon}</span>
        <h3 className="ss-title">{title}</h3>
      </div>
      <div className="ss-body">{children}</div>
    </div>
  )
}

// ─── Row with toggle ──────────────────────────────────────────────────────────
function ToggleRow({ icon, label, desc, on, onChange }) {
  return (
    <div className="settings-row">
      <div className="sr-left">
        {icon && <span className="sr-icon">{icon}</span>}
        <div className="sr-text">
          <div className="sr-label">{label}</div>
          {desc && <div className="sr-desc">{desc}</div>}
        </div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

// ─── Row with chevron (navigation) ───────────────────────────────────────────
function NavRow({ icon, label, desc, value, onClick, danger }) {
  return (
    <div className={`settings-row settings-row-nav ${danger ? 'settings-row-danger' : ''}`} onClick={onClick}>
      <div className="sr-left">
        {icon && <span className="sr-icon">{icon}</span>}
        <div className="sr-text">
          <div className="sr-label">{label}</div>
          {desc && <div className="sr-desc">{desc}</div>}
        </div>
      </div>
      <div className="sr-right">
        {value && <span className="sr-value">{value}</span>}
        <span className="sr-chevron">›</span>
      </div>
    </div>
  )
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, login, logout, appTheme, setAppTheme, appLanguage, setAppLanguage, emailNotifications, setEmailNotifications } = useBooking()

  // ── Profile edit state ────
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [profileSaved, setProfileSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  // ── Notification prefs ────
  const [notifs, setNotifs] = useState({
    bookingConfirm:  true,
    pnrAlerts:       true,
    trainDelays:     true,
    promotions:      false,
    smsAlerts:       true,
    whatsapp:        true,
    email:           emailNotifications,
  })

  // ── Privacy ──────────────
  const [privacy, setPrivacy] = useState({
    shareData:       false,
    analytics:       true,
    personalised:    true,
  })

  // ── Appearance ───────────
  const [currency, setCurrency] = useState('INR (₹)')

  // ── Security ─────────────
  const [biometric, setBiometric]   = useState(false)
  const [twoFactor, setTwoFactor]   = useState(false)
  const [autoLogout, setAutoLogout] = useState(true)

  // ── Travel Preferences ────
  const [travelClass, setTravelClass]       = useState('3A')
  const [berthPref, setBerthPref]           = useState('Lower')
  const [mealPref, setMealPref]             = useState('Veg')
  const [autoInsurance, setAutoInsurance]   = useState(false)
  const [flexiTicket, setFlexiTicket]       = useState(false)
  const [wheelchairPref, setWheelchairPref] = useState(false)
  const [seniorConcession, setSeniorConcession] = useState(false)

  // ── Delete / logout confirm ──
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // ── Security modals ──────
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showLinkedDevices, setShowLinkedDevices]   = useState(false)
  const [showActiveSessions, setShowActiveSessions] = useState(false)
  const [autoLogoutTimeout, setAutoLogoutTimeout]   = useState('30')

  // ── New feature modals ───
  const [showRateApp, setShowRateApp]               = useState(false)
  const [showFeedback, setShowFeedback]             = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy]   = useState(false)
  const [showTerms, setShowTerms]                   = useState(false)
  const [showClearHistory, setShowClearHistory]     = useState(false)
  const [showSavedPassengers, setShowSavedPassengers] = useState(false)
  const [showSavedPayments, setShowSavedPayments]   = useState(false)
  const [showDownloadData, setShowDownloadData]     = useState(false)
  const [appRating, setAppRating]                   = useState(0)
  const [feedbackText, setFeedbackText]             = useState('')
  const [feedbackSent, setFeedbackSent]             = useState(false)
  const [ratingDone, setRatingDone]                 = useState(false)
  const [downloadReady, setDownloadReady]           = useState(false)
  const [historyCleared, setHistoryCleared]         = useState(false)

  // ── Linked devices state ──
  const [linkedDevices, setLinkedDevices] = useState([
    { id: 1, name: 'This Device — Chrome on Windows', meta: 'Last active: Just now', current: true, icon: 'monitor' },
    { id: 2, name: 'Android Phone — CMT App', meta: 'Last active: 2 days ago', current: false, icon: 'phone' },
  ])
  const [removedDeviceMsg, setRemovedDeviceMsg] = useState('')

  const removeDevice = (id) => {
    setLinkedDevices(prev => prev.filter(d => d.id !== id))
    setRemovedDeviceMsg('Device removed successfully.')
    setTimeout(() => setRemovedDeviceMsg(''), 3000)
  }
  const removeAllOtherDevices = () => {
    setLinkedDevices(prev => prev.filter(d => d.current))
    setRemovedDeviceMsg('All other devices removed.')
    setTimeout(() => setRemovedDeviceMsg(''), 3000)
  }

  // ── Active sessions state ──
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, name: 'Web Browser — Chennai, IN', meta: 'Started: Today, 10:30 AM', current: true },
    { id: 2, name: 'Android App — Mumbai, IN', meta: 'Started: Yesterday, 6:15 PM', current: false },
  ])
  const [removedSessionMsg, setRemovedSessionMsg] = useState('')

  const terminateSession = (id) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id))
    setRemovedSessionMsg('Session terminated.')
    setTimeout(() => setRemovedSessionMsg(''), 3000)
  }
  const terminateAllSessions = () => {
    setActiveSessions(prev => prev.filter(s => s.current))
    setRemovedSessionMsg('All other sessions ended.')
    setTimeout(() => setRemovedSessionMsg(''), 3000)
  }
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  const handleSaveProfile = () => {
    if (user) login({ ...user, ...profileForm, avatarPreview })
    setEditingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleEmailNotifToggle = (v) => {
    setNotifs(n => ({ ...n, email: v }))
    setEmailNotifications(v)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleChangePassword = () => {
    setPwError('')
    if (!pwForm.current) { setPwError('Enter your current password'); return }
    if (pwForm.next.length < 6) { setPwError('New password must be at least 6 characters'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match'); return }
    setPwSaved(true)
    setTimeout(() => { setPwSaved(false); setShowChangePassword(false); setPwForm({ current: '', next: '', confirm: '' }) }, 1800)
  }

  const LANGUAGES = ['English','हिंदी','தமிழ்','తెలుగు','বাংলা','मराठी','ગુજરાતી','ਪੰਜਾਬੀ']

  return (
    <div className="settings-page">
      <Navbar />

      {/* ── Header ── */}
      <div className="settings-hero">
        <div className="settings-hero-inner">
          <button className="settings-back" onClick={() => navigate(-1)}>← Back</button>
          <h1 className="settings-hero-title">Settings</h1>
          <p className="settings-hero-sub">Manage your account, notifications & preferences</p>
        </div>
      </div>

      {/* ── Toast ── */}
      {profileSaved && (
        <div className="settings-toast"><Check size={15} color="#00C853" strokeWidth={2.5} style={{verticalAlign:"middle",marginRight:6}}/>Profile updated successfully</div>
      )}

      <div className="settings-body">
        <div className="settings-layout">

          {/* ══ LEFT SIDEBAR (nav pills) ════════════════════════════════ */}
          <aside className="settings-sidebar">
            {[
              { id:'profile',       icon:<User size={17}/>,     label:'Profile' },
              { id:'notifications', icon:<Bell size={17}/>,     label:'Notifications' },
              { id:'privacy',       icon:<Lock size={17}/>,     label:'Privacy' },
              { id:'appearance',    icon:<Palette size={17}/>,  label:'Appearance' },
              { id:'security',      icon:<Shield size={17}/>,   label:'Security' },
              { id:'travel',        icon:<Train size={17}/>,    label:'Travel Preferences' },
              { id:'account',       icon:<Settings size={17}/>, label:'Account' },
            ].map(item => (
              <a key={item.id} className="sidebar-link" href={`#${item.id}`}>
                <span className="sl-icon">{item.icon}</span>
                <span className="sl-label">{item.label}</span>
              </a>
            ))}
          </aside>

          {/* ══ RIGHT CONTENT ════════════════════════════════════════════ */}
          <main className="settings-main">

            {/* ── Profile ────────────────────────────────────────────── */}
            <div id="profile">
              <Section icon={<User size={20}/>} title="Profile">
                {!user ? (
                  <div className="settings-login-prompt">
                    <div className="slp-icon"><Key size={40} strokeWidth={1.2} color="#ccc"/></div>
                    <div className="slp-text">Sign in to manage your profile</div>
                    <button className="slp-btn" onClick={() => navigate('/login')}>Sign In / Register</button>
                  </div>
                ) : editingProfile ? (
                  <div className="profile-edit-form">
                    {/* Avatar upload */}
                    <div className="profile-avatar-row">
                      <div className="profile-avatar big-avatar" style={avatarPreview ? {padding:0,overflow:'hidden'} : {}}>
                        {avatarPreview
                          ? <img src={avatarPreview} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>
                          : (user.name.charAt(0).toUpperCase())
                        }
                      </div>
                      <div>
                        <button className="avatar-change-btn" onClick={() => fileInputRef.current?.click()}>
                          <Camera size={13} style={{verticalAlign:'middle',marginRight:5}}/>Change Photo
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{display:'none'}}
                          onChange={handleAvatarChange}
                        />
                        <div style={{fontSize:11,color:'#aaa',marginTop:5}}>JPG, PNG up to 5MB</div>
                      </div>
                    </div>
                    <div className="pef-grid">
                      <div className="pef-field">
                        <label>Full Name</label>
                        <input
                          value={profileForm.name}
                          onChange={e => setProfileForm(f => ({...f, name: e.target.value}))}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="pef-field">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={e => setProfileForm(f => ({...f, email: e.target.value}))}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="pef-field">
                        <label>Mobile Number</label>
                        <input
                          value={profileForm.phone}
                          onChange={e => setProfileForm(f => ({...f, phone: e.target.value}))}
                          placeholder="10-digit mobile"
                        />
                      </div>
                      <div className="pef-field">
                        <label>IRCTC ID</label>
                        <input value={user.irctcId || ''} disabled placeholder="Not linked" />
                      </div>
                    </div>
                    <div className="pef-actions">
                      <button className="pef-cancel" onClick={() => setEditingProfile(false)}>Cancel</button>
                      <button className="pef-save" onClick={handleSaveProfile}>Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-view">
                    <div className="profile-avatar-row">
                      <div className="profile-avatar big-avatar" style={user.avatarPreview ? {padding:0,overflow:'hidden'} : {}}>
                        {user.avatarPreview
                          ? <img src={user.avatarPreview} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>
                          : (user ? user.name.charAt(0).toUpperCase() : '?')
                        }
                      </div>
                      <div className="pv-info">
                        <div className="pv-name">{user.name}</div>
                        <div className="pv-sub">
                          {user.phone ? `+91 ${user.phone}` : ''}
                          {user.email ? ` · ${user.email}` : ''}
                        </div>
                        <div className="pv-badges">
                          {user.aadhaarLinked
                            ? <span className="pv-badge pv-green"><Check size={10} strokeWidth={3}/> Aadhaar Linked</span>
                            : <span className="pv-badge pv-orange"><AlertTriangle size={10}/> Aadhaar Not Linked</span>
                          }
                          {user.irctcId && <span className="pv-badge pv-blue">IRCTC: {user.irctcId}</span>}
                        </div>
                      </div>
                      <button className="pv-edit-btn" onClick={() => { setAvatarPreview(user.avatarPreview || null); setProfileForm({ name: user.name, email: user.email||'', phone: user.phone||'' }); setEditingProfile(true) }}>
                        Edit
                      </button>
                    </div>

                    <div className="profile-details-grid">
                      {[
                        { label: 'Full Name',     value: user.name },
                        { label: 'Mobile',        value: user.phone ? `+91 ${user.phone}` : '—' },
                        { label: 'Email',         value: user.email || '—' },
                        { label: 'IRCTC ID',      value: user.irctcId || '—' },
                        { label: 'Aadhaar',       value: user.aadhaarLinked ? 'Linked' : 'Not Linked' },
                        { label: 'Member Since',  value: 'Feb 2026' },
                      ].map((item, i) => (
                        <div key={i} className="pdg-item">
                          <div className="pdg-label">{item.label}</div>
                          <div className="pdg-value">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {!user.aadhaarLinked && (
                      <div className="settings-alert">
                        <AlertTriangle size={18} color="#E65100"/>
                        <div>
                          <strong>Link your Aadhaar</strong> to enable Tatkal booking and senior citizen concession.
                          <span className="sa-link" onClick={() => navigate('/link-aadhaar')}> Link Now →</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Section>
            </div>

            {/* ── Notifications ──────────────────────────────────────── */}
            <div id="notifications">
              <Section icon={<Bell size={20}/>} title="Notifications">
                <div className="settings-sub-heading">Booking Alerts</div>
                <ToggleRow icon={<Ticket size={18}/>} label="Booking Confirmation" desc="Get notified when a booking is confirmed" on={notifs.bookingConfirm} onChange={v => setNotifs(n => ({...n, bookingConfirm: v}))} />
                <ToggleRow icon={<ClipboardList size={18}/>} label="PNR Status Alerts" desc="Real-time updates on your PNR status" on={notifs.pnrAlerts} onChange={v => setNotifs(n => ({...n, pnrAlerts: v}))} />
                <ToggleRow icon={<Train size={18}/>} label="Train Delay Alerts" desc="Notify me when my train is delayed or cancelled" on={notifs.trainDelays} onChange={v => setNotifs(n => ({...n, trainDelays: v}))} />
                <ToggleRow icon={<Gift size={18}/>} label="Promotions & Offers" desc="Discounts, cashback and special fares" on={notifs.promotions} onChange={v => setNotifs(n => ({...n, promotions: v}))} />

                <div className="settings-sub-heading" style={{marginTop:20}}>Channels</div>
                <ToggleRow icon={<Phone size={18}/>} label="SMS Alerts" desc="Receive booking updates via SMS" on={notifs.smsAlerts} onChange={v => setNotifs(n => ({...n, smsAlerts: v}))} />
                <ToggleRow icon={<MessageSquare size={18}/>} label="WhatsApp" desc="Get tickets and updates on WhatsApp" on={notifs.whatsapp} onChange={v => setNotifs(n => ({...n, whatsapp: v}))} />
                <ToggleRow icon={<Mail size={18}/>} label="Email Notifications" desc={user?.email ? `Booking receipts sent to ${user.email}` : "Add email in profile to enable"} on={notifs.email} onChange={handleEmailNotifToggle} />

                {notifs.email && user?.email && (
                  <div className="email-notif-info">
                    <Check size={13} color="#00C853" strokeWidth={3} style={{flexShrink:0}}/>
                    Booking confirmations will be emailed to <strong>{user.email}</strong>
                  </div>
                )}
                {notifs.email && !user?.email && (
                  <div className="email-notif-warning">
                    <AlertTriangle size={13} color="#E65100" style={{flexShrink:0}}/>
                    No email on file. <span className="sa-link" onClick={() => { setEditingProfile(true); document.getElementById('profile')?.scrollIntoView({behavior:'smooth'}) }}>Add email in profile →</span>
                  </div>
                )}
              </Section>
            </div>

            {/* ── Privacy ────────────────────────────────────────────── */}
            <div id="privacy">
              <Section icon={<Lock size={20}/>} title="Privacy">
                <ToggleRow icon={<BarChart size={18}/>} label="Share Usage Data" desc="Help us improve by sharing anonymous usage statistics" on={privacy.shareData} onChange={v => setPrivacy(p => ({...p, shareData: v}))} />
                <ToggleRow icon={<TrendingUp size={18}/>} label="Analytics" desc="Allow analytics to improve app performance" on={privacy.analytics} onChange={v => setPrivacy(p => ({...p, analytics: v}))} />
                <ToggleRow icon={<Target size={18}/>} label="Personalised Recommendations" desc="Show train suggestions based on your travel history" on={privacy.personalised} onChange={v => setPrivacy(p => ({...p, personalised: v}))} />
                <NavRow icon={<FileText size={18}/>} label="Privacy Policy" onClick={() => setShowPrivacyPolicy(true)} />
                <NavRow icon={<FileText size={18}/>} label="Terms of Service" onClick={() => setShowTerms(true)} />
                <NavRow icon={<Trash size={18}/>} label="Clear Search History" desc="Remove all your saved searches" onClick={() => setShowClearHistory(true)} />
              </Section>
            </div>

            {/* ── Appearance ─────────────────────────────────────────── */}
            <div id="appearance">
              <Section icon={<Palette size={20}/>} title="Appearance">
                {/* Theme */}
                <div className="settings-row">
                  <div className="sr-left">
                    <span className="sr-icon"><Monitor size={18}/></span>
                    <div className="sr-text">
                      <div className="sr-label">Theme</div>
                      <div className="sr-desc">
                        {appTheme === 'dark' ? '🌙 Dark mode active' : appTheme === 'light' ? '☀️ Light mode active' : '⚙️ Following system setting'}
                      </div>
                    </div>
                  </div>
                  <div className="theme-pills">
                    {['Light', 'Dark', 'System'].map(t => (
                      <button
                        key={t}
                        className={`theme-pill ${appTheme === t.toLowerCase() ? 'theme-pill-active' : ''}`}
                        onClick={() => setAppTheme(t.toLowerCase())}
                      >
                        {t === 'Light' ? '☀️ ' : t === 'Dark' ? '🌙 ' : '⚙️ '}{t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="settings-row">
                  <div className="sr-left">
                    <span className="sr-icon"><Globe size={18}/></span>
                    <div className="sr-text">
                      <div className="sr-label">Language</div>
                      <div className="sr-desc">App interface language</div>
                    </div>
                  </div>
                  <select
                    className="settings-select"
                    value={appLanguage}
                    onChange={e => setAppLanguage(e.target.value)}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>

                {appLanguage !== 'English' && (
                  <div className="language-active-banner">
                    <Check size={13} color="#00C853" strokeWidth={3} style={{flexShrink:0}}/>
                    Language set to <strong>{appLanguage}</strong>. Full translation applied across the app.
                  </div>
                )}

                {/* Currency */}
                <div className="settings-row">
                  <div className="sr-left">
                    <span className="sr-icon"><DollarSign size={18}/></span>
                    <div className="sr-text">
                      <div className="sr-label">Currency Display</div>
                      <div className="sr-desc">How prices are shown</div>
                    </div>
                  </div>
                  <select className="settings-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                    {['INR (₹)','USD ($)','EUR (€)','GBP (£)'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </Section>
            </div>

            {/* ── Security ───────────────────────────────────────────── */}
            <div id="security">
              <Section icon={<Shield size={20}/>} title="Security">
                <ToggleRow icon={<Fingerprint size={18}/>} label="Biometric Login" desc="Use fingerprint or Face ID to sign in" on={biometric} onChange={setBiometric} />
                <ToggleRow icon={<Smartphone size={18}/>} label="Two-Factor Authentication" desc="Extra OTP verification for all logins" on={twoFactor} onChange={setTwoFactor} />

                {/* Auto Logout with timeout selector */}
                <div className="settings-row">
                  <div className="sr-left">
                    <span className="sr-icon"><Clock size={18}/></span>
                    <div className="sr-text">
                      <div className="sr-label">Auto Logout</div>
                      <div className="sr-desc">
                        {autoLogout ? `Sign out after ${autoLogoutTimeout} min of inactivity` : 'Disabled — stay signed in'}
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {autoLogout && (
                      <select
                        className="settings-select"
                        value={autoLogoutTimeout}
                        onChange={e => setAutoLogoutTimeout(e.target.value)}
                        style={{padding:'6px 10px',fontSize:13}}
                      >
                        {['5','10','15','30','60'].map(m => <option key={m}>{m} min</option>)}
                      </select>
                    )}
                    <Toggle on={autoLogout} onChange={setAutoLogout} />
                  </div>
                </div>

                <NavRow
                  icon={<Key size={18}/>}
                  label="Change Password"
                  desc="Update your account password"
                  onClick={() => setShowChangePassword(true)}
                />
                <NavRow
                  icon={<Monitor size={18}/>}
                  label="Linked Devices"
                  desc="See all devices where you're signed in"
                  value="1 device"
                  onClick={() => setShowLinkedDevices(true)}
                />
                <NavRow
                  icon={<Lock size={18}/>}
                  label="Active Sessions"
                  desc="View and terminate active sessions"
                  value="1 active"
                  onClick={() => setShowActiveSessions(true)}
                />
              </Section>
            </div>

            {/* ── Travel Preferences ─────────────────────────────────── */}
            <div id="travel">
              <Section icon={<Train size={20}/>} title="Travel Preferences">

                {/* Default Travel Class */}
                <div className="settings-row">
                  <div className="sr-left">
                    <span className="sr-icon"><Seat size={18}/></span>
                    <div className="sr-text">
                      <div className="sr-label">Default Travel Class</div>
                      <div className="sr-desc">Preferred class when booking</div>
                    </div>
                  </div>
                  <select className="settings-select" value={travelClass} onChange={e => setTravelClass(e.target.value)}>
                    {['SL','3A','2A','1A','CC','EC','2S'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Preferred Berth */}
                <div className="settings-row">
                  <div className="sr-left">
                    <span className="sr-icon"><Seat size={18}/></span>
                    <div className="sr-text">
                      <div className="sr-label">Preferred Berth</div>
                      <div className="sr-desc">Your berth preference</div>
                    </div>
                  </div>
                  <select className="settings-select" value={berthPref} onChange={e => setBerthPref(e.target.value)}>
                    {['Lower','Upper','Middle','Side Lower','Side Upper','No Preference'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>

                {/* Meal Preference */}
                <div className="settings-row">
                  <div className="sr-left">
                    <span className="sr-icon"><Coffee size={18}/></span>
                    <div className="sr-text">
                      <div className="sr-label">Meal Preference</div>
                      <div className="sr-desc">Default meal choice for catering</div>
                    </div>
                  </div>
                  <select className="settings-select" value={mealPref} onChange={e => setMealPref(e.target.value)}>
                    {['Veg','Non-Veg','Jain','No Preference'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>

                <NavRow icon={<Users size={18}/>} label="Saved Passengers" desc="Quickly add frequent travellers" value="3 saved" onClick={() => setShowSavedPassengers(true)} />
                <NavRow icon={<CreditCard size={18}/>} label="Saved Payment Methods" desc="Cards, UPI and wallets" value="2 saved" onClick={() => setShowSavedPayments(true)} />

                {/* Toggle preferences */}
                <div className="settings-sub-heading" style={{marginTop:4}}>Auto-Add Options</div>
                <ToggleRow
                  icon={<Shield size={18}/>}
                  label="Default Travel Insurance"
                  desc="Auto-add insurance to new bookings"
                  on={autoInsurance}
                  onChange={setAutoInsurance}
                />
                <ToggleRow
                  icon={<Ticket size={18}/>}
                  label="Flexi Ticket"
                  desc="Auto-select flexible cancellation tickets"
                  on={flexiTicket}
                  onChange={setFlexiTicket}
                />
                <ToggleRow
                  icon={<Smartphone size={18}/>}
                  label="Wheelchair Assistance"
                  desc="Request platform wheelchair for all bookings"
                  on={wheelchairPref}
                  onChange={setWheelchairPref}
                />
                <ToggleRow
                  icon={<Gift size={18}/>}
                  label="Senior Citizen Concession"
                  desc="Apply concession automatically if eligible"
                  on={seniorConcession}
                  onChange={setSeniorConcession}
                />
              </Section>
            </div>

            {/* ── Account ────────────────────────────────────────────── */}
            <div id="account">
              <Section icon={<Settings size={20}/>} title="Account">
                <NavRow icon={<Download size={18}/>} label="Download My Data" desc="Request a copy of all your booking data" onClick={() => setShowDownloadData(true)} />
                <NavRow icon={<LinkIcon size={18}/>} label="Link Aadhaar" desc="Required for Tatkal & concession booking" value={user?.aadhaarLinked ? 'Linked' : 'Not Linked'} onClick={() => navigate('/link-aadhaar')} />
                <NavRow icon={<Info size={18}/>} label="App Version" value="v4.0.0" onClick={() => {}} />
                <NavRow icon={<Star size={18}/>} label="Rate the App" onClick={() => setShowRateApp(true)} />
                <NavRow icon={<MessageSquare size={18}/>} label="Send Feedback" onClick={() => setShowFeedback(true)} />

                <div className="settings-divider" />

                {user ? (
                  <NavRow icon={<LogOut size={18}/>} label="Sign Out" desc="Sign out from your CMT account" onClick={() => setShowLogoutConfirm(true)} danger />
                ) : (
                  <NavRow icon={<Key size={18}/>} label="Sign In" desc="Access your bookings and preferences" onClick={() => navigate('/login')} />
                )}
                <NavRow icon={<XCircle size={18}/>} label="Delete Account" desc="Permanently delete your account and all data" onClick={() => setShowDeleteConfirm(true)} danger />
              </Section>
            </div>

          </main>
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════ */}

      {/* ── Logout Confirm ── */}
      {showLogoutConfirm && (
        <Modal onClose={() => setShowLogoutConfirm(false)}>
          <div className="smodal-icon"><LogOut size={36} strokeWidth={1.3} color="#555"/></div>
          <h3 className="smodal-title">Sign Out?</h3>
          <p className="smodal-desc">You'll need to sign in again to access your bookings and account.</p>
          <div className="smodal-actions">
            <button className="smodal-cancel" onClick={() => setShowLogoutConfirm(false)}>Stay Signed In</button>
            <button className="smodal-confirm smodal-danger" onClick={handleLogout}>Sign Out</button>
          </div>
        </Modal>
      )}

      {/* ── Delete Account Confirm ── */}
      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)}>
          <div className="smodal-icon"><AlertTriangle size={36} strokeWidth={1.3} color="#E53935"/></div>
          <h3 className="smodal-title">Delete Account?</h3>
          <p className="smodal-desc">This will permanently delete your account, all bookings history and personal data. <strong>This action cannot be undone.</strong></p>
          <div className="smodal-actions">
            <button className="smodal-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button className="smodal-confirm smodal-danger" onClick={() => { logout(); navigate('/') }}>Yes, Delete</button>
          </div>
        </Modal>
      )}

      {/* ── Change Password ── */}
      {showChangePassword && (
        <Modal onClose={() => setShowChangePassword(false)}>
          <div className="smodal-icon"><Key size={36} strokeWidth={1.3} color="#1565C0"/></div>
          <h3 className="smodal-title">Change Password</h3>
          {pwSaved ? (
            <div style={{textAlign:'center',padding:'12px 0'}}>
              <Check size={40} color="#00C853" strokeWidth={2.5}/>
              <p style={{marginTop:10,color:'#00A846',fontWeight:700}}>Password updated successfully!</p>
            </div>
          ) : (
            <>
              <div className="pw-form">
                <div className="pw-field">
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" value={pwForm.current} onChange={e => setPwForm(f => ({...f, current: e.target.value}))} />
                </div>
                <div className="pw-field">
                  <label>New Password</label>
                  <input type="password" placeholder="Min. 6 characters" value={pwForm.next} onChange={e => setPwForm(f => ({...f, next: e.target.value}))} />
                </div>
                <div className="pw-field">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Re-enter new password" value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} />
                </div>
                {pwError && <div className="pw-error"><AlertTriangle size={13}/> {pwError}</div>}
              </div>
              <div className="smodal-actions">
                <button className="smodal-cancel" onClick={() => setShowChangePassword(false)}>Cancel</button>
                <button className="smodal-confirm" style={{background:'#1565C0'}} onClick={handleChangePassword}>Update Password</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ── Linked Devices ── */}
      {showLinkedDevices && (
        <Modal onClose={() => setShowLinkedDevices(false)}>
          <div className="smodal-icon"><Monitor size={36} strokeWidth={1.3} color="#555"/></div>
          <h3 className="smodal-title">Linked Devices</h3>
          {removedDeviceMsg && (
            <div style={{background:'#e8f5e9',color:'#2e7d32',borderRadius:8,padding:'8px 12px',fontSize:13,marginBottom:12,textAlign:'center'}}>
              ✓ {removedDeviceMsg}
            </div>
          )}
          <div className="device-list">
            {linkedDevices.map(device => (
              <div key={device.id} className={`device-item ${device.current ? 'device-current' : ''}`}>
                <div className="device-icon">
                  {device.icon === 'monitor'
                    ? <Monitor size={22} color={device.current ? '#00A846' : '#888'}/>
                    : <Smartphone size={22} color={device.current ? '#00A846' : '#888'}/>
                  }
                </div>
                <div className="device-info">
                  <div className="device-name">{device.name}</div>
                  <div className="device-meta">
                    {device.meta}&nbsp;·&nbsp;
                    {device.current
                      ? <span className="device-badge">Current</span>
                      : null
                    }
                  </div>
                </div>
                {!device.current && (
                  <button className="device-remove" onClick={() => removeDevice(device.id)}>Remove</button>
                )}
              </div>
            ))}
            {linkedDevices.length === 1 && (
              <p style={{fontSize:12,color:'#aaa',textAlign:'center',marginTop:8}}>No other devices linked.</p>
            )}
          </div>
          <div className="smodal-actions" style={{marginTop:20}}>
            <button className="smodal-cancel" onClick={() => setShowLinkedDevices(false)}>Close</button>
            {linkedDevices.filter(d => !d.current).length > 0 && (
              <button className="smodal-confirm smodal-danger" onClick={removeAllOtherDevices}>Remove All Others</button>
            )}
          </div>
        </Modal>
      )}

      {/* ── Active Sessions ── */}
      {showActiveSessions && (
        <Modal onClose={() => setShowActiveSessions(false)}>
          <div className="smodal-icon"><Lock size={36} strokeWidth={1.3} color="#555"/></div>
          <h3 className="smodal-title">Active Sessions</h3>
          {removedSessionMsg && (
            <div style={{background:'#e8f5e9',color:'#2e7d32',borderRadius:8,padding:'8px 12px',fontSize:13,marginBottom:12,textAlign:'center'}}>
              ✓ {removedSessionMsg}
            </div>
          )}
          <div className="device-list">
            {activeSessions.map(session => (
              <div key={session.id} className={`device-item ${session.current ? 'device-current' : ''}`}>
                <div className="device-icon"><Monitor size={22} color={session.current ? '#00A846' : '#888'}/></div>
                <div className="device-info">
                  <div className="device-name">{session.name}</div>
                  <div className="device-meta">
                    {session.meta}&nbsp;·&nbsp;
                    {session.current ? <span className="device-badge">Active</span> : null}
                  </div>
                </div>
                {!session.current && (
                  <button className="device-remove" onClick={() => terminateSession(session.id)}>End</button>
                )}
              </div>
            ))}
            {activeSessions.length === 1 && (
              <p style={{fontSize:12,color:'#aaa',marginTop:16,textAlign:'center'}}>Only 1 active session found.</p>
            )}
          </div>
          <div className="smodal-actions" style={{marginTop:16}}>
            <button className="smodal-cancel" onClick={() => setShowActiveSessions(false)}>Close</button>
            {activeSessions.filter(s => !s.current).length > 0 && (
              <button className="smodal-confirm smodal-danger" onClick={terminateAllSessions}>End All Sessions</button>
            )}
          </div>
        </Modal>
      )}

      {/* ── Rate the App ── */}
      {showRateApp && (
        <Modal onClose={() => setShowRateApp(false)}>
          <div className="smodal-icon" style={{fontSize:36}}>⭐</div>
          <h3 className="smodal-title">Rate CMT Booking</h3>
          {ratingDone ? (
            <div style={{textAlign:'center',padding:'8px 0 16px'}}>
              <div style={{fontSize:40,marginBottom:8}}>🎉</div>
              <p style={{color:'#00A846',fontWeight:700,fontSize:15}}>Thanks for your rating!</p>
              <p style={{color:'#888',fontSize:13,marginTop:4}}>Your feedback helps us improve.</p>
            </div>
          ) : (
            <>
              <p className="smodal-desc">How would you rate your experience?</p>
              <div className="star-rating">
                {[1,2,3,4,5].map(n => (
                  <button key={n} className={`star-btn ${appRating >= n ? 'star-active' : ''}`} onClick={() => setAppRating(n)}>★</button>
                ))}
              </div>
              <div className="smodal-actions" style={{marginTop:20}}>
                <button className="smodal-cancel" onClick={() => setShowRateApp(false)}>Cancel</button>
                <button className="smodal-confirm" style={{background: appRating ? '#00C853' : '#ccc', cursor: appRating ? 'pointer' : 'not-allowed'}}
                  onClick={() => { if(appRating) setRatingDone(true) }}>
                  Submit Rating
                </button>
              </div>
            </>
          )}
          {ratingDone && <button className="smodal-cancel" style={{marginTop:8,width:'100%'}} onClick={() => { setShowRateApp(false); setRatingDone(false); setAppRating(0) }}>Close</button>}
        </Modal>
      )}

      {/* ── Send Feedback ── */}
      {showFeedback && (
        <Modal onClose={() => setShowFeedback(false)}>
          <div className="smodal-icon"><MessageSquare size={36} strokeWidth={1.3} color="#1565C0"/></div>
          <h3 className="smodal-title">Send Feedback</h3>
          {feedbackSent ? (
            <div style={{textAlign:'center',padding:'8px 0 16px'}}>
              <Check size={40} color="#00C853" strokeWidth={2.5}/>
              <p style={{color:'#00A846',fontWeight:700,marginTop:8}}>Feedback sent! Thank you.</p>
            </div>
          ) : (
            <>
              <p className="smodal-desc" style={{marginBottom:12}}>Tell us what you think or report an issue.</p>
              <textarea
                className="feedback-textarea"
                placeholder="Share your thoughts, suggestions, or report a bug..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                rows={4}
              />
              <div className="smodal-actions" style={{marginTop:14}}>
                <button className="smodal-cancel" onClick={() => setShowFeedback(false)}>Cancel</button>
                <button className="smodal-confirm" style={{background: feedbackText.trim() ? '#1565C0' : '#ccc'}}
                  onClick={() => { if(feedbackText.trim()) setFeedbackSent(true) }}>
                  Send Feedback
                </button>
              </div>
            </>
          )}
          {feedbackSent && <button className="smodal-cancel" style={{marginTop:8,width:'100%'}} onClick={() => { setShowFeedback(false); setFeedbackSent(false); setFeedbackText('') }}>Close</button>}
        </Modal>
      )}

      {/* ── Privacy Policy ── */}
      {showPrivacyPolicy && (
        <Modal onClose={() => setShowPrivacyPolicy(false)}>
          <div className="smodal-icon"><FileText size={36} strokeWidth={1.3} color="#1565C0"/></div>
          <h3 className="smodal-title">Privacy Policy</h3>
          <div className="policy-scroll">
            <p><strong>Data Collection:</strong> CMT Booking collects your name, phone number, email, and travel history to process bookings and improve your experience.</p>
            <p><strong>Data Usage:</strong> Your data is used solely for booking management, customer support, and personalised recommendations. We do not sell your data to third parties.</p>
            <p><strong>Aadhaar Data:</strong> Aadhaar information is used only for identity verification as per UIDAI guidelines and is not stored on our servers.</p>
            <p><strong>Cookies:</strong> We use cookies to maintain your session and remember your preferences.</p>
            <p><strong>Your Rights:</strong> You can request deletion of your data at any time from Settings → Account → Delete Account.</p>
            <p style={{color:'#aaa',fontSize:11,marginTop:8}}>Last updated: January 2026</p>
          </div>
          <button className="smodal-cancel" style={{width:'100%',marginTop:16}} onClick={() => setShowPrivacyPolicy(false)}>Close</button>
        </Modal>
      )}

      {/* ── Terms of Service ── */}
      {showTerms && (
        <Modal onClose={() => setShowTerms(false)}>
          <div className="smodal-icon"><FileText size={36} strokeWidth={1.3} color="#555"/></div>
          <h3 className="smodal-title">Terms of Service</h3>
          <div className="policy-scroll">
            <p><strong>1. Acceptance:</strong> By using CMT Booking, you agree to these terms. If you disagree, please discontinue use.</p>
            <p><strong>2. Bookings:</strong> All bookings are subject to Indian Railways availability and IRCTC terms. CMT Booking is a booking interface, not a railway operator.</p>
            <p><strong>3. Payments:</strong> Payments are processed securely. Refunds are subject to IRCTC cancellation policies.</p>
            <p><strong>4. Account:</strong> You are responsible for maintaining the security of your account. Do not share your credentials.</p>
            <p><strong>5. Limitation of Liability:</strong> CMT Booking is not liable for train delays, cancellations, or service disruptions caused by Indian Railways.</p>
            <p style={{color:'#aaa',fontSize:11,marginTop:8}}>Last updated: January 2026</p>
          </div>
          <button className="smodal-cancel" style={{width:'100%',marginTop:16}} onClick={() => setShowTerms(false)}>Close</button>
        </Modal>
      )}

      {/* ── Clear Search History ── */}
      {showClearHistory && (
        <Modal onClose={() => setShowClearHistory(false)}>
          <div className="smodal-icon"><Trash size={36} strokeWidth={1.3} color="#E53935"/></div>
          <h3 className="smodal-title">{historyCleared ? 'History Cleared' : 'Clear Search History?'}</h3>
          {historyCleared ? (
            <div style={{textAlign:'center',padding:'8px 0 16px'}}>
              <Check size={40} color="#00C853" strokeWidth={2.5}/>
              <p style={{color:'#00A846',fontWeight:700,marginTop:8}}>All search history deleted.</p>
              <button className="smodal-cancel" style={{marginTop:12,width:'100%'}} onClick={() => { setShowClearHistory(false); setHistoryCleared(false) }}>Close</button>
            </div>
          ) : (
            <>
              <p className="smodal-desc">This will permanently remove all your saved searches, recent routes, and station history.</p>
              <div className="smodal-actions">
                <button className="smodal-cancel" onClick={() => setShowClearHistory(false)}>Cancel</button>
                <button className="smodal-confirm smodal-danger" onClick={() => setHistoryCleared(true)}>Clear History</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ── Saved Passengers ── */}
      {showSavedPassengers && (
        <Modal onClose={() => setShowSavedPassengers(false)}>
          <div className="smodal-icon"><Users size={36} strokeWidth={1.3} color="#1565C0"/></div>
          <h3 className="smodal-title">Saved Passengers</h3>
          <div className="device-list" style={{textAlign:'left'}}>
            {[
              { name: user?.name || 'Self', age: 28, gender: 'Male', relation: 'Self' },
              { name: 'Ananya Sharma', age: 24, gender: 'Female', relation: 'Sister' },
              { name: 'Rajan Kumar', age: 58, gender: 'Male', relation: 'Father' },
            ].map((p, i) => (
              <div key={i} className="device-item">
                <div className="device-icon">
                  <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#00C853,#00A846)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:15}}>
                    {p.name.charAt(0)}
                  </div>
                </div>
                <div className="device-info">
                  <div className="device-name">{p.name}</div>
                  <div className="device-meta">{p.gender} · Age {p.age} · {p.relation}</div>
                </div>
                <button className="device-remove">Remove</button>
              </div>
            ))}
          </div>
          <div className="smodal-actions" style={{marginTop:16}}>
            <button className="smodal-cancel" onClick={() => setShowSavedPassengers(false)}>Close</button>
            <button className="smodal-confirm" style={{background:'#00C853'}}>+ Add Passenger</button>
          </div>
        </Modal>
      )}

      {/* ── Saved Payment Methods ── */}
      {showSavedPayments && (
        <Modal onClose={() => setShowSavedPayments(false)}>
          <div className="smodal-icon"><CreditCard size={36} strokeWidth={1.3} color="#1565C0"/></div>
          <h3 className="smodal-title">Saved Payment Methods</h3>
          <div className="device-list" style={{textAlign:'left'}}>
            <div className="device-item device-current">
              <div className="device-icon" style={{fontSize:22}}>💳</div>
              <div className="device-info">
                <div className="device-name">HDFC Bank •••• 4242</div>
                <div className="device-meta">Visa Debit · Expires 08/27</div>
              </div>
              <button className="device-remove">Remove</button>
            </div>
            <div className="device-item">
              <div className="device-icon" style={{fontSize:22}}>📱</div>
              <div className="device-info">
                <div className="device-name">UPI — user@upi</div>
                <div className="device-meta">Linked to SBI</div>
              </div>
              <button className="device-remove">Remove</button>
            </div>
          </div>
          <div className="smodal-actions" style={{marginTop:16}}>
            <button className="smodal-cancel" onClick={() => setShowSavedPayments(false)}>Close</button>
            <button className="smodal-confirm" style={{background:'#1565C0'}}>+ Add Method</button>
          </div>
        </Modal>
      )}

      {/* ── Download My Data ── */}
      {showDownloadData && (
        <Modal onClose={() => setShowDownloadData(false)}>
          <div className="smodal-icon"><Download size={36} strokeWidth={1.3} color="#1565C0"/></div>
          <h3 className="smodal-title">Download My Data</h3>
          {downloadReady ? (
            <div style={{textAlign:'center',padding:'8px 0 16px'}}>
              <Check size={40} color="#00C853" strokeWidth={2.5}/>
              <p style={{color:'#00A846',fontWeight:700,marginTop:8}}>Your data is ready!</p>
              <p style={{color:'#888',fontSize:13,marginTop:4}}>A link has been sent to <strong>{user?.email || 'your registered email'}</strong></p>
              <button className="pef-save" style={{marginTop:16,padding:'10px 28px'}}>⬇ Download Now</button>
            </div>
          ) : (
            <>
              <p className="smodal-desc">This will prepare a ZIP archive of all your booking data, profile info, and search history.</p>
              <div style={{background:'#F5F5F5',borderRadius:10,padding:'12px 16px',marginBottom:20,textAlign:'left',fontSize:13}}>
                <div style={{fontWeight:700,marginBottom:8,color:'#555'}}>Your export will include:</div>
                {['All booking history & PNR records','Passenger profiles','Search history','Account information'].map((item,i) => (
                  <div key={i} style={{display:'flex',gap:8,marginBottom:4,color:'#444'}}>
                    <Check size={13} color="#00C853" strokeWidth={3} style={{flexShrink:0,marginTop:2}}/>{item}
                  </div>
                ))}
              </div>
              <div className="smodal-actions">
                <button className="smodal-cancel" onClick={() => setShowDownloadData(false)}>Cancel</button>
                <button className="smodal-confirm" style={{background:'#1565C0'}} onClick={() => setDownloadReady(true)}>Request Export</button>
              </div>
            </>
          )}
          {downloadReady && <button className="smodal-cancel" style={{marginTop:8,width:'100%'}} onClick={() => { setShowDownloadData(false); setDownloadReady(false) }}>Close</button>}
        </Modal>
      )}
    </div>
  )
}
