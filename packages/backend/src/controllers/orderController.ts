import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { 
  CreateOrderSchema, 
  UpdateOrderSchema, 
  OrderQuerySchema 
} from '../types/order.types';

/**
 * Get all orders with pagination, filtering and sorting
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    // Validate and parse query parameters
    const queryResult = OrderQuerySchema.safeParse(req.query);
    
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: queryResult.error.errors,
      });
    }

    const result = await orderService.getOrders(queryResult.data);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }

    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error getting order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create a new order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = CreateOrderSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validationResult.error.errors,
      });
    }

    const order = await orderService.createOrder(validationResult.data);

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update an order
 */
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    // Validate request body
    const validationResult = UpdateOrderSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validationResult.error.errors,
      });
    }

    const updatedOrder = await orderService.updateOrder(id, validationResult.data);

    return res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete an order
 */
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    await orderService.deleteOrder(id);

    return res.status(200).json({
      success: true,
      message: `Order with ID ${id} deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    
    const stats = await orderService.getOrderStats(storeId as string);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting order stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get order statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
