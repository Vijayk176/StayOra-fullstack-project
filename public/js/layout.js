// =====================================================================
// js/layout.js
// Renders the shared top navbar (public pages) and the admin sidebar
// (protected pages), and wires up the logout button.
// =====================================================================

function renderPublicNavbar(active = '') {
  const el = document.getElementById('navbar');
  if (!el) return;
  const link = (href, label, key) =>
    `<li class="nav-item"><a class="nav-link ${active === key ? 'fw-bold text-decoration-underline' : ''}" href="${href}">${label}</a></li>`;

  el.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-stayora">
    <div class="container">
      <a class="navbar-brand fw-bold" href="index.html">🏨 Stayora</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto">
          ${link('index.html', 'Home', 'home')}
          ${link('book-now.html', 'Book Now', 'booknow')}
          ${link('login.html', 'Login', 'login')}
          ${link('register.html', 'Register', 'register')}
        </ul>
      </div>
    </div>
  </nav>`;
}

const SIDEBAR_LINKS = [
  { href: 'dashboard.html', label: '📊 Dashboard', key: 'dashboard' },
  { href: 'guests.html', label: '🧑‍🤝‍🧑 Guests', key: 'guests' },
  { href: 'rooms.html', label: '🛏️ Rooms', key: 'rooms' },
  { href: 'bookings.html', label: '📅 Bookings', key: 'bookings' },
  { href: 'payments.html', label: '💳 Payments', key: 'payments' },
  { href: 'services.html', label: '🧺 Services', key: 'services' },
  { href: 'employees.html', label: '👔 Employees', key: 'employees' },
  { href: 'profile.html', label: '👤 Profile', key: 'profile' }
];

function renderAdminLayout(active = '') {
  const user = typeof getUser === 'function' ? getUser() : null;

  const topbar = document.getElementById('navbar');
  if (topbar) {
    topbar.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-stayora">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="dashboard.html">🏨 Stayora Admin</a>
        <div class="d-flex align-items-center text-white">
          <span class="me-3">👋 ${user ? user.full_name : 'Guest'} <small class="text-warning">(${user ? user.role_name : ''})</small></span>
          <button class="btn btn-sm btn-outline-light" id="logoutBtn">Logout</button>
        </div>
      </div>
    </nav>`;

    document.getElementById('logoutBtn').addEventListener('click', async () => {
      try { await apiRequest('/auth/logout', { method: 'POST' }); } catch (e) {}
      clearSession();
      window.location.href = 'login.html';
    });
  }

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
    <div class="sidebar p-3">
      <ul class="nav flex-column">
        ${SIDEBAR_LINKS.map(
          (l) => `<li class="nav-item"><a class="nav-link ${active === l.key ? 'active' : ''}" href="${l.href}">${l.label}</a></li>`
        ).join('')}
      </ul>
    </div>`;
  }
}
