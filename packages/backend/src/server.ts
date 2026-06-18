import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import orderRoutes from './routes/orderRoutes'
import storeRoutes from './routes/storeRoutes'
import productRoutes from './routes/productRoutes'

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// API Routes
app.use('/api/orders', orderRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/products', productRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ShopAdmin API is running',
    version: '1.0.0',
  })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
})

export default app
