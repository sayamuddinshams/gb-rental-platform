import db from '../config/db.js';

// @desc    Request a property visit / booking
// @route   POST /api/bookings
export const createBooking = async (req, res, next) => {
  const { propertyId, visitDate, visitTime, notes } = req.body;

  try {
    if (!propertyId || !visitDate || !visitTime) {
      return res.status(400).json({ message: 'Please provide property ID, date, and time' });
    }

    const propQuery = await db.query('SELECT * FROM properties WHERE id = $1', [parseInt(propertyId, 10)]);
    if (propQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const property = propQuery.rows[0];

    // Create booking
    const result = await db.query(
      'INSERT INTO bookings (tenant_id, property_id, visit_date, visit_time, notes, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, parseInt(propertyId, 10), visitDate, visitTime, notes || '', 'pending']
    );

    const booking = result.rows[0];

    // Notify Owner
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [
        property.owner_id,
        'New Visit Request Scheduled',
        `${req.user.name} has requested a visit for your listing "${property.title}" on ${visitDate} at ${visitTime}.`
      ]
    );

    // Log Activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'CREATE_BOOKING', `Requested visit to property (ID: ${property.id}, Booking ID: ${booking.id})`]
    );

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// @desc    Get tenant bookings
// @route   GET /api/bookings/tenant
export const getTenantBookings = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT b.*, p.title as property_title, p.address as property_address, u.name as owner_name FROM bookings b JOIN properties p ON b.property_id = p.id JOIN users u ON p.owner_id = u.id WHERE b.tenant_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Get owner bookings
// @route   GET /api/bookings/owner
export const getOwnerBookings = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT b.*, p.title as property_title, u.name as tenant_name, u.email as tenant_email FROM bookings b JOIN properties p ON b.property_id = p.id JOIN users u ON b.tenant_id = u.id WHERE p.owner_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Approve/Reject a visit request (Owner only)
// @route   PUT /api/bookings/:id
export const updateBookingStatus = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update. Must be approved or rejected.' });
    }

    const bookingQuery = await db.query('SELECT b.*, p.title as property_title, p.owner_id FROM bookings b JOIN properties p ON b.property_id = p.id WHERE b.id = $1', [id]);
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    const booking = bookingQuery.rows[0];

    // Verify ownership
    if (booking.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to manage this booking' });
    }

    // Update status
    await db.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    // Notify Tenant
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [
        booking.tenant_id,
        `Visit Request ${status === 'approved' ? 'Approved' : 'Declined'}`,
        `Your visit request for "${booking.property_title}" on ${booking.visit_date} has been ${status === 'approved' ? 'approved' : 'declined'} by the owner.`
      ]
    );

    // Log Activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'UPDATE_BOOKING_STATUS', `Set booking ID ${id} status to ${status}`]
    );

    res.json({ message: `Visit request successfully ${status}` });
  } catch (err) {
    next(err);
  }
};
