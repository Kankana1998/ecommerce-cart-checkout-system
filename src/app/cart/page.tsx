"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "../../components/layout/SiteHeader";
import { useAuth } from "../../components/auth/AuthProvider";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  items: CartItem[];
}

export default function CartPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    orderId: string;
    newCode?: string;
  } | null>(null);

  useEffect(() => {
    if (!userId) {
      router.push("/");
      return;
    }

    async function loadCart() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/cart", {
          headers: { "x-user-id": userId ?? "demo-user" },
        });
        if (!res.ok) {
          throw new Error("Failed to load cart");
        }
        const data = await res.json();
        setCart(data);
      } catch (err) {
        setError("Failed to load cart");
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCart();
  }, [userId, router]);

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !cart) return;

    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId ?? "demo-user",
        },
        body: JSON.stringify({ code: discountCode || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const response = await res.json();
      const order = response.order;
      const newCode = response.discountCodeGeneratedForNextOrder;

      // Show success message instead of alert
      setSuccessMessage({
        orderId: order.id,
        newCode: newCode?.code,
      });

      // Reload cart (should be empty now)
      const cartRes = await fetch("/api/cart", {
        headers: { "x-user-id": userId ?? "demo-user" },
      });
      if (cartRes.ok) {
        const newCart = await cartRes.json();
        setCart(newCart);
        setDiscountCode("");
      }

      // Auto-hide success message after 8 seconds
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Checkout failed";
      alert(`Error: ${message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <SiteHeader title="Cart" />
        <main className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-sm text-slate-500">Loading cart...</p>
        </main>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <SiteHeader title="Cart" />
        <main className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-sm text-red-600">{error || "Failed to load cart"}</p>
        </main>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader title="Cart" />
      <main className="mx-auto max-w-5xl px-6 py-8">
        {successMessage && (
          <div className="mb-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-900">
                  <span>✓</span> Order Placed Successfully!
                </h2>
                <p className="mt-2 text-sm text-emerald-800">
                  Order ID: <span className="font-mono font-semibold">{successMessage.orderId}</span>
                </p>
                {successMessage.newCode && (
                  <div className="mt-4 rounded-md bg-white p-3">
                    <p className="text-xs font-medium text-slate-600">
                      🎉 NEW DISCOUNT CODE GENERATED
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                      {successMessage.newCode}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      Use this code on your next order for 10% off!
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-600 hover:text-emerald-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">
          Your Cart
        </h1>
        <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
          {cart.items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Your cart is empty.
            </p>
          ) : (
            <>
              <ul className="divide-y">
                {cart.items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      ${item.price * item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
                <span className="font-medium">Total</span>
                <span className="font-semibold">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="mt-4 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
                <p>
                  <strong>💡 How discounts work:</strong> Every 3rd order placed
                  generates a 10% discount code for the next order.
                </p>
                <p className="mt-2">
                  Example: After completing 3 orders, a code becomes available
                  to use on order 4.
                </p>
              </div>
              <form
                onSubmit={handleCheckout}
                className="mt-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Discount code (optional)"
                    className="flex-1 rounded-md border px-2 py-1 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {isCheckingOut ? "Processing..." : "Checkout"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

