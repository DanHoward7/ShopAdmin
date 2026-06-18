import express from 'express';
import {
  getOrderHistory,
  getRecentStatusChanges
} from '../controllers/historyController';

const router = express.Router();

/**
 * @route   GET /api/history/order/:orderId
 * @desc    Get order history for a specific order
 * @access  Private
 */
router.get('/order/:orderId', getOrderHistory);

/**
 * @route   GET /api/history/recent
 * @desc    Get recent status changes across all orders
 * @access  Private
 */
router.get('/recent', getRecentStatusChanges);

export default router;
