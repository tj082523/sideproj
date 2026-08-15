import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    api.listBookings().then((res) => setBookings(res.bookings)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function updateStatus(id, status) {
    try {
      await api.updateBooking(id, { status });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h2>Bookings</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card panel">
        {loading ? <p>Loading…</p> : bookings.length === 0 ? (
          <p className="empty-state">No bookings yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Customer</th><th>Service</th><th>When</th><th>Status</th><th>Update</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.customer_name}<br /><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{b.customer_email}</span></td>
                  <td>{b.service_name}</td>
                  <td>{b.booking_date} {b.booking_time}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>
                    <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}