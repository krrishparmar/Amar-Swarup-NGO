const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const res = await fetch(url, config);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────
export const verifyGoogleToken = (credential) =>
  request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });

export const signUp = (name, email, password) =>
  request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const signIn = (email, password) =>
  request('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

// ── KPI ───────────────────────────────────
export const fetchKPI = () => request('/kpi');

// ── Leads ─────────────────────────────────
export const fetchLeads = (status) =>
  request(`/leads${status && status !== 'All' ? `?status=${status}` : ''}`);

export const createLead = (data) =>
  request('/leads', { method: 'POST', body: JSON.stringify(data) });

export const updateLead = (id, data) =>
  request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const updateLeadFull = (id, data) =>
  request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const updateLeadStatus = (id, status) =>
  request(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const deleteLead = (id) =>
  request(`/leads/${id}`, { method: 'DELETE' });

export const bulkImportLeads = (records) =>
  request('/leads/bulk-import', { method: 'POST', body: JSON.stringify({ records }) });

// ── Pickups ───────────────────────────────
export const fetchPickups = (status) =>
  request(`/pickups${status && status !== 'All' ? `?status=${status}` : ''}`);

export const createPickup = (data) =>
  request('/pickups', { method: 'POST', body: JSON.stringify(data) });

export const updatePickup = (id, data) =>
  request(`/pickups/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const updatePickupFull = (id, data) =>
  request(`/pickups/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deletePickup = (id) =>
  request(`/pickups/${id}`, { method: 'DELETE' });

// ── Donors ────────────────────────────────
export const fetchDonors = (search) =>
  request(`/donors${search ? `?search=${encodeURIComponent(search)}` : ''}`);

export const createDonor = (data) =>
  request('/donors', { method: 'POST', body: JSON.stringify(data) });

// ── Leaderboard ───────────────────────────
export const fetchLeaderboard = () => request('/leaderboard');

// ── Activity Feed ─────────────────────────
export const fetchActivity = () => request('/activity');

// ── Reports ───────────────────────────────
export const fetchReports = () => request('/reports');

// ── Drivers ───────────────────────────────
export const fetchDrivers = (status) =>
  request(`/drivers${status ? `?status=${status}` : ''}`);

export const driverSignUp = (data) =>
  request('/drivers/signup', { method: 'POST', body: JSON.stringify(data) });

export const driverSignIn = (email, password) =>
  request('/drivers/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const driverGoogleSignIn = (credential) =>
  request('/drivers/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });

export const fetchDriverPickups = (driverId, status) =>
  request(`/drivers/${driverId}/pickups${status && status !== 'All' ? `?status=${status}` : ''}`);

export const driverUpdatePickup = (pickupId, data) =>
  request(`/drivers/pickups/${pickupId}`, { method: 'PATCH', body: JSON.stringify(data) });
