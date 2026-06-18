# ShopAdmin Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
yarn install
```

### 2. Setup Environment Variables

**Backend** (`packages/backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shopadmin"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`packages/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
```

### 3. Start Database
```bash
# Using Docker Compose
docker-compose up -d
```

### 4. Setup Database Schema
```bash
# Push schema to database
yarn db:push

# Or run migrations
yarn db:migrate
```

### 5. Seed Database with Sample Data
```bash
yarn workspace backend db:seed
```

This will create:
- ✅ **1 Admin User** (admin@shopadmin.com / admin123)
- ✅ **2 Stores** (TechGadgets Store, Fashion Hub)
- ✅ **2 Customers** (John Doe, Jane Smith)
- ✅ **2 Products** (Wireless Headphones, T-Shirt)
- ✅ **3 Orders** (ORD-001, ORD-002, ORD-003)
- ✅ **2 Addresses**

### 6. Start Development Servers
```bash
yarn dev
```

This starts:
- Backend API: http://localhost:3001
- Frontend Dashboard: http://localhost:3000
- Prisma Studio: Run `yarn db:studio` (http://localhost:5555)

---

## Default Login Credentials

After seeding, use these credentials to log in:

```
Email: admin@shopadmin.com
Password: admin123
```

⚠️ **Important**: Change these credentials in production!

---

## Troubleshooting

### No Orders Showing
**Problem**: Orders page is empty  
**Solution**: Run the seed script: `yarn workspace backend db:seed`

### Customers Page Redirects to Login
**Problem**: Not logged in or session expired  
**Solution**: 
1. Log in with: admin@shopadmin.com / admin123
2. If already logged in, check browser console for API errors
3. Ensure backend is running on port 3001

### Database Connection Error
**Problem**: Cannot connect to PostgreSQL  
**Solution**:
1. Ensure Docker is running: `docker-compose up -d`
2. Check DATABASE_URL in `packages/backend/.env`
3. Verify PostgreSQL is accessible: `docker-compose ps`

### Port Already in Use
**Problem**: Port 3000 or 3001 already in use  
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change ports in .env files
```

---

## Database Management

### View/Edit Data
```bash
yarn db:studio
```
Opens Prisma Studio at http://localhost:5555

### Reset Database
```bash
# Warning: This deletes all data!
yarn workspace backend prisma migrate reset

# Then re-seed
yarn workspace backend db:seed
```

### Create Migration
```bash
yarn workspace backend prisma migrate dev --name your_migration_name
```

---

## Testing the Application

### 1. Login
- Navigate to http://localhost:3000
- Login with admin@shopadmin.com / admin123

### 2. Test Orders
- View orders list (should show 3 sample orders)
- Click "View" on an order to see details
- Click "Create Order" to add a new order
- Test filters and search

### 3. Test Products
- Navigate to Products tab
- View products list (should show 2 sample products)
- Test search and filters
- Click actions to view/edit/delete

### 4. Test Stores
- Navigate to Stores tab
- View stores list (should show 2 sample stores)
- Click "View" to see store details

### 5. Test Customers
- Navigate to Customers tab
- View customers list (should show 2 sample customers)
- Click on a customer to see details

---

## Next Steps

After setup is complete:
1. ✅ Verify all pages load correctly
2. ✅ Test CRUD operations on each page
3. ✅ Check authentication (logout/login)
4. 📝 Start Phase 7: Testing & Quality Assurance
5. 🚀 Prepare for deployment

---

## Additional Commands

```bash
# Lint code
yarn lint

# Type check
yarn type-check

# Build for production
yarn build

# Start production servers
yarn start
```

---

## Support

For issues or questions:
1. Check CHANGELOG.md for recent changes
2. Review PLAN.md for project status
3. Check browser console for errors
4. Check backend logs for API errors
