# ShopAdmin - Multi-Store Order Management

A comprehensive admin application for managing orders from multiple React ecommerce stores.

## Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and chakra/ui
- **Backend**: Node.js with Express, TypeScript, and Prisma ORM
- **Database**: PostgreSQL
- **Monorepo**: Yarn workspaces

## Project Structure

```
shop-admin/
├── packages/
│   ├── backend/          # Express API server
│   └── frontend/         # Next.js admin dashboard
├── package.json          # Root package.json with workspace scripts
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- Docker (for PostgreSQL)

### Installation

```bash
# 1. Install dependencies
yarn install

# 2. Start database
docker-compose up -d

# 3. Setup database schema
yarn db:push

# 4. Seed database with sample data
yarn workspace backend db:seed

# 5. Start development servers
yarn dev
```

**📖 For detailed setup instructions, see [SETUP.md](./SETUP.md)**

### Default Login Credentials
```
Email: admin@shopadmin.com
Password: admin123
```

### Available Scripts

- `yarn dev` - Start both backend and frontend in development mode
- `yarn build` - Build both applications for production
- `yarn start` - Start both applications in production mode
- `yarn lint` - Lint both applications
- `yarn type-check` - Run TypeScript type checking
- `yarn db:push` - Push database schema changes
- `yarn db:migrate` - Run database migrations
- `yarn db:studio` - Open Prisma Studio

## Development Workflow

1. Backend API runs on `http://localhost:3001`
2. Frontend admin dashboard runs on `http://localhost:3000`
3. Database management via Prisma Studio on `http://localhost:5555`

## Features

- **Multi-store order management** - Manage orders from multiple ecommerce stores in one dashboard
- **Complete CRUD operations** - Full create, read, update, delete for orders, products, stores, and customers
- **Real-time order status updates** - Track order lifecycle with status management
- **Analytics and reporting** - Comprehensive dashboards with charts and KPIs
- **Export functionality** - Export data to CSV, PDF, and Excel formats
- **Responsive admin dashboard** - Mobile-first design with Chakra UI v3
- **JWT Authentication** - Secure role-based access control
- **Type-safe API** - Full TypeScript coverage across frontend and backend

## Current Status

✅ **Phase 8 Complete** - Demo Storefront MVP Ready for Presentation
- **Demo Store**: Complete ecommerce frontend with full order flow
  - Product listing with backend integration
  - Shopping cart with localStorage persistence
  - Checkout form with validation
  - Order creation and confirmation
  - Guest checkout support
  - Running on http://localhost:3100
- **Admin Dashboard**: Enhanced to support guest orders
  - Guest customer info extraction from order notes
  - Null-safe customer display
  - Complete order management

✅ **Phase 4.7 Complete** - All core admin functionality
- **Orders**: Full CRUD with Create Order modal, filters, search, export
- **Products**: Full CRUD with real API integration, search, filters
- **Stores**: View, Edit, Delete with proper navigation
- **Customers**: List, View, Delete (Edit/Create deferred)
- Authentication working with JWT tokens
- All navigation and routing fixed
- Type-safe data handling throughout

🎯 **Next Steps**
- **Phase 7**: Testing & Quality Assurance
- **Phase 9**: Multi-Storefront Architecture (when approved)

📦 **Storefront Documentation**
- ✅ **Demo Store** - Complete and ready for demo
  - See [docs/storefronts/demo-store/DEMO_PLAN.md](./docs/storefronts/demo-store/DEMO_PLAN.md)
  - See [docs/storefronts/demo-store/QUICK_START.md](./docs/storefronts/demo-store/QUICK_START.md)
- 📋 **Full Architecture** - Ready for future implementation
  - Complete multi-storefront proposal
  - See [docs/storefronts/README.md](./docs/storefronts/README.md)

📸 **Image Asset Management**
- 📖 **Strategy Document** - Comprehensive image handling guide
  - See [docs/IMAGE_ASSET_STRATEGY.md](./docs/IMAGE_ASSET_STRATEGY.md)
  - Current: Using Unsplash for demo images
  - Recommended: Cloudinary for production

## Known Issues & Deferred Features

**Known Issues:** None! All critical bugs resolved.

**Deferred Features** (documented for future implementation):
- ⚠️ **Customer Edit Modal** - Edit button placeholder (lower priority)
- ⚠️ **Customer Create** - Not needed (auto-created via orders)

**Recent Fixes:**
- ✅ Authentication token mismatch fixed (`accessToken` vs `token`)
- ✅ Customer detail page params handling fixed
- ✅ Products price display fixed (type handling)
- ✅ All navigation routes corrected to `/dashboard/*`

## Contributing

This project is designed for solo development with AI assistance. Follow the established patterns and maintain TypeScript strict mode throughout.
