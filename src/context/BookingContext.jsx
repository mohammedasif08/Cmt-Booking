import { createContext, useContext, useState, useEffect } from 'react'
import { createBooking, cancelBookingByPNR } from '../api'

const BookingContext = createContext()

export const BookingProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState({ from: '', to: '', date: '' })
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [passengers, setPassengers] = useState([])
  const [totalFare, setTotalFare] = useState(0)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [cancelledPNRs, setCancelledPNRs] = useState([])

  // Preserve passenger form state across auth redirect
  const [pendingPassengerData, setPendingPassengerData] = useState(null)

  const [user, setUser] = useState(null)

  // ── Global App Settings ──────────────────────────────────────────────────
  const [appTheme, setAppTheme] = useState('light')       // 'light' | 'dark' | 'system'
  const [appLanguage, setAppLanguage] = useState('English')
  const [emailNotifications, setEmailNotifications] = useState(true)

  // Apply theme to document
  useEffect(() => {
    const applyTheme = (t) => {
      document.documentElement.setAttribute('data-theme', t)
      if (t === 'dark') {
        document.documentElement.classList.add('dark-mode')
        document.documentElement.classList.remove('light-mode')
      } else {
        document.documentElement.classList.add('light-mode')
        document.documentElement.classList.remove('dark-mode')
      }
    }

    if (appTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark ? 'dark' : 'light')
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) => applyTheme(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      applyTheme(appTheme)
    }
  }, [appTheme])

  // Apply language as data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-language', appLanguage)
  }, [appLanguage])

  const login = (userData) => setUser(userData)
  const logout = () => setUser(null)

  /**
   * confirmBookingWithAPI — calls the backend to create booking and lock seats.
   * Returns the booking object from the API (contains pnr, status, passengers).
   * Falls back gracefully if the backend is unreachable.
   */
  const confirmBookingWithAPI = async ({ trainId, journeyDate, travelClass, totalFareAmt, passengerList }) => {
    const payload = {
      train_id: trainId,
      journey_date: journeyDate || new Date().toISOString().split('T')[0],
      travel_class: travelClass,
      total_fare: totalFareAmt,
      passengers: passengerList.map(p => ({
        name: p.name,
        age: p.age || 0,
        gender: p.gender || 'M',
        seat_number: String(p.seatNum),
        coach: p.coach || 'S1',
      })),
    }
    try {
      const result = await createBooking(payload)
      return { success: true, pnr: result.pnr, data: result }
    } catch (err) {
      console.warn('[CMT] Backend booking failed, running offline mode:', err.message)
      // Offline fallback — seats won't be locked in DB but UI still works
      return { success: false, pnr: null, data: null }
    }
  }

  /**
   * cancelBooking — marks cancelled in local state AND calls backend to unlock seats.
   */
  const cancelBooking = async (pnr) => {
    setCancelledPNRs(prev => [...prev, pnr])
    try {
      await cancelBookingByPNR(pnr)
      console.log(`[CMT] Booking ${pnr} cancelled — seats unlocked on backend`)
    } catch (err) {
      console.warn(`[CMT] Backend cancel failed for PNR ${pnr}:`, err.message)
      // Still mark as cancelled in UI even if backend is down
    }
  }

  const isBookingCancelled = (pnr) => cancelledPNRs.includes(pnr)

  // Simulate sending booking confirmation email
  const sendBookingEmail = (bookingData) => {
    if (!emailNotifications || !user?.email) return
    console.log(`[CMT Email] Booking confirmation sent to ${user.email}`, bookingData)
    // In production: call your email API here
  }

  return (
    <BookingContext.Provider value={{
      searchQuery, setSearchQuery,
      selectedTrain, setSelectedTrain,
      selectedClass, setSelectedClass,
      selectedSeats, setSelectedSeats,
      passengers, setPassengers,
      totalFare, setTotalFare,
      bookingDetails, setBookingDetails,
      cancelBooking, isBookingCancelled,
      confirmBookingWithAPI,
      pendingPassengerData, setPendingPassengerData,
      user, login, logout,
      appTheme, setAppTheme,
      appLanguage, setAppLanguage,
      emailNotifications, setEmailNotifications,
      sendBookingEmail,
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => useContext(BookingContext)
