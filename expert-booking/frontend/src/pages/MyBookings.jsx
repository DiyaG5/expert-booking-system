import { useState } from 'react';
import { api } from '../utils/api';
import './MyBookings.css';

const STATUS_COLORS = {
  pending: { bg: 'rgba(240,180,41,0.1)', border: '#f0b429', text: '#f0b429' },
  confirmed: { bg: 'rgba(59,130,246,0.1)', border: '#3b82f6', text: '#60a5fa' },
  completed: { bg: 'rgba(16,185,129,0.1)', border: '#10b981', text: '#34d399' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', text: '#fca5a5' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span className="status-badge" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const res = await api.getBookingsByEmail(email);
      setBookings(res.data);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  const formatCreated = (d) => new Date(d).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header">
          <h1>My <em>Bookings</em></h1>
          <p>Enter your email to view all your expert sessions</p>
        </div>

        <div className="email-search-section">
          <div className="email-search-box">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Enter your email address"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className={error ? 'error' : ''}
            />
            <button className="btn-search" onClick={handleSearch} disabled={loading}>
              {loading ? '...' : 'Find Bookings'}
            </button>
          </div>
          {error && <p className="email-error">⚠️ {error}</p>}
        </div>

        {loading && (
          <div className="bookings-loading">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-booking" />
            ))}
          </div>
        )}

        {!loading && searched && bookings.length === 0 && (
          <div className="empty-bookings">
            <div className="empty-icon">📅</div>
            <h3>No bookings found</h3>
            <p>No sessions booked with this email address. <br />Start by browsing our experts!</p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <>
            <div className="bookings-count">{bookings.length} booking{bookings.length > 1 ? 's' : ''} found</div>
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-card-left">
                    <div className="booking-expert-initial">
                      {booking.expertName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  </div>
                  <div className="booking-card-body">
                    <div className="booking-top">
                      <div>
                        <h3 className="booking-expert-name">{booking.expertName}</h3>
                        <p className="booking-created">Booked on {formatCreated(booking.createdAt)}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="booking-details">
                      <span className="booking-detail">📅 {formatDate(booking.date)}</span>
                      <span className="booking-detail">🕐 {booking.timeSlot}</span>
                      <span className="booking-detail">👤 {booking.clientName}</span>
                    </div>
                    {booking.notes && (
                      <p className="booking-notes">"{booking.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
