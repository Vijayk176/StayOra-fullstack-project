// =====================================================================
// js/auth.js
// Handles the Login and Register forms.
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const res = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
        saveSession(res.token, res.user);
        window.location.href = 'dashboard.html';
      } catch (err) {
        showAlert('alertBox', err.message);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const full_name = document.getElementById('full_name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const role_name = document.getElementById('role_name').value;

      try {
        await apiRequest('/auth/register', { method: 'POST', body: { full_name, email, password, role_name } });
        showAlert('alertBox', 'Registration successful! Redirecting to login...', 'success');
        setTimeout(() => (window.location.href = 'login.html'), 1500);
      } catch (err) {
        showAlert('alertBox', err.message);
      }
    });
  }
});
