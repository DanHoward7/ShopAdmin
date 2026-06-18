import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedAuth() {
  console.log('🌱 Seeding authentication data...')

  // Create default admin user
  const adminEmail = 'admin@shopadmin.com'
  const adminPassword = 'admin123' // Change this in production!

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    return
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    }
  })

  console.log('✅ Created admin user:', {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role
  })

  // Create sample manager user
  const managerEmail = 'manager@shopadmin.com'
  const managerPassword = 'manager123'

  const hashedManagerPassword = await bcrypt.hash(managerPassword, 12)

  const managerUser = await prisma.user.create({
    data: {
      email: managerEmail,
      password: hashedManagerPassword,
      name: 'Store Manager',
      role: 'MANAGER',
      isActive: true,
    }
  })

  console.log('✅ Created manager user:', {
    id: managerUser.id,
    email: managerUser.email,
    name: managerUser.name,
    role: managerUser.role
  })

  // Create sample viewer user
  const viewerEmail = 'viewer@shopadmin.com'
  const viewerPassword = 'viewer123'

  const hashedViewerPassword = await bcrypt.hash(viewerPassword, 12)

  const viewerUser = await prisma.user.create({
    data: {
      email: viewerEmail,
      password: hashedViewerPassword,
      name: 'Data Viewer',
      role: 'VIEWER',
      isActive: true,
    }
  })

  console.log('✅ Created viewer user:', {
    id: viewerUser.id,
    email: viewerUser.email,
    name: viewerUser.name,
    role: viewerUser.role
  })

  console.log('\n🎉 Authentication seeding completed!')
  console.log('\n📝 Default login credentials:')
  console.log('Admin: admin@shopadmin.com / admin123')
  console.log('Manager: manager@shopadmin.com / manager123')
  console.log('Viewer: viewer@shopadmin.com / viewer123')
  console.log('\n⚠️  Remember to change these passwords in production!')
}

async function main() {
  try {
    await seedAuth()
  } catch (error) {
    console.error('❌ Error seeding authentication data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { seedAuth }
