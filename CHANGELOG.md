# Changelog

All notable changes to the ShopAdmin project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 8.1 - Product Detail Page & Image Assets (2025-11-20)

#### Added
- **Product Detail Page**: Full-featured detail page at `/products/[id]`
  - Large product image display
  - Complete product information (name, price, SKU, category, description)
  - Stock availability indicators
  - Quantity selector with stock limits
  - Add to cart functionality
  - Breadcrumb navigation
  - Success notifications with animations
- **Image Asset Strategy**: Comprehensive documentation for image handling
  - Created `docs/IMAGE_ASSET_STRATEGY.md`
  - Documented Cloudinary, AWS S3, and self-hosted options
  - Comparison matrix and implementation guides
  - Security considerations and best practices
- **Real Product Images**: Updated seed data with 8 products using Unsplash images
  - Wireless Bluetooth Headphones
  - Premium Cotton T-Shirt
  - Smart Watch Series 5
  - Wireless Mouse
  - Mechanical Keyboard
  - Laptop Backpack
  - Running Shoes
  - Denim Jeans

#### Changed
- **ProductCard Component**: Enhanced with clickable elements
  - Image links to detail page
  - Title links to detail page
  - Added "View Details" button with eye icon
  - Improved hover states and transitions
- **Seed Data**: Replaced placeholder URLs with real Unsplash image URLs

#### Documentation
- Created comprehensive image asset management strategy document
- Updated README with image asset documentation reference
- Updated DEMO_PLAN with image asset information

---

### Phase 8 - Demo Storefront MVP (2025-11-20)

#### Added
- **Demo Storefront Application**: Complete Next.js 14 ecommerce storefront at `packages/storefronts/demo-store`
- **Product Listing Page**: Display products from backend with "Add to Cart" functionality
- **Shopping Cart**: Full cart management with localStorage persistence, quantity updates, and item removal
- **Checkout Flow**: Form validation and order submission with shipping address
- **Order Confirmation**: Success page with order details and link to admin dashboard
- **Backend Endpoint**: Added `GET /api/stores/:storeId/products` to fetch products by store
- **Guest Checkout Support**: Orders can be placed without customer accounts
- **Guest Customer Display**: Admin UI extracts guest info from order notes for display

#### Fixed
- **CORS Configuration**: Added demo store URL (port 3100) to allowed origins
- **Order Schema**: Updated order creation to include `orderNumber`, item `name`, and item `total` fields
- **Product Types**: Aligned frontend types with backend schema (removed `isActive`, added `category`)
- **Null Customer Handling**: OrderCustomerInfo component now handles null customers gracefully
- **Order Number Generation**: Auto-generate unique order numbers in format `ORD-{timestamp}-{random}`

#### Changed
- **Order Notes Format**: Store guest customer info as "Order from FirstName LastName (email@example.com)"
- **Cart Persistence**: Implemented localStorage for cart state across page refreshes
- **API Client**: Added comprehensive error logging for debugging

#### Documentation
- Updated `docs/storefronts/demo-store/DEMO_PLAN.md` with completion status
- Updated `PLAN.md` Phase 8 to Complete status
- Created complete implementation summary with resolved issues

---

### Phase 4.7 - Customers CRUD Implementation (2025-11-19)

#### Added
- **Customer Detail Page Actions**: Added Edit and Delete buttons to customer detail page header
- **Customer Delete Functionality**: Full delete operation with confirmation dialog and API integration
- **Customer Navigation**: Fixed routing to use `/dashboard/customers/${id}` for detail pages

#### Fixed
- **Params Handling**: Fixed `use(params)` error by removing Promise wrapper from params interface
- **Authentication Token**: Fixed critical token storage key mismatch - changed from `token` to `accessToken` to match auth-api storage
- **Customer Detail Navigation**: Updated customer list to navigate to correct dashboard route
- **Order Navigation from Customer Detail**: Fixed order links to use `/dashboard/orders/${id}` instead of `/orders/${id}`

#### Deferred
- **Customer Edit Modal**: Edit button shows placeholder alert - full implementation deferred (lower priority)
- **Customer Create**: Manual customer creation not implemented - customers typically auto-created via orders

---

### Phase 4.6 - Bug Fixes & Refinements (2025-11-19)

#### Fixed
- **Products Page**: Fixed `TypeError: product.price.toFixed is not a function` by adding type checking to handle both string and number price values
- **Customers Page**: Fixed redirect loop by wrapping page in `DashboardLayout` component for consistent UI structure
- **Root Navigation**: Optimized redirect path from `/` to go directly to `/dashboard/orders` instead of double-hopping through `/orders`
- **Orders Display**: Confirmed empty state properly displays "No orders found" message when database is empty

#### Changed
- Enhanced type safety in products page with defensive programming for API data variations
- Improved navigation consistency across all dashboard pages

---

### Phase 4.5 - Complete Missing UI Functionality (2025-11-19)

#### Added
- **Create Order Modal**: Full-featured modal with store selection, customer input, multiple items, shipping/tax costs, and form validation
- **Products Page**: Complete rewrite with real API integration, CRUD operations, search, and filters
- **API Integration**: Created `useCreateOrder` hook and `createOrder` API method

#### Fixed
- **Orders Navigation**: Fixed View button to correctly route to `/dashboard/orders/{id}`
- **Stores Navigation**: Replaced `window.location.href` with Next.js `router.push()` for proper client-side routing
- **Route Consolidation**: Removed duplicate pages at `/orders` and `/stores`, now redirect to dashboard paths

#### Changed
- All pages now use consistent Next.js routing patterns
- Products page connected to real backend API instead of mock data
- Improved navigation UX across all pages

---

### Phase 6 - Analytics & Reporting (2025-01-XX)

#### Added
- Real-time analytics dashboard with KPIs and interactive visualizations
- Export functionality for CSV, PDF, and Excel formats
- Performance metrics tracking and monitoring
- Advanced charts using Recharts library
- Multi-store analytics with comparative analysis

---

### Phase 5 - Authentication & Security (2025-01-XX)

#### Added
- JWT authentication system with refresh tokens
- Role-based access control (Admin, Manager, User)
- Password security with bcrypt hashing
- Input validation and sanitization with Zod
- Rate limiting for API endpoints
- Security headers and CORS configuration
- Audit logging system
- Protected route components

---

### Phase 4 - Frontend UI (2025-01-XX)

#### Added
- Complete Chakra UI v3 dashboard implementation
- Orders management with CRUD operations
- Stores management with registration and API keys
- Products management with inventory tracking
- Responsive mobile-first design
- React Query integration for data fetching
- 31+ React components with TypeScript

---

### Phase 1-3 - Foundation & Core Features (2025-01-XX)

#### Added
- Database schema with Prisma ORM
- Express.js backend API
- Docker Compose for PostgreSQL
- Core order management features
- Store management system
- Multi-store order aggregation
- Order tracking and search functionality

---

## Version History

- **v0.4.6** - Bug fixes and refinements (Current)
- **v0.4.5** - Complete missing UI functionality
- **v0.4.0** - Frontend UI implementation
- **v0.3.0** - Store management features
- **v0.2.0** - Core order management
- **v0.1.0** - Project foundation and setup
