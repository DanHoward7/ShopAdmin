# Demo Storefront - Quick Implementation Plan

## 🎯 Objective

Build a minimal ecommerce storefront to demonstrate the complete order flow:
1. Customer browses products
2. Customer adds products to cart
3. Customer places an order
4. Order appears in admin dashboard

**Timeline**: 1-2 days  
**Scope**: MVP for stakeholder demo  
**Status**: ✅ Complete

---

## 📋 Requirements

### Must Have (MVP)
- ✅ Product listing page
- ✅ Simple shopping cart
- ✅ Basic checkout form
- ✅ Order submission to existing backend
- ✅ Order confirmation page

### Nice to Have (If Time Permits)
- ✅ Product detail page
- ✅ Cart persistence (localStorage)
- ✅ Basic styling/branding
- ✅ Form validation

### Not Needed for Demo
- ❌ User authentication
- ❌ Payment processing
- ❌ Product search/filters
- ❌ User accounts
- ❌ Order history

---

## 🏗️ Technical Approach

### Tech Stack (Minimal)
```
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS (fast setup)
State: React useState (no Zustand needed for demo)
API: Fetch/Axios to existing backend
Port: 3100
```

### Project Structure
```
packages/storefronts/demo-store/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Product listing
│   │   ├── cart/
│   │   │   └── page.tsx          # Shopping cart
│   │   └── checkout/
│   │       ├── page.tsx          # Checkout form
│   │       └── success/
│   │           └── page.tsx      # Order confirmation
│   │
│   ├── components/
│   │   ├── ProductCard.tsx       # Product display
│   │   ├── CartItem.tsx          # Cart item
│   │   └── Header.tsx            # Simple header
│   │
│   └── lib/
│       ├── api.ts                # API client
│       └── types.ts              # TypeScript types
│
├── public/
├── .env.local
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Implementation Plan

### Phase 1: Setup (30 minutes)

#### Step 1: Create Next.js App
```bash
cd packages/storefronts
npx create-next-app@latest demo-store --typescript --tailwind --app --no-src-dir
cd demo-store
```

#### Step 2: Configure Environment
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STORE_ID=store-1
```

#### Step 3: Update package.json
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

#### Step 4: Add to Root Scripts
```json
// In root package.json
{
  "scripts": {
    "dev:demo": "yarn workspace @storefronts/demo-store dev"
  },
  "workspaces": [
    "packages/*",
    "packages/storefronts/*"
  ]
}
```

---

### Phase 2: API Integration (30 minutes)

#### Create API Client
```typescript
// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || 'store-1'

export async function getProducts() {
  const response = await fetch(`${API_URL}/stores/${STORE_ID}/products`)
  const data = await response.json()
  return data.data || []
}

export async function createOrder(orderData: any) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  })
  return response.json()
}
```

#### Create Types
```typescript
// src/lib/types.ts
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderData {
  storeId: string
  customerId?: string
  customerEmail: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  total: number
  shippingAddress: {
    line1: string
    city: string
    postalCode: string
    country: string
  }
}
```

---

### Phase 3: Product Listing (45 minutes)

#### Home Page (Product Listing)
```typescript
// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/api'
import { Product, CartItem } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) return <div className="p-8">Loading products...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Demo Store</h1>
          <Link 
            href="/cart" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Cart ({cartCount})
          </Link>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => addToCart(product)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
```

#### Product Card Component
```typescript
// components/ProductCard.tsx
import { Product } from '@/lib/types'

interface Props {
  product: Product
  onAddToCart: () => void
}

export default function ProductCard({ product, onAddToCart }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="aspect-square bg-gray-200 rounded mb-4 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded" />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
        <button
          onClick={onAddToCart}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={product.stock === 0}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-2">Stock: {product.stock}</p>
    </div>
  )
}
```

---

### Phase 4: Shopping Cart (30 minutes)

