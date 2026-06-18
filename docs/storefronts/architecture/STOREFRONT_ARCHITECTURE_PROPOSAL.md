# Storefront Architecture Proposal

## 📋 Executive Summary

This document outlines the architecture and implementation strategy for adding multiple ecommerce storefront applications to the ShopAdmin monorepo. Each storefront will be a separate Next.js application that integrates with the existing backend API while maintaining independence and scalability.

---

## 🎯 Objectives

1. **Multi-Store Support**: Enable multiple independent storefronts within the same monorepo
2. **Code Reusability**: Share common components, utilities, and types across storefronts
3. **Independent Deployment**: Each storefront can be deployed independently
4. **Consistent Architecture**: Maintain consistent patterns across all storefronts
5. **Easy Onboarding**: New storefronts can be scaffolded quickly using templates

---

## 🏗️ Proposed Monorepo Structure

```
ShopAdmin/
├── packages/
│   ├── backend/                    # Existing - API server
│   ├── admin/                      # Renamed from 'frontend'
│   │   └── (admin dashboard app)
│   │
│   ├── shared/                     # NEW - Shared code
│   │   ├── types/                  # Shared TypeScript types
│   │   ├── utils/                  # Shared utilities
│   │   ├── api-client/             # Shared API client
│   │   └── ui-components/          # Shared UI components (optional)
│   │
│   └── storefronts/                # NEW - Storefront applications
│       ├── store-template/         # Template for new stores
│       ├── techgadgets-store/      # Example: TechGadgets storefront
│       ├── fashion-hub-store/      # Example: Fashion Hub storefront
│       └── [store-name]-store/     # Additional stores...
│
├── docs/                           # NEW - Documentation
│   ├── architecture/
│   ├── storefronts/
│   │   ├── techgadgets-store/
│   │   └── fashion-hub-store/
│   └── shared/
│
├── scripts/                        # NEW - Monorepo scripts
│   ├── create-storefront.js        # Scaffold new storefront
│   └── deploy-storefront.js        # Deploy specific storefront
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 📦 Package Structure Details

### 1. **packages/admin** (Renamed from frontend)
- Current admin dashboard
- Minimal changes required
- Update package.json name: `frontend` → `admin`

### 2. **packages/shared** (NEW)
Shared code library that all storefronts can import.

#### Structure:
```
packages/shared/
├── src/
│   ├── types/
│   │   ├── api.ts              # API response types
│   │   ├── product.ts          # Product types
│   │   ├── order.ts            # Order types
│   │   ├── customer.ts         # Customer types
│   │   └── store.ts            # Store types
│   │
│   ├── api-client/
│   │   ├── base.ts             # Base API client
│   │   ├── products.ts         # Products API
│   │   ├── orders.ts           # Orders API
│   │   ├── cart.ts             # Cart API
│   │   └── checkout.ts         # Checkout API
│   │
│   ├── utils/
│   │   ├── currency.ts         # Currency formatting
│   │   ├── date.ts             # Date formatting
│   │   ├── validation.ts       # Form validation
│   │   └── helpers.ts          # General helpers
│   │
│   └── hooks/
│       ├── useProducts.ts      # Products hooks
│       ├── useCart.ts          # Cart hooks
│       └── useCheckout.ts      # Checkout hooks
│
├── package.json
├── tsconfig.json
└── README.md
```

#### package.json:
```json
{
  "name": "@shopadmin/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./types": "./dist/types/index.js",
    "./api-client": "./dist/api-client/index.js",
    "./utils": "./dist/utils/index.js",
    "./hooks": "./dist/hooks/index.js"
  }
}
```

### 3. **packages/storefronts/store-template** (NEW)
Template for creating new storefronts with all boilerplate pre-configured.

#### Structure:
```
packages/storefronts/store-template/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Home page
│   │   ├── products/
│   │   │   ├── page.tsx        # Products listing
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Product detail
│   │   ├── cart/
│   │   │   └── page.tsx        # Shopping cart
│   │   ├── checkout/
│   │   │   └── page.tsx        # Checkout
│   │   └── account/
│   │       ├── page.tsx        # Account dashboard
│   │       ├── orders/
│   │       └── profile/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductDetail.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   └── checkout/
│   │       ├── CheckoutForm.tsx
│   │       └── PaymentForm.tsx
│   │
│   ├── lib/
│   │   ├── store-config.ts     # Store-specific config
│   │   └── theme.ts            # Store theme
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

