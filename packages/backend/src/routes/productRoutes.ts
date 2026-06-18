import express from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController'

const router = express.Router()

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination, filtering and sorting
 * @access  Private
 */
router.get('/', getProducts)

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Private
 */
router.get('/:id', getProductById)

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private
 */
router.post('/', createProduct)

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private
 */
router.put('/:id', updateProduct)

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private
 */
router.delete('/:id', deleteProduct)

export default router
