# [Store Name] - Technical Specification

> **Template for technical specifications of individual storefronts**
>
> Copy this template to `docs/storefronts/[store-name]/TECHNICAL_SPEC.md`

---

## 📋 Document Information

**Store Name**: [Store Name]  
**Store ID**: [store-id]  
**Version**: 1.0  
**Last Updated**: [Date]  
**Status**: [Draft / Review / Approved / Implemented]

---

## 🎯 Technical Overview

### Purpose
[Brief description of the storefront's technical purpose and architecture]

### Technology Stack
```
Frontend Framework: Next.js 14 (App Router)
Language: TypeScript 5.3+
UI Framework: [Chakra UI / Tailwind CSS]
State Management: Zustand
Data Fetching: React Query (@tanstack/react-query)
API Client: Axios
Styling: [CSS Modules / Tailwind / Chakra]
Testing: Jest + React Testing Library + Playwright
```

### System Requirements
- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Modern browser (Chrome, Firefox, Safari, Edge)

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    [Store Name] Frontend                 │
│                     (Next.js 14)                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Pages (App Router)                                │ │
│  │  - Home, Products, Cart, Checkout, Account        │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Components                                        │ │
│  │  - Layout, Product, Cart, Checkout, Account       │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  State Management (Zustand)                       │ │
│  │  - Cart, User, UI State                           │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Data Layer (React Query)                         │ │
│  │  - Products, Orders, Customer                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/REST
                            │
┌─────────────────────────────────────────────────────────┐
│              @shopadmin/shared Package                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  API Client, Types, Utils, Hooks                  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/REST
                            │
┌─────────────────────────────────────────────────────────┐
│                  Backend API Server                      │
│                  (Express + Prisma)                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  REST API Endpoints                                │ │
│  │  - Products, Cart, Checkout, Orders, Customers    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │
┌─────────────────────────────────────────────────────────┐
│                PostgreSQL Database                       │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
packages/storefronts/[store-name]-store/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── globals.css               # Global styles
│   │   │
│   │   ├── products/                 # Products section
│   │   │   ├── page.tsx              # Products listing
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Product detail
│   │   │   └── loading.tsx           # Loading state
│   │   │
│   │   ├── cart/                     # Cart section
│   │   │   └── page.tsx              # Cart page
│   │   │
│   │   ├── checkout/                 # Checkout section
│   │   │   ├── page.tsx              # Checkout page
│   │   │   └── success/
│   │   │       └── page.tsx          # Order confirmation
│   │   │
│   │   ├── account/                  # Account section
│   │   │   ├── layout.tsx            # Account layout
│   │   │   ├── page.tsx              # Account dashboard
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── orders/
│   │   │   ├── profile/
│   │   │   └── wishlist/
│   │   │
│   │   ├── about/
│   │   ├── contact/
│   │   └── api/                      # API routes (if needed)
│   │
│   ├── components/                   # React components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── MobileMenu.tsx
│   │   │
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   └── AddToCartButton.tsx
│   │   │
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartList.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartDrawer.tsx
│   │   │
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── ShippingForm.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── OrderSummary.tsx
│   │   │
│   │   ├── account/
│   │   │   ├── AccountLayout.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   └── WishlistItem.tsx
│   │   │
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Loading.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── lib/                          # Utilities and config
│   │   ├── store-config.ts           # Store configuration
│   │   ├── theme.ts                  # Theme configuration
│   │   ├── constants.ts              # Constants
│   │   └── utils.ts                  # Utility functions
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useCart.ts                # Cart management
│   │   ├── useAuth.ts                # Authentication
│   │   ├── useCheckout.ts            # Checkout flow
│   │   └── useLocalStorage.ts        # Local storage
│   │
│   ├── store/                        # Zustand stores
│   │   ├── cartStore.ts              # Cart state
│   │   ├── userStore.ts              # User state
│   │   └── uiStore.ts                # UI state
│   │
│   └── types/                        # TypeScript types
│       ├── index.ts                  # Type exports
│       ├── cart.ts                   # Cart types
│       └── checkout.ts               # Checkout types
│
├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   ├── logo.svg
│   └── favicon.ico
│
├── tests/                            # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                      # Environment variables template
├── .env.local                        # Local environment variables
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── README.md                         # Documentation
```

---

## 🔧 Configuration

### Store Configuration

```typescript
// src/lib/store-config.ts
export const STORE_CONFIG = {
  // Store Identity
  storeId: '[store-id]',
  storeName: '[Store Name]',
  storeUrl: 'https://[domain]',
  
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  apiTimeout: 30000,
  
  // Features
  features: {
    reviews: true,
    wishlist: true,
    guestCheckout: true,
    socialLogin: false,
    productRecommendations: true,
  },
  
  // Pagination
  pagination: {
    productsPerPage: 12,
    ordersPerPage: 10,
  },
  
  // Cart
  cart: {
    maxItems: 99,
    persistDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Checkout
  checkout: {
    requireAccount: false,
    allowGuestCheckout: true,
    shippingMethods: ['standard', 'express', 'overnight'],
    paymentMethods: ['card', 'paypal'],
  },
  
  // SEO
  seo: {
    defaultTitle: '[Store Name] - [Tagline]',
    defaultDescription: '[Store description]',
    defaultKeywords: ['keyword1', 'keyword2'],
    ogImage: '/og-image.jpg',
  },
  
  // Social Media
  social: {
    facebook: 'https://facebook.com/[handle]',
    twitter: 'https://twitter.com/[handle]',
    instagram: 'https://instagram.com/[handle]',
  },
  
  // Contact
  contact: {
    email: 'support@[domain]',
    phone: '+1-XXX-XXX-XXXX',
    address: '[Physical address]',
  },
} as const

export type StoreConfig = typeof STORE_CONFIG
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STORE_ID=[store-id]
NEXT_PUBLIC_STORE_NAME="[Store Name]"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3100
NODE_ENV=development

# Payment Integration
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_GUEST_CHECKOUT=true

# Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Email Service (Optional)
SENDGRID_API_KEY=
EMAIL_FROM=noreply@[domain]
```

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      '[your-cdn-domain]',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_STORE_ID: process.env.NEXT_PUBLIC_STORE_ID,
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/shop',
        destination: '/products',
        permanent: true,
      },
    ]
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## 📊 State Management

### Cart Store (Zustand)

```typescript
// src/store/cartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  variant?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.productId === item.productId)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          }
        }
        return { items: [...state.items, item] }
      }),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.productId === productId ? { ...i, quantity } : i
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => 
          total + (item.price * item.quantity), 0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
