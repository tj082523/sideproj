import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <p>Loading…</p>;

  const { stats, recent_bookings } = data;
  const cards = [
    { label: 'Active customers', value: stats.total_customers },
    { label: 'Users in trash', value: stats.trashed_users },
    { label: 'Active services', value: stats.total_services },
    { label: 'Total bookings', value: stats.total_bookings },
    { label: 'Pending bookings', value: stats.pending_bookings },
    { label: 'Revenue (completed)', value: `$${Number(stats.revenue_completed).toFixed(2)}` },
  ];

  return (
    <>
      <h2>Overview</h2>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="card stat-card" key={c.label}>
            <div className="label">{c.label}</div>
            <div className="value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card panel">
        <div className="panel-head"><h3>Recent bookings</h3></div>
        {recent_bookings.length === 0 ? (
          <p className="empty-state">No bookings yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Customer</th><th>Service</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recent_bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.customer_name}</td>
                  <td>{b.service_name}</td>
                  <td>{b.booking_date} {b.booking_time}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}