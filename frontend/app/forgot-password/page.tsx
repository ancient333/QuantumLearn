"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Password reset email sent. Check your inbox and click the reset link."
      );
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          Forgot Password?
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Enter your email and we'll send you a password reset link.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-3 font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-green-400 text-sm">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-center text-red-400 text-sm">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-gray-400 text-sm">
          Remember your password?{" "}
          <a href="/login" className="text-purple-400 hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </main>
  );
}