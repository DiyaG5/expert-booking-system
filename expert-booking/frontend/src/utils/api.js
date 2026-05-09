const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const message = data.message || data.errors?.[0]?.msg || 'Something went wrong';
    throw new Error(message);
  }
  return data;
};

export const api = {
  getExperts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/experts?${query}`).then(handleResponse);
  },

  getExpertById: (id) =>
    fetch(`${BASE_URL}/experts/${id}`).then(handleResponse),

  createBooking: (data) =>
    fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getBookingsByEmail: (email) =>
    fetch(`${BASE_URL}/bookings?email=${encodeURIComponent(email)}`).then(handleResponse),

  updateBookingStatus: (id, status) =>
    fetch(`${BASE_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(handleResponse),
};
