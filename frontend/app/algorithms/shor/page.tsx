"use client";

import { useState } from "react";
import Link from "next/link";

type Step = {
  step: number;
  title: string;
  description: string;
  period?: number | null;
};

type Result = {
  success: boolean;
  number: number;
  base: number | null;
  period: number | null;
  factors: number[] | null;
  message: string;
  steps: Step[];
  qft?: {
    used?: boolean;
    description?: string;
  };
  workflow: string[];
};

export default function ShorPage() {
  const [number, setNumber] = useState("15");
  const [base, setBase] = useState("2");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function runShor() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "https://quantumlearn-1.onrender.com/algorithms/shor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: Number(number),
            base: Number(base),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Shor's algorithm failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to run Shor's algorithm."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <nav className="border-b border-white/10 bg-[#070b1c]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            QuantumLearn
          </Link>

          <div className="flex gap-6 text-sm text-gray-300">
            <Link href="/learn" className="hover:text-white">
              Learn
            </Link>

            <Link href="/algorithms" className="hover:text-white">
              Algorithms
            </Link>

            <Link href="/quantum-lab" className="hover:text-white">
              Quantum Lab
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-10 pt-12">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-sm text-purple-300">
            âš›ï¸ Quantum Algorithm Explorer
          </div>

          <h1 className="text-4xl font-bold md:text-5xl">
            Shor&apos;s Algorithm
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-400">
            Explore quantum period finding and integer factorization.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-2">

          <div className="space-y-6">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold">
                ðŸŽ¯ The Problem
              </h2>

              <p className="mt-4 leading-7 text-gray-400">
                Shor&apos;s algorithm converts integer factorization
                into a quantum period-finding problem.
              </p>

              <div className="mt-5 rounded-xl border border-purple-400/20 bg-purple-400/5 p-4">
                <p className="font-medium text-purple-200">
                  Core idea
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Find the period of a^x mod N and use that
                  period to extract non-trivial factors.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold">
                âš™ï¸ Experiment
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Number N
                  </label>

                  <input
                    type="number"
                    min="4"
                    max="1000"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Base a
                  </label>

                  <input
                    type="number"
                    min="2"
                    value={base}
                    onChange={(e) => setBase(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  />
                </div>

              </div>

              <button
                onClick={runShor}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-purple-500 px-5 py-3 font-semibold hover:bg-purple-400 disabled:opacity-50"
              >
                {loading
                  ? "Running..."
                  : "âš›ï¸ Run Shor's Algorithm"}
              </button>

              {error && (
                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold">
                ðŸŒ€ Quantum Fourier Transform
              </h2>

              <p className="mt-4 leading-7 text-gray-400">
                QFT is used during period finding to reveal
                information about the periodic structure of
                the function.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold">
                ðŸ§  Workflow
              </h2>

              <div className="mt-5 space-y-3">
                {[
                  "Choose N.",
                  "Choose a base a.",
                  "Create a quantum superposition.",
                  "Evaluate the periodic function.",
                  "Apply the Quantum Fourier Transform.",
                  "Extract the factors.",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex gap-4 rounded-xl border border-white/5 bg-black/20 p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-400/10 text-sm font-bold text-purple-300">
                      {index + 1}
                    </div>

                    <p className="text-sm text-gray-300">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="space-y-6">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold">
                ðŸ“Š Simulation Result
              </h2>

              {!result && !loading && (
                <div className="mt-6 rounded-xl border border-dashed border-white/10 p-10 text-center">
                  <div className="text-4xl">âš›ï¸</div>
                  <p className="mt-4 text-gray-400">
                    Run the simulation to see the result.
                  </p>
                </div>
              )}

              {loading && (
                <div className="mt-6 rounded-xl border border-white/10 p-10 text-center">
                  <div className="text-4xl">ðŸŒ€</div>
                  <p className="mt-4 text-gray-300">
                    Finding the period...
                  </p>
                </div>
              )}

              {result && (
                <div className="mt-6 space-y-5">

                  <div className="grid gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs text-gray-500">N</p>
                      <p className="mt-2 text-2xl font-bold">
                        {result.number}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs text-gray-500">Base</p>
                      <p className="mt-2 text-2xl font-bold">
                        {result.base ?? "â€”"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs text-gray-500">Period</p>
                      <p className="mt-2 text-2xl font-bold">
                        {result.period ?? "â€”"}
                      </p>
                    </div>

                  </div>

                  {result.factors && (
                    <div className="rounded-xl border border-green-400/20 bg-green-400/5 p-5">
                      <p className="text-sm text-green-300">
                        Factors found
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {result.factors[0]} Ã— {result.factors[1]} ={" "}
                        {result.number}
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-gray-300">
                      {result.message}
                    </p>
                  </div>

                </div>
              )}
            </div>

            {result && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-xl font-semibold">
                  ðŸ”¬ Step-by-Step
                </h2>

                <div className="mt-6 space-y-4">
                  {result.steps.map((step) => (
                    <div
                      key={step.step}
                      className="rounded-xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-400/10 text-sm font-bold text-purple-300">
                          {step.step}
                        </div>

                        <div>
                          <h3 className="font-semibold">
                            {step.title}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-gray-400">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result && result.period && result.base && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-xl font-semibold">
                  ðŸ”„ Period Finding
                </h2>

                <div className="my-5 rounded-xl border border-purple-400/20 bg-purple-400/5 p-5 text-center">
                  <p className="font-mono text-lg text-purple-200">
                    f(x) = {result.base}^x mod {result.number}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {Array.from(
                    {
                      length: Math.min(result.period * 2, 8),
                    },
                    (_, index) => {
                      const value =
                        Math.pow(result.base as number, index) %
                        result.number;

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-white/10 bg-black/20 p-4 text-center"
                        >
                          <p className="text-xs text-gray-500">
                            x = {index}
                          </p>

                          <p className="mt-2 font-mono text-lg font-semibold">
                            {value}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="mt-5 rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
                  <p className="text-sm text-blue-200">
                    Detected period:
                    <span className="ml-2 font-bold">
                      r = {result.period}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-xl font-semibold">
                  ðŸŒ€ QFT
                </h2>

                <p className="mt-4 text-sm leading-7 text-gray-400">
                  {result.qft?.description ??
                    "The Quantum Fourier Transform is used to extract periodic information during Shor's period-finding step."}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/20 p-6">
                  <span className="rounded-lg border border-white/10 px-4 py-3 text-sm">
                    Superposition
                  </span>

                  <span className="text-purple-300">â†’</span>

                  <span className="rounded-lg border border-white/10 px-4 py-3 text-sm">
                    Periodic Function
                  </span>

                  <span className="text-purple-300">â†’</span>

                  <span className="rounded-lg border border-purple-400/30 bg-purple-400/10 px-4 py-3 text-sm text-purple-200">
                    QFT
                  </span>

                  <span className="text-purple-300">â†’</span>

                  <span className="rounded-lg border border-white/10 px-4 py-3 text-sm">
                    Period
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-purple-400/20 bg-purple-400/5 p-6">
              <h2 className="text-xl font-semibold">
                ðŸ§  Need Help?
              </h2>

              <p className="mt-3 text-sm text-gray-400">
                Ask the AI Tutor to explain Shor&apos;s algorithm,
                period finding, or QFT.
              </p>

              <Link
                href="/tutor"
                className="mt-5 inline-flex rounded-xl border border-purple-400/30 bg-purple-400/10 px-5 py-3 text-sm font-semibold text-purple-200"
              >
                Ask AI Tutor â†’
              </Link>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}




