import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicNavbar() {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <header className="public-nav">
        <Link to="/" className="brand">Booqly</Link>
        <nav>
          <NavLink to="/services" className={({ isActive }) => isActive ? 'active' : ''}>Services</NavLink>
          {user ? (
            <>
              <NavLink to="/my-bookings">My Bookings</NavLink>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </nav>
      </header>
    </div>
  );
}