"use client";

import { useState } from "react";
import Link from "next/link";
import QuantumCircuit from "../components/QuantumCircuit";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://quantumlearn-1.onrender.com";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

export default function Dashboard() {
  const [selectedGate, setSelectedGate] =
    useState("H");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] = useState<{
    gate: string;
    shots: number;
    counts: {
      [key: string]: number;
    };
  } | null>(null);

  const [currentStep, setCurrentStep] =
    useState(1);

  const gateDescriptions: {
    [key: string]: {
      name: string;
      description: string;
    };
  } = {
    H: {
      name: "Hadamard Gate",
      description:
        "Creates a superposition, giving the qubit an equal probability of being measured as 0 or 1.",
    },

    X: {
      name: "Pauli-X Gate",
      description:
        "Flips the qubit state. A qubit in |0⟩ becomes |1⟩ and a qubit in |1⟩ becomes |0⟩.",
    },

    Z: {
      name: "Pauli-Z Gate",
      description:
        "Changes the phase of the |1⟩ state while leaving the measurement probabilities unchanged.",
    },

    CNOT: {
      name: "Controlled-NOT Gate",
      description:
        "Uses one qubit as a control to flip another qubit when the control qubit is in state |1⟩.",
    },
  };

  const quantumStates: {
    [key: string]: {
      initial: string;
      operation: string;
      final: string;
      explanation: string;
    };
  } = {
    H: {
      initial: "|0⟩",
      operation: "H",
      final: "(|0⟩ + |1⟩) / √2",
      explanation:
        "The Hadamard gate transforms |0⟩ into a superposition of |0⟩ and |1⟩. When measured, both outcomes have approximately equal probability.",
    },

    X: {
      initial: "|0⟩",
      operation: "X",
      final: "|1⟩",
      explanation:
        "The Pauli-X gate flips the qubit from |0⟩ to |1⟩. This is similar to a classical NOT operation.",
    },

    Z: {
      initial: "|0⟩",
      operation: "Z",
      final: "|0⟩",
      explanation:
        "The Pauli-Z gate changes the phase of the |1⟩ component. Starting from |0⟩, the measurement result remains |0⟩.",
    },

    CNOT: {
      initial: "|00⟩",
      operation: "CNOT",
      final: "|00⟩",
      explanation:
        "CNOT uses the first qubit as a control. Since the control starts in |0⟩, the target qubit is not flipped.",
    },
  };

  const currentState =
    quantumStates[selectedGate];

  const steps = [
    {
      number: 1,
      title: "Initial State",
      shortTitle: "Initialize",
      description:
        "The quantum system begins in its initial state. For these basic circuits, the qubit starts in |0⟩.",
      state: currentState.initial,
    },

    {
      number: 2,
      title: "Apply Gate",
      shortTitle: "Apply Gate",
      description:
        `The ${currentState.operation} gate is applied to the quantum state. This operation changes the state according to the rules of quantum mechanics.`,
      state: currentState.operation,
    },

    {
      number: 3,
      title: "Resulting State",
      shortTitle: "State",
      description:
        "After the gate has been applied, the quantum system is now in its resulting state.",
      state: currentState.final,
    },

    {
      number: 4,
      title: "Measure",
      shortTitle: "Measure",
      description:
        "Measurement converts the quantum state into a classical result. Running the circuit performs this measurement many times to observe the distribution.",
      state: "Measurement",
    },
  ];

  /*
   * ==================================================
   * RUN QUANTUM CIRCUIT
   * ==================================================
   */

  const runQuantumCircuit =
    async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `${API_BASE}/quantum/${selectedGate}`
        );

        if (!response.ok) {
          throw new Error(
            "Quantum simulation failed."
          );
        }

        const data =
          await response.json();

        console.log(
          "Quantum API response:",
          data
        );

        setResult(data);
        setCurrentStep(4);

        /*
         * ==============================================
         * LOAD CURRENT LEARNING PROGRESS
         * ==============================================
         */

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
         * DETERMINE WHETHER THIS IS A NEW GATE
         * ==============================================
         */

        const gatesExplored =
          Array.from(
            new Set([
              ...(progress.gatesExplored ||
                []),
              selectedGate,
            ])
          );

        const isNewGate =
          !(
            progress.gatesExplored ||
            []
          ).includes(selectedGate);

        /*
         * ==============================================
         * XP
         *
         * Every successful simulation:
         *
         * +10 XP
         *
         * First exploration of a gate:
         *
         * +20 XP
         *
         * ==============================================
         */

        const simulationXP = 10;

        const newGateXP = isNewGate
          ? 20
          : 0;

        const earnedXP =
          simulationXP +
          newGateXP;

        const updatedXP =
          (progress.xp || 0) +
          earnedXP;

        /*
         * ==============================================
         * UPDATE PROGRESS
         * ==============================================
         */

        const updatedProgress: LearningProgress =
          {
            ...progress,

            labUsed: true,

            gatesExplored,

            simulationsRun:
              (progress.simulationsRun ||
                0) + 1,

            lastGate:
              selectedGate,

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
         * SAVE QUANTUM LAB CONTEXT
         *
         * The AI Tutor can use this later.
         * ==============================================
         */

        localStorage.setItem(
          "quantumLabContext",
          JSON.stringify({
            gate: selectedGate,

            qubits:
              selectedGate === "CNOT"
                ? 2
                : 1,

            initialState:
              currentState.initial,

            finalState:
              currentState.final,

            operation:
              currentState.operation,

            description:
              gateDescriptions[
                selectedGate
              ].description,

            explanation:
              currentState.explanation,

            measurementCounts:
              data.counts,

            shots:
              data.shots,
          })
        );

        console.log(
          `Quantum Lab XP earned: ${earnedXP}`
        );

        console.log(
          `Total XP: ${updatedXP}`
        );
      } catch (error) {
        console.error(
          "Error running quantum circuit:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  /*
   * ==================================================
   * SELECT GATE
   * ==================================================
   */

  const selectGate = (
    gate: string
  ) => {
    setSelectedGate(gate);
    setResult(null);
    setCurrentStep(1);
  };

  /*
   * ==================================================
   * STEP CONTROLS
   * ==================================================
   */

  const restartSteps = () => {
    setCurrentStep(1);
    setResult(null);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(
        currentStep - 1
      );
    }
  };

  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(
        currentStep + 1
      );
    }
  };

  /*
   * ==================================================
   * MEASUREMENT EXPLANATION
   * ==================================================
   */

  const getMeasurementExplanation =
    () => {
      if (!result) {
        return "";
      }

      const entries =
        Object.entries(
          result.counts
        );

      if (entries.length === 0) {
        return "No measurement results were returned.";
      }

      const totalShots =
        result.shots;

      const dominant =
        entries.reduce(
          (
            previous,
            current
          ) =>
            current[1] >
            previous[1]
              ? current
              : previous
        );

      const dominantState =
        dominant[0];

      const dominantCount =
        dominant[1];

      const percentage =
        Math.round(
          (dominantCount /
            totalShots) *
            100
        );

      if (selectedGate === "H") {
        return `The Hadamard gate creates a superposition. The simulator measured the possible states across ${totalShots} shots. The most frequent result was |${dominantState}⟩ with approximately ${percentage}% of the measurements.`;
      }

      if (selectedGate === "X") {
        return `The X gate flips |0⟩ to |1⟩. The simulator produced |${dominantState}⟩ in ${percentage}% of the measurements.`;
      }

      if (selectedGate === "Z") {
        return `The Z gate changes quantum phase. Starting from |0⟩, that phase change does not alter the measurement probability, so the simulator primarily produces |${dominantState}⟩.`;
      }

      if (selectedGate === "CNOT") {
        return `The CNOT gate uses the first qubit as a control. Since the circuit starts in |00⟩, the control qubit is 0 and the target is not flipped. The dominant measurement was |${dominantState}⟩ with approximately ${percentage}% of the shots.`;
      }

      return `The simulator measured |${dominantState}⟩ most frequently, appearing in approximately ${percentage}% of the ${totalShots} shots.`;
    };

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white lg:px-10">

      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="mb-10">

          <div className="flex items-center justify-between">

            <Link
              href="/learn"
              className="text-sm text-slate-400 transition hover:text-cyan-300"
            >
              ← Learning Hub
            </Link>

            <div className="text-xl font-bold tracking-tight">
              Quantum
              <span className="text-cyan-400">
                Learn
              </span>
            </div>

            <Link
              href="/tutor"
              className="text-sm text-slate-400 transition hover:text-purple-300"
            >
              AI Tutor →
            </Link>

          </div>


          <div className="mt-8">

            <div className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Interactive Quantum Laboratory
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              Quantum Lab
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Build, simulate, and understand
              quantum circuits interactively.
            </p>

          </div>

        </header>


        {/* ==================================================
            MAIN DASHBOARD
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ==================================================
              CONTROL PANEL
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl lg:col-span-1">

            <div className="mb-6">

              <h2 className="text-lg font-semibold">
                Select Gate
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose a quantum gate to simulate
              </p>

            </div>


            {/* Gate Buttons */}

            <div className="grid grid-cols-4 gap-3">

              {[
                "H",
                "X",
                "Z",
                "CNOT",
              ].map(
                (gate) => (

                  <button
                    key={gate}
                    onClick={() =>
                      selectGate(gate)
                    }
                    className={`rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                      selectedGate === gate
                        ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/10"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    {gate}
                  </button>

                )
              )}

            </div>


            {/* Selected Gate */}

            <div className="mt-6 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                Selected Gate
              </p>

              <p className="mt-2 text-2xl font-bold text-cyan-300">
                {selectedGate}
              </p>

            </div>


            {/* Gate Description */}

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                What it does
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {
                  gateDescriptions[
                    selectedGate
                  ].description
                }
              </p>

            </div>


            {/* Run Button */}

            <button
              onClick={
                runQuantumCircuit
              }
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:bg-cyan-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  Running Simulation...
                </>
              ) : (
                "Run Quantum Circuit →"
              )}

            </button>

          </section>


          {/* ==================================================
              QUANTUM CIRCUIT
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl lg:col-span-2">

            <div className="mb-5">

              <h2 className="text-lg font-semibold">
                Quantum Circuit
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Visual representation of the selected quantum gate
              </p>

            </div>


            <div className="rounded-xl border border-white/5 bg-[#030712] p-4">

              <QuantumCircuit
                gate={selectedGate}
              />

            </div>


            {/* Gate Explanation */}

            <div className="mt-5 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  ✦
                </div>

                <div>

                  <p className="text-sm font-semibold text-cyan-300">
                    {
                      gateDescriptions[
                        selectedGate
                      ].name
                    }
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {
                      gateDescriptions[
                        selectedGate
                      ].description
                    }
                  </p>

                </div>

              </div>

            </div>

          </section>

        </div>


        {/* ==================================================
            QUANTUM STATE VISUALIZATION
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-6 shadow-xl">

          <div className="mb-6">

            <h2 className="text-lg font-semibold">
              Quantum State Transformation
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              See how the selected gate transforms the quantum state.
            </p>

          </div>


          <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">

            {/* Initial State */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                Initial State
              </p>

              <p className="mt-5 font-mono text-3xl font-bold text-white">
                {currentState.initial}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Before applying the gate
              </p>

            </div>


            {/* Arrow */}

            <div className="hidden text-2xl text-cyan-400 md:block">
              →
            </div>


            {/* Gate */}

            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.06] p-6 text-center shadow-lg shadow-cyan-500/5">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                Gate Applied
              </p>

              <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">

                <span className="font-mono text-2xl font-bold text-cyan-300">
                  {currentState.operation}
                </span>

              </div>

              <p className="mt-3 text-xs text-slate-500">
                Quantum operation
              </p>

            </div>


            {/* Arrow */}

            <div className="hidden text-2xl text-cyan-400 md:block">
              →
            </div>


            {/* Final State */}

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6 text-center">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                Resulting State
              </p>

              <p className="mt-5 font-mono text-2xl font-bold text-cyan-300">
                {currentState.final}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                After applying the gate
              </p>

            </div>

          </div>


          {/* State Explanation */}

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                ?
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-200">
                  What happened?
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {currentState.explanation}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            STEP-BY-STEP EXECUTION
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl">

          <div className="mb-8">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-lg font-semibold">
                  Step-by-Step Execution
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Follow how the quantum circuit executes from start to measurement.
                </p>

              </div>


              <button
                onClick={
                  restartSteps
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
              >
                ↻ Restart Steps
              </button>

            </div>

          </div>


          {/* Progress Line */}

          <div className="mb-10">

            <div className="flex items-center justify-between">

              {steps.map(
                (step, index) => (

                  <div
                    key={step.number}
                    className="flex flex-1 items-center"
                  >

                    <div className="flex flex-col items-center">

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold transition ${
                          currentStep >=
                          step.number
                            ? "border-cyan-400 bg-cyan-400 text-slate-950"
                            : "border-white/10 bg-white/[0.03] text-slate-500"
                        }`}
                      >
                        {currentStep >
                        step.number
                          ? "✓"
                          : step.number}
                      </div>

                      <span
                        className={`mt-3 hidden text-xs sm:block ${
                          currentStep >=
                          step.number
                            ? "text-cyan-300"
                            : "text-slate-500"
                        }`}
                      >
                        {
                          step.shortTitle
                        }
                      </span>

                    </div>


                    {index <
                      steps.length -
                        1 && (

                      <div
                        className={`mx-2 h-[2px] flex-1 transition ${
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

          </div>


          {/* Current Step */}

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-6">

            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">

                <span className="font-mono text-xl font-bold text-cyan-300">
                  {
                    steps[
                      currentStep - 1
                    ].state
                  }
                </span>

              </div>


              <div>

                <p className="text-xs uppercase tracking-wider text-cyan-400">
                  Step {currentStep} of{" "}
                  {steps.length}
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  {
                    steps[
                      currentStep - 1
                    ].title
                  }
                </h3>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  {
                    steps[
                      currentStep - 1
                    ].description
                  }
                </p>

              </div>

            </div>

          </div>


          {/* Navigation */}

          <div className="mt-6 flex items-center justify-between">

            <button
              onClick={
                goToPreviousStep
              }
              disabled={
                currentStep === 1
              }
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous
            </button>


            {currentStep <
            steps.length ? (

              <button
                onClick={
                  goToNextStep
                }
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Next Step →
              </button>

            ) : (

              <button
                onClick={
                  runQuantumCircuit
                }
                disabled={loading}
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Running..."
                  : "Run Simulation →"}
              </button>

            )}

          </div>

        </section>


        {/* ==================================================
            LEARNING FLOW
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl">

          <div className="mb-6">

            <h2 className="text-lg font-semibold">
              How the Quantum Lab Works
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Follow these three steps to experiment and understand the result.
            </p>

          </div>


          <div className="grid gap-4 md:grid-cols-3">

            {/* Step 1 */}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-bold text-cyan-300">
                1
              </div>

              <h3 className="mt-4 font-semibold">
                Choose a Gate
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Select H, X, Z, or CNOT to see how different quantum gates affect a quantum state.
              </p>

            </div>


            {/* Step 2 */}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-bold text-cyan-300">
                2
              </div>

              <h3 className="mt-4 font-semibold">
                Run the Circuit
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Execute the selected circuit using the quantum simulator and perform measurements.
              </p>

            </div>


            {/* Step 3 */}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-bold text-cyan-300">
                3
              </div>

              <h3 className="mt-4 font-semibold">
                Understand the Result
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Explore measurement counts and the distribution chart to understand what happened.
              </p>

            </div>

          </div>

        </section>


        {/* ==================================================
            SIMULATION RESULTS
        ================================================== */}

        {result && (

          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl">

            <div>

              <h2 className="text-lg font-semibold">
                Simulation Result
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Measurement results from the quantum simulator
              </p>

            </div>


            {/* Result Summary */}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Gate
                </p>

                <p className="mt-2 text-2xl font-bold text-cyan-300">
                  {selectedGate}
                </p>

              </div>


              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Shots
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {result.shots}
                </p>

              </div>


              <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  XP Earned
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  +10
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  +20 bonus if this was a new gate
                </p>

              </div>

            </div>


            {/* Measurement Results */}

            <div className="mt-8">

              <p className="text-sm font-medium text-slate-300">
                Measurement Results
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Number of times each quantum state was measured
              </p>


              <div className="mt-4 space-y-2">

                {Object.entries(
                  result.counts
                ).map(
                  ([state, count]) => (

                    <div
                      key={state}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >

                      <span className="font-mono text-cyan-300">
                        |{state}⟩
                      </span>

                      <span className="font-semibold">
                        {count}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* Measurement Explanation */}

            <div className="mt-8 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  ✦
                </div>

                <div>

                  <p className="text-sm font-semibold text-cyan-300">
                    What does this result mean?
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    {getMeasurementExplanation()}
                  </p>

                </div>

              </div>

            </div>


            {/* Chart */}

            <div className="mt-8">

              <p className="mb-4 text-sm font-medium text-slate-300">
                Measurement Distribution
              </p>

              <div className="h-72 w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={Object.entries(
                      result.counts
                    ).map(
                      ([state, count]) => ({
                        state,
                        count,
                      })
                    )}
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


            {/* Ask AI Tutor */}

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-purple-400/20 bg-purple-400/[0.04] p-6 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="font-semibold text-purple-300">
                  Want to understand this result better?
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Ask the AI Tutor to explain this gate and the measurement result using your current Quantum Lab experiment.
                </p>

              </div>


              <Link
                href="/tutor"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-purple-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-purple-300"
              >
                Ask AI Tutor →
              </Link>

            </div>

          </section>

        )}


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="py-10 text-center text-sm text-slate-600">

          Quantum
          <span className="text-cyan-500">
            Learn
          </span>

          {" "}• Interactive Quantum Education

        </footer>

      </div>

    </main>
  );
}



