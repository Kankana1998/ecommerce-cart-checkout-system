"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { logout } from "../../lib/firebaseClient";
import { LoginModal } from "../LoginModal";
import { useAuth } from "../auth/AuthProvider";

export function SiteHeader({
  title = "Uniblox Store",
}: {
  title?: string;
}) {
  const { userId, setUserId } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCartItemCount(0);
      return;
    }

    async function fetchCartCount() {
      try {
        const res = await fetch("/api/cart", {
          headers: { "x-user-id": userId ?? "demo-user" },
        });
        if (res.ok) {
          const cart = await res.json();
          const count = cart.items.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
          );
          setCartItemCount(count);
        }
      } catch {
        // Ignore errors
      }
    }

    void fetchCartCount();
    // Poll every 2 seconds to update cart count
    const interval = setInterval(fetchCartCount, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleLogout = async () => {
    await logout();
    setUserId(null);
    setCartItemCount(0);
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="font-semibold tracking-tight">{title}</div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4 text-sm">
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-900"
            >
              Products
            </Link>
            {userId ? (
              <>
                <Link
                  href="/cart"
                  className="relative text-slate-600 hover:text-slate-900"
                >
                  Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-medium text-white">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Admin
                </Link>
              </>
            ) : null}
          </nav>

          {userId ? (
            <button
              type="button"
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={() => setLoginOpen(true)}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Modal for explicit login */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoggedIn={(id) => {
          setUserId(id);
        }}
      />
    </header>
  );
}

