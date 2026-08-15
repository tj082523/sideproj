import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function Users() {
  const [tab, setTab] = useState('active'); // 'active' | 'trash'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lastDeleted, setLastDeleted] = useState(null); // for the quick "Undo" toast

  function load(activeTab = tab) {
    setLoading(true);
    setError('');
    const call = activeTab === 'trash' ? api.listTrashedUsers() : api.listUsers();
    call.then((res) => setUsers(res.users)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }

  useEffect(() => { load(tab); }, [tab]);

  async function handleDelete(user) {
    if (!confirm(`Delete ${user.name}? You'll be able to restore them from the Trash tab.`)) return;
    try {
      await api.deleteUser(user.id);
      setLastDeleted(user);
      setNotice(`${user.name} was moved to Trash.`);
      load();
      setTimeout(() => setNotice(''), 6000);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRestore(user) {
    try {
      await api.restoreUser(user.id);
      setNotice(`${user.name} was restored.`);
      setLastDeleted(null);
      load();
      setTimeout(() => setNotice(''), 4000);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleUndo() {
    if (!lastDeleted) return;
    await handleRestore(lastDeleted);
  }

  async function handlePermanentDelete(user) {
    if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api.permanentlyDeleteUser(user.id);
      setNotice(`${user.name} was permanently deleted.`);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h2>Users</h2>

      <div className="tabs">
        <button className={tab === 'active' ? 'active' : ''} onClick={() => setTab('active')}>Active</button>
        <button className={tab === 'trash' ? 'active' : ''} onClick={() => setTab('trash')}>Trash</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{notice}</span>
          {lastDeleted && tab === 'active' && (
            <button className="btn btn-sm btn-ghost" onClick={handleUndo}>Undo</button>
          )}
        </div>
      )}

      {tab === 'trash' && (
        <div className="trash-banner">
          Deleted profiles stay here until you restore or permanently delete them — nothing is lost by accident.
        </div>
      )}

      <div className="card panel">
        {loading ? (
          <p>Loading…</p>
        ) : users.length === 0 ? (
          <p className="empty-state">{tab === 'trash' ? 'Trash is empty.' : 'No users yet.'}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th>
                <th>{tab === 'trash' ? 'Deleted' : 'Joined'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td>{(tab === 'trash' ? u.deleted_at : u.created_at)?.slice(0, 10)}</td>
                  <td>
                    <div className="row-actions">
                      {tab === 'active' ? (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u)}>Delete</button>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-primary" onClick={() => handleRestore(u)}>Restore</button>
                          <button className="btn btn-sm btn-ghost" onClick={() => handlePermanentDelete(u)}>Delete forever</button>
                        </>
                      )}
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