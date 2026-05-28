import { pgTable, serial, text, timestamp, varchar, numeric, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";

export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "delivered", "cancelled", "quotation"]);

export const salesOrdersTable = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  type: varchar("type", { length: 20 }).default("order").notNull(),
  customerId: integer("customer_id").references(() => customersTable.id),
  namaCustomer: text("nama_customer").notNull(),
  noHp: varchar("no_hp", { length: 50 }),
  alamat: text("alamat"),
  salesName: text("sales_name"),
  status: orderStatusEnum("status").default("pending").notNull(),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 15, scale: 2 }).default("0"),
  tax: numeric("tax", { precision: 15, scale: 2 }).default("0"),
  total: numeric("total", { precision: 15, scale: 2 }).default("0").notNull(),
  catatan: text("catatan"),
  source: varchar("source", { length: 50 }).default("erp"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const salesOrderItemsTable = pgTable("sales_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => salesOrdersTable.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id"),
  nama: text("nama").notNull(),
  qty: integer("qty").default(1).notNull(),
  harga: numeric("harga", { precision: 15, scale: 2 }).default("0").notNull(),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).default("0").notNull(),
});

export const salesTeamsTable = pgTable("sales_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  leader: text("leader").notNull(),
  members: integer("members").default(1),
  target: numeric("target", { precision: 15, scale: 2 }).default("0"),
  achieved: numeric("achieved", { precision: 15, scale: 2 }).default("0"),
  region: varchar("region", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalesOrderSchema = createInsertSchema(salesOrdersTable).omit({ id: true, orderNumber: true, createdAt: true, updatedAt: true });
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;
export type SalesOrder = typeof salesOrdersTable.$inferSelect;

export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItemsTable).omit({ id: true });
export type InsertSalesOrderItem = z.infer<typeof insertSalesOrderItemSchema>;
export type SalesOrderItem = typeof salesOrderItemsTable.$inferSelect;
