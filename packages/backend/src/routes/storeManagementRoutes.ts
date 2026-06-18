import express from 'express';
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  getStoreConfig,
  updateStoreConfig,
  getStoreStats
} from '../controllers/storeManagementController';

const router = express.Router();

/**
 * @route   POST /api/store-management
 * @desc    Create a new store
 * @access  Private (Admin)
 */
router.post('/', createStore);

/**
 * @route   GET /api/store-management
 * @desc    Get all stores with filtering and pagination
 * @access  Private (Admin)
 */
router.get('/', getStores);

/**
 * @route   GET /api/store-management/stats
 * @desc    Get store statistics
 * @access  Private (Admin)
 */
router.get('/stats', getStoreStats);

/**
 * @route   GET /api/store-management/:id
 * @desc    Get store by ID
 * @access  Private (Admin or Store Owner)
 */
router.get('/:id', getStoreById);

/**
 * @route   PUT /api/store-management/:id
 * @desc    Update store
 * @access  Private (Admin or Store Owner)
 */
router.put('/:id', updateStore);

/**
 * @route   DELETE /api/store-management/:id
 * @desc    Delete store
 * @access  Private (Admin)
 */
router.delete('/:id', deleteStore);

/**
 * @route   GET /api/store-management/:id/config
 * @desc    Get store configuration
 * @access  Private (Admin or Store Owner)
 */
router.get('/:id/config', getStoreConfig);

/**
 * @route   PUT /api/store-management/:id/config
 * @desc    Update store configuration
 * @access  Private (Admin or Store Owner)
 */
router.put('/:id/config', updateStoreConfig);

export default router;