```

### User Store

```typescript
// src/store/userStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface UserStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),
      
      logout: () => set({
        user: null,
        isAuthenticated: false
      }),
    }),
    {
      name: 'user-storage',
    }
  )
)
```

---

## 🔌 API Integration

### API Client Setup

```typescript
// Uses @shopadmin/shared API client
import { createApiClient } from '@shopadmin/shared/api-client'
import { STORE_CONFIG } from '@/lib/store-config'

export const apiClient = createApiClient({
  baseURL: STORE_CONFIG.apiUrl,
  timeout: STORE_CONFIG.apiTimeout,
  headers: {
    'X-Store-ID': STORE_CONFIG.storeId,
  },
})
```

### React Query Hooks

```typescript
// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Product, ProductFilters } from '@shopadmin/shared/types'

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiClient.products.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient.products.getById(id),
    enabled: !!id,
  })
}
```

### API Endpoints Reference

```typescript
// Products
GET    /api/stores/:storeId/products
GET    /api/stores/:storeId/products/:id
GET    /api/stores/:storeId/products/search?q=query
GET    /api/stores/:storeId/categories

// Cart
GET    /api/cart/:sessionId
POST   /api/cart
PUT    /api/cart/:id/items
DELETE /api/cart/:id/items/:itemId
PATCH  /api/cart/:id/items/:itemId

// Checkout
POST   /api/checkout/validate
POST   /api/checkout/calculate-shipping
POST   /api/checkout/create-order
POST   /api/checkout/process-payment

// Customers
POST   /api/customers/register
POST   /api/customers/login
GET    /api/customers/me
PUT    /api/customers/me
GET    /api/customers/me/orders
GET    /api/customers/me/orders/:id

