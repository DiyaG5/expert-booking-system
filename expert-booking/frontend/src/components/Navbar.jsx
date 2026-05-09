import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name">ExpertConnect</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Experts
          </Link>
          <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
            My Bookings
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
