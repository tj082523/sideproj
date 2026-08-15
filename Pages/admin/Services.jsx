import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const EMPTY = { name: '', description: '', category: '', price: '', duration_minutes: 60, is_active: true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    api.listServices(true).then((res) => setServices(res.services)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function edit(s) {
    setEditingId(s.id);
    setForm({ ...s, price: s.price, is_active: !!s.is_active });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateService(editingId, form);
      } else {
        await api.createService(form);
      }
      resetForm();
      load();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this service permanently?')) return;
    try {
      await api.deleteService(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h2>Services</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card panel">
        <div className="panel-head"><h3>{editingId ? 'Edit service' : 'Add a new service'}</h3></div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <div className="field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Category</label>
            <input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label>Price (USD)</label>
            <input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="field">
            <label>Duration (minutes)</label>
            <input type="number" required value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </div>
          <div className="field">
            <label>
              <input type="checkbox" checked={!!form.is_active} style={{ width: 'auto', marginRight: 8 }}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Visible to customers
            </label>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-primary" type="submit">{editingId ? 'Save changes' : 'Add service'}</button>
            {editingId && <button className="btn btn-ghost" type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card panel">
        <div className="panel-head"><h3>All services</h3></div>
        {loading ? <p>Loading…</p> : (
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.category}</td>
                  <td>${Number(s.price).toFixed(2)}</td>
                  <td>{s.is_active ? <span className="badge badge-completed">active</span> : <span className="badge badge-cancelled">hidden</span>}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => edit(s)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(s.id)}>Delete</button>
                    </div>
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