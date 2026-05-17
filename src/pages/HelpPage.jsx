import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Train, Home, Ticket, ClipboardList, Search, User, Settings, Bell, Lock, Shield, CreditCard, Wallet, Phone, Mail, HelpCircle, IdCard, LogOut, Key, Download, MapPin, Calendar, ChevronRight, ChevronDown, ChevronUp, X, CheckCircle, Check, AlertTriangle, Info, Zap, ArrowRight, ArrowLeft, Activity, Clock, FileText, Navigation, Radio, XCircle, RefreshCw, Star, Users } from '../components/Icon'
import './HelpPage.css'

const FAQ_CATEGORIES = [
  {
    id: 'booking',
    icon: <Ticket size={22} strokeWidth={1.5}/>,
    label: 'Booking',
    faqs: [
      { q: 'How do I book a train ticket on CMT Booking?', a: 'Go to the Home page, enter your From and To stations, pick a date, and hit Search Trains. Browse the results, pick a train, choose your seats on the visual coach map, fill in passenger details, and confirm your booking.' },
      { q: 'How many passengers can I add in one booking?', a: 'You can add up to 6 passengers in a single transaction.' },
      { q: 'How will I know my booking is confirmed?', a: 'After payment, a confirmation screen with your PNR number appears instantly. An email and SMS are also sent to your registered contact details.' },
      { q: 'Can I choose specific berths?', a: 'Yes — use the visual seat map on the Seat Selection page to click and choose berths (Lower, Middle, Upper, Side-Lower, Side-Upper) individually.' },
    ]
  },
  {
    id: 'journey',
    icon: <Train size={22} strokeWidth={1.5}/>,
    label: 'Journey',
    faqs: [
      { q: 'What ID proof is required during travel?', a: 'Carry any one government-issued photo ID: Aadhaar Card, Passport, Voter ID, PAN Card, or Driving License. The name must match your ticket.' },
      { q: 'Can I travel on a Waitlisted ticket?', a: 'No — a waitlisted (WL) ticket does not entitle you to board. Only CNF (Confirmed) or RAC tickets allow travel. Check your PNR status before your journey.' },
      { q: 'How early should I reach the station?', a: 'Arrive at least 30 minutes before departure. For major stations like Delhi, Mumbai, or Chennai, we recommend 45–60 minutes.' },
      { q: 'Is e-ticket on phone accepted?', a: 'Yes, a digital copy on your phone is fully valid. You can also download a PDF from My Bookings.' },
    ]
  },
  {
    id: 'cancellation',
    icon: null,
    label: 'Cancellation',
    faqs: [
      { q: 'How do I cancel my ticket?', a: 'Go to My Bookings, open the booking, and tap Cancel Ticket. Refund will be credited after applicable charges.' },
      { q: 'What are the cancellation charges?', a: 'More than 48 hrs before departure: flat ₹60–240 per person (by class). 12–48 hrs: 25% of fare. 4–12 hrs: 50% of fare. Under 4 hrs or after chart preparation: no refund.' },
      { q: 'When will my refund arrive?', a: 'Refunds typically reach your account in 3–7 working days, depending on your bank or payment method.' },
      { q: 'Can I cancel individual passengers from a group booking?', a: 'Yes, you can do a partial cancellation. Open the booking, select specific passengers, and cancel only those passengers.' },
    ]
  },
  {
    id: 'tdr',
    icon: <FileText size={22} strokeWidth={1.5}/>,
    label: 'TDR',
    faqs: [
      { q: 'What is a TDR?', a: 'TDR (Ticket Deposit Receipt) is filed when you were unable to travel due to reasons outside your control — such as train cancellation, the train running over 3 hours late, or being denied boarding.' },
      { q: 'How do I file a TDR?', a: 'Open the affected booking in My Bookings and select File TDR. Choose the reason, submit, and IRCTC will review and process your refund.' },
      { q: 'How long does a TDR refund take?', a: 'TDR refunds typically take 60–90 days to process after filing, as they go through IRCTC verification.' },
    ]
  },
  {
    id: 'free-cancellation',
    icon: <Shield size={22} strokeWidth={1.5}/>,
    label: 'Free Cancellation',
    faqs: [
      { q: 'What is the Free Cancellation add-on?', a: 'For ₹110 per passenger at the time of booking, you get full fare protection — cancel anytime before chart preparation and receive a complete refund with zero deductions.' },
      { q: 'When must I use Free Cancellation?', a: 'You must cancel before chart preparation, which happens roughly 4 hours before departure. After the chart is prepared, the standard IRCTC rules apply.' },
      { q: 'Is the ₹110 fee also refunded?', a: 'No — the ₹110 add-on fee itself is non-refundable. Only the base ticket fare is fully refunded.' },
    ]
  },
  {
    id: 'refund',
    icon: <CreditCard size={22} strokeWidth={1.5}/>,
    label: 'Refunds',
    faqs: [
      { q: 'How long does a refund take?', a: 'Standard cancellations: 3–7 working days. UPI and Net Banking are usually faster (2–3 days), while Credit/Debit cards may take the full 7 days.' },
      { q: 'Where does the refund go?', a: 'The refund is credited to the original payment method used during booking — UPI, card, net banking, or wallet.' },
      { q: 'I cancelled but haven\'t received my refund. What should I do?', a: 'If it has been more than 7 working days, contact our support team with your PNR number and we will investigate immediately.' },
    ]
  },
  {
    id: 'account',
    icon: <User size={22} strokeWidth={1.5}/>,
    label: 'Account & Login',
    faqs: [
      { q: 'Do I need an IRCTC account to book?', a: 'Yes — CMT Booking is an IRCTC Authorised Partner, so you need a valid IRCTC username and password to complete a booking.' },
      { q: 'Why is my IRCTC login failing?', a: 'IRCTC usernames are case-sensitive. Make sure Caps Lock is off and you are entering the exact username you registered with IRCTC.' },
      { q: 'Is my data safe on CMT Booking?', a: 'Yes. All transactions use 256-bit SSL encryption. We never store your payment details or IRCTC password.' },
      { q: 'Do I need to link my Aadhaar?', a: 'Aadhaar linking with your IRCTC account is mandatory for Tatkal bookings from July 2024. For regular quota bookings it is optional.' },
    ]
  },
  {
    id: 'general',
    icon: <HelpCircle size={22} strokeWidth={1.5}/>,
    label: 'General',
    faqs: [
      { q: 'Is CMT Booking an official IRCTC partner?', a: 'Yes. Connect My Train (CMT) is an IRCTC Authorised Partner. All tickets are booked through the official IRCTC system.' },
      { q: 'What payment methods are accepted?', a: 'UPI, Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking, and major wallets are all supported.' },
      { q: 'How do I contact customer support?', a: 'Use the Live Chat, email us at support@cmtbooking.in, or call our toll-free number 1800-XXX-XXXX. Support is available 24/7.' },
    ]
  },
]

