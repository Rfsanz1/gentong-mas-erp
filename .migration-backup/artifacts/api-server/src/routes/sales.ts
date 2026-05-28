import { Router } from "express";
import { db } from "@workspace/db";
import {
  salesOrdersTable,
  salesOrderItemsTable,
  salesTeamsTable,
  customersTable,
  productsTable,
} from "@workspace/db";
import { eq, ilike, and, or, desc, sql, count, sum } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

function generateOrderNumber(type: string) {
  const prefix = type === "quotation" ? "QT" : "SO";
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}/${y}${m}${d}/${rand}`;
}

router.get("/sales/summary", async (req, res) => {
  try {
    const [totalOrders] = await db
      .select({ count: count() })
      .from(salesOrdersTable)
      .where(eq(salesOrdersTable.type, "order"));

    const [totalRevenue] = await db
      .select({ total: sum(salesOrdersTable.total) })
      .from(salesOrdersTable)
      .where(
        and(
          eq(salesOrdersTable.type, "order"),
          eq(salesOrdersTable.status, "delivered")
        )
      );

    const [pending] = await db
      .select({ count: count() })
      .from(salesOrdersTable)
      .where(eq(salesOrdersTable.status, "pending"));

    const [confirmed] = await db
      .select({ count: count() })
      .from(salesOrdersTable)
      .where(eq(salesOrdersTable.status, "confirmed"));

    res.json({
      totalOrders: totalOrders.count,
      totalRevenue: Number(totalRevenue.total ?? 0),
      pendingOrders: pending.count,
      pending: pending.count,
      confirmed: confirmed.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil summary" });
  }
});

router.get("/sales/orders", async (req, res) => {
  try {
    const { search, status, page = "1", limit = "20", type } = req.query as Record<string, string>;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(salesOrdersTable.namaCustomer, `%${search}%`),
          ilike(salesOrdersTable.orderNumber, `%${search}%`),
          ilike(salesOrdersTable.salesName, `%${search}%`)
        )
      );
    }
    const validStatuses = ["pending", "confirmed", "delivered", "cancelled"];
    if (status && status === "quotation") {
      conditions.push(eq(salesOrdersTable.type, "quotation"));
    } else {
      if (status && status !== "all" && validStatuses.includes(status)) {
        conditions.push(eq(salesOrdersTable.status, status as any));
      }
      if (type) {
        conditions.push(eq(salesOrdersTable.type, type));
      } else if (status !== "quotation") {
        conditions.push(eq(salesOrdersTable.type, "order"));
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [orders, [{ total }]] = await Promise.all([
      db
        .select()
        .from(salesOrdersTable)
        .where(where)
        .orderBy(desc(salesOrdersTable.createdAt))
        .limit(Number(limit))
        .offset(offset),
      db.select({ total: count() }).from(salesOrdersTable).where(where),
    ]);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(salesOrderItemsTable)
          .where(eq(salesOrderItemsTable.orderId, order.id));
        return { ...order, items };
      })
    );

    res.json({ data: ordersWithItems, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil orders" });
  }
});

router.get("/sales/orders/:id", async (req, res) => {
  try {
    const [order] = await db
      .select()
      .from(salesOrdersTable)
      .where(eq(salesOrdersTable.id, Number(req.params.id)));
    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });

    const items = await db
      .select()
      .from(salesOrderItemsTable)
      .where(eq(salesOrderItemsTable.orderId, order.id));

    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil order" });
  }
});

router.post("/sales/orders", async (req, res) => {
  try {
    const body = req.body;
    const orderType = body.type || "order";
    const orderNumber = generateOrderNumber(orderType);

    const namaCustomer = body.namaCustomer || body.customer || "Unknown";
    const noHp = body.noHp || body.phone || null;
    const alamat = body.alamat || body.address || null;
    const salesName = body.salesName || null;
    const catatan = body.catatan || body.notes || null;

    const rawItems: any[] = body.items || body.lines || [];
    const normalizedItems = rawItems.map((item: any) => ({
      productId: item.productId ?? null,
      nama: item.nama || item.product || "Item",
      qty: Number(item.qty) || 1,
      harga: Number(item.harga ?? item.price ?? 0),
    }));

    const subtotal = normalizedItems.reduce(
      (acc, item) => acc + item.qty * item.harga,
      0
    );
    const tax = body.tax ? Number(body.tax) : 0;
    const discount = body.discount ? Number(body.discount) : 0;
    const total = subtotal - discount + tax;

    const [newOrder] = await db
      .insert(salesOrdersTable)
      .values({
        orderNumber,
        type: orderType,
        namaCustomer,
        noHp,
        alamat,
        salesName,
        catatan,
        status: "pending",
        subtotal: String(subtotal),
        discount: String(discount),
        tax: String(tax),
        total: String(total),
        source: body.source || "erp",
      })
      .returning();

    if (normalizedItems.length > 0) {
      await db.insert(salesOrderItemsTable).values(
        normalizedItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          nama: item.nama,
          qty: item.qty,
          harga: String(item.harga),
          subtotal: String(item.qty * item.harga),
        }))
      );
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal membuat order" });
  }
});

router.patch("/sales/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db
      .update(salesOrdersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(salesOrdersTable.id, Number(req.params.id)))
      .returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Gagal update status" });
  }
});

router.delete("/sales/orders/:id", async (req, res) => {
  try {
    await db
      .delete(salesOrdersTable)
      .where(eq(salesOrdersTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal hapus order" });
  }
});

router.get("/sales/faktur", async (req, res) => {
  try {
    const orders = await db
      .select()
      .from(salesOrdersTable)
      .where(eq(salesOrdersTable.status, "delivered"))
      .orderBy(desc(salesOrdersTable.createdAt))
      .limit(50);
    res.json({ data: orders });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil faktur" });
  }
});

router.get("/sales/reports/monthly", async (req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT
        TO_CHAR(created_at, 'Mon') AS bulan,
        TO_CHAR(created_at, 'YYYY-MM') AS month_key,
        COUNT(*) AS orders,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total::numeric ELSE 0 END), 0) AS revenue,
        COUNT(DISTINCT nama_customer) AS customers
      FROM sales_orders
      WHERE type = 'order' AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month_key ASC
    `);
    res.json({ data: rows.rows });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil laporan" });
  }
});

