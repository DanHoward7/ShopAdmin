# Multi-Storefront Implementation Guide

## 📋 Quick Reference

This guide provides step-by-step instructions for implementing the multi-storefront architecture in the ShopAdmin monorepo.

---

## 📚 Documentation Index

1. **[STOREFRONT_ARCHITECTURE_PROPOSAL.md](./STOREFRONT_ARCHITECTURE_PROPOSAL.md)** - Complete architectural proposal
2. **[STOREFRONT_PLAN_TEMPLATE.md](./STOREFRONT_PLAN_TEMPLATE.md)** - Template for storefront development plans
3. **[STOREFRONT_TECHNICAL_SPEC_TEMPLATE.md](./STOREFRONT_TECHNICAL_SPEC_TEMPLATE.md)** - Template for technical specifications
4. **This Document** - Implementation guide

---

## 🎯 Implementation Phases

### Phase 1: Foundation Setup (Week 1)

#### Step 1.1: Rename Admin Package
```bash
# Navigate to packages directory
cd packages

# Rename frontend to admin
mv frontend admin

# Update package.json
cd admin
# Change "name": "frontend" to "name": "admin"
```

#### Step 1.2: Update Root Configuration
```bash
# Update root package.json
cd ../..
```

Edit `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"yarn workspace backend dev\" \"yarn workspace admin dev\"",
    "build": "yarn workspace backend build && yarn workspace admin build",
    "start": "concurrently \"yarn workspace backend start\" \"yarn workspace admin start\"",
    "lint": "yarn workspace backend lint && yarn workspace admin lint",
    "type-check": "yarn workspace backend type-check && yarn workspace admin type-check"
  }
}
```

#### Step 1.3: Create Shared Package
```bash
# Create shared package directory
mkdir -p packages/shared/src/{types,api-client,utils,hooks}

# Navigate to shared package
cd packages/shared

# Initialize package.json
cat > package.json << 'EOF'
{
  "name": "@shopadmin/shared",
  "version": "1.0.0",
  "description": "Shared code for ShopAdmin storefronts",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./types": "./dist/types/index.js",
    "./api-client": "./dist/api-client/index.js",
    "./utils": "./dist/utils/index.js",
    "./hooks": "./dist/hooks/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "axios": "^1.6.5",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "typescript": "^5.3.3"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Install dependencies
yarn install
```

#### Step 1.4: Extract Common Types
```bash
# Create base types file
cat > src/types/index.ts << 'EOF'
// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Product Types
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  sku?: string
  stock: number
  imageUrl?: string
  images?: string[]
  categoryId?: string
  storeId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Order Types
export type OrderStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface Order {
  id: string
  orderNumber: string
  storeId: string
  customerId?: string
  status: OrderStatus
  total: number
  tax?: number
  shipping?: number
  items: OrderItem[]
  shippingAddress?: Address
  billingAddress?: Address
  paymentMethod?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  price: number
  quantity: number
  total: number
}

// Customer Types
export interface Customer {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  storeId: string
  createdAt: string
  updatedAt: string
}

// Address Types
export interface Address {
  id?: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

// Cart Types
export interface Cart {
  id: string
  customerId?: string
  sessionId?: string
  storeId: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

// Checkout Types
export interface CheckoutData {
  email: string
  shippingAddress: Address
  billingAddress?: Address
  paymentMethod: string
  shippingMethod: string
}

export interface CheckoutResponse {
  orderId: string
  orderNumber: string
  total: number
  status: OrderStatus
}
EOF
```

#### Step 1.5: Create Base API Client
```bash
# Create API client
cat > src/api-client/base.ts << 'EOF'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

export class BaseApiClient {
  protected client: AxiosInstance

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          // Clear tokens and redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/account/login'
        }
        return Promise.reject(error)
      }
    )
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  protected async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export function createApiClient(config: ApiClientConfig) {
  return new BaseApiClient(config)
}
EOF
```

#### Step 1.6: Build Shared Package
```bash
# Build the shared package
cd packages/shared
yarn build
```

---

### Phase 2: Create Storefront Template (Week 1-2)

#### Step 2.1: Create Template Directory
```bash
# Create storefronts directory
cd ../..
mkdir -p packages/storefronts

# Create template
cd packages/storefronts
npx create-next-app@latest store-template --typescript --tailwind --app --no-src-dir
```

#### Step 2.2: Configure Template
```bash
cd store-template

# Install additional dependencies
yarn add @shopadmin/shared@workspace:* @tanstack/react-query zustand axios react-icons

# Create directory structure
mkdir -p src/{components/{layout,product,cart,checkout,account,shared},lib,hooks,store,types}
```

#### Step 2.3: Create Store Configuration
```bash
cat > src/lib/store-config.ts << 'EOF'
export const STORE_CONFIG = {
  storeId: process.env.NEXT_PUBLIC_STORE_ID || 'store-template',
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'Store Template',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  features: {
    reviews: true,
    wishlist: true,
    guestCheckout: true,
  },
} as const
EOF
```

#### Step 2.4: Create Environment Template
```bash
cat > .env.example << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STORE_ID=store-template
NEXT_PUBLIC_STORE_NAME="Store Template"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3100

# Feature Flags
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_GUEST_CHECKOUT=true
EOF

# Copy to .env.local
cp .env.example .env.local
```

---

### Phase 3: Create First Storefront (Week 2-3)

#### Step 3.1: Copy Template
```bash
# From packages/storefronts directory
cp -r store-template techgadgets-store
cd techgadgets-store
```

