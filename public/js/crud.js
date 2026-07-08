// =====================================================================
// js/crud.js
// Generic, reusable CRUD page builder. Each admin page (Guests, Rooms,
// Bookings, Payments, Employees, Services) calls initCrudPage() with a
// small config object describing its endpoint + fields, and gets a
// full table + search + pagination + add/edit/delete modal for free.
// =====================================================================

let CRUD_STATE = { page: 1, limit: 10, search: '' };

async function initCrudPage(config) {
  requireAuth();
  renderAdminLayout(config.pageKey);

  document.getElementById('pageTitle').textContent = config.title;
  buildTableHead(config);
  buildForm(config);

  document.getElementById('searchInput').addEventListener('input', debounce((e) => {
    CRUD_STATE.search = e.target.value;
    CRUD_STATE.page = 1;
    loadData(config);
  }, 400));

  document.getElementById('addBtn').addEventListener('click', () => openModal(config));
  document.getElementById('saveBtn').addEventListener('click', () => saveRecord(config));

  await loadData(config);
}

function buildTableHead(config) {
  const thead = document.getElementById('tableHead');
  thead.innerHTML = `<tr>${config.columns.map((c) => `<th>${c.label}</th>`).join('')}<th>Actions</th></tr>`;
}

function buildForm(config) {
  const formEl = document.getElementById('recordForm');
  formEl.innerHTML = config.formFields.map((f) => `
    <div class="mb-3">
      <label class="form-label">${f.label}</label>
      ${f.type === 'select'
        ? `<select class="form-select" id="field_${f.key}" ${f.required ? 'required' : ''}>
            <option value="">-- Select ${f.label} --</option>
            ${(f.options || []).map((o) => `<option value="${o.value}">${o.label}</option>`).join('')}
          </select>`
        : `<input type="${f.type || 'text'}" class="form-control" id="field_${f.key}" ${f.required ? 'required' : ''} ${f.step ? `step="${f.step}"` : ''}>`
      }
    </div>
  `).join('');
}

async function loadData(config) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = `<tr><td colspan="${config.columns.length + 1}" class="text-center">Loading...</td></tr>`;

  try {
    const params = new URLSearchParams({ page: CRUD_STATE.page, limit: CRUD_STATE.limit });
    if (CRUD_STATE.search) params.set('search', CRUD_STATE.search);

    const res = await apiRequest(`${config.endpoint}?${params.toString()}`);
    renderTable(config, res.data);
    renderPagination(config, res);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="${config.columns.length + 1}" class="text-danger text-center">${err.message}</td></tr>`;
  }
}

function renderTable(config, rows) {
  const tbody = document.getElementById('tableBody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="${config.columns.length + 1}" class="text-center">No records found</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((row) => `
    <tr>
      ${config.columns.map((c) => `<td>${formatCell(row[c.key], c)}</td>`).join('')}
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick='openModal(${JSON.stringify(config).replace(/'/g, "&#39;")}, ${JSON.stringify(row).replace(/'/g, "&#39;")})'>Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick='deleteRecord(${JSON.stringify(config).replace(/'/g, "&#39;")}, ${row[config.pk]})'>Delete</button>
      </td>
    </tr>
  `).join('');
}

function formatCell(value, column) {
  if (value === null || value === undefined) return '-';
  if (column.badge) {
    const cls = { Available: 'badge-available', Occupied: 'badge-occupied', Maintenance: 'badge-maintenance' }[value] || 'bg-secondary';
    return `<span class="badge ${cls}">${value}</span>`;
  }
  if (column.date) return new Date(value).toLocaleDateString();
  if (column.money) return 'Rs. ' + Number(value).toLocaleString();
  return value;
}

function renderPagination(config, res) {
  const el = document.getElementById('pagination');
  if (!el) return;
  let html = '';
  for (let p = 1; p <= res.totalPages; p++) {
    html += `<li class="page-item ${p === res.page ? 'active' : ''}"><a class="page-link" href="#" onclick="event.preventDefault(); changePage(${p})">${p}</a></li>`;
  }
  el.innerHTML = html || '';
  window.__currentCrudConfig = config;
}

function changePage(p) {
  CRUD_STATE.page = p;
  loadData(window.__currentCrudConfig);
}

let editingId = null;

function openModal(config, row = null) {
  editingId = row ? row[config.pk] : null;
  document.getElementById('modalTitle').textContent = row ? `Edit ${config.title}` : `Add ${config.title}`;

  config.formFields.forEach((f) => {
    const el = document.getElementById(`field_${f.key}`);
    if (el) el.value = row && row[f.key] !== undefined && row[f.key] !== null ? row[f.key] : '';
  });

  window.__currentCrudConfig = config;
  const modal = new bootstrap.Modal(document.getElementById('recordModal'));
  modal.show();
}

async function saveRecord(config) {
  const body = {};
  config.formFields.forEach((f) => {
    const el = document.getElementById(`field_${f.key}`);
    let val = el.value;
    if (f.type === 'number') val = val === '' ? undefined : Number(val);
    if (val !== '') body[f.key] = val;
  });

  try {
    if (editingId) {
      await apiRequest(`${config.endpoint}/${editingId}`, { method: 'PUT', body });
    } else {
      await apiRequest(config.endpoint, { method: 'POST', body });
    }
    bootstrap.Modal.getInstance(document.getElementById('recordModal')).hide();
    await loadData(config);
  } catch (err) {
    alert(err.message);
  }
}

async function deleteRecord(config, id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    await apiRequest(`${config.endpoint}/${id}`, { method: 'DELETE' });
    await loadData(config);
  } catch (err) {
    alert(err.message);
  }
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
