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

// ── KPI ───────────────────────────────────
export const fetchKPI = () => request('/kpi');

// ── Leads ─────────────────────────────────
export const fetchLeads = (status) =>
  request(`/leads${status && status !== 'All' ? `?status=${status}` : ''}`);

export const createLead = (data) =>
  request('/leads', { method: 'POST', body: JSON.stringify(data) });

export const updateLead = (id, data) =>
  request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// ── Pickups ───────────────────────────────
export const fetchPickups = (status) =>
  request(`/pickups${status && status !== 'All' ? `?status=${status}` : ''}`);

export const createPickup = (data) =>
  request('/pickups', { method: 'POST', body: JSON.stringify(data) });

export const updatePickup = (id, data) =>
  request(`/pickups/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

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
