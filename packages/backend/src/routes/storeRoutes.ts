import express from 'express'
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  getStoreProducts
} from '../controllers/storeController'

const router = express.Router()

/**
 * @route   GET /api/stores
 * @desc    Get all stores
 * @access  Private
 */
router.get('/', getStores)

/**
 * @route   GET /api/stores/:storeId/products
 * @desc    Get all products for a specific store
 * @access  Public (for storefront)
 */
router.get('/:storeId/products', getStoreProducts)

/**
 * @route   GET /api/stores/:id
 * @desc    Get a single store by ID
 * @access  Private
 */
router.get('/:id', getStoreById)

/**
 * @route   POST /api/stores
 * @desc    Create a new store
 * @access  Private
 */
router.post('/', createStore)

/**
 * @route   PUT /api/stores/:id
 * @desc    Update a store
 * @access  Private
 */
router.put('/:id', updateStore)

/**
 * @route   DELETE /api/stores/:id
 * @desc    Delete a store
 * @access  Private
 */
router.delete('/:id', deleteStore)

export default router
