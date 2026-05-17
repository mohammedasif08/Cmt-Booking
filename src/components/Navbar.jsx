import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { useTranslation } from '../data/translations'
import { Train, User, ClipboardList, HelpCircle, IdCard, Settings, LogOut, Key, Wallet, CreditCard, ChevronRight, Check, X, LinkIcon } from './Icon'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout, appLanguage } = useBooking()
  const t = useTranslation(appLanguage)
  const [accountOpen, setAccountOpen] = useState(false)
  const slideRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (slideRef.current && !slideRef.current.contains(e.target)) setAccountOpen(false)
    }
    if (accountOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [accountOpen])

  useEffect(() => {
    if (accountOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [accountOpen])

  const handleLogout = () => { logout(); setAccountOpen(false); navigate('/') }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/home')}>
          <div className="brand-logo">
            <span className="brand-icon"><Train size={26} color="#00C853" strokeWidth={1.6}/></span>
            <div className="brand-text">
              <span className="brand-name">CMT Booking</span>
              <span className="brand-tagline">Connect My Train</span>
            </div>
          </div>
        </div>
        <div className="navbar-links">
          <Link to="/home" className="nav-link">{t('home')}</Link>
          <Link to="/bookings" className="nav-link">{t('bookings')}</Link>
          <Link to="/help" className="nav-link">{t('help')}</Link>
          <button className="nav-account-btn" onClick={() => setAccountOpen(true)}>
            <span className="account-icon"><User size={16} strokeWidth={2}/></span>
            <span>{user ? user.name.split(' ')[0] : 'Account'}</span>
            <span className="account-chevron"><ChevronRight size={14} strokeWidth={2.5}/></span>
          </button>
        </div>
      </nav>

      {accountOpen && <div className="account-overlay" onClick={() => setAccountOpen(false)} />}

      <div ref={slideRef} className={"account-drawer" + (accountOpen ? " drawer-open" : "")}>
        <div className="drawer-header">
          <h2 className="drawer-title">Account</h2>
          <button className="drawer-close" onClick={() => setAccountOpen(false)}><X size={16} strokeWidth={2.5}/></button>
        </div>

        <div className="drawer-content">
          <div className="drawer-user">
            <div className={"drawer-avatar" + (user ? " avatar-loggedin" : "")}>
              {user ? user.name.charAt(0).toUpperCase() : <User size={22} color="#aaa"/>}
            </div>
            <div className="drawer-user-info">
              <div className="drawer-user-name">{user ? user.name : 'Guest User'}</div>
              <div className="drawer-user-sub">
                {user ? user.phone ? '+91 ' + user.phone : user.email : 'Sign in to view your bookings'}
              </div>
            </div>
          </div>

          {!user && (
            <button className="drawer-signin-btn" onClick={() => { setAccountOpen(false); navigate('/login') }}>
              Sign In / Register
            </button>
          )}

          {user && (
            <div className="drawer-status-row">
              <div className={"dsr-item " + (user.aadhaarLinked ? 'dsr-linked' : 'dsr-pending')}>
                <Check size={12} strokeWidth={3}/> Aadhaar {user.aadhaarLinked ? 'Linked' : 'Not Linked'}
              </div>
              {user.irctcId && (
                <div className="dsr-item dsr-linked">
                  <Check size={12} strokeWidth={3}/> IRCTC: {user.irctcId}
                </div>
              )}
            </div>
          )}

          <div className="drawer-divider"/>
          <div className="drawer-section-title">My details</div>

          <div className="drawer-menu-item" onClick={() => { setAccountOpen(false); navigate('/bookings') }}>
            <span className="dmi-icon"><ClipboardList size={18}/></span>
            <span className="dmi-label">{t('bookings')}</span>
            <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
          </div>

          <div className="drawer-menu-item" onClick={() => { setAccountOpen(false); navigate('/settings') }}>
            <span className="dmi-icon"><User size={18}/></span>
            <span className="dmi-label">{t('profile')}</span>
            <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
          </div>

          <div className="drawer-divider"/>
          <div className="drawer-section-title">Payments</div>

          <div className="drawer-menu-item">
            <span className="dmi-icon"><Wallet size={18}/></span>
            <span className="dmi-label">Wallet</span>
            <span className="dmi-right-tag">₹0</span>
            <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
          </div>

          <div className="drawer-menu-item">
            <span className="dmi-icon"><CreditCard size={18}/></span>
            <span className="dmi-label">Saved Payment Methods</span>
            <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
          </div>

          <div className="drawer-divider"/>
          <div className="drawer-section-title">More</div>

          <div className="drawer-menu-item" onClick={() => { setAccountOpen(false); navigate('/help') }}>
            <span className="dmi-icon"><HelpCircle size={18}/></span>
            <span className="dmi-label">{t('help')}</span>
            <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
          </div>

          <div className="drawer-menu-item" onClick={() => { setAccountOpen(false); navigate('/link-aadhaar') }}>
            <span className="dmi-icon"><IdCard size={18}/></span>
            <span className="dmi-label">Link Aadhaar</span>
            {user?.aadhaarLinked
              ? <span className="dmi-right-tag dmi-green">Linked</span>
              : <span className="dmi-right-tag dmi-orange">Required</span>}
            <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
          </div>

          <div className="drawer-menu-item" onClick={() => { setAccountOpen(false); navigate('/settings') }}>
            <span className="dmi-icon"><Settings size={18}/></span>
            <span className="dmi-label">{t('settings')}</span>
            <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
          </div>

          <div className="drawer-divider"/>

          {user ? (
            <div className="drawer-menu-item dmi-logout" onClick={handleLogout}>
              <span className="dmi-icon"><LogOut size={18}/></span>
              <span className="dmi-label">Logout</span>
              <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
            </div>
          ) : (
            <div className="drawer-menu-item dmi-signin" onClick={() => { setAccountOpen(false); navigate('/login') }}>
              <span className="dmi-icon"><Key size={18}/></span>
              <span className="dmi-label">Sign In</span>
              <ChevronRight size={16} color="#ccc" strokeWidth={2}/>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <div className="drawer-footer-brand">
            <Train size={16} color="#00C853" style={{verticalAlign:'middle', marginRight:6}}/>
            CMT Booking
          </div>
          <div className="drawer-footer-sub">IRCTC Authorised Partner</div>
        </div>
      </div>
    </>
  )
}