#### Cart Page
```typescript
// app/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { CartItem } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    // Load cart from localStorage
    const saved = localStorage.getItem('cart')
    if (saved) {
      setCart(JSON.parse(saved))
    }
  }, [])

  function updateQuantity(productId: string, quantity: number) {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId))
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  function removeItem(productId: string) {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  function handleCheckout() {
    localStorage.setItem('cart', JSON.stringify(cart))
    router.push('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        
        <div className="bg-white rounded-lg shadow">
          {cart.map(item => (
            <div key={item.product.id} className="p-6 border-b flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.product.name}</h3>
                <p className="text-gray-600">${item.product.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <span className="font-bold w-24 text-right">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 text-center px-6 py-3 border border-gray-300 rounded hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
              <button
                onClick={handleCheckout}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### Phase 5: Checkout (45 minutes)

#### Checkout Page
```typescript
// app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CartItem, OrderData } from '@/lib/types'
import { createOrder } from '@/lib/api'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'USA',
  })

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      setCart(JSON.parse(saved))
    } else {
      router.push('/cart')
    }
  }, [router])

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData: OrderData = {
        storeId: process.env.NEXT_PUBLIC_STORE_ID || 'store-1',
        customerEmail: formData.email,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total,
        shippingAddress: {
          line1: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      }

      const result = await createOrder(orderData)
      
      if (result.success) {
        localStorage.removeItem('cart')
        router.push(`/checkout/success?orderId=${result.data.id}`)
      } else {
        alert('Failed to create order: ' + result.error)
      }
    } catch (error) {
      console.error('Order creation failed:', error)
      alert('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### Success Page
```typescript
// app/checkout/success/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been received and is being processed.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-6">
            Order ID: {orderId}
          </p>
        )}
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
```

---

## ✅ Implementation Checklist

### Setup
- [ ] Create Next.js app in `packages/storefronts/demo-store`
- [ ] Configure environment variables
- [ ] Update root package.json scripts
- [ ] Install dependencies

### Development
- [ ] Create API client (`lib/api.ts`)
- [ ] Create types (`lib/types.ts`)
- [ ] Build product listing page
- [ ] Build ProductCard component
- [ ] Build cart page
- [ ] Build checkout page
- [ ] Build success page

### Testing
- [ ] Test product listing loads from API
- [ ] Test add to cart functionality
- [ ] Test cart updates (quantity, remove)
- [ ] Test checkout form submission
- [ ] Test order creation in backend
- [ ] Verify order appears in admin dashboard

### Polish (If Time)
- [ ] Add basic styling/branding
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add form validation
- [ ] Test on mobile

---

## 🧪 Testing Flow

### End-to-End Test
1. **Start Backend**: `yarn workspace backend dev`
2. **Start Demo Store**: `yarn dev:demo`
3. **Browse Products**: Visit http://localhost:3100
4. **Add to Cart**: Click "Add to Cart" on products
5. **View Cart**: Click cart button, verify items
6. **Checkout**: Fill form, submit order
7. **Verify Success**: See confirmation page
8. **Check Admin**: Login to admin at http://localhost:3000
9. **View Order**: Navigate to Orders page, find new order

---

## 📊 Success Criteria

### Functional Requirements
- ✅ Products load from backend API
- ✅ Cart functionality works (add, update, remove)
- ✅ Checkout form submits successfully
- ✅ Order created in database
- ✅ Order visible in admin dashboard

### Demo Requirements
- ✅ Stakeholders can browse products
- ✅ Stakeholders can add items to cart
- ✅ Stakeholders can place an order
- ✅ Order appears in admin immediately
- ✅ Complete flow takes < 2 minutes

---

## 🚀 Quick Start Commands

```bash
# Create the demo store
cd packages/storefronts
npx create-next-app@latest demo-store --typescript --tailwind --app --no-src-dir

# Configure and start
cd demo-store
# Copy .env.local configuration
yarn dev

# In another terminal, ensure backend is running
cd ../../..
yarn workspace backend dev
```

---

## 📝 Notes

### Backend Requirements
The demo store uses these existing endpoints:
- `GET /api/stores/:storeId/products` - List products
- `POST /api/orders` - Create order

**Verify these endpoints work before building the storefront!**

### Simplifications for Demo
- No user authentication (guest checkout only)
- No payment processing
- No order history
- No product search/filters
- Minimal styling
- No cart persistence across sessions (localStorage only)

### Future Enhancements
After demo approval, can add:
- User authentication
- Payment integration
- Product detail pages
- Search and filters
- Better styling
- Cart persistence
- Order tracking

---

## 🎯 Timeline

| Task | Duration | Status |
|------|----------|--------|
| Setup project | 30 min | ✅ Complete |
| API integration | 30 min | ✅ Complete |
| Product listing | 45 min | ✅ Complete |
| Shopping cart | 30 min | ✅ Complete |
| Checkout flow | 45 min | ✅ Complete |
| Testing | 30 min | ✅ Complete |
| Polish | 30 min | ✅ Complete |

**Total**: 3-4 hours (half day)

---

## ✅ Implementation Complete

**Status**: ✅ Complete and Ready for Demo  
**Completion Date**: November 20, 2025

### Issues Resolved
1. ✅ Added missing backend endpoint: `GET /api/stores/:storeId/products`
2. ✅ Fixed CORS configuration to allow demo store (port 3100)
3. ✅ Fixed order creation schema mismatch (added orderNumber, item name/total)
4. ✅ Fixed guest checkout display in admin dashboard
5. ✅ Added guest customer info extraction from order notes

### What's Working
- ✅ Product listing with real backend data
- ✅ Product detail pages with full information
- ✅ Shopping cart with localStorage persistence
- ✅ Checkout form with validation
- ✅ Order creation with unique order numbers
- ✅ Orders visible in admin dashboard
- ✅ Guest customer information display
- ✅ Complete end-to-end flow from storefront to admin
- ✅ Clickable product cards with navigation
- ✅ Quantity selector on detail page
- ✅ Stock availability display
- ✅ Success notifications

### Demo URLs
- **Demo Store**: http://localhost:3100
- **Admin Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Image Assets
- **Current Solution**: Unsplash image URLs in seed data
- **Products**: 8 products with real product images
- **Strategy**: See [../../IMAGE_ASSET_STRATEGY.md](../../IMAGE_ASSET_STRATEGY.md)
- **Production Ready**: Cloudinary integration documented for future
