"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


type TeleportationResult = {
  algorithm: string;
  input_state: string;
  shots: number;
  counts: Record<string, number>;
  teleported_state: string;
  success: boolean;
  explanation: string;
};


type LearningProgress = {
  completedAlgorithms: string[];
  tutorUsed: boolean;
  labUsed: boolean;
  gatesExplored: string[];
  simulationsRun: number;
  lastGate: string;
  xp: number;
};


export default function QuantumTeleportationPage() {

  const [inputState, setInputState] =
    useState<"0" | "1">("0");

  const [result, setResult] =
    useState<TeleportationResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==================================================
  // Run Simulation
  // ==================================================

  const runSimulation = async () => {

    setLoading(true);
    setError("");
    setResult(null);

    try {

      const response = await fetch(
        "https://quantumlearn-1.onrender.com/algorithms/quantum-teleportation",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            input_state: inputState,
            shots: 1000,
          }),
        }
      );


      if (!response.ok) {

        const errorData =
          await response.json().catch(
            () => null
          );

        throw new Error(
          errorData?.detail ||
          "Quantum Teleportation simulation failed."
        );
      }


      const data: TeleportationResult =
        await response.json();


      setResult(data);


      // ==================================================
      // Save Algorithm Context
      // ==================================================

      localStorage.setItem(
        "quantumAlgorithmContext",
        JSON.stringify({
          algorithm:
            data.algorithm,

          input_state:
            data.input_state,

          shots:
            data.shots,

          result:
            data.counts,

          teleported_state:
            data.teleported_state,

          success:
            data.success,

          explanation:
            data.explanation,
        })
      );


      // ==================================================
      // Update Learning Progress
      // ==================================================

      const storedProgress =
        localStorage.getItem(
          "quantumLearningProgress"
        );


      let progress: LearningProgress = {
        completedAlgorithms: [],
        tutorUsed: false,
        labUsed: false,
        gatesExplored: [],
        simulationsRun: 0,
        lastGate: "",
        xp: 0,
      };


      if (storedProgress) {

        try {

          progress = {
            ...progress,
            ...JSON.parse(
              storedProgress
            ),
          };

        } catch {

          console.error(
            "Could not load learning progress."
          );
        }
      }


      const algorithmName =
        "Quantum Teleportation";

      const alreadyCompleted =
        (progress.completedAlgorithms || []).includes(
          algorithmName
        );

      const earnedXP =
        alreadyCompleted
          ? 0
          : 100;

      const updatedXP =
        (progress.xp || 0) + earnedXP;

      const completedAlgorithms =
        Array.from(
          new Set([
            ...(progress.completedAlgorithms || []),
            algorithmName,
          ])
        );

      localStorage.setItem(
        "quantumLearningProgress",
        JSON.stringify({
          ...progress,

          completedAlgorithms,

          simulationsRun:
            (progress.simulationsRun || 0) + 1,

          xp: updatedXP,
        })
      );


    } catch (simulationError) {

      console.error(
        "Quantum Teleportation error:",
        simulationError
      );


      setError(
        simulationError instanceof Error
          ? simulationError.message
          : "Unable to run the simulation."
      );


    } finally {

      setLoading(false);
    }
  };


  // ==================================================
  // Chart Data
  // ==================================================

  const chartData = result
    ? Object.entries(
        result.counts
      ).map(
        ([state, count]) => ({
          state,
          count,
        })
      )
    : [];


  // ==================================================
  // Calculate probabilities
  // ==================================================

  const totalMeasurements =
    result
      ? Object.values(
          result.counts
        ).reduce(
          (total, count) =>
            total + count,
          0
        )
      : 0;


  // ==================================================
  // JSX
  // ==================================================

  return (
    <main className="min-h-screen bg-[#050816] text-white">


      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-white/10 bg-[#070b1f]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-xl font-bold tracking-wide"
          >
            Quantum
            <span className="text-cyan-400">
              Learn
            </span>
          </Link>


          <nav className="flex items-center gap-6 text-sm text-slate-300">

            <Link
              href="/learn"
              className="transition hover:text-white"
            >
              Learning Hub
            </Link>

            <Link
              href="/algorithms"
              className="text-cyan-400"
            >
              Algorithms
            </Link>

            <Link
              href="/quantum-lab"
              className="transition hover:text-white"
            >
              Quantum Lab
            </Link>

            <Link
              href="/tutor"
              className="transition hover:text-white"
            >
              AI Tutor
            </Link>

          </nav>

        </div>

      </header>


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-12">


        {/* ==================================================
            BACK LINK
        ================================================== */}

        <Link
          href="/algorithms"
          className="text-sm text-slate-400 transition hover:text-cyan-400"
        >
          ← Back to Algorithms
        </Link>


        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="mt-8 max-w-4xl">

          <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
            QUANTUM ALGORITHM
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Quantum Teleportation
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            Learn how an unknown quantum state can be
            transferred from one qubit to another using
            entanglement and classical communication.
          </p>

        </div>


        {/* ==================================================
            INPUT STATE + CIRCUIT
        ================================================== */}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">


          {/* ==================================================
              INPUT STATE
          ================================================== */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">

            <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
              STEP 1
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Choose Input State
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Choose the quantum state that Alice
              will teleport to Bob.
            </p>


            <div className="mt-7 grid grid-cols-2 gap-4">

              <button
                type="button"
                onClick={() =>
                  setInputState("0")
                }
                className={`rounded-2xl border p-5 text-center transition ${
                  inputState === "0"
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                }`}
              >

                <div className="text-3xl font-bold">
                  |0⟩
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  Zero state
                </div>

              </button>


              <button
                type="button"
                onClick={() =>
                  setInputState("1")
                }
                className={`rounded-2xl border p-5 text-center transition ${
                  inputState === "1"
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                }`}
              >

                <div className="text-3xl font-bold">
                  |1⟩
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  One state
                </div>

              </button>

            </div>


            <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                Selected state
              </p>

              <p className="mt-2 text-3xl font-bold text-cyan-300">
                |{inputState}⟩
              </p>

            </div>

          </div>


          {/* ==================================================
              CIRCUIT
          ================================================== */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 lg:col-span-2">

            <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
              QUANTUM CIRCUIT
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Teleportation Circuit
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Alice prepares the input state, creates
              an entangled pair with Bob, performs
              measurements, and sends classical
              information to Bob.
            </p>


            {/* Circuit */}

            <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-[#030612] p-6">

              <div className="min-w-[650px] space-y-8">


                {/* Alice input */}

                <div className="flex items-center gap-4">

                  <div className="w-16 text-sm font-semibold text-cyan-300">
                    Alice
                  </div>

                  <div className="flex flex-1 items-center">

                    <div className="flex h-14 w-20 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 font-bold">
                      |{inputState}⟩
                    </div>

                    <div className="h-px flex-1 bg-white/20" />

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/5 font-bold">
                      H
                    </div>

                    <div className="h-px flex-1 bg-white/20" />

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/5 font-bold">
                      M
                    </div>

                  </div>

                </div>


                {/* Entangled qubit */}

                <div className="flex items-center gap-4">

                  <div className="w-16 text-sm font-semibold text-cyan-300">
                    Alice
                  </div>

                  <div className="flex flex-1 items-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/5 font-bold">
                      H
                    </div>

                    <div className="h-px flex-1 bg-white/20" />

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/5 font-bold">
                      ●
                    </div>

                    <div className="h-px flex-1 bg-white/20" />

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/5 font-bold">
                      M
                    </div>

                  </div>

                </div>


                {/* Bob */}

                <div className="flex items-center gap-4">

                  <div className="w-16 text-sm font-semibold text-emerald-300">
                    Bob
                  </div>

                  <div className="flex flex-1 items-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 font-bold">
                      H
                    </div>

                    <div className="h-px flex-1 bg-white/20" />

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 font-bold">
                      ⊕
                    </div>

                    <div className="h-px flex-1 bg-white/20" />

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 font-bold">
                      Z
                    </div>

                  </div>

                </div>


                {/* Classical communication */}

                <div className="flex items-center gap-4">

                  <div className="w-16 text-sm text-slate-500">
                    Classical
                  </div>

                  <div className="flex flex-1 items-center">

                    <div className="border-t border-dashed border-cyan-400/50 flex-1" />

                    <span className="mx-4 text-xs text-cyan-400">
                      classical bits
                    </span>

                    <div className="border-t border-dashed border-cyan-400/50 flex-1" />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            STEPS
        ================================================== */}

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-7">

          <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
            HOW IT WORKS
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Six steps of quantum teleportation
          </h2>


          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">


            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

              <span className="text-sm font-bold text-cyan-400">
                01
              </span>

              <h3 className="mt-3 font-bold">
                Prepare the state
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Alice prepares the quantum state
                |{inputState}⟩ that she wants to
                teleport.
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

              <span className="text-sm font-bold text-cyan-400">
                02
              </span>

              <h3 className="mt-3 font-bold">
                Create entanglement
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Alice and Bob create an entangled
                Bell pair using H and CNOT gates.
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

              <span className="text-sm font-bold text-cyan-400">
                03
              </span>

              <h3 className="mt-3 font-bold">
                Entangle the input
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Alice applies a CNOT gate between
                her input qubit and her entangled
                qubit.
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

              <span className="text-sm font-bold text-cyan-400">
                04
              </span>

              <h3 className="mt-3 font-bold">
                Measure Alice's qubits
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Alice measures her two qubits,
                producing two classical bits.
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

              <span className="text-sm font-bold text-cyan-400">
                05
              </span>

              <h3 className="mt-3 font-bold">
                Send classical information
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                The two classical measurement results
                determine which corrections Bob must apply.
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

              <span className="text-sm font-bold text-cyan-400">
                06
              </span>

              <h3 className="mt-3 font-bold">
                Reconstruct the state
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Bob applies the required X and Z
                corrections and reconstructs the
                original quantum state.
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            RUN SIMULATION
        ================================================== */}

        <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.035] p-7">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>

              <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
                QISKIT SIMULATION
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Run the algorithm
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Execute the quantum teleportation circuit
                using the Qiskit Aer simulator with
                1,000 measurement shots.
              </p>

            </div>


            <button
              type="button"
              onClick={runSimulation}
              disabled={loading}
              className="rounded-2xl bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Running Simulation..."
                : "Run Simulation →"}
            </button>

          </div>


          {/* Error */}

          {error && (

            <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-5">

              <p className="font-semibold text-red-300">
                Simulation Error
              </p>

              <p className="mt-2 text-sm leading-6 text-red-200/80">
                {error}
              </p>

            </div>

          )}

        </div>


        {/* ==================================================
            RESULT
        ================================================== */}

        {result && (

          <div className="mt-8 grid gap-6 lg:grid-cols-2">


            {/* ==================================================
                RESULT CARD
            ================================================== */}

            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.035] p-7">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold tracking-[0.2em] text-emerald-400">
                    SIMULATION RESULT
                  </p>

                  <h2 className="mt-3 text-2xl font-bold">
                    Teleportation Complete
                  </h2>

                </div>


                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-400">
                  Success
                </span>

              </div>


              <div className="mt-8 grid gap-4 sm:grid-cols-2">


                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Input State
                  </p>

                  <p className="mt-2 text-3xl font-bold text-cyan-300">
                    {result.input_state}
                  </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Teleported State
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-300">
                    {result.teleported_state}
                  </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Shots
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {result.shots}
                  </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Measurements
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {totalMeasurements}
                  </p>

                </div>

              </div>


              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Explanation
                </p>

                <p className="mt-3 leading-7 text-slate-300">
                  {result.explanation}
                </p>

              </div>


              <Link
                href="/tutor"
                className="mt-6 inline-flex rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-400/20"
              >
                Ask AI Tutor about this result →
              </Link>

            </div>


            {/* ==================================================
                MEASUREMENT CHART
            ================================================== */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">

              <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
                MEASUREMENT RESULTS
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Quantum Measurement Distribution
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                These are the measurement outcomes returned
                by the Qiskit simulation.
              </p>


              <div className="mt-8 h-[300px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 10,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                    />

                    <XAxis
                      dataKey="state"
                      tick={{
                        fill: "#94a3b8",
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#94a3b8",
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background:
                          "#0b1025",
                        border:
                          "1px solid rgba(255,255,255,0.1)",
                        borderRadius:
                          "12px",
                        color: "white",
                      }}
                    />

                    <Bar
                      dataKey="count"
                      fill="#22d3ee"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>


              {/* Counts */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">

                {Object.entries(
                  result.counts
                ).map(
                  ([state, count]) => {

                    const probability =
                      totalMeasurements > 0
                        ? (
                            (count /
                              totalMeasurements) *
                            100
                          ).toFixed(1)
                        : "0.0";


                    return (

                      <div
                        key={state}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >

                        <div className="flex items-center justify-between">

                          <span className="font-mono text-cyan-300">
                            {state}
                          </span>

                          <span className="text-sm text-slate-400">
                            {count} shots
                          </span>

                        </div>

                        <div className="mt-2 text-xs text-slate-500">
                          Probability: {probability}%
                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          </div>

        )}


        {/* ==================================================
            CONCEPT EXPLANATION
        ================================================== */}

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-7">

          <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
            KEY CONCEPT
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            What is actually being teleported?
          </h2>

          <div className="mt-5 max-w-4xl space-y-4 text-slate-400">

            <p className="leading-7">
              Quantum teleportation does not physically move
              a qubit from Alice to Bob. Instead, the
              information describing the quantum state is
              transferred using entanglement and classical
              communication.
            </p>

            <p className="leading-7">
              The original state is destroyed when Alice
              performs her measurements, while Bob's qubit
              becomes the corresponding quantum state after
              the appropriate corrections.
            </p>

            <p className="leading-7">
              Importantly, quantum teleportation does not
              allow information to travel faster than light,
              because Alice still has to communicate her
              classical measurement results to Bob.
            </p>

          </div>

        </div>


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">

          <Link
            href="/algorithms"
            className="rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-4 text-center font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            ← All Algorithms
          </Link>

          <Link
            href="/quantum-lab"
            className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-4 text-center font-semibold text-cyan-400 transition hover:bg-cyan-400/20"
          >
            Open Quantum Lab →
          </Link>

          <Link
            href="/tutor"
            className="rounded-2xl bg-cyan-400 px-6 py-4 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Ask AI Tutor →
          </Link>

        </div>

      </section>

    </main>
  );
}




