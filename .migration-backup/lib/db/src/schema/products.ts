import { pgTable, serial, text, timestamp, varchar, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 50 }).default("pcs"),
  hargaBeli: numeric("harga_beli", { precision: 15, scale: 2 }).default("0"),
  hargaJual: numeric("harga_jual", { precision: 15, scale: 2 }).default("0"),
  stock: integer("stock").default(0).notNull(),
  minStock: integer("min_stock").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
