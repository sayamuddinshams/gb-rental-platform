import express from 'express';
import { 
  getStats, getUsers, toggleUserBan, verifyOwner, 
  updatePropertyStatus, getReports, resolveReport, getLogs 
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protect & authorize('admin') to all routes in this router
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleUserBan);
router.put('/users/:id/verify-owner', verifyOwner);
router.put('/properties/:id/status', updatePropertyStatus);
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);
router.get('/logs', getLogs);

export default router;
