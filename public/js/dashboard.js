
// js/dashboard.js
// Fetches analytics from backend and renders Chart.js charts.


document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  renderAdminLayout('dashboard');

  try {
    const [summary, bookings, revenue, roomsStatus, servicesStats, recent] = await Promise.all([
      apiRequest('/dashboard/summary'),
      apiRequest('/dashboard/bookings'),
      apiRequest('/dashboard/revenue'),
      apiRequest('/dashboard/rooms-status'),
      apiRequest('/dashboard/services-stats'),
      apiRequest('/dashboard/recent-bookings')
    ]);

    renderSummary(summary.data);
    renderBookingsChart(bookings.data);
    renderRevenueChart(revenue.data);
    renderRoomsPie(roomsStatus.data);
    renderServicesChart(servicesStats.data);
    renderRecentTable(recent.data);
  } catch (err) {
    console.error(err);
  }
});

function renderSummary(data) {
  document.getElementById('statBookings').textContent = data.total_bookings;
  document.getElementById('statRevenue').textContent = 'Rs. ' + parseInt(Number(data.total_revenue).toLocaleString());
  document.getElementById('statGuests').textContent = data.total_guests;
  document.getElementById('statAvailable').textContent = data.available_rooms;
  document.getElementById('statOccupied').textContent = data.occupied_rooms;
}

function renderBookingsChart(rows) {
  new Chart(document.getElementById('bookingsChart'), {
    type: 'bar',
    data: {
      labels: rows.map((r) => r.month),
      datasets: [{ label: 'Bookings', data: rows.map((r) => r.total_bookings), backgroundColor: '#0f3d3e' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

function renderRevenueChart(rows) {
  new Chart(document.getElementById('revenueChart'), {
    type: 'line',
    data: {
      labels: rows.map((r) => r.month),
      datasets: [{
        label: 'Revenue (Rs.)',
        data: rows.map((r) => r.total_revenue),
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212,175,55,0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true }
  });
}

function renderRoomsPie(rows) {
  const colors = { Available: '#198754', Occupied: '#dc3545', Maintenance: '#ffc107' };
  new Chart(document.getElementById('roomsPieChart'), {
    type: 'pie',
    data: {
      labels: rows.map((r) => r.status),
      datasets: [{ data: rows.map((r) => r.total), backgroundColor: rows.map((r) => colors[r.status] || '#6c757d') }]
    },
    options: { responsive: true }
  });
}

function renderServicesChart(rows) {
  new Chart(document.getElementById('servicesChart'), {
    type: 'bar',
    data: {
      labels: rows.map((r) => r.service_name),
      datasets: [{ label: 'Times Used', data: rows.map((r) => r.total_used), backgroundColor: '#0f3d3e' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

function renderRecentTable(rows) {
  const tbody = document.getElementById('recentBookingsBody');
  tbody.innerHTML = rows.map((r) => `
    <tr>
      <td>#${r.booking_id}</td>
      <td>${r.guest_name}</td>
      <td>${r.room_number} (${r.type_name})</td>
      <td>${new Date(r.check_in_date).toLocaleDateString()}</td>
      <td>${new Date(r.check_out_date).toLocaleDateString()}</td>
      <td>Rs. ${Number(r.total_amount).toLocaleString()}</td>
      <td><span class="badge bg-secondary">${r.booking_status}</span></td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="text-center">No bookings yet</td></tr>';
}
