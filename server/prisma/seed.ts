import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface SeedProductInput {
  sku: string;
  serialPrefix: string;
  name: string;
  brand: string;
  category: 'Laptops' | 'Smartphones' | 'Tablets' | 'Gaming' | 'Audio';
  price: number;
  stock: number;
  warrantyMonths: number;
  visible: boolean;
  featured: boolean;
  specProcessor: string;
  specMemory: string;
  specDisplay: string;
  imageUrl: string;
}

const FLAGSHIP_CATALOG: SeedProductInput[] = [
  {
    sku: 'APL-MBP14-M4',
    serialPrefix: 'SN-APLMBP1',
    name: 'Apple MacBook Pro 14-inch (M4)',
    brand: 'Apple',
    category: 'Laptops',
    price: 1599.0,
    stock: 5,
    warrantyMonths: 12,
    visible: true,
    featured: true,
    specProcessor: 'Apple M4 Chip (10-Core CPU / 10-Core GPU)',
    specMemory: '16GB Unified Memory · 512GB SSD',
    specDisplay: '14" Liquid Retina XDR (120Hz ProMotion)',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85',
  },
  {
    sku: 'SAM-S24U-256',
    serialPrefix: 'SN-SAMS24U',
    name: 'Samsung Galaxy S24 Ultra (256GB)',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 1299.99,
    stock: 6,
    warrantyMonths: 12,
    visible: true,
    featured: true,
    specProcessor: 'Snapdragon 8 Gen 3 for Galaxy',
    specMemory: '12GB RAM · 256GB NVMe Storage',
    specDisplay: '6.8" Dynamic AMOLED 2X · Titanium Frame & S Pen',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=85',
  },
  {
    sku: 'APL-IP16P-128',
    serialPrefix: 'SN-APLIP16',
    name: 'Apple iPhone 16 Pro (128GB)',
    brand: 'Apple',
    category: 'Smartphones',
    price: 999.0,
    stock: 8,
    warrantyMonths: 12,
    visible: true,
    featured: true,
    specProcessor: 'Apple A18 Pro Chip (6-Core GPU)',
    specMemory: '8GB RAM · 128GB Storage',
    specDisplay: '6.3" ProMotion Always-On Super Retina XDR',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85',
  },
  {
    sku: 'APL-IPADP11-M4',
    serialPrefix: 'SN-APLIPAD',
    name: 'Apple 11-inch iPad Pro (M4, Wi-Fi)',
    brand: 'Apple',
    category: 'Tablets',
    price: 999.0,
    stock: 3,
    warrantyMonths: 12,
    visible: true,
    featured: false,
    specProcessor: 'Apple M4 Chip (9-Core CPU)',
    specMemory: '8GB Unified · 256GB Wi-Fi 6E',
    specDisplay: '11" Ultra Retina XDR Tandem OLED',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85',
  },
  {
    sku: 'SNY-PS5S-1TB',
    serialPrefix: 'SN-SNYPS5S',
    name: 'Sony PlayStation 5 Slim Console (1TB)',
    brand: 'Sony',
    category: 'Gaming',
    price: 499.99,
    stock: 2,
    warrantyMonths: 12,
    visible: true,
    featured: true,
    specProcessor: 'Custom PS5 Architecture (AMD Zen 2 + RDNA 2)',
    specMemory: '16GB GDDR6 · 1TB Custom NVMe SSD',
    specDisplay: '4K 120Hz HDMI 2.1 · Disc Drive & DualSense',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85',
  },
  {
    sku: 'SNY-XM5-BLK',
    serialPrefix: 'SN-SNYXM5B',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    category: 'Audio',
    price: 399.99,
    stock: 10,
    warrantyMonths: 12,
    visible: true,
    featured: false,
    specProcessor: 'Active Noise Cancellation (Dual QN1 + V1)',
    specMemory: 'SBC / AAC / LDAC · Multipoint Bluetooth 5.2',
    specDisplay: '30mm Carbon Driver · Up to 30-Hr Battery',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=85',
  },
];

async function main(): Promise<void> {
  console.log('⚡ Resetting VoltOps Cloud database for clean deterministic seed...');

  await prisma.rmaTicket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.serialUnit.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.storeSetting.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  const [adminHash, staffHash, clientHash] = await Promise.all([
    bcrypt.hash('Admin123!', 10),
    bcrypt.hash('Staff123!', 10),
    bcrypt.hash('Client123!', 10),
  ]);

  await prisma.user.createMany({
    data: [
      {
        name: 'Elena Vance',
        email: 'admin@voltops.io',
        passwordHash: adminHash,
        role: 'ADMIN',
      },
      {
        name: 'Marcus Chen',
        email: 'staff@voltops.io',
        passwordHash: staffHash,
        role: 'STAFF',
      },
      {
        name: 'Jordan Taylor',
        email: 'client@voltops.io',
        passwordHash: clientHash,
        role: 'CUSTOMER',
      },
    ],
  });

  // 2. Seed Store Settings
  await prisma.storeSetting.create({
    data: {
      id: 'singleton',
      storeName: 'VoltOps Electronics',
      freeShippingThreshold: 500,
      lowStockThreshold: 3,
      taxRatePercent: 0,
    },
  });

  // 3. Seed Promo Codes
  await prisma.promoCode.createMany({
    data: [
      {
        code: 'TECH10',
        type: 'PERCENT',
        value: 10,
        minSpend: 300,
        active: true,
      },
      {
        code: 'PRO50',
        type: 'FIXED',
        value: 50,
        minSpend: 500,
        active: true,
      },
    ],
  });

  // 4. Seed 6 Flagship SKUs and 34 Serialized Hardware Units
  let totalSerialsCreated = 0;

  for (const item of FLAGSHIP_CATALOG) {
    const createdProduct = await prisma.product.create({
      data: {
        sku: item.sku,
        name: item.name,
        brand: item.brand,
        category: item.category,
        price: item.price,
        stock: item.stock,
        warrantyMonths: item.warrantyMonths,
        visible: item.visible,
        featured: item.featured,
        specProcessor: item.specProcessor,
        specMemory: item.specMemory,
        specDisplay: item.specDisplay,
        imageUrl: item.imageUrl,
      },
    });

    const serialRows = Array.from({ length: item.stock }, (_, idx) => ({
      serial: `${item.serialPrefix}-${1001 + idx}`,
      productId: createdProduct.id,
      status: 'IN_STOCK',
    }));

    await prisma.serialUnit.createMany({
      data: serialRows,
    });

    totalSerialsCreated += serialRows.length;
  }

  console.log(`✅ Seeded 3 RBAC accounts (admin@voltops.io, staff@voltops.io, client@voltops.io)`);
  console.log(`✅ Seeded StoreSetting ("VoltOps Electronics") & 2 Promo Codes (TECH10, PRO50)`);
  console.log(`✅ Seeded ${FLAGSHIP_CATALOG.length} Flagship Electronics SKUs & ${totalSerialsCreated} IN_STOCK SerialUnit rows`);
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
