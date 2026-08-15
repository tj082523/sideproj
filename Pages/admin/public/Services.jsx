import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listServices()
      .then((res) => setServices(res.services))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="section-title" style={{ marginTop: 48 }}>
        <div>
          <h2>All services</h2>
          <p>Pick something and book a time in the next step.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Loading services…</p>}

      {!loading && services.length === 0 && (
        <div className="empty-state">No services are available right now. Check back soon.</div>
      )}

      <div className="service-grid">
        {services.map((s) => (
          <div className="card service-card" key={s.id}>
            {s.category && <span className="cat">{s.category}</span>}
            <h3>{s.name}</h3>
            <p className="desc">{s.description}</p>
            <div className="meta">
              <span className="price">${Number(s.price).toFixed(2)}</span>
              <span className="duration">{s.duration_minutes} min</span>
            </div>
            <Link to={`/book/${s.id}`} className="btn btn-primary" style={{ marginTop: 14 }}>
              Book now
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}