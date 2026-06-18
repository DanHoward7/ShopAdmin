import { PrismaClient } from '@prisma/client';
import { OrderStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@shopadmin.com' },
    update: {},
    create: {
      email: 'admin@shopadmin.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', { email: adminUser.email, password: 'admin123' });

  // Create sample stores
  const store1 = await prisma.store.upsert({
    where: { id: 'store-1' },
    update: {},
    create: {
      id: 'store-1',
      name: 'TechGadgets Store',
      url: 'https://techgadgets.example.com',
      description: 'Your one-stop shop for the latest tech gadgets',
      contactEmail: 'support@techgadgets.com',
      contactPhone: '+1-555-1000',
      isActive: true,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { id: 'store-2' },
    update: {},
    create: {
      id: 'store-2',
      name: 'Fashion Hub',
      url: 'https://fashionhub.example.com',
      description: 'Trendy fashion for everyone',
      contactEmail: 'support@fashionhub.com',
      contactPhone: '+1-555-2000',
      isActive: true,
    },
  });

  console.log('✅ Created stores:', { store1: store1.name, store2: store2.name });

  // Create sample customers
  const customer1 = await prisma.customer.upsert({
    where: { 
      email_storeId: { 
        email: 'john.doe@example.com', 
        storeId: store1.id 
      } 
    },
    update: {},
    create: {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      storeId: store1.id,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { 
      email_storeId: { 
        email: 'jane.smith@example.com', 
        storeId: store2.id 
      } 
    },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0456',
      storeId: store2.id,
    },
  });

  console.log('✅ Created customers:', { customer1: customer1.email, customer2: customer2.email });

  // Create sample products with real images from Unsplash
  const product1 = await prisma.product.upsert({
    where: { id: 'product-1' },
    update: {},
    create: {
      id: 'product-1',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      sku: 'WBH-001',
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      category: 'Electronics',
      storeId: store1.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: 'product-2' },
    update: {},
    create: {
      id: 'product-2',
      name: 'Premium Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt in various colors',
      price: 29.99,
      sku: 'PCT-001',
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
      category: 'Clothing',
      storeId: store2.id,
    },
  });

  // Add more products for a better demo
  const product3 = await prisma.product.upsert({
    where: { id: 'product-3' },
    update: {},
    create: {
      id: 'product-3',
      name: 'Smart Watch Series 5',
      description: 'Advanced fitness tracking and health monitoring',
      price: 299.99,
      sku: 'SW-005',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
      category: 'Electronics',
      storeId: store1.id,
    },
  });

  const product4 = await prisma.product.upsert({
    where: { id: 'product-4' },
    update: {},
    create: {
      id: 'product-4',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 49.99,
      sku: 'WM-002',
      stock: 75,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop',
      category: 'Electronics',
      storeId: store1.id,
    },
  });

  const product5 = await prisma.product.upsert({
    where: { id: 'product-5' },
    update: {},
    create: {
      id: 'product-5',
      name: 'Mechanical Keyboard',
      description: 'RGB backlit mechanical gaming keyboard',
      price: 129.99,
      sku: 'KB-003',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop',
      category: 'Electronics',
      storeId: store1.id,
    },
  });

  const product6 = await prisma.product.upsert({
    where: { id: 'product-6' },
    update: {},
    create: {
      id: 'product-6',
      name: 'Laptop Backpack',
      description: 'Durable backpack with padded laptop compartment',
      price: 79.99,
      sku: 'BP-004',
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
      category: 'Accessories',
      storeId: store1.id,
    },
  });

  const product7 = await prisma.product.upsert({
    where: { id: 'product-7' },
    update: {},
    create: {
      id: 'product-7',
      name: 'Running Shoes',
      description: 'Lightweight running shoes with superior cushioning',
      price: 89.99,
      sku: 'RS-101',
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      category: 'Footwear',
      storeId: store2.id,
    },
  });

  const product8 = await prisma.product.upsert({
    where: { id: 'product-8' },
    update: {},
    create: {
      id: 'product-8',
      name: 'Denim Jeans',
      description: 'Classic fit denim jeans in multiple washes',
      price: 59.99,
      sku: 'DJ-102',
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
      category: 'Clothing',
      storeId: store2.id,
    },
  });

  console.log('✅ Created products:', { 
    product1: product1.name, 
    product2: product2.name,
    product3: product3.name,
    product4: product4.name,
    product5: product5.name,
    product6: product6.name,
    product7: product7.name,
    product8: product8.name
  });

  // Create sample addresses
  const shippingAddress1 = await prisma.address.create({
    data: {
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
  });

  const shippingAddress2 = await prisma.address.create({
    data: {
      line1: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'USA',
    },
  });

  console.log('✅ Created addresses');

  // Delete existing orders to avoid unique constraint errors
  await prisma.order.deleteMany({
    where: {
      orderNumber: {
        in: ['ORD-001', 'ORD-002', 'ORD-003']
      }
    }
  });

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-001',
      storeId: store1.id,
      customerId: customer1.id,
      status: OrderStatus.PROCESSING,
      total: 199.99,
      tax: 16.00,
      shipping: 9.99,
      shippingAddressId: shippingAddress1.id,
      billingAddressId: shippingAddress1.id,
      paymentMethod: 'Credit Card',
      notes: 'Customer requested expedited shipping',
      items: {
        create: [
          {
            productId: product1.id,
            name: product1.name,
            price: product1.price,
            quantity: 1,
            total: product1.price,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-002',
      storeId: store2.id,
      customerId: customer2.id,
      status: OrderStatus.COMPLETED,
      total: 89.97,
      tax: 7.20,
      shipping: 5.99,
      shippingAddressId: shippingAddress2.id,
      billingAddressId: shippingAddress2.id,
      paymentMethod: 'PayPal',
      items: {
        create: [
          {
            productId: product2.id,
            name: product2.name,
            price: product2.price,
            quantity: 3,
            total: 89.97,
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-003',
      storeId: store1.id,
      customerId: customer1.id,
      status: OrderStatus.PENDING,
      total: 199.99,
      tax: 16.00,
      shipping: 0.00,
      shippingAddressId: shippingAddress1.id,
      billingAddressId: shippingAddress1.id,
      paymentMethod: 'Credit Card',
      notes: 'Free shipping promotion applied',
      items: {
        create: [
          {
            productId: product1.id,
            name: product1.name,
            price: product1.price,
            quantity: 1,
            total: product1.price,
          },
        ],
      },
    },
  });

  console.log('✅ Created orders:', { 
    order1: order1.orderNumber, 
    order2: order2.orderNumber,
    order3: order3.orderNumber 
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: 1 (admin@shopadmin.com / admin123)`);
  console.log(`- Stores: 2`);
  console.log(`- Customers: 2`);
  console.log(`- Products: 2`);
  console.log(`- Orders: 3`);
  console.log(`- Addresses: 2`);
  console.log('\n🔐 Login Credentials:');
  console.log(`   Email: admin@shopadmin.com`);
  console.log(`   Password: admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
