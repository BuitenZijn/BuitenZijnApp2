"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Image from "next/image";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  TagIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

// ==========================================
// Category form
// ==========================================
function CategoryManager() {
  const categories = useQuery(api.shop.listAllCategories);
  const createCategory = useMutation(api.shop.createCategory);
  const updateCategory = useMutation(api.shop.updateCategory);
  const deleteCategory = useMutation(api.shop.deleteCategory);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<Id<"shop_categories"> | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Naam en slug zijn verplicht.");
      return;
    }
    try {
      if (editId) {
        await updateCategory({
          id: editId,
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
        });
      } else {
        await createCategory({
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          order: (categories?.length ?? 0) + 1,
        });
      }
      setForm({ name: "", slug: "", description: "" });
      setEditId(null);
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fout bij opslaan.");
    }
  };

  const handleEdit = (cat: NonNullable<typeof categories>[number]) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
    });
    setEditId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"shop_categories">) => {
    try {
      await deleteCategory({ id });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Kan niet verwijderen.");
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2">
          <TagIcon className="w-5 h-5" />
          Categorieën
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({ name: "", slug: "", description: "" });
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Categorie
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Naam"
              value={form.name}
              onChange={(e) => {
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: editId
                    ? form.slug
                    : e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, ""),
                });
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
            />
            <input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
            />
          </div>
          <input
            placeholder="Beschrijving (optioneel)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
          />
          {error && <p className="text-sm text-rust-500">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              {editId ? "Bijwerken" : "Toevoegen"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categories?.map((cat) => (
          <div
            key={cat._id}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <span className="font-medium">{cat.name}</span>
            {!cat.isActive && (
              <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                inactief
              </span>
            )}
            <button
              onClick={() => handleEdit(cat)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(cat._id)}
              className="text-gray-400 hover:text-rust-600 transition-colors"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {categories?.length === 0 && (
          <p className="text-sm text-gray-500">
            Nog geen categorieën. Voeg er een toe.
          </p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Product form
// ==========================================
function ProductForm({
  categories,
  product,
  onDone,
}: {
  categories: { _id: Id<"shop_categories">; name: string }[];
  product?: {
    _id: Id<"shop_products">;
    name: string;
    slug: string;
    description?: string;
    priceInCents: number;
    categoryId: Id<"shop_categories">;
    stock: number;
    isActive: boolean;
  } | null;
  onDone: () => void;
}) {
  const createProduct = useMutation(api.shop.createProduct);
  const updateProduct = useMutation(api.shop.updateProduct);
  const generateUploadUrl = useMutation(api.shop.generateUploadUrl);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    priceInCents: product?.priceInCents ?? 0,
    categoryId: product?.categoryId ?? categories[0]?._id ?? "",
    stock: product?.stock ?? 0,
    isActive: product?.isActive ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [imageId, setImageId] = useState<Id<"_storage"> | undefined>(undefined);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setImageId(storageId);
    } catch {
      setError("Afbeelding uploaden mislukt.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Naam is verplicht.");
      return;
    }
    if (form.priceInCents <= 0) {
      setError("Prijs moet groter zijn dan 0.");
      return;
    }
    if (!form.categoryId) {
      setError("Selecteer een categorie.");
      return;
    }

    try {
      if (product) {
        await updateProduct({
          id: product._id,
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          priceInCents: form.priceInCents,
          categoryId: form.categoryId as Id<"shop_categories">,
          stock: form.stock,
          isActive: form.isActive,
          ...(imageId ? { imageId } : {}),
        });
      } else {
        await createProduct({
          name: form.name,
          slug:
            form.slug ||
            form.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          description: form.description || undefined,
          priceInCents: form.priceInCents,
          categoryId: form.categoryId as Id<"shop_categories">,
          stock: form.stock,
          ...(imageId ? { imageId } : {}),
        });
      }
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fout bij opslaan.");
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Naam <span className="text-rust-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: product
                  ? form.slug
                  : e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, ""),
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prijs (€) <span className="text-rust-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={(form.priceInCents / 100).toFixed(2)}
            onChange={(e) =>
              setForm({
                ...form,
                priceInCents: Math.round(
                  parseFloat(e.target.value || "0") * 100,
                ),
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voorraad
          </label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: parseInt(e.target.value || "0") })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categorie <span className="text-rust-500">*</span>
          </label>
          <select
            value={form.categoryId as string}
            onChange={(e) =>
              setForm({
                ...form,
                categoryId: e.target.value as Id<"shop_categories">,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
          >
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Afbeelding
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {uploading && (
            <p className="text-xs text-gray-500 mt-1">Uploaden...</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Beschrijving
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
        />
      </div>
      {product && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="rounded border-gray-300 text-green-500 focus:ring-green-200"
          />
          Actief (zichtbaar in shop)
        </label>
      )}
      {error && <p className="text-sm text-rust-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          {product ? "Bijwerken" : "Toevoegen"}
        </button>
        <button
          onClick={onDone}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}

// ==========================================
// Orders list
// ==========================================
function OrdersList() {
  const orders = useQuery(api.shop.listOrders);
  const updateStatus = useMutation(api.shop.updateOrderStatus);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-600",
  };

  const statusLabels: Record<string, string> = {
    pending: "In afwachting",
    confirmed: "Bevestigd",
    completed: "Afgehaald",
    cancelled: "Geannuleerd",
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Nog geen bestellingen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white border border-gray-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold text-navy-800">
                {order.orderNumber}
              </span>
              <span className="text-sm text-gray-500 ml-3">
                {new Date(order.createdAt).toLocaleDateString("nl-BE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">{order.customerName}</span> —{" "}
            {order.customerEmail}
            {order.customerPhone && ` — ${order.customerPhone}`}
          </div>
          <div className="text-sm text-gray-500 mb-3">
            {order.items.map((item, i) => (
              <span key={i}>
                {item.quantity}× {item.productName} (€
                {((item.priceInCents * item.quantity) / 100).toFixed(2)})
                {i < order.items.length - 1 && ", "}
              </span>
            ))}
            <span className="font-semibold text-navy-800 ml-2">
              Totaal: €{(order.totalInCents / 100).toFixed(2)}
            </span>
          </div>
          {order.note && (
            <p className="text-sm text-gray-500 italic mb-3">
              &quot;{order.note}&quot;
            </p>
          )}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <div className="flex gap-2">
              {order.status === "pending" && (
                <button
                  onClick={() =>
                    updateStatus({ id: order._id, status: "confirmed" })
                  }
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                >
                  Bevestigen
                </button>
              )}
              {(order.status === "pending" || order.status === "confirmed") && (
                <button
                  onClick={() =>
                    updateStatus({ id: order._id, status: "completed" })
                  }
                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                >
                  Afgehaald
                </button>
              )}
              <button
                onClick={() =>
                  updateStatus({ id: order._id, status: "cancelled" })
                }
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
              >
                Annuleren
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// Main admin shop page
// ==========================================
export default function AdminShopPage() {
  const categories = useQuery(api.shop.listAllCategories);
  const products = useQuery(api.shop.listAllProducts);
  const deleteProduct = useMutation(api.shop.deleteProduct);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Id<"shop_products"> | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] =
    useState<Id<"shop_products"> | null>(null);
  const [tab, setTab] = useState<"products" | "orders">("products");

  const productToEdit = editProduct
    ? products?.find((p) => p._id === editProduct)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-800 flex items-center gap-2">
          <ShoppingBagIcon className="w-7 h-7" />
          Shop Beheer
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "products"
              ? "bg-white text-navy-800 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Producten ({products?.length ?? 0})
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "orders"
              ? "bg-white text-navy-800 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Bestellingen
        </button>
      </div>

      {tab === "products" && (
        <>
          <CategoryManager />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-800 flex items-center gap-2">
              <ArchiveBoxIcon className="w-5 h-5" />
              Producten
            </h2>
            <button
              onClick={() => {
                setShowProductForm(true);
                setEditProduct(null);
              }}
              disabled={!categories || categories.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
              Product
            </button>
          </div>

          {(showProductForm || editProduct) && categories && (
            <ProductForm
              categories={categories}
              product={productToEdit ?? null}
              onDone={() => {
                setShowProductForm(false);
                setEditProduct(null);
              }}
            />
          )}

          {/* Product grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products?.map((product) => (
              <div
                key={product._id}
                className={`bg-white border rounded-xl overflow-hidden shadow-sm ${
                  !product.isActive
                    ? "border-gray-300 opacity-60"
                    : "border-gray-200"
                }`}
              >
                {product.imageUrl ? (
                  <div className="relative h-40">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    <ArchiveBoxIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-navy-800">
                      {product.name}
                    </h3>
                    {!product.isActive && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                        inactief
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {product.categoryName}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">
                      €{(product.priceInCents / 100).toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        product.stock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-rust-100 text-rust-700"
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} op voorraad`
                        : "Uitverkocht"}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditProduct(product._id);
                        setShowProductForm(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                      Bewerken
                    </button>
                    {deleteConfirm === product._id ? (
                      <button
                        onClick={async () => {
                          await deleteProduct({ id: product._id });
                          setDeleteConfirm(null);
                        }}
                        className="flex-1 px-2 py-1.5 bg-rust-500 text-white rounded-lg text-xs font-medium hover:bg-rust-600 transition-colors"
                      >
                        Bevestigen?
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(product._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        Verwijderen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ArchiveBoxIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nog geen producten. Voeg er een toe.</p>
            </div>
          )}
        </>
      )}

      {tab === "orders" && <OrdersList />}
    </div>
  );
}
