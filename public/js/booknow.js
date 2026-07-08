// =====================================================================
// js/booknow.js
// Powers the public "Book Now" page: load room types, check
// availability, then submit the guest's details to create a booking.
// =====================================================================

let selectedRoomType = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadRoomTypes();

  document.getElementById('checkAvailabilityBtn').addEventListener('click', handleCheckAvailability);
  document.getElementById('bookingForm').addEventListener('submit', handleSubmitBooking);

  // Prevent picking a check-in date in the past
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('check_in_date').min = today;
  document.getElementById('check_out_date').min = today;
});

async function loadRoomTypes() {
  const select = document.getElementById('room_type_id');
  try {
    const res = await fetch('/api/public/room-types').then((r) => r.json());
    select.innerHTML = '<option value="">-- Select a room type --</option>' +
      res.data.map((rt) => `<option value="${rt.room_type_id}">${rt.type_name} - Rs. ${Number(rt.base_price).toLocaleString()}/night (max ${rt.max_occupancy} guests)</option>`).join('');
  } catch (err) {
    select.innerHTML = '<option value="">Failed to load room types</option>';
  }
}

async function handleCheckAvailability() {
  const check_in_date = document.getElementById('check_in_date').value;
  const check_out_date = document.getElementById('check_out_date').value;
  const room_type_id = document.getElementById('room_type_id').value;
  const resultBox = document.getElementById('availabilityResult');

  if (!check_in_date || !check_out_date || !room_type_id) {
    resultBox.innerHTML = `<div class="alert alert-warning">Please select dates and a room type first.</div>`;
    return;
  }
  if (new Date(check_out_date) <= new Date(check_in_date)) {
    resultBox.innerHTML = `<div class="alert alert-warning">Check-out date must be after check-in date.</div>`;
    return;
  }

  resultBox.innerHTML = `<div class="text-muted">Checking availability...</div>`;

  try {
    const params = new URLSearchParams({ room_type_id, check_in_date, check_out_date });
    const res = await fetch(`/api/public/availability?${params}`).then((r) => r.json());

    if (res.data.available) {
      selectedRoomType = { room_type_id, check_in_date, check_out_date };
      resultBox.innerHTML = `<div class="alert alert-success">🎉 ${res.data.available_rooms} room(s) available! Please fill in your details below.</div>`;
      document.getElementById('detailsCard').classList.remove('d-none');
    } else {
      selectedRoomType = null;
      resultBox.innerHTML = `<div class="alert alert-danger">Sorry, no rooms of this type are available for these dates. Try different dates or a different room type.</div>`;
      document.getElementById('detailsCard').classList.add('d-none');
    }
  } catch (err) {
    resultBox.innerHTML = `<div class="alert alert-danger">Something went wrong. Please try again.</div>`;
  }
}

async function handleSubmitBooking(e) {
  e.preventDefault();

  if (!selectedRoomType) {
    showAlert('alertBox', 'Please check availability first.');
    return;
  }

  const body = {
    full_name: document.getElementById('full_name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    cnic_passport: document.getElementById('cnic_passport').value.trim(),
    city: document.getElementById('city').value.trim(),
    country: document.getElementById('country').value.trim(),
    room_type_id: selectedRoomType.room_type_id,
    check_in_date: selectedRoomType.check_in_date,
    check_out_date: selectedRoomType.check_out_date
  };

  try {
    const res = await fetch('/api/public/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then((r) => r.json());

    if (!res.success) {
      showAlert('alertBox', res.message || 'Booking failed. Please try again.');
      return;
    }

    document.getElementById('searchCard').classList.add('d-none');
    document.getElementById('detailsCard').classList.add('d-none');
    document.getElementById('confirmCard').classList.remove('d-none');
    document.getElementById('confirmText').innerHTML = `
      Booking Reference: <strong>#${res.data.booking_id}</strong><br>
      Room ${res.data.room_number} (${res.data.room_type}) &middot; ${res.data.nights} night(s)<br>
      Total: <strong>Rs. ${Number(res.data.total_amount).toLocaleString()}</strong><br>
      Status: <span class="badge bg-warning text-dark">${res.data.booking_status}</span>
    `;
  } catch (err) {
    showAlert('alertBox', 'Something went wrong. Please try again.');
  }
}
