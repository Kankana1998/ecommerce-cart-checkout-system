"use client";

import { useState } from "react";
import { LoginModal } from "../components/LoginModal";
import { SiteHeader } from "../components/layout/SiteHeader";
import { useAuth } from "../components/auth/AuthProvider";

const PRODUCTS = [
  {
    id: "p1",
    name: "Wireless Headphones",
    price: 120,
    description: "Comfortable over-ear wireless headphones.",
  },
  {
    id: "p2",
    name: "Mechanical Keyboard",
    price: 90,
    description: "Compact mechanical keyboard with RGB.",
  },
  {
    id: "p3",
    name: "4K Monitor",
    price: 400,
    description: "27-inch 4K IPS display.",
  },
];

export default function Home() {
  const { userId, setUserId } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddClick = (productId: string) => {
    setFeedback(null);
    if (!userId) {
      setPendingProductId(productId);
      setLoginOpen(true);
    } else {
      void addToCart(productId, userId, setFeedback);
    }
  };

  const handleLoggedIn = (newUserId: string) => {
    setUserId(newUserId);
    if (pendingProductId) {
      void addToCart(pendingProductId, newUserId, setFeedback);
      setPendingProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add items to your cart and proceed to checkout. Every 3rd
            order gets a 10% discount code.
          </p>
          {feedback ? (
            <p className="mt-2 text-xs text-emerald-600">
              {feedback}
            </p>
          ) : null}
        </section>
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-lg border bg-white p-4 shadow-sm"
            >
              <div>
                <h2 className="text-sm font-medium">
                  {product.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {product.description}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  ${product.price}
                </span>
                <button
                  type="button"
                  className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
                  onClick={() => handleAddClick(product.id)}
                >
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoggedIn={handleLoggedIn}
      />
    </div>
  );
}

async function addToCart(
  productId: string,
  userId: string,
  setFeedback: (msg: string | null) => void,
) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId ?? "demo-user",
      },
      body: JSON.stringify({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to add to cart");
    }
    setFeedback("Item added to cart.");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    setFeedback("Something went wrong while adding to cart.");
  }
}
