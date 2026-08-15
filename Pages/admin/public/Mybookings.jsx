import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    api.listBookings().then((res) => setBookings(res.bookings)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function cancel(id) {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.updateBooking(id, { status: 'cancelled' });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{ padding: '40px 0 64px' }}>
      <h2>My bookings</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Loading…</p>}

      {!loading && bookings.length === 0 && (
        <div className="empty-state card" style={{ marginTop: 16 }}>
          <p>You haven't booked anything yet.</p>
          <Link to="/services" className="btn btn-primary" style={{ marginTop: 12 }}>Browse services</Link>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="card" style={{ padding: '4px 24px', marginTop: 16 }}>
          {bookings.map((b) => (
            <div className="booking-row" key={b.id}>
              <div className="info">
                <h4>{b.service_name}</h4>
                <div className="when">{b.booking_date} at {b.booking_time}</div>
              </div>
              <div className="right">
                <span className={`badge badge-${b.status}`}>{b.status}</span>
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <button className="btn btn-ghost btn-sm" onClick={() => cancel(b.id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}