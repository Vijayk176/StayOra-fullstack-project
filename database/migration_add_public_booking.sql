-- =====================================================================
-- migration_add_public_booking.sql
-- Run this ONLY if you already ran database.sql before and your Neon
-- database already has data in it (so you don't want to drop everything
-- and start over).
--
-- What it does: updates the Bookings.booking_status CHECK constraint to
-- allow a new status "PendingConfirmation", used for bookings submitted
-- by customers themselves through the public "Book Now" page, before
-- staff review/confirm them.
--
-- Run with:
--   psql "$DATABASE_URL" -f database/migration_add_public_booking.sql
-- Or paste into the Neon SQL Editor and run.
-- =====================================================================

ALTER TABLE Bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check;

ALTER TABLE Bookings ADD CONSTRAINT bookings_booking_status_check
  CHECK (booking_status IN ('PendingConfirmation', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'));

-- Done. New public bookings will be created with status 'PendingConfirmation'.
