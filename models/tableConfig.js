// =====================================================================
// models/tableConfig.js
// Metadata describing each table: primary key, editable columns,
// searchable text columns, and filterable columns.
// The generic model/controller (models/genericModel.js,
// controllers/genericController.js) use this config to build SQL
// queries dynamically for EVERY module (Guests, Rooms, Bookings, etc.)
// This keeps the code DRY while still giving full CRUD + search +
// filter + pagination per module, as required by the project.
// =====================================================================

const tableConfig = {
  roles: {
    table: 'roles',
    pk: 'role_id',
    columns: ['role_name'],
    searchable: ['role_name'],
    filterable: []
  },
  departments: {
    table: 'departments',
    pk: 'department_id',
    columns: ['department_name', 'description'],
    searchable: ['department_name'],
    filterable: []
  },
  employees: {
    table: 'employees',
    pk: 'employee_id',
    columns: ['full_name', 'email', 'phone', 'department_id', 'designation', 'salary', 'hire_date', 'is_active'],
    searchable: ['full_name', 'email', 'designation'],
    filterable: ['department_id', 'is_active']
  },
  guests: {
    table: 'guests',
    pk: 'guest_id',
    columns: ['full_name', 'email', 'phone', 'cnic_passport', 'address', 'city', 'country'],
    searchable: ['full_name', 'email', 'phone', 'cnic_passport'],
    filterable: ['city', 'country']
  },
  roomtypes: {
    table: 'roomtypes',
    pk: 'room_type_id',
    columns: ['type_name', 'description', 'base_price', 'max_occupancy'],
    searchable: ['type_name'],
    filterable: []
  },
  rooms: {
    table: 'rooms',
    pk: 'room_id',
    columns: ['room_number', 'room_type_id', 'floor_number', 'status', 'image_url'],
    searchable: ['room_number'],
    filterable: ['status', 'room_type_id', 'floor_number']
  },
  bookings: {
    table: 'bookings',
    pk: 'booking_id',
    columns: ['guest_id', 'room_id', 'user_id', 'check_in_date', 'check_out_date', 'total_amount', 'booking_status'],
    searchable: [],
    filterable: ['booking_status', 'guest_id', 'room_id']
  },
  payments: {
    table: 'payments',
    pk: 'payment_id',
    columns: ['booking_id', 'amount_paid', 'payment_method', 'payment_status'],
    searchable: [],
    filterable: ['payment_status', 'payment_method', 'booking_id']
  },
  invoices: {
    table: 'invoices',
    pk: 'invoice_id',
    columns: ['booking_id', 'total_amount', 'tax_amount', 'grand_total'],
    searchable: [],
    filterable: ['booking_id']
  },
  services: {
    table: 'services',
    pk: 'service_id',
    columns: ['service_name', 'description', 'price'],
    searchable: ['service_name'],
    filterable: []
  },
  servicebookings: {
    table: 'servicebookings',
    pk: 'service_booking_id',
    columns: ['booking_id', 'service_id', 'quantity', 'total_price'],
    searchable: [],
    filterable: ['booking_id', 'service_id']
  },
  housekeeping: {
    table: 'housekeeping',
    pk: 'housekeeping_id',
    columns: ['room_id', 'employee_id', 'task_date', 'status', 'remarks'],
    searchable: ['remarks'],
    filterable: ['status', 'room_id', 'employee_id']
  },
  reviews: {
    table: 'reviews',
    pk: 'review_id',
    columns: ['guest_id', 'booking_id', 'rating', 'comment'],
    searchable: ['comment'],
    filterable: ['rating', 'guest_id']
  },
  contactmessages: {
    table: 'contactmessages',
    pk: 'message_id',
    columns: ['full_name', 'email', 'subject', 'message', 'is_read'],
    searchable: ['full_name', 'email', 'subject'],
    filterable: ['is_read']
  },
  activitylogs: {
    table: 'activitylogs',
    pk: 'log_id',
    columns: ['user_id', 'action', 'entity_name', 'entity_id'],
    searchable: ['action', 'entity_name'],
    filterable: ['user_id', 'entity_name']
  }
};

module.exports = tableConfig;
