import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/users', label: 'Users' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <span className="brand">Booqly Admin</span>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => isActive ? 'active' : ''}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="signout" onClick={logout}>Sign out</button>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <div />
          <div className="who">Signed in as <strong>{user?.name}</strong></div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