router.get("/sales/teams", async (req, res) => {
  try {
    const teams = await db
      .select()
      .from(salesTeamsTable)
      .orderBy(desc(salesTeamsTable.achieved));
    res.json({ data: teams });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil tim sales" });
  }
});

router.get("/inventory/products", async (req, res) => {
  try {
    const { search, limit = "50" } = req.query as Record<string, string>;
    const conditions = [eq(productsTable.isActive, true)];
    if (search) {
      conditions.push(
        or(
          ilike(productsTable.name, `%${search}%`),
          ilike(productsTable.sku, `%${search}%`)
        )!
      );
    }
    const products = await db
      .select()
      .from(productsTable)
      .where(and(...conditions))
      .orderBy(productsTable.name)
      .limit(Number(limit));
    res.json({ data: products });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

router.get("/inventory/products/:id", async (req, res) => {
  try {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, Number(req.params.id)));
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

router.post("/inventory/products", async (req, res) => {
  try {
    const [product] = await db.insert(productsTable).values(req.body).returning();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Gagal tambah produk" });
  }
});

router.get("/sales/quotations", async (req, res) => {
  try {
    const { search, page = "1", limit = "50" } = req.query as Record<string, string>;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: any[] = [eq(salesOrdersTable.type, "quotation")];
    if (search) {
      conditions.push(
        or(
          ilike(salesOrdersTable.namaCustomer, `%${search}%`),
          ilike(salesOrdersTable.orderNumber, `%${search}%`)
        )
      );
    }
    const where = and(...conditions);
    const [quotations, [{ total }]] = await Promise.all([
      db.select().from(salesOrdersTable).where(where).orderBy(desc(salesOrdersTable.createdAt)).limit(Number(limit)).offset(offset),
      db.select({ total: count() }).from(salesOrdersTable).where(where),
    ]);
    res.json({ data: quotations, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil quotations" });
  }
});

router.get("/sales/list", async (req, res) => {
  try {
    const orders = await db
      .select()
      .from(salesOrdersTable)
      .where(eq(salesOrdersTable.type, "order"))
      .orderBy(desc(salesOrdersTable.createdAt))
      .limit(100);
    res.json({ data: orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil daftar sales" });
  }
});

router.get("/customers", async (req, res) => {
  try {
    const { search } = req.query as Record<string, string>;
    const conditions = [eq(customersTable.isActive, true)];
    if (search) {
      conditions.push(
        or(
          ilike(customersTable.name, `%${search}%`),
          ilike(customersTable.phone, `%${search}%`)
        )!
      );
    }
    const customers = await db
      .select()
      .from(customersTable)
      .where(and(...conditions))
      .orderBy(customersTable.name)
      .limit(100);
    res.json({ data: customers });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil customers" });
  }
});

export default router;
