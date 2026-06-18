import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers with pagination and filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      storeId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (storeId) {
      where.storeId = storeId as string;
    }

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc',
        },
      }),
      prisma.customer.count({ where }),
    ]);

    // Calculate total spent for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderStats = await prisma.order.aggregate({
          where: { customerId: customer.id },
          _sum: { total: true },
          _count: true,
        });

        return {
          ...customer,
          totalOrders: orderStats._count,
          totalSpent: orderStats._sum.total || 0,
        };
      })
    );

    res.json({
      success: true,
      data: customersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
    });
  }
});

// Get single customer by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: id as string },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Calculate customer stats
    const orderStats = await prisma.order.aggregate({
      where: { customerId: id as string },
      _sum: { total: true },
      _avg: { total: true },
      _count: true,
    });

    return res.json({
      success: true,
      data: {
        ...customer,
        stats: {
          totalOrders: orderStats._count,
          totalSpent: orderStats._sum?.total || 0,
          averageOrderValue: orderStats._avg?.total || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
    });
  }
});

// Update customer
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    const customer = await prisma.customer.update({
      where: { id: id as string },
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer',
    });
  }
});

// Delete customer
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id: id as string },
    });

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer',
    });
  }
});

export default router;
