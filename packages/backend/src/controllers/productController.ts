import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// Get all products with pagination, filtering and sorting
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      storeId,
      category,
      sort = 'createdAt',
      order = 'desc',
      search,
      inStock
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Build filter conditions
    const where: any = {}
    
    if (storeId) {
      where.storeId = storeId as string
    }
    
    if (category) {
      where.category = category as string
    }
    
    if (inStock === 'true') {
      where.stock = { gt: 0 }
    } else if (inStock === 'false') {
      where.stock = { equals: 0 }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where })
    
    // Get products with store relation
    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: limitNum,
      orderBy: {
        [sort as string]: order
      }
    })

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error getting products:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      })
    }

    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            url: true
          }
        }
      }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      })
    }

    return res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error getting product:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      sku,
      stock,
      imageUrl,
      storeId,
      category
    } = req.body

    // Validate required fields
    if (!name || !price || !storeId) {
      return res.status(400).json({
        success: false,
        message: 'Name, price and storeId are required'
      })
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId as string }
    })

    if (!store) {
      return res.status(404).json({
        success: false,
        message: `Store with ID ${storeId} not found`
      })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        sku,
        stock: stock || 0,
        imageUrl,
        storeId: storeId as string,
        category
      }
    })

    return res.status(201).json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      })
    }
    
    const {
      name,
      description,
      price,
      sku,
      stock,
      imageUrl,
      category
    } = req.body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: id as string }
    })

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      })
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: {
        name,
        description,
        price,
        sku,
        stock,
        imageUrl,
        category
      }
    })

    return res.status(200).json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: id as string }
    })

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      })
    }

    // Check if product is used in any orders
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id as string }
    })

    if (orderItemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product as it is used in ${orderItemCount} orders`
      })
    }

    // Delete product
    await prisma.product.delete({
      where: { id: id as string }
    })

    return res.status(200).json({
      success: true,
      message: `Product with ID ${id} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
