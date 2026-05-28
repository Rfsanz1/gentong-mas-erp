import { Router } from "express";
import { db } from "@workspace/db";
import { salesOrdersTable, productsTable, customersTable } from "@workspace/db";
import { eq, desc, count, sum, and, lt } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/dashboard/summary", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders] = await db
      .select({ count: count() })
      .from(salesOrdersTable)
      .where(eq(salesOrdersTable.type, "order"));

    const [revenueResult] = await db
      .select({ total: sum(salesOrdersTable.total) })
      .from(salesOrdersTable)
      .where(
        and(
          eq(salesOrdersTable.type, "order"),
          eq(salesOrdersTable.status, "delivered")
        )
      );

    const [activeCustomers] = await db
      .select({ count: count() })
      .from(customersTable)
      .where(eq(customersTable.isActive, true));

    const [lowStock] = await db
      .select({ count: count() })
      .from(productsTable)
      .where(lt(productsTable.stock, productsTable.minStock ?? 5));

    const recentOrders = await db
      .select()
      .from(salesOrdersTable)
      .where(eq(salesOrdersTable.type, "order"))
      .orderBy(desc(salesOrdersTable.createdAt))
      .limit(5);

    const monthlyRows = await db.execute(
      `SELECT
        TO_CHAR(created_at, 'Mon') AS month,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total::numeric ELSE 0 END), 0) AS revenue,
        COUNT(*) AS orders
      FROM sales_orders
      WHERE type = 'order' AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY TO_CHAR(created_at, 'YYYY-MM') ASC` as any
    );

    const alerts = [];
    if (lowStock.count > 0) {
      alerts.push({
        message: `${lowStock.count} produk stok menipis`,
        type: "warning",
        href: "/gudang/inventory",
      });
    }

    res.json({
      revenue_today: 0,
      total_orders: totalOrders.count,
      invoice_outstanding: 0,
      active_customers: activeCustomers.count,
      low_stock_count: lowStock.count,
      pending_po: 0,
      revenue_growth: 0,
      order_growth: 0,
      recent_orders: recentOrders.map((o) => ({
        id: o.id,
        customer: o.namaCustomer,
        amount: Number(o.total),
        status: o.status,
        date: o.createdAt,
      })),
      alerts,
      monthly_revenue: (monthlyRows as any).rows?.map((r: any) => ({
        month: r.month,
        revenue: Number(r.revenue),
        orders: Number(r.orders),
      })) ?? [],
      totalRevenue: Number(revenueResult.total ?? 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil dashboard summary" });
  }
});

export default router;
