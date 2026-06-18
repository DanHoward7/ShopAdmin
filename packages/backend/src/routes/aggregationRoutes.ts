import express from 'express';
import {
  getAggregatedOrders,
  getStoreComparison
} from '../controllers/aggregationController';

const router = express.Router();

/**
 * @route   GET /api/aggregation/orders
 * @desc    Get aggregated order data across all stores
 * @access  Private
 */
router.get('/orders', getAggregatedOrders);

/**
 * @route   GET /api/aggregation/stores
 * @desc    Get store comparison metrics
 * @access  Private
 */
router.get('/stores', getStoreComparison);

export default router;