### 4. **packages/storefronts/[store-name]-store** (NEW)
Individual storefront applications, each with:
- Unique branding and theme
- Store-specific configuration
- Custom features and pages
- Independent deployment

---

## 🔗 Integration Architecture

### API Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Backend API (Port 3001)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /api/stores/:storeId/products                         │ │
│  │  /api/stores/:storeId/orders                           │ │
│  │  /api/stores/:storeId/customers                        │ │
│  │  /api/cart                                             │ │
│  │  /api/checkout                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                ┌───────────┼───────────┐
                │           │           │
                │           │           │
┌───────────────▼───┐  ┌────▼─────┐  ┌─▼──────────────────┐
│  Admin Dashboard  │  │  Shared  │  │  Storefront Apps   │
│   (Port 3000)     │  │ Package  │  │  (Ports 3100+)     │
│                   │  │          │  │                    │
│  - Manage Orders  │  │  Types   │  │  - Product Browse  │
│  - Manage Products│  │  Utils   │  │  - Shopping Cart   │
│  - Manage Stores  │  │  Hooks   │  │  - Checkout        │
│  - Analytics      │  │  API     │  │  - User Account    │
└───────────────────┘  └──────────┘  └────────────────────┘
```

### Store Identification

Each storefront identifies itself to the backend using:

1. **Store ID in API calls**:
   ```typescript
   // In store-config.ts
   export const STORE_CONFIG = {
     storeId: 'store-1', // From database
     name: 'TechGadgets Store',
     apiUrl: process.env.NEXT_PUBLIC_API_URL,
   }
   ```

2. **API Key (optional for public endpoints)**:
   ```typescript
   // For authenticated store operations
   headers: {
     'X-Store-ID': STORE_CONFIG.storeId,
     'X-Store-API-Key': process.env.STORE_API_KEY
   }
   ```

---

## 🛠️ Implementation Plan

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Rename Admin Package
```bash
# Rename packages/frontend to packages/admin
mv packages/frontend packages/admin

# Update package.json
# Update all import references
# Update root package.json scripts
```

#### 1.2 Create Shared Package
```bash
# Create shared package structure
mkdir -p packages/shared/src/{types,api-client,utils,hooks}

# Initialize package
cd packages/shared
yarn init -y

# Setup TypeScript
tsc --init
```

#### 1.3 Extract Common Code
- Move types from admin to shared
- Create base API client
- Extract utility functions
- Create reusable hooks

### Phase 2: Store Template Creation (Week 1-2)

#### 2.1 Create Template Structure
```bash
# Create template
mkdir -p packages/storefronts/store-template

# Initialize Next.js app
cd packages/storefronts/store-template
npx create-next-app@latest . --typescript --tailwind --app
```

#### 2.2 Build Core Features
- Product listing page
- Product detail page
- Shopping cart
- Checkout flow
- User account pages

#### 2.3 Configure Theme System
- Chakra UI or Tailwind CSS
- Theme configuration
- Brand customization

### Phase 3: First Storefront Implementation (Week 2-3)

#### 3.1 Create TechGadgets Store
```bash
# Copy template
cp -r packages/storefronts/store-template packages/storefronts/techgadgets-store

# Configure store
cd packages/storefronts/techgadgets-store
# Update store-config.ts with store-1 ID
# Customize branding
# Add store-specific features
```

#### 3.2 Backend Enhancements
- Add storefront-specific API endpoints
- Implement cart management
- Add checkout API
- Customer authentication for storefronts

#### 3.3 Testing & Refinement
- Test all storefront features
- Verify API integration
- Performance optimization

### Phase 4: Second Storefront (Week 3-4)

#### 4.1 Create Fashion Hub Store
- Copy template
- Configure for store-2
- Customize branding
- Deploy independently

#### 4.2 Documentation
- Create storefront-specific docs
- API integration guide
- Deployment guide

### Phase 5: Automation & Tooling (Week 4)

#### 5.1 Create Scaffolding Script
```bash
# scripts/create-storefront.js
yarn create-storefront --name="MyStore" --storeId="store-3"
```

#### 5.2 Deployment Automation
- Docker configurations per storefront
- CI/CD pipelines
- Environment management

---

## 🔧 Technical Specifications

### Port Allocation
```
3000  - Admin Dashboard
3001  - Backend API
3100  - TechGadgets Store
3101  - Fashion Hub Store
3102+ - Additional Stores
5432  - PostgreSQL
5555  - Prisma Studio
```

### Environment Variables

#### Shared (.env.example)
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Store Configuration (set per storefront)
NEXT_PUBLIC_STORE_ID=store-1
NEXT_PUBLIC_STORE_NAME="TechGadgets Store"

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
```

