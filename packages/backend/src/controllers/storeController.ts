import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// Get all stores
export const getStores = async (req: Request, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
    })

    // Calculate revenue for each store
    const storesWithRevenue = await Promise.all(
      stores.map(async (store) => {
        const revenue = await prisma.order.aggregate({
          where: {
            storeId: store.id,
            status: {
              in: ['COMPLETED', 'SHIPPED'],
            },
          },
          _sum: {
            total: true,
          },
        })

        return {
          ...store,
          revenue: revenue._sum.total || 0,
        }
      })
    )

    return res.status(200).json({
      success: true,
      data: storesWithRevenue,
    })
  } catch (error) {
    console.error('Error getting stores:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get stores',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Get a single store by ID
export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required'
      })
    }

    const store = await prisma.store.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            orders: true,
            products: true,
            customers: true,
          },
        },
      },
    })

    if (!store) {
      return res.status(404).json({
        success: false,
        message: `Store with ID ${id} not found`,
      })
    }

    // Calculate revenue
    const revenue = await prisma.order.aggregate({
      where: {
        storeId: id,
        status: {
          in: ['COMPLETED', 'SHIPPED'],
        },
      },
      _sum: {
        total: true,
      },
    })

    return res.status(200).json({
      success: true,
      data: {
        ...store,
        revenue: revenue._sum.total || 0,
      },
    })
  } catch (error) {
    console.error('Error getting store:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get store',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Create a new store
export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, url, apiKey, apiSecret } = req.body

    // Validate required fields
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Name and URL are required',
      })
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        name,
        url,
        apiKey,
        apiSecret,
      },
    })

    return res.status(201).json({
      success: true,
      data: store,
    })
  } catch (error) {
    console.error('Error creating store:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create store',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Update a store
export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required'
      })
    }
    const { name, url, apiKey, apiSecret, isActive } = req.body

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id: id },
    })

    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: `Store with ID ${id} not found`,
      })
    }

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id: id },
      data: {
        name,
        url,
        apiKey,
        apiSecret,
        isActive,
      },
    })

    return res.status(200).json({
      success: true,
      data: updatedStore,
    })
  } catch (error) {
    console.error('Error updating store:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update store',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Delete a store
export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required'
      })
    }

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id: id },
    })

    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: `Store with ID ${id} not found`,
      })
    }

    // Delete store (will cascade delete related orders, products, etc.)
    await prisma.store.delete({
      where: { id: id },
    })

    return res.status(200).json({
      success: true,
      message: `Store with ID ${id} deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting store:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete store',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Get products by store ID
export const getStoreProducts = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params
    
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required'
      })
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return res.status(404).json({
        success: false,
        message: `Store with ID ${storeId} not found`,
      })
    }

    // Get products for this store
    const products = await prisma.product.findMany({
      where: {
        storeId: storeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.status(200).json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error('Error getting store products:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get store products',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
