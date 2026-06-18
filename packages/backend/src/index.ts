import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes';
import storeRoutes from './routes/storeRoutes';
import productRoutes from './routes/productRoutes';
import customerRoutes from './routes/customerRoutes';
import aggregationRoutes from './routes/aggregationRoutes';
import historyRoutes from './routes/historyRoutes';
import storeRegistrationRoutes from './routes/storeRegistrationRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';
import storeManagementRoutes from './routes/storeManagementRoutes';
import storeIntegrationRoutes from './routes/storeIntegrationRoutes';
import authRoutes from './routes/auth';
import { autoAudit } from './middleware/audit';
import { generalLimiter } from './middleware/rateLimiter';
import { sanitizeInput, securityHeaders, limitRequestSize } from './middleware/security';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3100', // Demo store
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Rate limiting
app.use('/api', generalLimiter);

// Additional security middleware
app.use(securityHeaders);
app.use(limitRequestSize(10 * 1024 * 1024)); // 10MB limit
app.use(sanitizeInput);

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Audit middleware for automatic logging
app.use(autoAudit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/aggregation', aggregationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/store-registration', storeRegistrationRoutes);
app.use('/api/stores', apiKeyRoutes);
app.use('/api/store-management', storeManagementRoutes);
app.use('/api/integration', storeIntegrationRoutes);

// API root metadata
app.get('/api', (req, res) => {
  res.json({ 
    message: 'ShopAdmin API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      orders: '/api/orders',
      stores: '/api/stores',
      products: '/api/products',
      aggregation: '/api/aggregation',
      history: '/api/history',
      storeRegistration: '/api/store-registration',
      storeManagement: '/api/store-management',
      integration: '/api/integration'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
