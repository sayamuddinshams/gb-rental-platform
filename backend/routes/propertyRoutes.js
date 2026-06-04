import express from 'express';
import { 
  getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, 
  toggleFavorite, getFavorites, addReview, getCities, getAmenities, reportProperty 
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes (must be positioned above generic :id routes to prevent parameter mismatches)
router.get('/', getProperties);
router.get('/cities', getCities);
router.get('/amenities', getAmenities);

// Protected routes (Tenant/User wishlist)
router.get('/favorites', protect, getFavorites);

// Property CRUD & Actions
router.get('/:id', getPropertyById);
router.post('/', protect, authorize('owner', 'admin'), createProperty);
router.put('/:id', protect, authorize('owner', 'admin'), updateProperty);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteProperty);

// User actions on properties
router.post('/:id/favorite', protect, authorize('tenant'), toggleFavorite);
router.post('/:id/reviews', protect, authorize('tenant'), addReview);
router.post('/:id/report', protect, authorize('tenant'), reportProperty);

export default router;
