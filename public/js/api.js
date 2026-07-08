// =====================================================================
// js/api.js
// Small wrapper around fetch() that automatically attaches the JWT
// token and the base API URL. Used by every page.
// =====================================================================

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('stayora_token');
}

function getUser() {
  const raw = localStorage.getItem('stayora_user');
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem('stayora_token', token);
  localStorage.setItem('stayora_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('stayora_token');
  localStorage.removeItem('stayora_user');
}

// Redirect to login if not authenticated. Call at the top of protected pages.
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

// Core request function
async function apiRequest(endpoint, { method = 'GET', body = null, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { success: false, message: 'Invalid server response' };
  }

  if (res.status === 401) {
    clearSession();
    window.location.href = 'login.html';
    return;
  }

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Simple toast/alert helper
function showAlert(containerId, message, type = 'danger') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}
