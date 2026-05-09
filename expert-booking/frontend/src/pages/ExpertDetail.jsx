import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import './ExpertDetail.css';

function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useSocket();
  const [expert, setExpert] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveUpdate, setLiveUpdate] = useState(null);

  useEffect(() => {
    api.getExpertById(id)
      .then((res) => {
        setExpert(res.data);
        setSlotsByDate(res.data.slotsByDate || {});
        const firstDate = Object.keys(res.data.slotsByDate || {})[0];
        if (firstDate) setSelectedDate(firstDate);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Real-time socket subscription
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    socket.emit('join-expert-room', id);

    socket.on('slot-booked', ({ expertId, date, timeSlot, isBooked }) => {
      if (expertId !== id) return;

      setSlotsByDate((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = updated[date].map((s) =>
            s.time === timeSlot ? { ...s, isBooked } : s
          );
        }
        return updated;
      });

      setLiveUpdate(`Slot ${timeSlot} on ${date} was just booked!`);
      setTimeout(() => setLiveUpdate(null), 3000);
    });

    return () => {
      socket.emit('leave-expert-room', id);
      socket.off('slot-booked');
    };
  }, [id, socketRef]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const initials = expert?.name.split(' ').map(n => n[0]).join('').slice(0, 2) || '';

  if (loading) return (
    <div className="detail-page">
      <div className="container">
        <div className="detail-loading">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-block" style={{ height: i === 0 ? 120 : 40, width: i === 2 ? '60%' : '100%' }} />)}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="detail-page">
      <div className="container">
        <div className="error-state">⚠️ {error} <br /><button onClick={() => navigate(-1)}>← Go Back</button></div>
      </div>
    </div>
  );

  return (
    <div className="detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Experts</button>

        {liveUpdate && (
          <div className="live-toast">
            <span className="live-dot" /> {liveUpdate}
          </div>
        )}

        <div className="detail-layout">
          <div className="detail-left">
            <div className="expert-profile">
              <div className="detail-avatar">{initials}</div>
              <div className="profile-info">
                <h1>{expert.name}</h1>
                <span className="detail-category">{expert.category}</span>
                <div className="detail-rating">
                  <span className="stars-lg">{'★'.repeat(Math.floor(expert.rating))}{'☆'.repeat(5 - Math.floor(expert.rating))}</span>
                  <span>{expert.rating.toFixed(1)} ({expert.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>About</h3>
              <p>{expert.bio}</p>
            </div>

            <div className="detail-card">
              <h3>Expertise</h3>
              <div className="expertise-list">
                {expert.expertise?.map((e, i) => (
                  <span key={i} className="expertise-tag">{e}</span>
                ))}
              </div>
            </div>

            <div className="detail-stats">
              <div className="stat">
                <span className="stat-val">{expert.experience}</span>
                <span className="stat-label">Years Exp.</span>
              </div>
              <div className="stat">
                <span className="stat-val">₹{expert.hourlyRate.toLocaleString()}</span>
                <span className="stat-label">Per Hour</span>
              </div>
              <div className="stat">
                <span className="stat-val">{expert.reviewCount}+</span>
                <span className="stat-label">Sessions</span>
              </div>
            </div>
          </div>

          <div className="detail-right">
            <div className="slots-section">
              <div className="slots-header">
                <h2>Available Slots</h2>
                <span className="realtime-badge">⬤ Real-time</span>
              </div>

              {Object.keys(slotsByDate).length === 0 ? (
                <p className="no-slots">No available slots at the moment.</p>
              ) : (
                <>
                  <div className="date-tabs">
                    {Object.keys(slotsByDate).map((date) => (
                      <button
                        key={date}
                        className={`date-tab ${selectedDate === date ? 'active' : ''}`}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      >
                        {formatDate(date)}
                      </button>
                    ))}
                  </div>

                  {selectedDate && (
                    <div className="slots-grid">
                      {slotsByDate[selectedDate]?.map((slot) => (
                        <button
                          key={slot._id || slot.time}
                          className={`slot-btn ${slot.isBooked ? 'booked' : ''} ${selectedSlot === slot.time && !slot.isBooked ? 'selected' : ''}`}
                          disabled={slot.isBooked}
                          onClick={() => setSelectedSlot(slot.time)}
                        >
                          {slot.time}
                          {slot.isBooked && <span className="booked-label">Booked</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    className="btn-proceed"
                    disabled={!selectedDate || !selectedSlot}
                    onClick={() => navigate(`/book/${id}`, {
                      state: { expert, date: selectedDate, timeSlot: selectedSlot }
                    })}
                  >
                    {selectedSlot ? `Book ${selectedSlot} on ${formatDate(selectedDate)} →` : 'Select a time slot to continue'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertDetail;
