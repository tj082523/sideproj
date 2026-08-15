const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (auth && token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // auth
  register: (payload) => request('/api/auth/register.php', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login.php', { method: 'POST', body: payload, auth: false }),
  logout: () => request('/api/auth/logout.php', { method: 'POST' }),
  me: () => request('/api/auth/me.php'),

  // services
  listServices: (all = false) => request(`/api/services.php${all ? '?all=1' : ''}`, { auth: all }),
  getService: (id) => request(`/api/services.php?id=${id}`, { auth: false }),
  createService: (payload) => request('/api/services.php', { method: 'POST', body: payload }),
  updateService: (id, payload) => request(`/api/services.php?id=${id}`, { method: 'PUT', body: payload }),
  deleteService: (id) => request(`/api/services.php?id=${id}`, { method: 'DELETE' }),

  // bookings
  listBookings: () => request('/api/bookings.php'),
  createBooking: (payload) => request('/api/bookings.php', { method: 'POST', body: payload }),
  updateBooking: (id, payload) => request(`/api/bookings.php?id=${id}`, { method: 'PUT', body: payload }),
  deleteBooking: (id) => request(`/api/bookings.php?id=${id}`, { method: 'DELETE' }),

  // admin: users (soft delete / restore)
  listUsers: () => request('/api/users.php'),
  listTrashedUsers: () => request('/api/users.php?trash=1'),
  deleteUser: (id) => request(`/api/users.php?id=${id}`, { method: 'DELETE' }),
  permanentlyDeleteUser: (id) => request(`/api/users.php?id=${id}&permanent=1`, { method: 'DELETE' }),
  restoreUser: (id) => request(`/api/users.php?id=${id}&action=restore`, { method: 'POST' }),

  // admin: dashboard
  getDashboard: () => request('/api/dashboard.php'),
};