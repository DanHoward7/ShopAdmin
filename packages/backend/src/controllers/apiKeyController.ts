import { Request, Response } from 'express';
import { apiKeyService } from '../services/apiKeyService';
import { 
  ApiKeyCreateSchema,
  ApiKeyUpdateSchema
} from '../types/store.types';

/**
 * Create a new API key for a store
 */
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required',
      });
    }

    const validationResult = ApiKeyCreateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid API key data',
        errors: validationResult.error.errors,
      });
    }

    // In a real app, get this from authenticated user
    const createdBy = 'admin'; // TODO: Get from auth context

    const apiKey = await apiKeyService.createApiKey(storeId, validationResult.data, createdBy);

    return res.status(201).json({
      success: true,
      data: apiKey,
      message: 'API key created successfully. Save the key securely - it will not be shown again.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create API key',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all API keys for a store
 */
export const getStoreApiKeys = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required',
      });
    }

    const apiKeys = await apiKeyService.getStoreApiKeys(storeId);

    return res.status(200).json({
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    console.error('Error getting API keys:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get API keys',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get API key by ID
 */
export const getApiKeyById = async (req: Request, res: Response) => {
  try {
    const { storeId, keyId } = req.params;
    
    if (!storeId || !keyId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID and API key ID are required',
      });
    }

    const apiKey = await apiKeyService.getApiKeyById(keyId, storeId);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: `API key with ID ${keyId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error('Error getting API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get API key',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update API key
 */
export const updateApiKey = async (req: Request, res: Response) => {
  try {
    const { storeId, keyId } = req.params;
    
    if (!storeId || !keyId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID and API key ID are required',
      });
    }

    const validationResult = ApiKeyUpdateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid update data',
        errors: validationResult.error.errors,
      });
    }

    const updatedApiKey = await apiKeyService.updateApiKey(keyId, storeId, validationResult.data);

    return res.status(200).json({
      success: true,
      data: updatedApiKey,
      message: 'API key updated successfully',
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update API key',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete API key
 */
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const { storeId, keyId } = req.params;
    
    if (!storeId || !keyId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID and API key ID are required',
      });
    }

    await apiKeyService.deleteApiKey(keyId, storeId);

    return res.status(200).json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete API key',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Rotate API key (generate new key)
 */
export const rotateApiKey = async (req: Request, res: Response) => {
  try {
    const { storeId, keyId } = req.params;
    
    if (!storeId || !keyId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID and API key ID are required',
      });
    }

    const rotatedApiKey = await apiKeyService.rotateApiKey(keyId, storeId);

    return res.status(200).json({
      success: true,
      data: rotatedApiKey,
      message: 'API key rotated successfully. Save the new key securely - it will not be shown again.',
    });
  } catch (error) {
    console.error('Error rotating API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to rotate API key',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get API key usage statistics
 */
export const getApiKeyStats = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required',
      });
    }

    const stats = await apiKeyService.getApiKeyStats(storeId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting API key stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get API key statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
