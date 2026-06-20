"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBagIcon,
  FunnelIcon,
  ShoppingCartIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

interface CartItem {
  productId: Id<"shop_products">;
  name: string;
  priceInCents: number;
  quantity: number;
  imageUrl: string | null;
  stock: number;
}

export default function ShopPage() {
  const categories = useQuery(api.shop.listCategories);
  const [selectedCategory, setSelectedCategory] = useState<
    Id<"shop_categories"> | undefined
  >(undefined);
  const products = useQuery(api.shop.listProducts, {
    categoryId: selectedCategory,
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product: NonNullable<typeof products>[number]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          priceInCents: product.priceInCents,
          quantity: 1,
          imageUrl: product.imageUrl,
          stock: product.stock,
        },
      ];
    });
  };

  const updateQuantity = (productId: Id<"shop_products">, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.productId !== productId) return item;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock) return item;
            return { ...item, quantity: newQty };
          })
          .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: Id<"shop_products">) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const cartTotal = cart.reduce(
    (sum, i) => sum + i.priceInCents * i.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-beige-200 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-800 flex items-center gap-3">
              <ShoppingBagIcon className="w-8 h-8" />
              Shop
            </h1>
            <p className="text-gray-600 mt-1">
              Ontdek onze producten en bestel eenvoudig online.
            </p>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            Winkelmandje
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rust-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Category filter */}
        {categories && categories.length > 0 && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Alles
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat._id
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-8">
          {/* Product grid */}
          <div className="flex-1">
            {products === undefined ? (
              <div className="text-center py-12 text-gray-500">Laden...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Geen producten gevonden.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const inCart = cart.find((i) => i.productId === product._id);
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      {product.imageUrl ? (
                        <div className="relative h-48">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                          <ShoppingBagIcon className="w-16 h-16 text-gray-200" />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-xs text-green-600 font-medium mb-1">
                          {product.categoryName}
                        </p>
                        <h3 className="font-semibold text-navy-800 text-lg mb-1">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600">
                            €{(product.priceInCents / 100).toFixed(2)}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              product.stock > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} beschikbaar`
                              : "Uitverkocht"}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={
                            product.stock <= 0 ||
                            (inCart?.quantity ?? 0) >= product.stock
                          }
                          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCartIcon className="w-4 h-4" />
                          {inCart
                            ? `In mandje (${inCart.quantity})`
                            : "In mandje"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart sidebar */}
          {showCart && (
            <div className="w-80 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-navy-800 text-lg">
                    Winkelmandje
                  </h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    Je mandje is leeg.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cart.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3"
                        >
                          {item.imageUrl ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              <ShoppingBagIcon className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-navy-800 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              €{(item.priceInCents / 100).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-medium w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-gray-300 hover:text-rust-500 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Totaal</span>
                        <span className="font-bold text-navy-800 text-lg">
                          €{(cartTotal / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/shop/bestellen?cart=${encodeURIComponent(JSON.stringify(cart.map((i) => ({ id: i.productId, qty: i.quantity }))))}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Bestellen
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
