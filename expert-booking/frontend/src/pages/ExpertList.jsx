import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './ExpertList.css';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Health', 'Legal', 'Marketing', 'Education', 'Design', 'Business'];

function StarRating({ rating }) {
  return (
    <span className="stars">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span className="rating-val">{rating.toFixed(1)}</span>
    </span>
  );
}

function ExpertCard({ expert, onClick }) {
  const initials = expert.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = ['#7c6af7', '#f0b429', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6'];
  const color = colors[expert.name.charCodeAt(0) % colors.length];

  return (
    <div className="expert-card" onClick={onClick}>
      <div className="card-header">
        <div className="avatar" style={{ background: `linear-gradient(135deg, ${color}33, ${color}66)`, border: `2px solid ${color}44` }}>
          <span style={{ color }}>{initials}</span>
        </div>
        <div className="card-badge">{expert.category}</div>
      </div>
      <div className="card-body">
        <h3 className="expert-name">{expert.name}</h3>
        <p className="expert-bio">{expert.bio}</p>
        <div className="expert-tags">
          {expert.expertise?.slice(0, 3).map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <div className="meta-row">
          <StarRating rating={expert.rating} />
          <span className="review-count">({expert.reviewCount})</span>
        </div>
        <div className="meta-row">
          <span className="experience">{expert.experience} yrs exp</span>
          <span className="rate">₹{expert.hourlyRate.toLocaleString()}/hr</span>
        </div>
        <button className="btn-book">Book Session →</button>
      </div>
    </div>
  );
}

function ExpertList() {
  const [experts, setExperts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 6, category };
      if (search.trim()) params.search = search.trim();
      const res = await api.getExperts(params);
      setExperts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load experts');
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    const timer = setTimeout(fetchExperts, 300);
    return () => clearTimeout(timer);
  }, [fetchExperts]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="expert-list-page">
      <div className="container">
        <div className="page-hero">
          <h1>Find Your <em>Expert</em></h1>
          <p>Connect with world-class professionals across every domain</p>
        </div>

        <div className="search-bar">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by name, expertise..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
          {search && (
            <button className="clear-search" onClick={() => { setSearch(''); setPage(1); }}>×</button>
          )}
        </div>

        <div className="category-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-avatar" />
                <div className="skeleton-line w60" />
                <div className="skeleton-line w80" />
                <div className="skeleton-line w40" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button className="btn-retry" onClick={fetchExperts}>Try Again</button>
          </div>
        ) : experts.length === 0 ? (
          <div className="empty-state">
            <p>No experts found. Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="results-info">
              Showing {experts.length} of {pagination.total} experts
            </div>
            <div className="experts-grid">
              {experts.map((expert) => (
                <ExpertCard
                  key={expert._id}
                  expert={expert}
                  onClick={() => navigate(`/experts/${expert._id}`)}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage(p => p - 1)}
                >← Prev</button>
                <div className="page-numbers">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`page-num ${page === i + 1 ? 'active' : ''}`}
                      onClick={() => setPage(i + 1)}
                    >{i + 1}</button>
                  ))}
                </div>
                <button
                  className="page-btn"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage(p => p + 1)}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExpertList;