#### Step 3.2: Configure Store
```bash
# Update .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STORE_ID=store-1
NEXT_PUBLIC_STORE_NAME="TechGadgets Store"
NEXT_PUBLIC_APP_URL=http://localhost:3100
EOF

# Update package.json name
# Change "name": "store-template" to "name": "@storefronts/techgadgets-store"
```

#### Step 3.3: Update Root Scripts
```bash
# Add to root package.json scripts
cd ../../..

# Edit package.json to add:
{
  "scripts": {
    "dev:store:tech": "yarn workspace @storefronts/techgadgets-store dev",
    "build:store:tech": "yarn workspace @storefronts/techgadgets-store build"
  },
  "workspaces": [
    "packages/*",
    "packages/storefronts/*"
  ]
}
```

#### Step 3.4: Start Development
```bash
# Start backend
yarn workspace backend dev

# In another terminal, start storefront
yarn dev:store:tech
```

---

### Phase 4: Backend Enhancements

#### Step 4.1: Add Cart Endpoints
Create `packages/backend/src/routes/cartRoutes.ts`:
```typescript
import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Get cart
router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params
  
  const cart = await prisma.cart.findFirst({
    where: { sessionId },
    include: { items: true },
  })
  
  res.json({ success: true, data: cart })
})

// Add item to cart
router.post('/', async (req, res) => {
  const { sessionId, storeId, productId, quantity } = req.body
  
  // Implementation here
  
  res.json({ success: true, data: cart })
})

export default router
```

#### Step 4.2: Add Checkout Endpoints
Create `packages/backend/src/routes/checkoutRoutes.ts`:
```typescript
import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Create order from cart
router.post('/create-order', async (req, res) => {
  const { cartId, shippingAddress, billingAddress, paymentMethod } = req.body
  
  // Implementation here
  
  res.json({ success: true, data: order })
})

export default router
```

#### Step 4.3: Update Database Schema
Add to `packages/backend/prisma/schema.prisma`:
```prisma
model Cart {
  id         String      @id @default(cuid())
  customerId String?
  sessionId  String?
  storeId    String
  store      Store       @relation(fields: [storeId], references: [id])
  items      CartItem[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  expiresAt  DateTime?

  @@index([customerId])
  @@index([sessionId])
  @@index([storeId])
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([cartId])
  @@index([productId])
}
```

Run migration:
```bash
cd packages/backend
yarn db:push
```

---

## 🛠️ Creating New Storefronts

### Quick Command (Future - After Script Creation)
```bash
yarn create-storefront --name="MyStore" --storeId="store-3" --port=3102
```

### Manual Process
1. Copy template: `cp -r packages/storefronts/store-template packages/storefronts/mystore-store`
2. Update `.env.local` with store ID and name
3. Update `package.json` name
4. Customize branding in `src/lib/store-config.ts`
5. Add to root `package.json` scripts
6. Start development: `yarn dev:store:mystore`

---

## 📊 Project Structure After Implementation

```
ShopAdmin/
├── packages/
│   ├── backend/              # API server
│   ├── admin/                # Admin dashboard (renamed from frontend)
│   ├── shared/               # Shared code library
│   └── storefronts/
│       ├── store-template/   # Template for new stores
│       ├── techgadgets-store/
│       └── fashion-hub-store/
│
├── docs/
│   ├── architecture/
│   └── storefronts/
│       ├── techgadgets-store/
│       │   ├── PLAN.md
│       │   ├── TECHNICAL_SPEC.md
│       │   └── DEPLOYMENT.md
│       └── fashion-hub-store/
│           └── ...
│
├── scripts/
│   └── create-storefront.js
│
├── STOREFRONT_ARCHITECTURE_PROPOSAL.md
├── STOREFRONT_PLAN_TEMPLATE.md
├── STOREFRONT_TECHNICAL_SPEC_TEMPLATE.md
├── MULTI_STOREFRONT_IMPLEMENTATION_GUIDE.md (this file)
├── docker-compose.yml
├── package.json
└── README.md
```

---

## ✅ Verification Checklist

### After Phase 1 (Foundation)
- [ ] Admin package renamed successfully
- [ ] Shared package created and builds
- [ ] Types extracted to shared package
- [ ] Base API client working
- [ ] Root scripts updated

### After Phase 2 (Template)
- [ ] Store template created
- [ ] Template builds successfully
- [ ] Environment variables configured
- [ ] Basic pages created

### After Phase 3 (First Storefront)
- [ ] TechGadgets store created
- [ ] Store ID configured correctly
- [ ] Storefront runs on port 3100
- [ ] Can fetch products from API
- [ ] Basic navigation works

### After Phase 4 (Backend)
- [ ] Cart endpoints implemented
- [ ] Checkout endpoints implemented
- [ ] Database schema updated
- [ ] Migrations run successfully

---

## 🚀 Next Steps

1. **Review Proposal**: Read [STOREFRONT_ARCHITECTURE_PROPOSAL.md](./STOREFRONT_ARCHITECTURE_PROPOSAL.md)
2. **Start Implementation**: Follow Phase 1 steps above
3. **Create Documentation**: Use templates for each new storefront
4. **Build Features**: Implement cart, checkout, and account features
5. **Test Thoroughly**: Ensure all features work correctly
6. **Deploy**: Set up production deployment

---

## 📞 Questions & Support

For questions about implementation:
1. Review the architecture proposal
2. Check the templates
3. Refer to this implementation guide
4. Create an issue or discussion

---

## 📝 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **React Query Documentation**: https://tanstack.com/query/latest
- **Zustand Documentation**: https://zustand-demo.pmnd.rs/
- **Prisma Documentation**: https://www.prisma.io/docs

---

**Last Updated**: November 20, 2025  
**Version**: 1.0  
**Status**: Ready for Implementation
