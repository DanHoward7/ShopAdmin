import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { OrderQuerySchema } from '../types/order.types';

/**
 * Get aggregated order data across all stores
 */
export const getAggregatedOrders = async (req: Request, res: Response) => {
  try {
    const queryResult = OrderQuerySchema.safeParse(req.query);
    
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: queryResult.error.errors,
      });
    }

    const result = await orderService.getOrders(queryResult.data);

    // Add aggregation metadata
    const aggregationData = {
      ...result,
      aggregation: {
        totalStores: new Set(result.orders.map(order => order.storeId)).size,
        storeBreakdown: result.orders.reduce((acc, order) => {
          const storeName = order.store.name;
          if (!acc[storeName]) {
            acc[storeName] = {
              count: 0,
              totalRevenue: 0,
              storeId: order.storeId,
            };
          }
          acc[storeName].count++;
          acc[storeName].totalRevenue += order.total;
          return acc;
        }, {} as Record<string, { count: number; totalRevenue: number; storeId: string }>),
      },
    };

    return res.status(200).json({
      success: true,
      ...aggregationData,
    });
  } catch (error) {
    console.error('Error getting aggregated orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get aggregated orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get store comparison metrics
 */
export const getStoreComparison = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    // Get orders for all stores
    const queryParams: any = {
      page: 1,
      limit: 1000, // Get all orders for comparison
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    
    if (dateFrom) queryParams.dateFrom = dateFrom as string;
    if (dateTo) queryParams.dateTo = dateTo as string;
    
    const allOrdersResult = await orderService.getOrders(queryParams);

    // Group by store and calculate metrics
    const storeMetrics = allOrdersResult.orders.reduce((acc, order) => {
      const storeId = order.storeId;
      const storeName = order.store.name;

      if (!acc[storeId]) {
        acc[storeId] = {
          storeId,
          storeName,
          storeUrl: order.store.url,
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          statusBreakdown: {
            PENDING: 0,
            PROCESSING: 0,
            COMPLETED: 0,
            CANCELLED: 0,
            REFUNDED: 0,
            ON_HOLD: 0,
            SHIPPED: 0,
          },
        };
      }

      acc[storeId].totalOrders++;
      acc[storeId].totalRevenue += order.total;
      acc[storeId].statusBreakdown[order.status]++;

      return acc;
    }, {} as Record<string, any>);

    // Calculate average order values
    Object.values(storeMetrics).forEach((store: any) => {
      store.averageOrderValue = store.totalOrders > 0 
        ? store.totalRevenue / store.totalOrders 
        : 0;
    });

    return res.status(200).json({
      success: true,
      data: {
        stores: Object.values(storeMetrics),
        summary: {
          totalStores: Object.keys(storeMetrics).length,
          totalOrders: allOrdersResult.orders.length,
          totalRevenue: Object.values(storeMetrics).reduce((sum: number, store: any) => sum + store.totalRevenue, 0),
          dateRange: { dateFrom, dateTo },
        },
      },
    });
  } catch (error) {
    console.error('Error getting store comparison:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get store comparison',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