// Reviews (if enabled)
GET    /api/stores/:storeId/products/:id/reviews
POST   /api/stores/:storeId/products/:id/reviews

// Wishlist (if enabled)
GET    /api/customers/me/wishlist
POST   /api/customers/me/wishlist
DELETE /api/customers/me/wishlist/:itemId
```

---

## 🎨 Theming & Styling

### Theme Configuration

```typescript
// src/lib/theme.ts (Chakra UI example)
import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#[color]',
      100: '#[color]',
      // ... more shades
      900: '#[color]',
    },
  },
  fonts: {
    heading: '[Font Family]',
    body: '[Font Family]',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
})
```

### Responsive Breakpoints

```typescript
// Chakra UI breakpoints
const breakpoints = {
  base: '0px',    // Mobile
  sm: '480px',    // Small mobile
  md: '768px',    // Tablet
  lg: '992px',    // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
// tests/unit/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/product/ProductCard'

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    image: '/test.jpg',
  }
  
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })
  
  it('calls onAddToCart when button clicked', () => {
    const onAddToCart = jest.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    button.click()
    
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct)
  })
})
```

### Integration Tests

```typescript
// tests/integration/cart.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/store/cartStore'

describe('Cart Integration', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })
  
  it('adds item to cart', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem({
        id: '1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      })
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.getTotalPrice()).toBe(99.99)
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test('complete checkout flow', async ({ page }) => {
  // Navigate to products
  await page.goto('/products')
  
  // Add product to cart
  await page.click('[data-testid="product-card"]:first-child button')
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  
  // Go to cart
  await page.click('[data-testid="cart-icon"]')
  await expect(page).toHaveURL('/cart')
  
  // Proceed to checkout
  await page.click('button:has-text("Checkout")')
  await expect(page).toHaveURL('/checkout')
  
  // Fill shipping info
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="firstName"]', 'John')
  await page.fill('[name="lastName"]', 'Doe')
  await page.fill('[name="address"]', '123 Main St')
  await page.fill('[name="city"]', 'New York')
  await page.fill('[name="postalCode"]', '10001')
  
  // Submit order
  await page.click('button:has-text("Place Order")')
  
  // Verify success
  await expect(page).toHaveURL(/\/checkout\/success/)
  await expect(page.locator('h1')).toContainText('Order Confirmed')
})
```

---

## 🚀 Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const ProductGallery = dynamic(() => import('@/components/product/ProductGallery'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={product.blurDataUrl}
/>
```

### Caching Strategy

```typescript
// React Query cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## 🔒 Security

### Authentication

```typescript
// JWT token storage and management
import { useUserStore } from '@/store/userStore'

export function useAuth() {
  const { user, setUser, logout } = useUserStore()
  
  const login = async (email: string, password: string) => {
    const response = await apiClient.customers.login({ email, password })
    const { token, user } = response.data
    
    // Store token
    localStorage.setItem('accessToken', token)
    
    // Update user state
    setUser(user)
  }
  
  return { user, login, logout }
}
```

### Input Validation

```typescript
// Form validation with Zod
import { z } from 'zod'

export const checkoutSchema = z.object({
  email: z.string().email('Invalid email'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(1, 'City required'),
  postalCode: z.string().regex(/^\d{5}$/, 'Invalid postal code'),
})
```

### XSS Protection

```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify'

const sanitizedHtml = DOMPurify.sanitize(userInput)
```

---

## 📊 Analytics & Monitoring

### Google Analytics

```typescript
// lib/analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label: string
  value?: number
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
```

### Error Tracking (Sentry)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

---

## 📦 Build & Deployment

### Build Process

```bash
# Install dependencies
yarn install

# Type check
yarn type-check

# Lint
yarn lint

# Test
yarn test

# Build
yarn build

# Start production
yarn start
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 📝 API Documentation

[Link to detailed API documentation or embed key endpoints here]

---

## 🔄 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | [Date] | Initial specification | [Name] |

---

## 📞 Support & Contact

**Technical Lead**: [Name]  
**Email**: [email]  
**Slack Channel**: #[channel-name]

---

**Document Status**: [Draft / Review / Approved / Implemented]  
**Next Review Date**: [Date]