### Package Dependencies

#### Root package.json updates:
```json
{
  "scripts": {
    "dev": "concurrently \"yarn workspace backend dev\" \"yarn workspace admin dev\"",
    "dev:store:tech": "yarn workspace @storefronts/techgadgets-store dev",
    "dev:store:fashion": "yarn workspace @storefronts/fashion-hub-store dev",
    "dev:all": "concurrently \"yarn workspace backend dev\" \"yarn workspace admin dev\" \"yarn dev:store:tech\" \"yarn dev:store:fashion\"",
    "build:stores": "yarn workspaces foreach -p --include '@storefronts/*' run build"
  },
  "workspaces": [
    "packages/*",
    "packages/storefronts/*"
  ]
}
```

---

## 📊 Database Schema Additions

### New Tables for Storefront Features

```prisma
// Add to schema.prisma

model Cart {
  id         String      @id @default(cuid())
  customerId String?
  sessionId  String?     // For guest users
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

model Wishlist {
  id         String         @id @default(cuid())
  customerId String
  customer   Customer       @relation(fields: [customerId], references: [id], onDelete: Cascade)
  storeId    String
  store      Store          @relation(fields: [storeId], references: [id])
  items      WishlistItem[]
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  @@unique([customerId, storeId])
  @@index([customerId])
  @@index([storeId])
}

model WishlistItem {
  id         String   @id @default(cuid())
  wishlistId String
  wishlist   Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  createdAt  DateTime @default(now())

  @@index([wishlistId])
  @@index([productId])
}

model Review {
  id         String   @id @default(cuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
  rating     Int      // 1-5
  title      String?
  comment    String?
  verified   Boolean  @default(false) // Verified purchase
  helpful    Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([productId])
  @@index([customerId])
}
```

---

## 🎨 UI/UX Considerations

### Design System Options

#### Option 1: Chakra UI (Consistent with Admin)
**Pros:**
- Already used in admin dashboard
- Excellent theming system
- Component library ready
- TypeScript support

**Cons:**
- Larger bundle size
- Learning curve for customization

#### Option 2: Tailwind CSS + shadcn/ui
**Pros:**
- Smaller bundle size
- Highly customizable
- Modern approach
- Great performance

**Cons:**
- Different from admin
- More setup required

#### Option 3: Hybrid Approach
- Use Chakra UI for shared components
- Allow storefronts to choose their own UI framework
- Provide both Chakra and Tailwind templates

**Recommendation**: Start with Chakra UI for consistency, provide Tailwind template later.

---

## 🚀 Deployment Strategy

### Development
```bash
# Run all services
yarn dev:all

# Run specific storefront
yarn dev:store:tech
```

### Production

#### Option 1: Vercel (Recommended for Next.js)
- Each storefront as separate Vercel project
- Environment variables per project
- Automatic deployments from Git branches

#### Option 2: Docker + Kubernetes
```yaml
# docker-compose.prod.yml
services:
  backend:
    build: ./packages/backend
    ports:
      - "3001:3001"
  
  admin:
    build: ./packages/admin
    ports:
      - "3000:3000"
  
  techgadgets-store:
    build: ./packages/storefronts/techgadgets-store
    ports:
      - "3100:3000"
    environment:
      - NEXT_PUBLIC_STORE_ID=store-1
  
  fashion-hub-store:
    build: ./packages/storefronts/fashion-hub-store
    ports:
      - "3101:3000"
    environment:
      - NEXT_PUBLIC_STORE_ID=store-2
```

#### Option 3: Traditional VPS
- Nginx reverse proxy
- PM2 for process management
- Each storefront on different subdomain

---

## 📚 Documentation Structure

