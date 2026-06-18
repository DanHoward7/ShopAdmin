import { Request, Response } from 'express';
import { storeService } from '../services/storeService';
import { 
  StoreCreateSchema,
  StoreUpdateSchema,
  StoreQuerySchema,
  StoreConfigSchema
} from '../types/store.types';

/**
 * Create a new store
 */
export const createStore = async (req: Request, res: Response) => {
  try {
    const validationResult = StoreCreateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store data',
        errors: validationResult.error.errors,
      });
    }

    const store = await storeService.createStore(validationResult.data);

    return res.status(201).json({
      success: true,
      data: store,
      message: 'Store created successfully',
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create store',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all stores with filtering and pagination
 */
export const getStores = async (req: Request, res: Response) => {
  try {
    const queryResult = StoreQuerySchema.safeParse(req.query);
    
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: queryResult.error.errors,
      });
    }

    const result = await storeService.getStores(queryResult.data);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error getting stores:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get stores',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get store by ID
 */
export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Store ID is required' 
      });
    }

    const store = await storeService.getStoreById(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: `Store with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error('Error getting store:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get store',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update store
 */
export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required',
      });
    }

    const validationResult = StoreUpdateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid update data',
        errors: validationResult.error.errors,
      });
    }

    const updatedStore = await storeService.updateStore(id, validationResult.data);

    return res.status(200).json({
      success: true,
      data: updatedStore,
      message: 'Store updated successfully',
    });
  } catch (error) {
    console.error('Error updating store:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update store',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete store
 */
export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required',
      });
    }

    await storeService.deleteStore(id);

    return res.status(200).json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete store',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get store configuration
 */
export const getStoreConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required',
      });
    }

    const config = await storeService.getStoreConfig(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Store configuration for ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error getting store config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get store configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update store configuration
 */
export const updateStoreConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required',
      });
    }

    const validationResult = StoreConfigSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration data',
        errors: validationResult.error.errors,
      });
    }

    const updatedConfig = await storeService.updateStoreConfig(id, validationResult.data);

    return res.status(200).json({
      success: true,
      data: updatedConfig,
      message: 'Store configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating store config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update store configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get store statistics
 */
export const getStoreStats = async (req: Request, res: Response) => {
  try {
    const stats = await storeService.getStoreStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting store stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get store statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
