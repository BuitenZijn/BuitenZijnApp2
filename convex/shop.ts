import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==========================================
// CATEGORIES
// ==========================================

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("shop_categories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const listAllCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shop_categories").collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("shop_categories", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("shop_categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Categorie niet gevonden");
    await ctx.db.patch(id, updates);
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("shop_categories") },
  handler: async (ctx, { id }) => {
    // Check if any products use this category
    const products = await ctx.db
      .query("shop_products")
      .withIndex("by_category", (q) => q.eq("categoryId", id))
      .first();
    if (products) {
      throw new Error(
        "Kan categorie niet verwijderen: er zijn nog producten gekoppeld.",
      );
    }
    await ctx.db.delete(id);
  },
});

// ==========================================
// PRODUCTS
// ==========================================

export const listProducts = query({
  args: { categoryId: v.optional(v.id("shop_categories")) },
  handler: async (ctx, { categoryId }) => {
    let products;
    if (categoryId) {
      products = await ctx.db
        .query("shop_products")
        .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
        .collect();
      products = products.filter((p) => p.isActive);
    } else {
      products = await ctx.db
        .query("shop_products")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    }

    // Resolve image URLs and category names
    const enriched = await Promise.all(
      products.map(async (p) => {
        const category = await ctx.db.get(p.categoryId);
        const imageUrl = p.imageId ? await ctx.storage.getUrl(p.imageId) : null;
        return {
          ...p,
          imageUrl,
          categoryName: category?.name ?? "Onbekend",
        };
      }),
    );
    return enriched;
  },
});

export const listAllProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("shop_products").collect();
    const enriched = await Promise.all(
      products.map(async (p) => {
        const category = await ctx.db.get(p.categoryId);
        const imageUrl = p.imageId ? await ctx.storage.getUrl(p.imageId) : null;
        return {
          ...p,
          imageUrl,
          categoryName: category?.name ?? "Onbekend",
        };
      }),
    );
    return enriched;
  },
});

export const getProduct = query({
  args: { id: v.id("shop_products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) return null;
    const category = await ctx.db.get(product.categoryId);
    const imageUrl = product.imageId
      ? await ctx.storage.getUrl(product.imageId)
      : null;
    return {
      ...product,
      imageUrl,
      categoryName: category?.name ?? "Onbekend",
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    priceInCents: v.number(),
    categoryId: v.id("shop_categories"),
    imageId: v.optional(v.id("_storage")),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("shop_products", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("shop_products"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    priceInCents: v.optional(v.number()),
    categoryId: v.optional(v.id("shop_categories")),
    imageId: v.optional(v.id("_storage")),
    stock: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Product niet gevonden");
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("shop_products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product niet gevonden");
    // Delete associated image if any
    if (product.imageId) {
      await ctx.storage.delete(product.imageId);
    }
    await ctx.db.delete(id);
  },
});

// ==========================================
// ORDERS
// ==========================================

export const createOrder = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    items: v.array(
      v.object({
        productId: v.id("shop_products"),
        quantity: v.number(),
      }),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) {
      throw new Error("Bestelling moet minstens 1 product bevatten.");
    }

    // Validate stock and build order items snapshot
    const orderItems = [];
    let totalInCents = 0;

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) {
        throw new Error(`Product niet beschikbaar.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Onvoldoende voorraad voor "${product.name}". Beschikbaar: ${product.stock}`,
        );
      }
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        priceInCents: product.priceInCents,
      });
      totalInCents += product.priceInCents * item.quantity;
    }

    // Deduct stock
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock - item.quantity,
          updatedAt: Date.now(),
        });
      }
    }

    // Generate order number (date-based + random)
    const now = Date.now();
    const dateStr = new Date(now).toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `BZ-${dateStr}-${rand}`;

    return await ctx.db.insert("shop_orders", {
      orderNumber,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      userId: args.userId,
      items: orderItems,
      totalInCents,
      status: "pending",
      note: args.note,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("shop_orders")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
  },
});

export const getOrder = query({
  args: { id: v.id("shop_orders") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const updateOrderStatus = mutation({
  args: {
    id: v.id("shop_orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, { id, status }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Bestelling niet gevonden");

    // If cancelling, restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const product = await ctx.db.get(item.productId);
        if (product) {
          await ctx.db.patch(item.productId, {
            stock: product.stock + item.quantity,
            updatedAt: Date.now(),
          });
        }
      }
    }

    await ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});