```
docs/
├── architecture/
│   ├── overview.md
│   ├── monorepo-structure.md
│   └── api-integration.md
│
├── shared/
│   ├── api-client.md
│   ├── types.md
│   ├── utils.md
│   └── hooks.md
│
├── storefronts/
│   ├── getting-started.md
│   ├── creating-new-storefront.md
│   ├── customization-guide.md
│   ├── deployment.md
│   │
│   ├── techgadgets-store/
│   │   ├── PLAN.md
│   │   ├── TECHNICAL_SPEC.md
│   │   ├── DEPLOYMENT.md
│   │   └── CHANGELOG.md
│   │
│   └── fashion-hub-store/
│       ├── PLAN.md
│       ├── TECHNICAL_SPEC.md
│       ├── DEPLOYMENT.md
│       └── CHANGELOG.md
│
└── admin/
    └── (existing docs)
```

---

## ⚠️ Potential Challenges & Solutions

### Challenge 1: Code Duplication
**Solution**: Aggressive use of shared package, create reusable components

### Challenge 2: Version Management
**Solution**: Use workspace protocol in package.json, centralized dependency management

### Challenge 3: Build Times
**Solution**: Turborepo for caching, incremental builds

### Challenge 4: Different Store Requirements
**Solution**: Feature flags, plugin system, extensible architecture

### Challenge 5: Database Migrations
**Solution**: Careful planning, backward compatibility, feature flags

---

## 💰 Cost Considerations

### Infrastructure Costs (Monthly Estimates)

**Development:**
- Local development: $0
- Shared PostgreSQL: $0 (Docker)

**Production (Small Scale):**
- Backend API (VPS): $10-20
- PostgreSQL (Managed): $15-25
- Admin Dashboard (Vercel): $0 (Hobby)
- 2 Storefronts (Vercel): $0 (Hobby) or $40 (Pro)
- CDN/Assets: $5-10
- **Total: $30-95/month**

**Production (Medium Scale):**
- Backend API (VPS/Cloud): $50-100
- PostgreSQL (Managed): $50-100
- Admin Dashboard: $20
- 5 Storefronts: $100
- CDN/Assets: $20-50
- **Total: $240-370/month**

---

## 📈 Success Metrics

### Technical Metrics
- Build time per storefront: < 2 minutes
- Page load time: < 2 seconds
- API response time: < 500ms
- Code reusability: > 60% shared code
- Test coverage: > 80%

### Business Metrics
- Time to launch new storefront: < 1 week
- Developer onboarding time: < 2 days
- Deployment frequency: Multiple per day
- Zero-downtime deployments: 100%

---

## 🎯 Next Steps

### Immediate Actions (This Week)
1. ✅ Review and approve this proposal
2. 📝 Create detailed technical specifications for shared package
3. 🏗️ Begin Phase 1: Foundation Setup
4. 📋 Create project board for storefront development

### Short Term (Next 2 Weeks)
1. Complete shared package
2. Build store template
3. Create first storefront (TechGadgets)
4. Write documentation

### Medium Term (Next Month)
1. Launch second storefront (Fashion Hub)
2. Create automation scripts
3. Setup CI/CD pipelines
4. Performance optimization

---

## 📞 Questions for Discussion

1. **UI Framework**: Chakra UI vs Tailwind CSS vs Hybrid?
2. **Deployment**: Vercel vs Docker vs VPS?
3. **Payment Integration**: Stripe, PayPal, or multiple options?
4. **Authentication**: Separate auth per store or unified?
5. **Inventory Management**: Real-time sync or eventual consistency?
6. **Search**: Built-in or third-party (Algolia, Elasticsearch)?
7. **CDN**: Cloudflare, AWS CloudFront, or Vercel Edge?
8. **Analytics**: Google Analytics, Plausible, or custom?

---

## 📝 Conclusion

This architecture provides a scalable, maintainable foundation for adding multiple ecommerce storefronts to the ShopAdmin monorepo. Key benefits:

✅ **Code Reusability**: Shared package reduces duplication  
✅ **Independence**: Each storefront can be deployed separately  
✅ **Consistency**: Template ensures best practices  
✅ **Scalability**: Easy to add new storefronts  
✅ **Maintainability**: Centralized types and utilities  
✅ **Flexibility**: Each store can be customized  

**Recommendation**: Proceed with Phase 1 implementation and create the first storefront as a proof of concept.

---

**Document Version**: 1.0  
**Last Updated**: November 20, 2025  
**Author**: Development Team  
**Status**: 📋 Proposal - Awaiting Approval
