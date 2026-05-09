import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './BookingPage.css';

function BookingPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { expert, date, timeSlot } = location.state || {};

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  if (!expert || !date || !timeSlot) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="error-state">
            <p>Invalid booking session. Please select a slot first.</p>
            <button onClick={() => navigate('/')}>← Browse Experts</button>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!form.clientName.trim() || form.clientName.trim().length < 2)
      errs.clientName = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.clientEmail))
      errs.clientEmail = 'Enter a valid email address';
    if (!/^\+?[\d\s\-()]{7,15}$/.test(form.clientPhone))
      errs.clientPhone = 'Enter a valid phone number';
    if (form.notes.length > 500)
      errs.notes = 'Notes cannot exceed 500 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      await api.createBooking({
        expertId: id,
        ...form,
        date,
        timeSlot,
      });
      setSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (success) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <p>Your session with <strong>{expert.name}</strong> has been booked.</p>
            <div className="booking-summary">
              <div className="summary-row"><span>Date</span><strong>{formatDate(date)}</strong></div>
              <div className="summary-row"><span>Time</span><strong>{timeSlot}</strong></div>
              <div className="summary-row"><span>Expert</span><strong>{expert.name}</strong></div>
              <div className="summary-row"><span>Category</span><strong>{expert.category}</strong></div>
            </div>
            <div className="success-actions">
              <button className="btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
              <button className="btn-secondary" onClick={() => navigate('/')}>Browse More Experts</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="booking-layout">
          <div className="booking-form-section">
            <h1>Complete Your Booking</h1>
            <p className="form-subtitle">Fill in your details to confirm the session</p>

            {apiError && (
              <div className="api-error">⚠️ {apiError}</div>
            )}

            <div className="form-group">
              <label>Full Name <span className="required">*</span></label>
              <input
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={errors.clientName ? 'error' : ''}
              />
              {errors.clientName && <span className="field-error">{errors.clientName}</span>}
            </div>

            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <input
                name="clientEmail"
                type="email"
                value={form.clientEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                className={errors.clientEmail ? 'error' : ''}
              />
              {errors.clientEmail && <span className="field-error">{errors.clientEmail}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input
                name="clientPhone"
                value={form.clientPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={errors.clientPhone ? 'error' : ''}
              />
              {errors.clientPhone && <span className="field-error">{errors.clientPhone}</span>}
            </div>

            <div className="form-group">
              <label>Session Notes <span className="optional">(optional)</span></label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="What would you like to discuss? Any specific topics or questions..."
                rows={4}
                className={errors.notes ? 'error' : ''}
              />
              <div className="char-count">{form.notes.length}/500</div>
              {errors.notes && <span className="field-error">{errors.notes}</span>}
            </div>

            <button
              className="btn-confirm"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>

          <div className="booking-sidebar">
            <div className="session-summary">
              <h3>Session Summary</h3>
              <div className="summary-expert">
                <div className="summary-avatar">
                  {expert.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="summary-name">{expert.name}</div>
                  <div className="summary-cat">{expert.category}</div>
                </div>
              </div>
              <div className="summary-details">
                <div className="summary-row">
                  <span>📅 Date</span>
                  <strong>{formatDate(date)}</strong>
                </div>
                <div className="summary-row">
                  <span>🕐 Time</span>
                  <strong>{timeSlot}</strong>
                </div>
                <div className="summary-row">
                  <span>⏱ Duration</span>
                  <strong>60 minutes</strong>
                </div>
                <div className="summary-row total">
                  <span>💳 Total</span>
                  <strong>₹{expert.hourlyRate.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
