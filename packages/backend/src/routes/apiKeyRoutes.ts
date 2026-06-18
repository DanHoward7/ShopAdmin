import express from 'express';
import {
  createApiKey,
  getStoreApiKeys,
  getApiKeyById,
  updateApiKey,
  deleteApiKey,
  rotateApiKey,
  getApiKeyStats
} from '../controllers/apiKeyController';

const router = express.Router();

/**
 * @route   POST /api/stores/:storeId/api-keys
 * @desc    Create a new API key for a store
 * @access  Private (Store Owner or Admin)
 */
router.post('/:storeId/api-keys', createApiKey);

/**
 * @route   GET /api/stores/:storeId/api-keys
 * @desc    Get all API keys for a store
 * @access  Private (Store Owner or Admin)
 */
router.get('/:storeId/api-keys', getStoreApiKeys);

/**
 * @route   GET /api/stores/:storeId/api-keys/stats
 * @desc    Get API key usage statistics for a store
 * @access  Private (Store Owner or Admin)
 */
router.get('/:storeId/api-keys/stats', getApiKeyStats);

/**
 * @route   GET /api/stores/:storeId/api-keys/:keyId
 * @desc    Get API key by ID
 * @access  Private (Store Owner or Admin)
 */
router.get('/:storeId/api-keys/:keyId', getApiKeyById);

/**
 * @route   PUT /api/stores/:storeId/api-keys/:keyId
 * @desc    Update API key
 * @access  Private (Store Owner or Admin)
 */
router.put('/:storeId/api-keys/:keyId', updateApiKey);

/**
 * @route   POST /api/stores/:storeId/api-keys/:keyId/rotate
 * @desc    Rotate API key (generate new key)
 * @access  Private (Store Owner or Admin)
 */
router.post('/:storeId/api-keys/:keyId/rotate', rotateApiKey);

/**
 * @route   DELETE /api/stores/:storeId/api-keys/:keyId
 * @desc    Delete API key
 * @access  Private (Store Owner or Admin)
 */
router.delete('/:storeId/api-keys/:keyId', deleteApiKey);

export default router;
