import { Request, Response } from 'express';
import { orderHistoryService } from '../services/orderHistoryService';

/**
 * Get order history for a specific order
 */
export const getOrderHistory = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    const history = await orderHistoryService.getOrderHistory(orderId);

    return res.status(200).json({
      success: true,
      data: {
        orderId,
        history,
      },
    });
  } catch (error) {
    console.error('Error getting order history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get order history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get recent status changes across all orders
 */
export const getRecentStatusChanges = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 50;

    const recentChanges = await orderHistoryService.getRecentStatusChanges(limitNum);

    return res.status(200).json({
      success: true,
      data: recentChanges,
    });
  } catch (error) {
    console.error('Error getting recent status changes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get recent status changes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
