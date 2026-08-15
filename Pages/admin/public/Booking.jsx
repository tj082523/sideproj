import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';

export default function Booking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [form, setForm] = useState({ booking_date: '', booking_time: '', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getService(serviceId).then((res) => setService(res.service)).catch((e) => setError(e.message));
  }, [serviceId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setBusy(true);
    try {
      await api.createBooking({ service_id: Number(serviceId), ...form });
      setSuccess('Booking confirmed! Redirecting to your bookings…');
      setTimeout(() => navigate('/my-bookings'), 1200);
    } catch (err) {
      if (err.message === 'Not authenticated') {
        navigate('/login', { state: { from: { pathname: `/book/${serviceId}` } } });
        return;
      }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!service && !error) return <p style={{ padding: '48px 0' }}>Loading…</p>;
  if (error && !service) return <div className="alert alert-error" style={{ marginTop: 40 }}>{error}</div>;

  return (
    <div className="booking-layout">
      <form className="card booking-form" onSubmit={handleSubmit}>
        <h2>Book: {service.name}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" required value={form.booking_date}
            onChange={(e) => setForm({ ...form, booking_date: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="time">Time</label>
          <input id="time" type="time" required value={form.booking_time}
            onChange={(e) => setForm({ ...form, booking_time: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" rows={3} value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Booking…' : 'Confirm booking'}
        </button>
      </form>

      <aside className="card summary-card">
        <h4>Summary</h4>
        <div className="summary-row"><span>Service</span><strong>{service.name}</strong></div>
        <div className="summary-row"><span>Duration</span><strong>{service.duration_minutes} min</strong></div>
        <div className="summary-row"><span>Price</span><strong>${Number(service.price).toFixed(2)}</strong></div>
      </aside>
    </div>
  );
}
