"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/app/providers";
import Link from "next/link";
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

function BestellenContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const createOrder = useMutation(api.shop.createOrder);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Parse cart from URL
  const cartParam = searchParams.get("cart");
  const cartItems: { id: Id<"shop_products">; qty: number }[] = (() => {
    try {
      return cartParam ? JSON.parse(cartParam) : [];
    } catch {
      return [];
    }
  })();

  // Load product details for each cart item
  const products = cartItems.map((item) => ({
    ...item,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    product: useQuery(api.shop.getProduct, { id: item.id }),
  }));

  // Pre-fill from user
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName:
          prev.customerName ||
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.name ||
          "",
        customerEmail: prev.customerEmail || user.email || "",
      }));
    }
  }, [user]);

  const allLoaded = products.every((p) => p.product !== undefined);
  const totalInCents = products.reduce(
    (sum, p) => sum + (p.product?.priceInCents ?? 0) * p.qty,
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.customerName.trim() || !form.customerEmail.trim()) {
      setError("Naam en e-mail zijn verplicht.");
      return;
    }

    setSubmitting(true);
    try {
      const orderId = await createOrder({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone || undefined,
        userId: user?.id as Id<"users"> | undefined,
        items: cartItems.map((i) => ({
          productId: i.id,
          quantity: i.qty,
        })),
        note: form.note || undefined,
      });

      // Fetch the order to get the order number
      const orderNumber = `BZ-${orderId}`;
      setOrderNumber(orderNumber);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Er ging iets mis.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderNumber) {
    return (
      <div className="min-h-screen bg-beige-200 py-12">
        <div className="max-w-lg mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-navy-800 mb-2">
              Bestelling geplaatst!
            </h1>
            <p className="text-gray-600 mb-4">
              Bedankt voor je bestelling. We nemen zo snel mogelijk contact met
              je op.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Een bevestiging wordt verstuurd naar{" "}
              <strong>{form.customerEmail}</strong>.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Terug naar shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-beige-200 py-12">
        <div className="max-w-lg mx-auto px-6 text-center">
          <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-800 mb-2">Leeg mandje</h1>
          <p className="text-gray-600 mb-6">
            Je hebt nog niets in je mandje. Ga terug naar de shop.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Naar de shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-200 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Terug naar shop
        </Link>

        <h1 className="text-3xl font-bold text-navy-800 mb-8">Bestellen</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Order form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-navy-800 text-lg">
                Jouw gegevens
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam <span className="text-rust-500">*</span>
                </label>
                <input
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres <span className="text-rust-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) =>
                    setForm({ ...form, customerEmail: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefoonnummer
                </label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) =>
                    setForm({ ...form, customerPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opmerking
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rust-50 border border-rust-200 text-rust-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !allLoaded}
              className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Bestelling plaatsen..." : "Bestelling plaatsen"}
            </button>
          </form>

          {/* Order summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-navy-800 text-lg mb-4">
                Overzicht
              </h2>
              <div className="space-y-3 mb-4">
                {products.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product?.name ?? "Laden..."}{" "}
                      <span className="text-gray-400">×{item.qty}</span>
                    </span>
                    <span className="font-medium text-navy-800">
                      €
                      {item.product
                        ? (
                            (item.product.priceInCents * item.qty) /
                            100
                          ).toFixed(2)
                        : "..."}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-navy-800">Totaal</span>
                <span className="font-bold text-green-600 text-xl">
                  €{(totalInCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BestellenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-beige-200 flex items-center justify-center text-gray-500">
          Laden...
        </div>
      }
    >
      <BestellenContent />
    </Suspense>
  );
}
