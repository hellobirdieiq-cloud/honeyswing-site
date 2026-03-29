"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDF8F0]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold text-[#1B3A2D]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            HoneySwing
          </h1>
          <p className="mt-2 text-sm text-[#1B3A2D]/70">
            Coach Dashboard Login
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg bg-[#1B3A2D]/5 p-6 text-center">
            <p className="font-medium text-[#1B3A2D]">
              Check your email for a login link
            </p>
            <p className="mt-2 text-sm text-[#1B3A2D]/60">
              We sent a magic link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1B3A2D]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@example.com"
                className="mt-1 block w-full rounded-lg border border-[#1B3A2D]/20 bg-white px-4 py-3 text-[#1B3A2D] placeholder:text-[#1B3A2D]/40 focus:border-[#D4A843] focus:outline-none focus:ring-2 focus:ring-[#D4A843]/30"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#D4A843] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#C09A3A] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
