import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import SeatSelection from './pages/SeatSelection'
import PassengerDetails from './pages/PassengerDetails'
import BookingConfirmation from './pages/BookingConfirmation'
import PNRStatus from './pages/PNRStatus'
import LiveStatus from './pages/LiveStatus'
import HelpPage from './pages/HelpPage'
import BookingsPage from './pages/BookingsPage'
import AuthPage from './pages/AuthPage'
import LinkAadhaar from './pages/LinkAadhaar'
import SettingsPage from './pages/SettingsPage'
import './App.css'

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/train/:trainId/seats" element={<SeatSelection />} />
          <Route path="/passenger-details" element={<PassengerDetails />} />
          <Route path="/confirmation" element={<BookingConfirmation />} />
          <Route path="/pnr-status" element={<PNRStatus />} />
          <Route path="/live-status" element={<LiveStatus />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/link-aadhaar" element={<LinkAadhaar />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </BookingProvider>
  )
}
