import express from 'express';
import { createBooking, getTenantBookings, getOwnerBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('tenant'), createBooking);
router.get('/tenant', protect, authorize('tenant'), getTenantBookings);
router.get('/owner', protect, authorize('owner'), getOwnerBookings);
router.put('/:id', protect, authorize('owner', 'admin'), updateBookingStatus);

export default router;
