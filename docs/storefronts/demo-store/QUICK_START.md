# Demo Store - Quick Start Guide

## 🎯 Goal

Build a minimal storefront in **3-4 hours** to demo the complete order flow to stakeholders.

---

## 📋 Prerequisites

- ✅ Backend API running (`yarn workspace backend dev`)
- ✅ Database seeded with products
- ✅ Admin dashboard working

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Next.js App
```bash
cd packages/storefronts
npx create-next-app@latest demo-store --typescript --tailwind --app --no-src-dir
cd demo-store
```

### Step 2: Configure Environment
```bash
# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STORE_ID=store-1
EOF
```

### Step 3: Update package.json
```json
{
  "name": "@storefronts/demo-store",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3100",
    "build": "next build",
    "start": "next start -p 3100"
  }
}
```

### Step 4: Add to Root Scripts
```bash
# In root package.json, add:
"dev:demo": "yarn workspace @storefronts/demo-store dev"

# And update workspaces:
"workspaces": [
  "packages/*",
  "packages/storefronts/*"
]
```

---

## 📝 Implementation Order

### 1. API Client (15 min)
Create `src/lib/api.ts` and `src/lib/types.ts`

### 2. Product Listing (45 min)
- Home page with product grid
- ProductCard component
- Add to cart functionality

### 3. Shopping Cart (30 min)
- Cart page
- Update quantities
- Remove items
- Calculate total

### 4. Checkout (45 min)
- Checkout form
- Order submission
- Success page

### 5. Testing (30 min)
- Test complete flow
- Verify order in admin
- Fix any issues

---

## 🧪 Testing Checklist

- [ ] Products load from API
- [ ] Can add products to cart
- [ ] Cart count updates
- [ ] Can view cart page
- [ ] Can update quantities
- [ ] Can remove items
- [ ] Total calculates correctly
- [ ] Can submit checkout form
- [ ] Order creates successfully
- [ ] Success page shows
- [ ] Order appears in admin dashboard

---

## 🎨 Minimal Styling

Use Tailwind CSS utility classes for quick styling:
- `bg-white` - White backgrounds
- `shadow` - Drop shadows
- `rounded-lg` - Rounded corners
- `p-6` - Padding
- `grid grid-cols-3` - Product grid
- `bg-blue-600 text-white` - Primary buttons

---

## 🔧 Troubleshooting

### Products not loading?
- Check backend is running on port 3001
- Verify STORE_ID in .env.local matches database
- Check browser console for errors

### Order not creating?
- Check POST /api/orders endpoint exists
- Verify request body format
- Check backend logs for errors

### Order not in admin?
- Refresh admin dashboard
- Check correct store ID
- Verify database connection

---

## 📊 Demo Flow

### For Stakeholders
1. **Browse Products** (http://localhost:3100)
   - Show product grid
   - Show prices and stock

2. **Add to Cart**
   - Click "Add to Cart" on 2-3 products
   - Show cart count updating

3. **View Cart**
   - Click cart button
   - Show cart items
   - Update quantity
   - Show total

4. **Checkout**
   - Click "Proceed to Checkout"
   - Fill form quickly
   - Submit order

5. **Confirmation**
   - Show success page
   - Note order ID

6. **Admin Dashboard**
   - Switch to admin (http://localhost:3000)
   - Navigate to Orders
   - Show new order
   - Click to view details

**Total Demo Time**: < 2 minutes

---

## 🎯 Success Criteria

✅ **Functional**
- Complete order flow works end-to-end
- Order appears in admin immediately
- No errors in console

✅ **Demo-Ready**
- Clean, simple UI
- Fast and responsive
- Easy to understand

✅ **Stakeholder-Friendly**
- Obvious how to use
- Clear feedback
- Professional appearance

---

## 📈 Next Steps After Demo

If approved:
1. Add user authentication
2. Add payment integration
3. Improve styling/branding
4. Add product detail pages
5. Add search and filters
6. Implement full architecture from Phase 9

---

## 🔗 Resources

- **Detailed Plan**: [DEMO_PLAN.md](./DEMO_PLAN.md)
- **Full Architecture**: [../architecture/](../architecture/)
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Estimated Time**: 3-4 hours  
**Difficulty**: Easy  
**Status**: Ready to implement