export default function HelpPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('booking')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLiveChat, setShowLiveChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { from: 'agent', text: 'Hi! Welcome to CMT Booking Support 👋 How can I help you today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatTyping, setChatTyping] = useState(false)
  const chatEndRef = useRef(null)

  const agentReplies = [
    'Sure, I can help with that! Could you share your PNR number?',
    'Let me check that for you. One moment please.',
    'I understand your concern. Our team will resolve this within 24 hours.',
    'Your booking is confirmed. Is there anything else you need help with?',
    'For refunds, please allow 5–7 working days after cancellation.',
    'You can track your train status on the Live Status page.',
  ]

  const sendChatMessage = () => {
    const msg = chatInput.trim()
    if (!msg) return
    setChatMessages(prev => [...prev, { from: 'user', text: msg }])
    setChatInput('')
    setChatTyping(true)
    setTimeout(() => {
      const reply = agentReplies[Math.floor(Math.random() * agentReplies.length)]
      setChatMessages(prev => [...prev, { from: 'agent', text: reply }])
      setChatTyping(false)
    }, 1400)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatTyping])

  const activeCat = FAQ_CATEGORIES.find(c => c.id === activeCategory)

  // filtered FAQs by search
  const filteredFaqs = searchTerm.trim().length > 1
    ? FAQ_CATEGORIES.flatMap(c => c.faqs.filter(f =>
        f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.a.toLowerCase().includes(searchTerm.toLowerCase())
      ).map(f => ({ ...f, category: c.label })))
    : null

  return (
    <div className="help-page">
      <Navbar />

      {/* TOP SECTION */}
      <div className="help-top">
        <div className="help-top-inner">
          <button className="help-back" onClick={() => navigate('/')}>← Back to Home</button>
          <div className="help-top-content">
            <div className="help-top-left">
              <div className="help-icon-badge"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg></div>
              <h1>How can we help you?</h1>
              <p>Search our help articles or browse topics below</p>
              <div className="help-search-wrap">
                <span className="hs-icon"><Search size={18} strokeWidth={1.8}/></span>
                <input
                  className="help-search"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setExpandedFaq(null) }}
                />
                {searchTerm && (
                  <button className="hs-clear" onClick={() => setSearchTerm('')}><X size={14} strokeWidth={2.5}/></button>
                )}
              </div>
            </div>
            <div className="help-support-cards">
              <a className="hsc-item" href="mailto:support@cmtbooking.in">
                <span className="hsc-icon"><Mail size={20} strokeWidth={1.5} color="#00C853"/></span>
                <div>
                  <div className="hsc-title">Email Support</div>
                  <div className="hsc-desc">support@cmtbooking.in</div>
                </div>
              </a>
              <a className="hsc-item" href="tel:1800XXXXXXX">
                <span className="hsc-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.07 2.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></span>
                <div>
                  <div className="hsc-title">Call Us</div>
                  <div className="hsc-desc">1800-XXX-XXXX · 24/7</div>
                </div>
              </a>
              <div className="hsc-item" style={{cursor:'pointer'}} onClick={() => setShowLiveChat(true)}>
                <span className="hsc-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></span>
                <div>
                  <div className="hsc-title">Live Chat</div>
                  <div className="hsc-desc">Chat with an agent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="help-body">

        {/* SEARCH RESULTS */}
        {filteredFaqs && (
          <div className="help-search-results">
            <div className="hsr-header">
              <span>Showing {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for "<strong>{searchTerm}</strong>"</span>
            </div>
            {filteredFaqs.length === 0 ? (
              <div className="hsr-empty">
                <div><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
                <h3>No results found</h3>
                <p>Try different keywords or browse the categories below.</p>
                <button className="hsr-reset" onClick={() => setSearchTerm('')}>Clear search</button>
              </div>
            ) : (
              <div className="faq-list">
                {filteredFaqs.map((faq, i) => (
                  <div key={i} className={"faq-item" + (expandedFaq === 's' + i ? ' faq-open' : '')}>
                    <div className="faq-q" onClick={() => setExpandedFaq(expandedFaq === 's' + i ? null : 's' + i)}>
                      <div className="faq-q-left">
                        <span className="faq-cat-tag">{faq.category}</span>
                        <span>{faq.q}</span>
                      </div>
                      <span className="faq-toggle">{expandedFaq === 's' + i ? '−' : '+'}</span>
                    </div>
                    {expandedFaq === 's' + i && <div className="faq-a">{faq.a}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CATEGORY TABS + FAQ */}
        {!filteredFaqs && (
          <div className="help-main-area">
            {/* CATEGORY PILLS */}
            <div className="help-cat-pills">
              {FAQ_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={"cat-pill" + (activeCategory === cat.id ? ' pill-active' : '')}
                  onClick={() => { setActiveCategory(cat.id); setExpandedFaq(null) }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* FAQ LIST */}
            <div className="help-faq-area">
              <div className="hfa-header">
                <span className="hfa-icon">{activeCat?.icon}</span>
                <h2>{activeCat?.label}</h2>
                <span className="hfa-count">{activeCat?.faqs.length} articles</span>
              </div>

              <div className="faq-list">
                {activeCat?.faqs.map((faq, i) => (
                  <div key={i} className={"faq-item" + (expandedFaq === i ? ' faq-open' : '')}>
                    <div className="faq-q" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                      <span>{faq.q}</span>
                      <span className="faq-toggle">{expandedFaq === i ? '−' : '+'}</span>
                    </div>
                    {expandedFaq === i && <div className="faq-a">{faq.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STILL NEED HELP */}
        <div className="help-still-stuck">
          <div className="hss-inner">
            <div className="hss-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
            <h3>Still need help?</h3>
            <p>Our support team is available 24/7. We typically respond within a few minutes.</p>
            <div className="hss-actions">
              <button className="hss-btn hss-primary" onClick={() => setShowLiveChat(true)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:"middle",marginRight:6}}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Start Live Chat</button>
              <a className="hss-btn hss-outline" href="mailto:support@cmtbooking.in"><Mail size={14} style={{verticalAlign:"middle",marginRight:5}}/>Send Email</a>
            </div>
          </div>
        </div>

      </div>

      {/* ── Live Chat Modal ─────────────────────────────────────────── */}
      {showLiveChat && (
        <div className="live-chat-overlay" onClick={() => setShowLiveChat(false)}>
          <div className="live-chat-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="lc-header">
              <div className="lc-agent-info">
                <div className="lc-avatar">S</div>
                <div>
                  <div className="lc-agent-name">CMT Support</div>
                  <div className="lc-status"><span className="lc-dot"/>Online · Typically replies instantly</div>
                </div>
              </div>
              <button className="lc-close" onClick={() => setShowLiveChat(false)}>
                <X size={18}/>
              </button>
            </div>

            {/* Messages */}
            <div className="lc-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`lc-msg lc-msg-${msg.from}`}>
                  {msg.from === 'agent' && <div className="lc-msg-avatar">S</div>}
                  <div className="lc-bubble">{msg.text}</div>
                </div>
              ))}
              {chatTyping && (
                <div className="lc-msg lc-msg-agent">
                  <div className="lc-msg-avatar">S</div>
                  <div className="lc-bubble lc-typing">
                    <span/><span/><span/>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>

            {/* Input */}
            <div className="lc-input-row">
              <input
                className="lc-input"
                placeholder="Type your message…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
              />
              <button className="lc-send" onClick={sendChatMessage} disabled={!chatInput.trim()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
