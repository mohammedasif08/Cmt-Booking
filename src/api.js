const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const searchTrains = async (from, to) => {
  const response = await fetch(`${BASE_URL}/search/?from=${from}&to=${to}`);
  return response.json();
};

export const getAllTrains = async () => {
  const response = await fetch(`${BASE_URL}/trains/`);
  return response.json();
};

export const getTrainById = async (trainId) => {
  const response = await fetch(`${BASE_URL}/trains/${trainId}/`);
  return response.json();
};

/**
 * Create a booking — also locks the seats on the backend.
 * @param {Object} payload - { train_id, journey_date, travel_class, total_fare, passengers }
 *   passengers: [{ name, age, gender, seat_number, coach }]
 */
export const createBooking = async (payload) => {
  const response = await fetch(`${BASE_URL}/bookings/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Booking failed');
  }
  return response.json();
};

/**
 * Cancel a booking by PNR — also unlocks the seats on the backend.
 */
export const cancelBookingByPNR = async (pnr) => {
  const response = await fetch(`${BASE_URL}/bookings/${pnr}/cancel/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Cancellation failed');
  }
  return response.json();
};

/**
 * Fetch booking info by PNR.
 */
export const getBookingByPNR = async (pnr) => {
  const response = await fetch(`${BASE_URL}/bookings/${pnr}/`);
  if (!response.ok) throw new Error('PNR not found');
  return response.json();
};
