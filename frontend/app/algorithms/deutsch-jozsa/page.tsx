"use client";

import Link from "next/link";
import { useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


type SimulationResult = {
  algorithm: string;
  oracle_type: string;
  classification: string;
  result: string;
  shots: number;
  counts: {
    [key: string]: number;
  };
  explanation: string;
};


type LearningProgress = {
  completedAlgorithms: string[];
  tutorUsed: boolean;
  labUsed: boolean;
  gatesExplored: string[];
  simulationsRun: number;
  lastGate?: string;

  quizScore?: number;
  quizXP?: number;
  quizzesCompleted?: number;

  topicPerformance?: Record<
    string,
    {
      correct: number;
      total: number;
    }
  >;

  xp?: number;
};


export default function DeutschJozsaPage() {

  const [oracleType, setOracleType] =
    useState<"constant" | "balanced">(
      "constant"
    );

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<SimulationResult | null>(
      null
    );

  const [currentStep, setCurrentStep] =
    useState(1);


  /*
   * ==================================================
   * ALGORITHM STEPS
   * ==================================================
   */

  const steps = [
    {
      number: 1,
      title: "Initialize the Qubits",
      description:
        "The algorithm starts with the input qubit in |0âŸ© and the auxiliary qubit in |1âŸ©.",
      circuit:
        "qâ‚€: |0âŸ©    qâ‚: |1âŸ©",
    },

    {
      number: 2,
      title: "Create Superposition",
      description:
        "Hadamard gates are applied to create a superposition of possible input states.",
      circuit:
        "qâ‚€: |0âŸ© â”€â”€Hâ”€â”€    qâ‚: |1âŸ© â”€â”€Hâ”€â”€",
    },

    {
      number: 3,
      title: "Apply the Oracle",
      description:
        oracleType === "constant"
          ? "The constant oracle behaves the same way for every input."
          : "The balanced oracle produces different outputs for different input states.",
      circuit:
        oracleType === "constant"
          ? "qâ‚€ â”€â”€Hâ”€â”€â”Œâ”€â”€â”€â”€â”€â”€â”€â”"
          : "qâ‚€ â”€â”€Hâ”€â”€â”Œâ”€â”€â”€â”€â”€â”€â”€â”",
    },

    {
      number: 4,
      title: "Apply the Final Hadamard",
      description:
        "A second Hadamard operation allows quantum interference to reveal information about the oracle.",
      circuit:
        "qâ‚€ â”€â”€Hâ”€â”€ Oracle â”€â”€Hâ”€â”€",
    },

    {
      number: 5,
      title: "Measure",
      description:
        "The input qubit is measured. The measurement pattern determines whether the oracle is constant or balanced.",
      circuit:
        "qâ‚€ â”€â”€Hâ”€â”€ Oracle â”€â”€Hâ”€â”€M",
    },

    {
      number: 6,
      title: "Classify the Oracle",
      description:
        oracleType === "constant"
          ? "If the input register is measured as 0, the oracle is classified as constant."
          : "If a non-zero result appears in the input register, the oracle is classified as balanced.",
      circuit:
        "Measurement â†’ Classification",
    },
  ];


  /*
   * ==================================================
   * RUN SIMULATION
   * ==================================================
   */

  const runSimulation =
    async () => {

      setLoading(true);

      try {

        const response =
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/algorithms/deutsch-jozsa`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                oracle_type:
                  oracleType,

                shots: 1000,
              }),
            }
          );


        if (!response.ok) {
          throw new Error(
            "Deutschâ€“Jozsa simulation failed."
          );
        }


        const data =
          await response.json();


        console.log(
          "Deutschâ€“Jozsa result:",
          data
        );


        setResult(data);

        setCurrentStep(6);


        /*
         * ==============================================
         * LOAD LEARNING PROGRESS
         * ==============================================
         */

        const storedProgress =
          localStorage.getItem(
            "quantumLearningProgress"
          );


        let progress: LearningProgress =
          {
            completedAlgorithms: [],
            tutorUsed: false,
            labUsed: false,
            gatesExplored: [],
            simulationsRun: 0,
            lastGate: "",

            quizScore: 0,
            quizXP: 0,
            quizzesCompleted: 0,

            topicPerformance: {},

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


        /*
         * ==============================================
         * CHECK WHETHER THIS IS THE FIRST COMPLETION
         * ==============================================
         */

        const algorithmName =
          "Deutschâ€“Jozsa";


        const alreadyCompleted =
          (
            progress.completedAlgorithms ||
            []
          ).includes(
            algorithmName
          );


        const completedAlgorithms =
          Array.from(
            new Set([
              ...(progress.completedAlgorithms ||
                []),

              algorithmName,
            ])
          );


        /*
         * ==============================================
         * XP
         *
         * First completion:
         *
         * +100 XP
         *
         * Re-running:
         *
         * No completion bonus
         * ==============================================
         */

        const earnedXP =
          alreadyCompleted
            ? 0
            : 100;


        const updatedXP =
          (progress.xp || 0) +
          earnedXP;


        /*
         * ==============================================
         * UPDATE PROGRESS
         * ==============================================
         */

        const updatedProgress:
          LearningProgress =
          {
            ...progress,

            completedAlgorithms,

            simulationsRun:
              (progress.simulationsRun ||
                0) + 1,

            xp: updatedXP,
          };


        localStorage.setItem(
          "quantumLearningProgress",
          JSON.stringify(
            updatedProgress
          )
        );


        /*
         * ==============================================
         * SAVE ALGORITHM CONTEXT
         *
         * AI Tutor can use this context.
         * ==============================================
         */

        localStorage.setItem(
          "quantumAlgorithmContext",
          JSON.stringify({
            algorithm:
              "Deutschâ€“Jozsa",

            oracle_type:
              data.oracle_type,

            oracleType:
              data.oracle_type,

            classification:
              data.classification,

            result:
              data.result,

            shots:
              data.shots,

            counts:
              data.counts,

            explanation:
              data.explanation,
          })
        );


        console.log(
          `Deutschâ€“Jozsa XP earned: ${earnedXP}`
        );

        console.log(
          `Total XP: ${updatedXP}`
        );

      } catch (error) {

        console.error(
          "Error running Deutschâ€“Jozsa:",
          error
        );

        alert(
          "Unable to run the Deutschâ€“Jozsa simulation. Please make sure the backend server is running."
        );

      } finally {

        setLoading(false);

      }

    };


  /*
   * ==================================================
   * STEP NAVIGATION
   * ==================================================
   */

  const nextStep = () => {

    if (
      currentStep <
      steps.length
    ) {

      setCurrentStep(
        currentStep + 1
      );

    }

  };


  const previousStep = () => {

    if (currentStep > 1) {

      setCurrentStep(
        currentStep - 1
      );

    }

  };


  const restartSteps = () => {

    setCurrentStep(1);

    setResult(null);

  };


  /*
   * ==================================================
   * RESULT CHART DATA
   * ==================================================
   */

  const chartData =
    result
      ? Object.entries(
          result.counts
        ).map(
          ([state, count]) => ({
            state,
            count,
          })
        )
      : [];


  /*
   * ==================================================
   * RESULT EXPLANATION
   * ==================================================
   */

  const getResultExplanation =
    () => {

      if (!result) {
        return "";
      }


      if (
        result.classification
          ?.toLowerCase()
          .includes("constant")
      ) {

        return (
          "The measurement result indicates that the oracle behaves the same way for all possible inputs. The Deutschâ€“Jozsa algorithm identifies this as a constant function."
        );

      }


      return (
        "The measurement result indicates that the oracle behaves differently for different inputs. The Deutschâ€“Jozsa algorithm therefore identifies it as a balanced function."
      );

    };


  return (

    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white lg:px-10">

      <div className="mx-auto max-w-7xl">


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">

          <Link
            href="/learn"
            className="text-xl font-bold tracking-tight"
          >
            Quantum
            <span className="text-cyan-400">
              Learn
            </span>
          </Link>


          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">

            <Link
              href="/learn"
              className="transition hover:text-white"
            >
              Learning Hub
            </Link>

            <Link
              href="/algorithms"
              className="text-cyan-400 transition hover:text-cyan-300"
            >
              Algorithms
            </Link>

            <Link
              href="/dashboard"
              className="transition hover:text-white"
            >
              Quantum Lab
            </Link>

            <Link
              href="/quiz"
              className="transition hover:text-white"
            >
              Quiz
            </Link>

            <Link
              href="/tutor"
              className="transition hover:text-white"
            >
              AI Tutor
            </Link>

          </div>

        </nav>


        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="py-10">

          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">

            Quantum Algorithm

          </div>


          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">

            Deutschâ€“Jozsa Algorithm

          </h1>


          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">

            Determine whether a function is
            constant or balanced using quantum
            parallelism.

          </p>

        </section>


        {/* ==================================================
            ALGORITHM OVERVIEW
        ================================================== */}

        <section className="grid gap-6 lg:grid-cols-3">


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Difficulty
            </p>

            <p className="mt-2 text-xl font-semibold text-cyan-300">
              Beginner
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Main Idea
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Quantum parallelism and interference
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Completion Reward
            </p>

            <p className="mt-2 text-xl font-semibold text-emerald-400">
              +100 XP
            </p>

            <p className="mt-1 text-xs text-slate-500">
              First completion only
            </p>

          </div>


        </section>


        {/* ==================================================
            ORACLE SELECTION
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div>

            <h2 className="text-lg font-semibold">
              Choose the Oracle
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the type of function that
              the algorithm should analyze.
            </p>

          </div>


          <div className="mt-6 grid gap-4 md:grid-cols-2">


            {/* Constant */}

            <button
              onClick={() => {

                setOracleType(
                  "constant"
                );

                setResult(null);

                setCurrentStep(1);

              }}
              className={`rounded-2xl border p-6 text-left transition ${
                oracleType ===
                "constant"
                  ? "border-cyan-400/40 bg-cyan-400/[0.07] shadow-lg shadow-cyan-500/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >

              <div className="flex items-center justify-between">

                <h3 className="font-semibold">
                  Constant Function
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    oracleType ===
                    "constant"
                      ? "bg-cyan-400/10 text-cyan-300"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {oracleType ===
                  "constant"
                    ? "Selected"
                    : "Select"}
                </span>

              </div>


              <p className="mt-3 text-sm leading-6 text-slate-400">

                The oracle produces the same
                output for every possible input.

              </p>


              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-sm text-cyan-300">

                f(0) = f(1)

              </div>

            </button>


            {/* Balanced */}

            <button
              onClick={() => {

                setOracleType(
                  "balanced"
                );

                setResult(null);

                setCurrentStep(1);

              }}
              className={`rounded-2xl border p-6 text-left transition ${
                oracleType ===
                "balanced"
                  ? "border-purple-400/40 bg-purple-400/[0.07] shadow-lg shadow-purple-500/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >

              <div className="flex items-center justify-between">

                <h3 className="font-semibold">
                  Balanced Function
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    oracleType ===
                    "balanced"
                      ? "bg-purple-400/10 text-purple-300"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {oracleType ===
                  "balanced"
                    ? "Selected"
                    : "Select"}
                </span>

              </div>


              <p className="mt-3 text-sm leading-6 text-slate-400">

                The oracle produces different
                outputs for different input states.

              </p>


              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-sm text-purple-300">

                f(0) â‰  f(1)

              </div>

            </button>


          </div>


          {/* Run */}

          <button
            onClick={
              runSimulation
            }
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading
              ? "Running Quantum Simulation..."
              : "Run Deutschâ€“Jozsa Simulation â†’"}

          </button>

        </section>


        {/* ==================================================
            STEP-BY-STEP
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-lg font-semibold">
                Step-by-Step Algorithm
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Understand what happens at each
                stage of Deutschâ€“Jozsa.
              </p>

            </div>


            <button
              onClick={
                restartSteps
              }
              className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              â†» Restart
            </button>

          </div>


          {/* Progress */}

          <div className="mt-8 flex items-center">

            {steps.map(
              (step, index) => (

                <div
                  key={
                    step.number
                  }
                  className="flex flex-1 items-center"
                >

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      currentStep >=
                      step.number
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : "border-white/10 bg-white/[0.03] text-slate-500"
                    }`}
                  >

                    {currentStep >
                    step.number
                      ? "âœ“"
                      : step.number}

                  </div>


                  {index <
                    steps.length -
                      1 && (

                    <div
                      className={`mx-2 h-[2px] flex-1 ${
                        currentStep >
                        step.number
                          ? "bg-cyan-400"
                          : "bg-white/10"
                      }`}
                    />

                  )}

                </div>

              )
            )}

          </div>


          {/* Current Step */}

          <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-6">

            <p className="text-xs uppercase tracking-wider text-cyan-400">

              Step {currentStep} of{" "}
              {steps.length}

            </p>


            <h3 className="mt-2 text-2xl font-semibold">

              {
                steps[
                  currentStep - 1
                ].title
              }

            </h3>


            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">

              {
                steps[
                  currentStep - 1
                ].description
              }

            </p>


            <div className="mt-6 rounded-xl border border-white/10 bg-[#030712] p-6">

              <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">
                Circuit Concept
              </p>

              <pre className="overflow-x-auto font-mono text-sm leading-7 text-cyan-300">
                {
                  steps[
                    currentStep - 1
                  ].circuit
                }
              </pre>

            </div>

          </div>


          {/* Controls */}

          <div className="mt-6 flex justify-between">

            <button
              onClick={
                previousStep
              }
              disabled={
                currentStep === 1
              }
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              â† Previous
            </button>


            {currentStep <
            steps.length ? (

              <button
                onClick={
                  nextStep
                }
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Next Step â†’
              </button>

            ) : (

              <button
                onClick={
                  runSimulation
                }
                disabled={loading}
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {loading
                  ? "Running..."
                  : "Run Simulation â†’"}
              </button>

            )}

          </div>

        </section>


        {/* ==================================================
            CIRCUIT VISUALIZATION
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div>

            <h2 className="text-lg font-semibold">
              Deutschâ€“Jozsa Circuit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Conceptual circuit for the selected oracle.
            </p>

          </div>


          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#030712] p-8">

            <div className="min-w-[700px] space-y-8 font-mono">

              {/* q0 */}

              <div className="flex items-center gap-3">

                <span className="w-10 text-slate-500">
                  qâ‚€
                </span>

                <div className="h-[2px] flex-1 bg-slate-700" />

                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                  H
                </div>

                <div className="h-[2px] w-12 bg-slate-700" />

                <div className="flex h-12 min-w-[110px] items-center justify-center rounded-lg border border-purple-400/30 bg-purple-400/10 px-4 text-purple-300">
                  Oracle
                </div>

                <div className="h-[2px] w-12 bg-slate-700" />

                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                  H
                </div>

                <div className="h-[2px] w-12 bg-slate-700" />

                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                  M
                </div>

              </div>


              {/* q1 */}

              <div className="flex items-center gap-3">

                <span className="w-10 text-slate-500">
                  qâ‚
                </span>

                <div className="h-[2px] flex-1 bg-slate-700" />

                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                  H
                </div>

                <div className="h-[2px] w-12 bg-slate-700" />

                <div className="flex h-12 min-w-[110px] items-center justify-center rounded-lg border border-purple-400/30 bg-purple-400/10 px-4 text-purple-300">
                  Oracle
                </div>

                <div className="h-[2px] w-12 bg-slate-700" />

                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500">
                  â€”
                </div>

                <div className="h-[2px] w-12 bg-slate-700" />

                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500">
                  â€”
                </div>

              </div>

            </div>

          </div>


          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">

            <p className="text-sm font-semibold text-slate-200">
              Current Oracle
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">

              {oracleType ===
              "constant"
                ? "The selected oracle is constant. It produces the same function value for every input."
                : "The selected oracle is balanced. It produces different function values across the input space."}

            </p>

          </div>

        </section>


        {/* ==================================================
            SIMULATION RESULT
        ================================================== */}

        {result && (

          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-lg font-semibold">
                  Simulation Result
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Actual result returned by the Qiskit simulation.
                </p>

              </div>


              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-5 py-3">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  First Completion
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-400">
                  +100 XP
                </p>

              </div>

            </div>


            {/* Summary */}

            <div className="mt-6 grid gap-4 md:grid-cols-4">

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Oracle
                </p>

                <p className="mt-2 font-semibold capitalize">
                  {result.oracle_type}
                </p>

              </div>


              <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Classification
                </p>

                <p className="mt-2 font-semibold text-cyan-300">
                  {result.classification}
                </p>

              </div>


              <div className="rounded-xl border border-purple-400/10 bg-purple-400/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Result
                </p>

                <p className="mt-2 font-mono font-semibold text-purple-300">
                  {result.result}
                </p>

              </div>


              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Shots
                </p>

                <p className="mt-2 font-semibold">
                  {result.shots}
                </p>

              </div>

            </div>


            {/* Explanation */}

            <div className="mt-6 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">

              <p className="text-sm font-semibold text-cyan-300">
                What does this result mean?
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {getResultExplanation()}
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {result.explanation}
              </p>

            </div>


            {/* Counts */}

            <div className="mt-8">

              <h3 className="text-sm font-semibold">
                Measurement Counts
              </h3>

              <div className="mt-4 space-y-2">

                {Object.entries(
                  result.counts
                ).map(
                  ([state, count]) => (

                    <div
                      key={state}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4"
                    >

                      <span className="font-mono text-cyan-300">
                        |{state}âŸ©
                      </span>

                      <span className="font-semibold">
                        {count}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* Chart */}

            <div className="mt-8">

              <h3 className="mb-4 text-sm font-semibold">
                Measurement Distribution
              </h3>

              <div className="h-72 w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={chartData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="state"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* AI Tutor */}

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-7">

              <h3 className="text-2xl font-semibold">
                Understand the Result
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Your actual Deutschâ€“Jozsa simulation result has been saved for the AI Tutor.
                Ask it to explain the oracle, classification, measurement result, and why the algorithm reached its conclusion.
              </p>

              <Link
                href="/tutor"
                className="mt-5 inline-block rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300"
              >
                Ask AI Tutor â†’
              </Link>

            </div>

          </section>

        )}


        {/* ==================================================
            CONCEPT SUMMARY
        ================================================== */}

        <section className="mt-6 grid gap-6 md:grid-cols-3">


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              01
            </div>

            <h3 className="mt-4 font-semibold">
              Quantum Parallelism
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">

              The algorithm evaluates information
              about multiple possible inputs through
              quantum superposition.

            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300">
              02
            </div>

            <h3 className="mt-4 font-semibold">
              Oracle
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">

              The oracle contains the function whose
              behavior we want to classify.

            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              03
            </div>

            <h3 className="mt-4 font-semibold">
              Interference
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">

              The final Hadamard operation creates
              interference that reveals whether the
              oracle is constant or balanced.

            </p>

          </div>


        </section>


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <section className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center">

          <Link
            href="/algorithms"
            className="text-sm text-slate-400 transition hover:text-cyan-300"
          >
            â† Back to Algorithms
          </Link>


          <div className="flex flex-wrap gap-3">

            <Link
              href="/algorithms/grover"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              Grover â†’
            </Link>


            <Link
              href="/algorithms/quantum-teleportation"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              Teleportation â†’
            </Link>

          </div>

        </section>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="py-10 text-center text-sm text-slate-600">

          Quantum
          <span className="text-cyan-500">
            Learn
          </span>

          {" "}â€¢ Interactive Quantum Education

        </footer>

      </div>

    </main>

  );
}




