import express from 'express'
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats
} from '../controllers/orderController'

const router = express.Router()

/**
 * @route   GET /api/orders
 * @desc    Get all orders with pagination, filtering and sorting
 * @access  Private
 */
router.get('/', getOrders)

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics
 * @access  Private
 */
router.get('/stats', getOrderStats)

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by ID
 * @access  Private
 */
router.get('/:id', getOrderById)

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', createOrder)

/**
 * @route   PUT /api/orders/:id
 * @desc    Update an order
 * @access  Private
 */
router.put('/:id', updateOrder)

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete an order
 * @access  Private
 */
router.delete('/:id', deleteOrder)

export default router
