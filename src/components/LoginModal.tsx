"use client";

import { useState } from "react";
import { signInWithGoogle } from "../lib/firebaseClient";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoggedIn: (userId: string) => void;
}

export function LoginModal({
  open,
  onClose,
  onLoggedIn,
}: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      const user = await signInWithGoogle();
      const userId = user.uid ?? user.email ?? "anonymous-user";
      // Auth state is handled globally by AuthProvider; this callback is for
      // callers that want to react immediately (e.g. to continue a pending action).
      onLoggedIn(String(userId));
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold tracking-tight">
          Login required
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Please sign in with Google before adding items to your cart.
        </p>
        {error ? (
          <p className="mt-2 text-xs text-red-600">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-3 text-sm">
          <button
            type="button"
            className="rounded-full px-4 py-1 text-slate-600 hover:bg-slate-100"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-1 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}

