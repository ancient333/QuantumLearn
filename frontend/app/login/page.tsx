"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
  setMessage(error.message);
} else {
  const params = new URLSearchParams(window.location.search);
  const redirectedFrom = params.get("redirectedFrom");

  window.location.href = redirectedFrom || "/";
}

    setLoading(false);
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome 
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Login to QuantumLearn
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-purple-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none focus:border-purple-500"
          />

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-purple-400 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-3 font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-gray-500 text-sm">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-lg border border-white/10 bg-white/10 py-3 font-semibold hover:bg-white/20"
        >
          Continue with Google
        </button>

        {message && (
          <p className="mt-4 text-center text-red-400 text-sm">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-purple-400 hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}