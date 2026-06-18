import express from 'express';
import {
  submitRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  cancelRegistration,
  getRegistrationStats
} from '../controllers/storeRegistrationController';

const router = express.Router();

/**
 * @route   POST /api/store-registration
 * @desc    Submit a new store registration
 * @access  Public
 */
router.post('/', submitRegistration);

/**
 * @route   GET /api/store-registration
 * @desc    Get all registrations with filtering and pagination
 * @access  Private (Admin)
 */
router.get('/', getRegistrations);

/**
 * @route   GET /api/store-registration/stats
 * @desc    Get registration statistics
 * @access  Private (Admin)
 */
router.get('/stats', getRegistrationStats);

/**
 * @route   GET /api/store-registration/:id
 * @desc    Get registration by ID
 * @access  Private (Admin or Owner)
 */
router.get('/:id', getRegistrationById);

/**
 * @route   PUT /api/store-registration/:id/status
 * @desc    Update registration status (approve/reject)
 * @access  Private (Admin)
 */
router.put('/:id/status', updateRegistrationStatus);

/**
 * @route   DELETE /api/store-registration/:id
 * @desc    Cancel registration
 * @access  Private (Owner)
 */
router.delete('/:id', cancelRegistration);

export default router;
