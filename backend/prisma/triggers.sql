-- Flight Validation Trigger
-- Ensures that arrival time is always after departure time
CREATE OR REPLACE FUNCTION validate_flight_times()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."arrivalTime" <= NEW."departureTime" THEN
    RAISE EXCEPTION 'Arrival time must be after departure time';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_flight_times_trigger
BEFORE INSERT OR UPDATE ON "Flight"
FOR EACH ROW
EXECUTE FUNCTION validate_flight_times();

-- Booking Status Update Trigger
-- Automatically updates booking status based on payment status
CREATE OR REPLACE FUNCTION update_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all payments for this booking are completed
  IF EXISTS (
    SELECT 1 FROM "Payment" 
    WHERE "bookingId" = NEW."bookingId" 
    AND "status" != 'CONFIRMED'
  ) THEN
    -- If any payment is not completed, do nothing
    RETURN NEW;
  ELSE
    -- If all payments are completed, update booking status to CONFIRMED
    UPDATE "Booking" 
    SET "status" = 'COMPLETED' 
    WHERE "id" = NEW."bookingId" AND "status" = 'PENDING';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_booking_status_trigger
AFTER INSERT OR UPDATE ON "Payment"
FOR EACH ROW
EXECUTE FUNCTION update_booking_status();

-- Ticket Status Update Trigger
-- Automatically updates ticket status when booking is cancelled
CREATE OR REPLACE FUNCTION update_ticket_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."status" = 'CANCELLED' AND OLD."status" != 'CANCELLED' THEN
    UPDATE "Ticket"
    SET "status" = 'CANCELLED'
    WHERE "bookingId" = NEW."id";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_status_trigger
AFTER UPDATE ON "Booking"
FOR EACH ROW
EXECUTE FUNCTION update_ticket_status();

-- Seat Availability Update Trigger
-- Updates seat availability when a ticket is issued
CREATE OR REPLACE FUNCTION update_seat_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."status" = 'ISSUED' THEN
    UPDATE "FlightSeat"
    SET "isAvailable" = FALSE
    WHERE "id" = NEW."flightSeatId";
  ELSIF NEW."status" = 'CANCELLED' OR NEW."status" = 'REFUNDED' THEN
    UPDATE "FlightSeat"
    SET "isAvailable" = TRUE
    WHERE "id" = NEW."flightSeatId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seat_availability_trigger
AFTER INSERT OR UPDATE ON "Ticket"
FOR EACH ROW
EXECUTE FUNCTION update_seat_availability();