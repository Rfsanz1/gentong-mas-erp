import { PrismaClient, CostingMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding Gentong Mas ERP...\n');

  // ─── ROLES ────────────────────────────────────────────────────────────────
  console.log('📋 Seeding roles...');
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'Super Admin' }, update: {}, create: { name: 'Super Admin', description: 'Akses penuh ke semua fitur' } }),
    prisma.role.upsert({ where: { name: 'Admin' }, update: {}, create: { name: 'Admin', description: 'Administrator operasional harian' } }),
    prisma.role.upsert({ where: { name: 'Owner' }, update: {}, create: { name: 'Owner', description: 'Pemilik usaha — akses laporan & keuangan' } }),
    prisma.role.upsert({ where: { name: 'Finance' }, update: {}, create: { name: 'Finance', description: 'Staf keuangan & akuntansi' } }),
    prisma.role.upsert({ where: { name: 'Sales' }, update: {}, create: { name: 'Sales', description: 'Staf penjualan' } }),
    prisma.role.upsert({ where: { name: 'Gudang' }, update: {}, create: { name: 'Gudang', description: 'Staf gudang & inventori' } }),
    prisma.role.upsert({ where: { name: 'Kasir' }, update: {}, create: { name: 'Kasir', description: 'Kasir POS' } }),
    prisma.role.upsert({ where: { name: 'Driver' }, update: {}, create: { name: 'Driver', description: 'Pengemudi pengiriman' } }),
    prisma.role.upsert({ where: { name: 'Purchasing' }, update: {}, create: { name: 'Purchasing', description: 'Staf pembelian & pengadaan' } }),
  ]);
  const roleMap = Object.fromEntries(roles.map(r => [r.name, r]));
  console.log(`   ✓ ${roles.length} roles`);

  // ─── USERS ────────────────────────────────────────────────────────────────
  console.log('👤 Seeding users...');
  const hash = (p: string) => bcrypt.hashSync(p, 10);
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'superadmin@gentongmas.com' },
      update: {},
      create: { email: 'superadmin@gentongmas.com', name: 'Super Admin', password: hash('Admin1234!'), roleId: roleMap['Super Admin'].id },
    }),
    prisma.user.upsert({
      where: { email: 'admin@gentongmas.com' },
      update: {},
      create: { email: 'admin@gentongmas.com', name: 'Budi Hartono', password: hash('Admin1234!'), roleId: roleMap['Admin'].id },
    }),
    prisma.user.upsert({
      where: { email: 'owner@gentongmas.com' },
      update: {},
      create: { email: 'owner@gentongmas.com', name: 'H. Sugiarto Widjaja', password: hash('Owner1234!'), roleId: roleMap['Owner'].id },
    }),
    prisma.user.upsert({
      where: { email: 'finance@gentongmas.com' },
      update: {},
      create: { email: 'finance@gentongmas.com', name: 'Sari Dewi', password: hash('Finance1234!'), roleId: roleMap['Finance'].id },
    }),
    prisma.user.upsert({
      where: { email: 'sales1@gentongmas.com' },
      update: {},
      create: { email: 'sales1@gentongmas.com', name: 'Agus Santoso', password: hash('Sales1234!'), roleId: roleMap['Sales'].id },
    }),
    prisma.user.upsert({
      where: { email: 'sales2@gentongmas.com' },
      update: {},
      create: { email: 'sales2@gentongmas.com', name: 'Rina Kusuma', password: hash('Sales1234!'), roleId: roleMap['Sales'].id },
    }),
    prisma.user.upsert({
      where: { email: 'gudang@gentongmas.com' },
      update: {},
      create: { email: 'gudang@gentongmas.com', name: 'Doni Prasetyo', password: hash('Gudang1234!'), roleId: roleMap['Gudang'].id },
    }),
    prisma.user.upsert({
      where: { email: 'purchasing@gentongmas.com' },
      update: {},
      create: { email: 'purchasing@gentongmas.com', name: 'Wati Lestari', password: hash('Purchase1234!'), roleId: roleMap['Purchasing'].id },
    }),
  ]);
  console.log(`   ✓ ${users.length} users`);

  // ─── WAREHOUSES ───────────────────────────────────────────────────────────
  console.log('🏭 Seeding warehouses...');
  const warehouses = await Promise.all([
    prisma.warehouse.upsert({
      where: { code: 'GDG-UTAMA' },
      update: {},
      create: { code: 'GDG-UTAMA', name: 'Gudang Utama', address: 'Jl. Industri Raya No. 88, Kawasan Berikat Cakung, Jakarta Timur 13910' },
    }),
    prisma.warehouse.upsert({
      where: { code: 'GDG-BEKASI' },
      update: {},
      create: { code: 'GDG-BEKASI', name: 'Gudang Bekasi', address: 'Jl. Sultan Agung Km. 27, Bekasi Timur, Jawa Barat 17116' },
    }),
    prisma.warehouse.upsert({
      where: { code: 'GDG-TANGERANG' },
      update: {},
      create: { code: 'GDG-TANGERANG', name: 'Gudang Tangerang', address: 'Jl. Gatot Subroto Km. 5, Tangerang Selatan, Banten 15312' },
    }),
  ]);
  const warehouseUtama = warehouses[0];
  console.log(`   ✓ ${warehouses.length} gudang`);

  // ─── PRODUCT CATEGORIES ───────────────────────────────────────────────────
  console.log('🗂️  Seeding kategori produk...');
  const categories = await Promise.all([
    prisma.productCategory.upsert({ where: { code: 'CAT-SEMEN' }, update: {}, create: { code: 'CAT-SEMEN', name: 'Semen & Beton' } }),
    prisma.productCategory.upsert({ where: { code: 'CAT-BESI' }, update: {}, create: { code: 'CAT-BESI', name: 'Besi & Baja' } }),
    prisma.productCategory.upsert({ where: { code: 'CAT-KAYU' }, update: {}, create: { code: 'CAT-KAYU', name: 'Kayu & Triplek' } }),
    prisma.productCategory.upsert({ where: { code: 'CAT-CAT' }, update: {}, create: { code: 'CAT-CAT', name: 'Cat & Bahan Kimia' } }),
    prisma.productCategory.upsert({ where: { code: 'CAT-KERAMIK' }, update: {}, create: { code: 'CAT-KERAMIK', name: 'Keramik & Granit' } }),
    prisma.productCategory.upsert({ where: { code: 'CAT-PIPA' }, update: {}, create: { code: 'CAT-PIPA', name: 'Pipa & Sanitasi' } }),
    prisma.productCategory.upsert({ where: { code: 'CAT-ATAP' }, update: {}, create: { code: 'CAT-ATAP', name: 'Atap & Rangka' } }),
    prisma.productCategory.upsert({ where: { code: 'CAT-ALAT' }, update: {}, create: { code: 'CAT-ALAT', name: 'Alat & Perkakas' } }),
  ]);
  const catMap = Object.fromEntries(categories.map(c => [c.code, c]));
  console.log(`   ✓ ${categories.length} kategori`);

  // ─── PRODUCT UNITS ────────────────────────────────────────────────────────
  console.log('📏 Seeding satuan produk...');
  const units = await Promise.all([
    prisma.productUnit.upsert({ where: { name: 'Sak' }, update: {}, create: { name: 'Sak', symbol: 'sak' } }),
    prisma.productUnit.upsert({ where: { name: 'Kilogram' }, update: {}, create: { name: 'Kilogram', symbol: 'kg' } }),
    prisma.productUnit.upsert({ where: { name: 'Ton' }, update: {}, create: { name: 'Ton', symbol: 'ton' } }),
    prisma.productUnit.upsert({ where: { name: 'Batang' }, update: {}, create: { name: 'Batang', symbol: 'btg' } }),
    prisma.productUnit.upsert({ where: { name: 'Lembar' }, update: {}, create: { name: 'Lembar', symbol: 'lbr' } }),
    prisma.productUnit.upsert({ where: { name: 'Galon' }, update: {}, create: { name: 'Galon', symbol: 'gln' } }),
    prisma.productUnit.upsert({ where: { name: 'Kaleng' }, update: {}, create: { name: 'Kaleng', symbol: 'klg' } }),
    prisma.productUnit.upsert({ where: { name: 'Dus' }, update: {}, create: { name: 'Dus', symbol: 'dus' } }),
    prisma.productUnit.upsert({ where: { name: 'Pcs' }, update: {}, create: { name: 'Pcs', symbol: 'pcs' } }),
    prisma.productUnit.upsert({ where: { name: 'Meter Persegi' }, update: {}, create: { name: 'Meter Persegi', symbol: 'm2' } }),
    prisma.productUnit.upsert({ where: { name: 'Meter' }, update: {}, create: { name: 'Meter', symbol: 'm' } }),
    prisma.productUnit.upsert({ where: { name: 'Roll' }, update: {}, create: { name: 'Roll', symbol: 'roll' } }),
  ]);
  const unitMap = Object.fromEntries(units.map(u => [u.name, u]));
  console.log(`   ✓ ${units.length} satuan`);

  // ─── PRODUCTS ─────────────────────────────────────────────────────────────
  console.log('📦 Seeding produk...');

  type ProductSeed = {
    sku: string; name: string; brand?: string;
    categoryCode: string; unitName: string;
    hargaBeli: number; hargaJual: number;
    stokMinimum: number; costingMethod?: CostingMethod;
    stokAwal: number;
  };

  const productSeeds: ProductSeed[] = [
    // SEMEN & BETON
    { sku: 'SEM-TR-50', name: 'Semen Tiga Roda 50 kg', brand: 'Tiga Roda', categoryCode: 'CAT-SEMEN', unitName: 'Sak', hargaBeli: 58000, hargaJual: 65000, stokMinimum: 50, stokAwal: 500 },
    { sku: 'SEM-GRS-50', name: 'Semen Gresik 50 kg', brand: 'Gresik', categoryCode: 'CAT-SEMEN', unitName: 'Sak', hargaBeli: 57000, hargaJual: 64000, stokMinimum: 50, stokAwal: 400 },
    { sku: 'SEM-PAD-40', name: 'Semen Padang 40 kg', brand: 'Padang', categoryCode: 'CAT-SEMEN', unitName: 'Sak', hargaBeli: 47000, hargaJual: 53000, stokMinimum: 30, stokAwal: 300 },
    { sku: 'SEM-BHL-50', name: 'Semen Batu Hitam 50 kg', brand: 'Batu Hitam', categoryCode: 'CAT-SEMEN', unitName: 'Sak', hargaBeli: 56000, hargaJual: 63000, stokMinimum: 30, stokAwal: 250 },
    { sku: 'BET-MOR-25', name: 'Mortar Instan MU-100 25 kg', brand: 'MU', categoryCode: 'CAT-SEMEN', unitName: 'Sak', hargaBeli: 48000, hargaJual: 56000, stokMinimum: 20, stokAwal: 150 },

    // BESI & BAJA
    { sku: 'BSI-10-12', name: 'Besi Beton Polos 10mm × 12m', brand: 'Master Steel', categoryCode: 'CAT-BESI', unitName: 'Batang', hargaBeli: 75000, hargaJual: 85000, stokMinimum: 100, costingMethod: CostingMethod.FIFO, stokAwal: 800 },
    { sku: 'BSI-12-12', name: 'Besi Beton Polos 12mm × 12m', brand: 'Master Steel', categoryCode: 'CAT-BESI', unitName: 'Batang', hargaBeli: 95000, hargaJual: 108000, stokMinimum: 100, costingMethod: CostingMethod.FIFO, stokAwal: 600 },
    { sku: 'BSI-DLG-10-12', name: 'Besi Beton Ulir D10 × 12m', brand: 'Krakatau Steel', categoryCode: 'CAT-BESI', unitName: 'Batang', hargaBeli: 80000, hargaJual: 92000, stokMinimum: 80, costingMethod: CostingMethod.FIFO, stokAwal: 500 },
    { sku: 'BSI-DLG-13-12', name: 'Besi Beton Ulir D13 × 12m', brand: 'Krakatau Steel', categoryCode: 'CAT-BESI', unitName: 'Batang', hargaBeli: 125000, hargaJual: 142000, stokMinimum: 80, costingMethod: CostingMethod.FIFO, stokAwal: 400 },
    { sku: 'BSI-HLW-50-50', name: 'Hollow Besi 50×50×6m', brand: 'Baja Ringan', categoryCode: 'CAT-BESI', unitName: 'Batang', hargaBeli: 155000, hargaJual: 175000, stokMinimum: 50, stokAwal: 200 },
    { sku: 'WF-200-6M', name: 'WF Baja 200×100×6m', brand: 'Gunung Garuda', categoryCode: 'CAT-BESI', unitName: 'Batang', hargaBeli: 1250000, hargaJual: 1400000, stokMinimum: 10, costingMethod: CostingMethod.FIFO, stokAwal: 50 },

    // KAYU & TRIPLEK
    { sku: 'TRP-9MM-122', name: 'Triplek 9mm 1220×2440mm', brand: 'Sengon', categoryCode: 'CAT-KAYU', unitName: 'Lembar', hargaBeli: 82000, hargaJual: 95000, stokMinimum: 30, stokAwal: 200 },
    { sku: 'TRP-12MM-122', name: 'Triplek 12mm 1220×2440mm', brand: 'Sengon', categoryCode: 'CAT-KAYU', unitName: 'Lembar', hargaBeli: 108000, hargaJual: 125000, stokMinimum: 30, stokAwal: 180 },
    { sku: 'TRP-18MM-122', name: 'Triplek 18mm 1220×2440mm', brand: 'Meranti', categoryCode: 'CAT-KAYU', unitName: 'Lembar', hargaBeli: 155000, hargaJual: 178000, stokMinimum: 20, stokAwal: 120 },
    { sku: 'GYP-9MM-120', name: 'Gypsum Board 9mm 1200×2400mm', brand: 'Jayaboard', categoryCode: 'CAT-KAYU', unitName: 'Lembar', hargaBeli: 62000, hargaJual: 72000, stokMinimum: 25, stokAwal: 250 },

    // CAT & KIMIA
    { sku: 'CAT-EXT-5KG-PTH', name: 'Cat Eksterior 5kg Putih', brand: 'Dulux', categoryCode: 'CAT-CAT', unitName: 'Kaleng', hargaBeli: 155000, hargaJual: 178000, stokMinimum: 20, stokAwal: 100 },
    { sku: 'CAT-EXT-25KG-PTH', name: 'Cat Eksterior 25kg Putih', brand: 'Dulux', categoryCode: 'CAT-CAT', unitName: 'Kaleng', hargaBeli: 625000, hargaJual: 720000, stokMinimum: 10, stokAwal: 60 },
    { sku: 'CAT-INT-5KG-PTH', name: 'Cat Interior 5kg Putih', brand: 'Catylac', categoryCode: 'CAT-CAT', unitName: 'Kaleng', hargaBeli: 82000, hargaJual: 95000, stokMinimum: 20, stokAwal: 120 },
    { sku: 'CAT-DAK-5KG-GRY', name: 'Cat Waterproof Dak 5kg Abu', brand: 'No Drop', categoryCode: 'CAT-CAT', unitName: 'Kaleng', hargaBeli: 175000, hargaJual: 200000, stokMinimum: 15, stokAwal: 80 },
    { sku: 'LEM-PC-5KG', name: 'Perekat Keramik MU-400 5kg', brand: 'MU', categoryCode: 'CAT-CAT', unitName: 'Sak', hargaBeli: 42000, hargaJual: 50000, stokMinimum: 30, stokAwal: 200 },

    // KERAMIK & GRANIT
    { sku: 'KRM-40-40-PTH', name: 'Keramik 40×40cm Putih Glossy', brand: 'Roman', categoryCode: 'CAT-KERAMIK', unitName: 'Dus', hargaBeli: 62000, hargaJual: 72000, stokMinimum: 30, stokAwal: 300 },
    { sku: 'KRM-60-60-GRY', name: 'Keramik 60×60cm Abu Polished', brand: 'Niro Granite', categoryCode: 'CAT-KERAMIK', unitName: 'Dus', hargaBeli: 185000, hargaJual: 215000, stokMinimum: 20, stokAwal: 150 },
    { sku: 'GRN-60-60-BLK', name: 'Granit 60×60cm Hitam Polished', brand: 'Granito', categoryCode: 'CAT-KERAMIK', unitName: 'Meter Persegi', hargaBeli: 195000, hargaJual: 225000, stokMinimum: 20, stokAwal: 200 },

    // PIPA & SANITASI
    { sku: 'PPA-AW-4-4M', name: 'Pipa PVC AW 4" 4m', brand: 'Rucika', categoryCode: 'CAT-PIPA', unitName: 'Batang', hargaBeli: 95000, hargaJual: 110000, stokMinimum: 20, stokAwal: 100 },
    { sku: 'PPA-AW-3-4M', name: 'Pipa PVC AW 3" 4m', brand: 'Rucika', categoryCode: 'CAT-PIPA', unitName: 'Batang', hargaBeli: 55000, hargaJual: 65000, stokMinimum: 20, stokAwal: 150 },
    { sku: 'PPA-GLP-1-6M', name: 'Pipa Galvanis 1" 6m', brand: 'Spindo', categoryCode: 'CAT-PIPA', unitName: 'Batang', hargaBeli: 135000, hargaJual: 155000, stokMinimum: 15, stokAwal: 80 },

    // ATAP & RANGKA
    { sku: 'ATR-GLV-03-183', name: 'Atap Seng Gelombang 0.3mm × 1.83m', brand: 'Aluzinc', categoryCode: 'CAT-ATAP', unitName: 'Lembar', hargaBeli: 48000, hargaJual: 57000, stokMinimum: 50, stokAwal: 500 },
    { sku: 'ATR-UPVC-05-185', name: 'Atap UPVC Bening 0.5mm × 1.85m', brand: 'Sunlite', categoryCode: 'CAT-ATAP', unitName: 'Lembar', hargaBeli: 62000, hargaJual: 73000, stokMinimum: 30, stokAwal: 200 },

    // ALAT & PERKAKAS
    { sku: 'ALT-SKTRU-M8', name: 'Skrup Baja Ringan M8×16mm (200 pcs)', brand: 'Pioner', categoryCode: 'CAT-ALAT', unitName: 'Dus', hargaBeli: 28000, hargaJual: 35000, stokMinimum: 50, stokAwal: 300 },
    { sku: 'ALT-WRM-10MM', name: 'Kawat Bendrat 1mm (1 kg)', brand: 'Kawat Lokal', categoryCode: 'CAT-ALAT', unitName: 'Kilogram', hargaBeli: 18000, hargaJual: 22000, stokMinimum: 100, stokAwal: 500 },
    { sku: 'ALT-PAKU-57', name: 'Paku Biasa 5/7 (1 kg)', brand: 'Lokal', categoryCode: 'CAT-ALAT', unitName: 'Kilogram', hargaBeli: 14000, hargaJual: 18000, stokMinimum: 50, stokAwal: 400 },
  ];

  let prodCount = 0;
  for (const p of productSeeds) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        categoryId: catMap[p.categoryCode].id,
        unitId: unitMap[p.unitName].id,
        hargaBeli: p.hargaBeli,
        hargaJual: p.hargaJual,
        stokMinimum: p.stokMinimum,
        costingMethod: p.costingMethod ?? CostingMethod.AVERAGE,
        currentAvgCost: p.hargaBeli,
      },
    });

    // Stok awal di Gudang Utama
    await prisma.stock.upsert({
      where: { productId_warehouseId: { productId: product.id, warehouseId: warehouseUtama.id } },
      update: {},
      create: { productId: product.id, warehouseId: warehouseUtama.id, qty: p.stokAwal },
    });

    // StockMovement opening (hanya jika belum ada)
    const existingMov = await prisma.stockMovement.findFirst({
      where: { productId: product.id, type: 'opening', warehouseId: warehouseUtama.id },
    });
    if (!existingMov) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          warehouseId: warehouseUtama.id,
          type: 'opening',
          qty: p.stokAwal,
          note: 'Stok awal seeding',
        },
      });
    }
    prodCount++;
  }
  console.log(`   ✓ ${prodCount} produk + stok awal di Gudang Utama`);

  // ─── SUPPLIERS ────────────────────────────────────────────────────────────
  console.log('🏢 Seeding suppliers...');

  const supplierSeeds = [
    { code: 'SUP-001', name: 'PT Semen Indonesia (Persero) Tbk', email: 'purchasing@semenindonesia.com', phone: '031-3981732', address: 'Jl. Veteran, Gresik, Jawa Timur 61122', city: 'Gresik', npwp: '01.001.000.0-091.000', bankName: 'BCA', bankAccount: '2050123456' },
    { code: 'SUP-002', name: 'PT Krakatau Steel (Persero) Tbk', email: 'sales@krakatausteel.com', phone: '0254-570126', address: 'Jl. Industri No. 5, Cilegon, Banten 42435', city: 'Cilegon', npwp: '01.002.000.0-412.000', bankName: 'Mandiri', bankAccount: '1230005678901' },
    { code: 'SUP-003', name: 'PT Wavin Anamtex (Rucika)', email: 'order@rucika.co.id', phone: '021-8801234', address: 'Kawasan Industri Pulogadung, Jakarta Timur 13930', city: 'Jakarta Timur', npwp: '01.555.777.0-071.000', bankName: 'BRI', bankAccount: '003101010101309' },
    { code: 'SUP-004', name: 'PT Roman Ceramics Indonesia', email: 'sales@romanceramics.com', phone: '021-29027000', address: 'Jl. Daan Mogot Km. 18, Tangerang 15122', city: 'Tangerang', npwp: '01.333.444.0-421.000', bankName: 'BCA', bankAccount: '7770099888' },
    { code: 'SUP-005', name: 'PT ICI Paints Indonesia (Dulux)', email: 'csc@akzonobel.com', phone: '021-5321901', address: 'Jl. Letjend S. Parman Kav. 76, Jakarta Barat 11410', city: 'Jakarta Barat', npwp: '01.777.888.0-051.000', bankName: 'CIMB Niaga', bankAccount: '54801036880' },
    { code: 'SUP-006', name: 'CV Maju Jaya Bangunan', email: 'majujaya@gmail.com', phone: '021-7771234', address: 'Jl. Panjang No. 45, Kebon Jeruk, Jakarta Barat 11530', city: 'Jakarta Barat', npwp: '55.111.222.0-023.000', bankName: 'Mandiri', bankAccount: '1230099887766' },
    { code: 'SUP-007', name: 'PT Sumber Bangunan Sejahtera', email: 'info@sbsejahtera.com', phone: '022-6123456', address: 'Jl. Soekarno-Hatta No. 212, Bandung 40292', city: 'Bandung', npwp: '62.444.555.0-429.000', bankName: 'BNI', bankAccount: '0987654321' },
    { code: 'SUP-008', name: 'PT Gunung Garuda Steel', email: 'penjualan@gununggaruda.com', phone: '021-8801500', address: 'Jl. Raya Bekasi Km. 23, Cakung, Jakarta Timur 13910', city: 'Jakarta Timur', npwp: '01.888.999.0-073.000', bankName: 'BCA', bankAccount: '0880015001' },
  ];

  let supCount = 0;
  for (const s of supplierSeeds) {
    await prisma.supplier.upsert({ where: { code: s.code }, update: {}, create: s });
    supCount++;
  }
  console.log(`   ✓ ${supCount} supplier`);

  // ─── CUSTOMERS ────────────────────────────────────────────────────────────
  console.log('👥 Seeding customers...');

  const customerSeeds = [
    { name: 'PT Bangun Persada Konstruksi', email: 'procurement@bpkonstruksi.com', phone: '021-5551001', address: 'Jl. TB Simatupang No. 88, Pasar Minggu, Jakarta Selatan 12520', city: 'Jakarta Selatan', province: 'DKI Jakarta', npwp: '72.001.002.0-051.000', creditLimit: 200000000 },
    { name: 'CV Karya Muda Developer', email: 'keuangan@karyamuda.co.id', phone: '021-8881002', address: 'Jl. Raya Ciputat No. 12, Tangerang Selatan 15411', city: 'Tangerang Selatan', province: 'Banten', creditLimit: 100000000 },
    { name: 'PT Cahaya Mandiri Proyek', email: 'admin@cahayamandiri.co.id', phone: '031-7891003', address: 'Jl. Raya Darmo Permai III No. 25, Surabaya 60226', city: 'Surabaya', province: 'Jawa Timur', npwp: '72.003.004.0-616.000', creditLimit: 150000000 },
    { name: 'Toko Bangunan Sinar Mas', email: 'sinarmas.bangunan@gmail.com', phone: '0274-561004', address: 'Jl. Tentara Pelajar No. 7, Yogyakarta 55243', city: 'Yogyakarta', province: 'DI Yogyakarta', creditLimit: 50000000 },
    { name: 'PT Griya Indah Properti', email: 'buy@griyaindah.com', phone: '021-7451005', address: 'Jl. Kemang Raya No. 50, Kemang, Jakarta Selatan 12560', city: 'Jakarta Selatan', province: 'DKI Jakarta', npwp: '72.005.006.0-051.000', creditLimit: 300000000 },
    { name: 'CV Mulia Jaya Contractor', email: 'muliajaya.contractor@gmail.com', phone: '022-7341006', address: 'Jl. Sumatera No. 33, Bandung 40117', city: 'Bandung', province: 'Jawa Barat', creditLimit: 75000000 },
    { name: 'Bapak Eko Prasetyo', phone: '081234567001', address: 'Perumahan Permata Biru Blok C5, Depok 16416', city: 'Depok', province: 'Jawa Barat', creditLimit: 5000000 },
    { name: 'PT Andalan Bangun Sentosa', email: 'purchase@andalanbs.co.id', phone: '021-6501007', address: 'Jl. Puri Kencana No. 1, Kembangan, Jakarta Barat 11610', city: 'Jakarta Barat', province: 'DKI Jakarta', npwp: '72.007.008.0-023.000', creditLimit: 250000000 },
    { name: 'Toko Berkah Material', email: 'berkahmaterial@yahoo.com', phone: '0341-891008', address: 'Jl. Veteran No. 77, Malang 65141', city: 'Malang', province: 'Jawa Timur', creditLimit: 40000000 },
    { name: 'PT Mitra Bangun Perkasa', email: 'info@mitrabangun.co.id', phone: '021-5301009', address: 'Kawasan Industri Berikat Nusantara, Pluit, Jakarta Utara 14440', city: 'Jakarta Utara', province: 'DKI Jakarta', npwp: '72.009.010.0-052.000', creditLimit: 500000000 },
    { name: 'CV Rejeki Bangunan', email: 'rejekibangunan@gmail.com', phone: '0265-7891010', address: 'Jl. Merdeka No. 15, Purwokerto 53111', city: 'Purwokerto', province: 'Jawa Tengah', creditLimit: 30000000 },
    { name: 'PT Buana Konstruksi Utama', email: 'bkutama@bkonstruksi.co.id', phone: '0351-4831011', address: 'Jl. Pahlawan No. 2, Madiun 63133', city: 'Madiun', province: 'Jawa Timur', npwp: '72.011.012.0-617.000', creditLimit: 120000000 },
    { name: 'Ibu Siti Rahayu', phone: '081387651012', address: 'Jl. Margonda Raya No. 100, Depok 16424', city: 'Depok', province: 'Jawa Barat', creditLimit: 3000000 },
    { name: 'PT Nusantara Properti Kencana', email: 'npk@nusantarapropert.com', phone: '021-7891013', address: 'Jl. Fatmawati No. 188, Cilandak, Jakarta Selatan 12420', city: 'Jakarta Selatan', province: 'DKI Jakarta', npwp: '72.013.014.0-051.000', creditLimit: 400000000 },
    { name: 'CV Putra Mandiri Kontraktor', email: 'putramandiri.ktr@gmail.com', phone: '0231-8901014', address: 'Jl. Tuparev No. 67, Cirebon 45153', city: 'Cirebon', province: 'Jawa Barat', creditLimit: 60000000 },
  ];

  let custCount = 0;
  for (const c of customerSeeds) {
    const exists = await prisma.customer.findFirst({ where: { name: c.name } });
    if (!exists) {
      await prisma.customer.create({ data: c });
    }
    custCount++;
  }
  console.log(`   ✓ ${custCount} customer`);

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('\n✅ Seeding selesai!\n');
  const [r, u, w, cat, un, p, s, sup, cust] = await Promise.all([
    prisma.role.count(), prisma.user.count(), prisma.warehouse.count(),
    prisma.productCategory.count(), prisma.productUnit.count(), prisma.product.count(),
    prisma.stock.count(), prisma.supplier.count(), prisma.customer.count(),
  ]);
  console.table({ roles: r, users: u, warehouses: w, categories: cat, units: un, products: p, stocks: s, suppliers: sup, customers: cust });

  console.log('\n🔑 Login credentials:');
  console.log('   superadmin@gentongmas.com  →  Admin1234!   (Super Admin)');
  console.log('   admin@gentongmas.com       →  Admin1234!   (Admin)');
  console.log('   owner@gentongmas.com       →  Owner1234!   (Owner)');
  console.log('   sales1@gentongmas.com      →  Sales1234!   (Sales)');
  console.log('   finance@gentongmas.com     →  Finance1234! (Finance)');
  console.log('   gudang@gentongmas.com      →  Gudang1234!  (Gudang)');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
