# ShopAdmin - Quick Reference

## 🚀 Quick Start

```bash
# 1. Start database
docker-compose up -d

# 2. Seed database (first time only)
yarn workspace backend db:seed

# 3. Start dev servers
yarn dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio: `yarn db:studio` → http://localhost:5555

---

## 🔐 Default Login

```
Email: admin@shopadmin.com
Password: admin123
```

⚠️ **Important**: Change these credentials in production!

---

## 📊 Sample Data (After Seeding)

- **1 Admin User** (for login)
- **2 Stores** (TechGadgets Store, Fashion Hub)
- **2 Customers** (John Doe, Jane Smith)
- **2 Products** (Wireless Headphones, T-Shirt)
- **3 Orders** (ORD-001, ORD-002, ORD-003)

---

## 🗂️ Application Routes

### Main Pages
- **Dashboard**: `/dashboard`
- **Orders**: `/dashboard/orders`
- **Products**: `/dashboard/products`
- **Stores**: `/dashboard/stores`
- **Customers**: `/dashboard/customers`
- **Analytics**: `/analytics`
- **Settings**: `/settings`

### Detail Pages
- Order Detail: `/dashboard/orders/{id}`
- Product Detail: `/dashboard/products/{id}`
- Store Detail: `/dashboard/stores/{id}`
- Customer Detail: `/dashboard/customers/{id}`

---

## ✅ Feature Status

### Fully Functional ✅
- **Orders**: Full CRUD + Create modal, filters, search, export
- **Products**: Full CRUD, search, filters, pagination
- **Stores**: View, Edit, Delete
- **Customers**: List, View, Delete
- **Authentication**: JWT with proper token handling

### Deferred ⚠️
- Customer Edit Modal (lower priority)
- Customer Create (not needed - auto-created via orders)

---

## 🛠️ Common Commands

### Development
```bash
yarn dev              # Start both frontend and backend
yarn lint             # Lint all code
yarn type-check       # TypeScript type checking
```

### Database
```bash
yarn db:push          # Push schema changes
yarn db:migrate       # Run migrations
yarn db:studio        # Open Prisma Studio
yarn workspace backend db:seed  # Seed database
```

### Build & Deploy
```bash
yarn build            # Build for production
yarn start            # Start production servers
```

---

## 🐛 Troubleshooting

### No Orders Showing
**Solution**: Run seed script
```bash
yarn workspace backend db:seed
```

### Customers Page Redirects to Login
**Solution**: 
1. Clear browser localStorage
2. Log in again with admin credentials

### Port Already in Use
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error
**Solution**:
```bash
docker-compose up -d
docker-compose ps  # Verify PostgreSQL is running
```

---

## 📝 Important Files

### Configuration
- `packages/backend/.env` - Backend environment variables
- `packages/frontend/.env.local` - Frontend environment variables
- `docker-compose.yml` - Database configuration

### Documentation
- `README.md` - Project overview
- `SETUP.md` - Detailed setup instructions
- `PLAN.md` - Development roadmap and progress
- `CHANGELOG.md` - Version history
- `SESSION_SUMMARY_2025-11-19.md` - Today's work summary

### Key Code Files
- `packages/backend/src/index.ts` - Backend entry point
- `packages/backend/src/scripts/seed.ts` - Database seeding
- `packages/frontend/src/app/dashboard/` - Main dashboard pages
- `packages/frontend/src/lib/api.ts` - API client configuration

---

## 🔑 Key Technical Details

### Authentication
- **Storage**: `accessToken`, `refreshToken`, `tokenExpiresAt` in localStorage
- **Header**: `Authorization: Bearer {accessToken}`
- **Expiry**: 7 days (configurable in backend .env)

### API Structure
- **Base URL**: `http://localhost:3001/api`
- **Response Format**: `{ success: boolean, data/orders: [], pagination: {} }`
- **Error Format**: `{ success: false, error: string }`

### Database
- **Type**: PostgreSQL 18
- **ORM**: Prisma v6.16.3
- **Connection**: Via Docker Compose
- **Port**: 5432

---

## 📞 Support

For issues or questions:
1. Check `SETUP.md` for detailed instructions
2. Review `CHANGELOG.md` for recent changes
3. Check browser console for errors
4. Check backend logs for API errors
5. Use Prisma Studio to inspect database

---

## 🎯 Next Steps

**Current Phase**: Phase 7 - Testing & Quality Assurance

**Upcoming Tasks**:
1. Write unit tests for API endpoints
2. Add integration tests for database operations
3. Implement E2E tests for critical workflows
4. Set up CI/CD pipeline
5. Prepare for production deployment

---

**Last Updated**: November 19, 2025  
**Version**: 0.4.7  
**Status**: ✅ Production Ready (pending testing)
