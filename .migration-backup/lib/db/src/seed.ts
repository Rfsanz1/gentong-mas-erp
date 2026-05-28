import { db } from "./index";
import { customersTable, productsTable, salesOrdersTable, salesOrderItemsTable, salesTeamsTable } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  await db.delete(salesOrderItemsTable);
  await db.delete(salesOrdersTable);
  await db.delete(salesTeamsTable);
  await db.delete(productsTable);
  await db.delete(customersTable);

  const customers = await db.insert(customersTable).values([
    { name: "PT Maju Bersama", email: "info@majubersama.co.id", phone: "081234567890", address: "Jl. Sudirman No.1", city: "Jakarta" },
    { name: "CV Berkah Jaya", email: "berkah@jaya.com", phone: "082345678901", address: "Jl. Gatot Subroto No.5", city: "Surabaya" },
    { name: "UD Sumber Rezeki", email: "sumber@rezeki.id", phone: "083456789012", address: "Jl. Diponegoro No.12", city: "Bandung" },
    { name: "Toko Mas Indah", email: "masindah@gmail.com", phone: "084567890123", address: "Jl. Ahmad Yani No.7", city: "Semarang" },
    { name: "PT Surya Abadi", email: "surya@abadi.co.id", phone: "085678901234", address: "Jl. Pemuda No.20", city: "Medan" },
    { name: "Bapak Hendra Wijaya", phone: "086789012345", address: "Jl. Kenanga No.3", city: "Yogyakarta" },
    { name: "CV Anugrah Sejahtera", email: "anugrah@sejahtera.id", phone: "087890123456", city: "Makassar" },
    { name: "PT Global Nusantara", email: "global@nusantara.com", phone: "088901234567", city: "Denpasar" },
  ]).returning();

  const products = await db.insert(productsTable).values([
    { sku: "PRD-001", name: "Laptop ASUS VivoBook 14", category: "Elektronik", unit: "unit", hargaBeli: "7500000", hargaJual: "9500000", stock: 25 },
    { sku: "PRD-002", name: "Mouse Wireless Logitech", category: "Aksesoris", unit: "pcs", hargaBeli: "150000", hargaJual: "250000", stock: 100 },
    { sku: "PRD-003", name: "Keyboard Mechanical RGB", category: "Aksesoris", unit: "pcs", hargaBeli: "350000", hargaJual: "550000", stock: 50 },
    { sku: "PRD-004", name: "Monitor LG 24 inch FHD", category: "Elektronik", unit: "unit", hargaBeli: "2800000", hargaJual: "3500000", stock: 15 },
    { sku: "PRD-005", name: "Printer HP LaserJet Pro", category: "Elektronik", unit: "unit", hargaBeli: "2200000", hargaJual: "3000000", stock: 10 },
    { sku: "PRD-006", name: "Headset Gaming Rexus", category: "Aksesoris", unit: "pcs", hargaBeli: "200000", hargaJual: "350000", stock: 75 },
    { sku: "PRD-007", name: "Flashdisk SanDisk 64GB", category: "Storage", unit: "pcs", hargaBeli: "80000", hargaJual: "150000", stock: 200 },
    { sku: "PRD-008", name: "SSD Crucial 500GB", category: "Storage", unit: "pcs", hargaBeli: "600000", hargaJual: "900000", stock: 40 },
    { sku: "PRD-009", name: "Webcam Logitech C920", category: "Aksesoris", unit: "pcs", hargaBeli: "900000", hargaJual: "1350000", stock: 30 },
    { sku: "PRD-010", name: "Speaker Bluetooth JBL", category: "Audio", unit: "pcs", hargaBeli: "500000", hargaJual: "750000", stock: 60 },
    { sku: "PRD-011", name: "Tinta Printer Canon", category: "Perlengkapan", unit: "set", hargaBeli: "120000", hargaJual: "200000", stock: 150 },
    { sku: "PRD-012", name: "Kertas HVS A4 80gr (Rim)", category: "Perlengkapan", unit: "rim", hargaBeli: "45000", hargaJual: "65000", stock: 500 },
  ]).returning();

  await db.insert(salesTeamsTable).values([
    { name: "Tim Jakarta", leader: "Budi Santoso", members: 5, target: "500000000", achieved: "423500000", region: "Jakarta" },
    { name: "Tim Surabaya", leader: "Siti Rahayu", members: 4, target: "400000000", achieved: "380000000", region: "Jawa Timur" },
    { name: "Tim Bandung", leader: "Ahmad Fauzi", members: 3, target: "300000000", achieved: "275000000", region: "Jawa Barat" },
    { name: "Tim Semarang", leader: "Dewi Kusuma", members: 3, target: "250000000", achieved: "198000000", region: "Jawa Tengah" },
    { name: "Tim Medan", leader: "Rizky Pratama", members: 4, target: "350000000", achieved: "310000000", region: "Sumatera Utara" },
  ]);

  const statuses: Array<"pending" | "confirmed" | "delivered" | "cancelled"> = ["pending", "confirmed", "delivered", "delivered", "cancelled"];
  const salesNames = ["Budi Santoso", "Siti Rahayu", "Ahmad Fauzi", "Dewi Kusuma", "Rizky Pratama"];

  for (let i = 0; i < 25; i++) {
    const customer = customers[i % customers.length];
    const status = statuses[i % statuses.length];
    const salesName = salesNames[i % salesNames.length];
    const itemCount = (i % 3) + 1;
    const selectedProducts = products.slice((i * 2) % products.length, ((i * 2) % products.length) + itemCount);

    let subtotal = 0;
    const items = selectedProducts.map(p => {
      const qty = (i % 5) + 1;
      const harga = Number(p.hargaJual);
      subtotal += qty * harga;
      return { productId: p.id, nama: p.name, qty, harga };
    });

    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);

    const [order] = await db.insert(salesOrdersTable).values({
      orderNumber: `SO/${createdAt.getFullYear()}${String(createdAt.getMonth()+1).padStart(2,"0")}${String(createdAt.getDate()).padStart(2,"0")}/${String(i+1).padStart(4,"0")}`,
      type: "order",
      customerId: customer.id,
      namaCustomer: customer.name,
      noHp: customer.phone,
      alamat: customer.address,
      salesName,
      status,
      subtotal: String(subtotal),
      total: String(subtotal),
      source: "erp",
      createdAt,
      updatedAt: createdAt,
    }).returning();

    await db.insert(salesOrderItemsTable).values(
      items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        nama: item.nama,
        qty: item.qty,
        harga: String(item.harga),
        subtotal: String(item.qty * item.harga),
      }))
    );
  }

  for (let i = 0; i < 8; i++) {
    const customer = customers[i % customers.length];
    const salesName = salesNames[i % salesNames.length];
    const p = products[i % products.length];
    const qty = 2;
    const total = Number(p.hargaJual) * qty;

    await db.insert(salesOrdersTable).values({
      orderNumber: `QT/2026${String(i+1).padStart(4,"0")}`,
      type: "quotation",
      customerId: customer.id,
      namaCustomer: customer.name,
      noHp: customer.phone,
      salesName,
      status: "pending",
      subtotal: String(total),
      total: String(total),
      source: "erp",
    });
  }

  console.log("✅ Seed selesai!");
  console.log(`   ${customers.length} customers`);
  console.log(`   ${products.length} produk`);
  console.log(`   25 sales orders`);
  console.log(`   8 quotations`);
  console.log(`   5 tim sales`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
