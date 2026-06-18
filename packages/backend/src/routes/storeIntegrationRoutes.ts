import express from 'express';
import {
  processWebhook,
  syncOrder,
  getIntegrationStatus,
  testConnection,
  getApiDocumentation,
  authenticateApiKey,
  requirePermission
} from '../controllers/storeIntegrationController';

const router = express.Router();

// Apply API key authentication to all routes
router.use(authenticateApiKey);

/**
 * @route   POST /api/integration/webhook
 * @desc    Process incoming webhook from ecommerce store
 * @access  Private (API Key with orders:write permission)
 */
router.post('/webhook', requirePermission('orders:write'), processWebhook);

/**
 * @route   POST /api/integration/orders/sync
 * @desc    Manually sync order data from ecommerce store
 * @access  Private (API Key with orders:write permission)
 */
router.post('/orders/sync', requirePermission('orders:write'), syncOrder);

/**
 * @route   GET /api/integration/status
 * @desc    Get store integration status and configuration
 * @access  Private (API Key with store:read permission)
 */
router.get('/status', requirePermission('store:read'), getIntegrationStatus);

/**
 * @route   GET /api/integration/test
 * @desc    Test store connection and API configuration
 * @access  Private (API Key with store:read permission)
 */
router.get('/test', requirePermission('store:read'), testConnection);

/**
 * @route   GET /api/integration/docs
 * @desc    Get API documentation for store integration
 * @access  Private (API Key with store:read permission)
 */
router.get('/docs', requirePermission('store:read'), getApiDocumentation);

export default router;
