"use client";

import { useState } from "react";
import Link from "next/link";

type GateName =
  | "H"
  | "X"
  | "Y"
  | "Z"
  | "S"
  | "T"
  | "CNOT"
  | "SWAP"
  | "RX"
  | "RY"
  | "RZ"
  | "MEASURE";

type GateOperation = {
  gate: GateName;
  qubit?: number;
  control?: number;
  target?: number;
  qubit1?: number;
  qubit2?: number;
  angle?: number;
};

type CircuitColumn = {
  id: number;
  operations: GateOperation[];
};

type SimulationResult = {
  success: boolean;
  qubits: number;
  shots: number;
  counts: {
    [key: string]: number;
  };
};


type ExplanationResult = {
  success: boolean;
  qubits: number;
  operations: GateOperation[];
  explanation: string;
};

type FixResult = {
  success: boolean;
  qubits: number;
  operations: GateOperation[];
  simulation_error: string | null;
  explanation: string;
};
const QUBIT_COUNT = 3;

const SINGLE_QUBIT_GATES: GateName[] = [
  "H",
  "X",
  "Y",
  "Z",
  "S",
  "T",
  "RX",
  "RY",
  "RZ",
  "MEASURE",
];

const CONTROLLED_GATES: GateName[] = [
  "CNOT",
  "SWAP",
];


export default function QuantumLabPage() {

  const [selectedGate, setSelectedGate] =
    useState<GateName>("H");

  const [selectedQubit, setSelectedQubit] =
    useState(0);

  const [secondQubit, setSecondQubit] =
    useState(1);

  const [angle, setAngle] =
    useState(Math.PI / 2);

  const [circuit, setCircuit] =
    useState<CircuitColumn[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<SimulationResult | null>(null);

  const [error, setError] =
    useState("");

  const [explaining, setExplaining] =
    useState(false);

  const [explanation, setExplanation] =
    useState<ExplanationResult | null>(null);

  const [fixing, setFixing] =
    useState(false);

  const [fixResult, setFixResult] =
    useState<FixResult | null>(null);


  // ==================================================
  // Add Operation
  // ==================================================

  const addOperation = () => {

    setError("");
    setResult(null);
    setExplanation(null);
    setFixResult(null);

    let operation: GateOperation;


    // ------------------------------------------------
    // CNOT
    // ------------------------------------------------

    if (selectedGate === "CNOT") {

      if (selectedQubit === secondQubit) {

        setError(
          "CNOT control and target qubits must be different."
        );

        return;
      }

      operation = {
        gate: "CNOT",
        control: selectedQubit,
        target: secondQubit,
      };
    }


    // ------------------------------------------------
    // SWAP
    // ------------------------------------------------

    else if (selectedGate === "SWAP") {

      if (selectedQubit === secondQubit) {

        setError(
          "SWAP qubits must be different."
        );

        return;
      }

      operation = {
        gate: "SWAP",
        qubit1: selectedQubit,
        qubit2: secondQubit,
      };
    }


    // ------------------------------------------------
    // Rotation Gates
    // ------------------------------------------------

    else if (
      selectedGate === "RX" ||
      selectedGate === "RY" ||
      selectedGate === "RZ"
    ) {

      operation = {
        gate: selectedGate,
        qubit: selectedQubit,
        angle,
      };
    }


    // ------------------------------------------------
    // Single-Qubit Gates
    // ------------------------------------------------

    else {

      operation = {
        gate: selectedGate,
        qubit: selectedQubit,
      };
    }


    const newColumn: CircuitColumn = {
      id: Date.now(),
      operations: [operation],
    };


    setCircuit((current) => [
      ...current,
      newColumn,
    ]);
  };


  // ==================================================
  // Remove Column
  // ==================================================

  const removeColumn = (columnId: number) => {

    setCircuit((current) =>
      current.filter(
        (column) => column.id !== columnId
      )
    );

    setResult(null);
    setExplanation(null);
    setFixResult(null);
    setError("");
    setExplanation(null);
    setFixResult(null);
  };


  // ==================================================
  // Clear Circuit
  // ==================================================

  const clearCircuit = () => {

    setCircuit([]);
    setResult(null);
    setExplanation(null);
    setFixResult(null);
    setError("");
  };


  // ==================================================
  // Build API Operations
  // ==================================================

  const buildOperations = (): GateOperation[] => {

    return circuit.flatMap(
      (column) => column.operations
    );
  };

  const operations = buildOperations();


  // ==================================================
  // Run Circuit
  // ==================================================

  const fixCircuit = async () => {
    if (operations.length === 0) {
      return;
    }

    setFixing(true);
    setFixResult(null);

    try {
      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/circuit/fix",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            qubits: QUBIT_COUNT,
            operations,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to analyze the circuit."
        );
      }

      setFixResult(data);
    } catch (error) {
      console.error("Circuit fix failed:", error);

      setFixResult({
        success: false,
        qubits: QUBIT_COUNT,
        operations,
        simulation_error:
          error instanceof Error
            ? error.message
            : "Unknown error",
        explanation:
          "I could not analyze this circuit right now. Please try again.",
      });
    } finally {
      setFixing(false);
    }
  };

  const runCircuit = async () => {

    if (circuit.length === 0) {

      setError(
        "Add at least one gate before running the circuit."
      );

      return;
    }


    setLoading(true);
    setError("");
    setResult(null);


    try {

      const operations =
        buildOperations();


      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/circuit/simulate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            qubits: QUBIT_COUNT,
            operations,
            shots: 1000,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
            "Circuit simulation failed."
        );
      }


      setResult(data);

    } catch (simulationError) {

      setError(
        simulationError instanceof Error
          ? simulationError.message
          : "Unable to run the circuit."
      );

    } finally {

      setLoading(false);
    }
  };


  const buildLocalCircuitExplanation = (
    operations: GateOperation[]
  ): ExplanationResult => {
    const gateDescriptions: Record<string, string> = {
      H: "The Hadamard gate creates superposition, so a qubit can have amplitudes for both |0⟩ and |1⟩.",
      X: "The X gate is the quantum NOT gate. It swaps the |0⟩ and |1⟩ states.",
      Y: "The Y gate rotates the qubit around the Y axis of the Bloch sphere.",
      Z: "The Z gate changes the phase of the |1⟩ component without changing measurement probabilities by itself.",
      S: "The S gate applies a 90-degree phase rotation to the |1⟩ component.",
      T: "The T gate applies a 45-degree phase rotation to the |1⟩ component.",
      CNOT: "The CNOT gate flips the target qubit only when the control qubit is |1⟩. When the control is in superposition, CNOT can create entanglement.",
      SWAP: "The SWAP gate exchanges the quantum states of two qubits.",
      RX: "RX rotates a qubit around the X axis by the selected angle.",
      RY: "RY rotates a qubit around the Y axis by the selected angle.",
      RZ: "RZ rotates a qubit around the Z axis, changing the relative phase.",
      MEASURE: "Measurement converts the quantum state into a classical result according to the state's probabilities.",
    };

    const lines = operations.map((operation, index) => {
      const gate = operation.gate;
      let target = "";

      if (gate === "CNOT") {
        target = ` (control q${operation.control ?? 0} → target q${operation.target ?? 1})`;
      } else if (gate === "SWAP") {
        target = ` (q${operation.qubit1 ?? 0} ↔ q${operation.qubit2 ?? 1})`;
      } else if (operation.qubit !== undefined) {
        target = ` on q${operation.qubit}`;
      }

      return `${index + 1}. ${gate}${target}: ${gateDescriptions[gate] || "This gate changes the quantum state according to its unitary operation."}`;
    });

    const hasCnot = operations.some((operation) => operation.gate === "CNOT");
    const hasMeasurement = operations.some((operation) => operation.gate === "MEASURE");

    return {
      success: true,
      qubits: QUBIT_COUNT,
      operations,
      explanation: [
        "Gemini is temporarily unavailable, so QuantumLearn is using its built-in circuit explanation mode.",
        "",
        `This circuit contains ${operations.length} operation${operations.length === 1 ? "" : "s"} across ${QUBIT_COUNT} qubits.`,
        hasCnot
          ? "The circuit contains a controlled operation, so correlations or entanglement may be created depending on the input state."
          : "The circuit currently uses single-qubit operations, so each listed gate acts on its specified qubit.",
        hasMeasurement
          ? "The circuit includes measurement, which converts the final quantum state into classical measurement results."
          : "No measurement gate was explicitly added; the simulator can still measure the final state when running the circuit.",
        "",
        "Step-by-step gate explanation:",
        ...lines,
      ].join("\n"),
    };
  };


  // ==================================================

  // ==================================================
  // Explain My Circuit
  // ==================================================

  const explainCircuit = async () => {

    if (circuit.length === 0) {

      setError(
        "Add at least one gate before requesting an explanation."
      );

      return;
    }


    setExplaining(true);
    setError("");
    setExplanation(null);
    setFixResult(null);


    try {

      const operations =
        buildOperations();


      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/circuit/explain",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            qubits: QUBIT_COUNT,
            operations,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
            "Circuit explanation failed."
        );
      }


      const returnedExplanation =
        typeof data.explanation === "string"
          ? data.explanation
          : "";

      const returnedQuotaMessage =
        returnedExplanation.toLowerCase().includes("gemini") &&
        (returnedExplanation.toLowerCase().includes("quota") ||
          returnedExplanation.toLowerCase().includes("free-tier") ||
          returnedExplanation.toLowerCase().includes("rate limit") ||
          returnedExplanation.toLowerCase().includes("temporarily"));

      if (returnedQuotaMessage) {
        setExplanation(
          buildLocalCircuitExplanation(
            operations
          )
        );
        setError(
          "Gemini is temporarily unavailable. The built-in circuit tutor is explaining this circuit instead."
        );
      } else {
        setExplanation(data);
      }

    } catch (explanationError) {

      const errorMessage =
        explanationError instanceof Error
          ? explanationError.message
          : "Unable to explain the circuit.";

      const quotaError =
        errorMessage.toLowerCase().includes("quota") ||
        errorMessage.toLowerCase().includes("rate limit") ||
        errorMessage.toLowerCase().includes("resource_exhausted") ||
        errorMessage.toLowerCase().includes("429") ||
        errorMessage.toLowerCase().includes("gemini");

      if (quotaError) {
        setExplanation(
          buildLocalCircuitExplanation(
            buildOperations()
          )
        );
        setError(
          "Gemini is temporarily unavailable. The built-in circuit tutor is explaining this circuit instead."
        );
      } else {
        setError(errorMessage);
      }

    } finally {

      setExplaining(false);
    }
  };

  // Render Gate
  // ==================================================

  const renderGate = (
    column: CircuitColumn,
    qubit: number
  ) => {

    const operation =
      column.operations.find(
        (item) =>
          item.qubit === qubit ||
          item.control === qubit ||
          item.target === qubit ||
          item.qubit1 === qubit ||
          item.qubit2 === qubit
      );


    if (!operation) {

      return (
        <div className="flex h-14 w-20 items-center justify-center">
          <div className="h-px w-12 bg-white/10" />
        </div>
      );
    }


    // ------------------------------------------------
    // CNOT
    // ------------------------------------------------

    if (operation.gate === "CNOT") {

      if (operation.control === qubit) {

        return (
          <div className="relative flex h-14 w-20 items-center justify-center">

            <div className="absolute h-14 w-px bg-cyan-400/50" />

            <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-400/10">

              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

            </div>

          </div>
        );
      }


      if (operation.target === qubit) {

        return (
          <div className="relative flex h-14 w-20 items-center justify-center">

            <div className="absolute h-14 w-px bg-cyan-400/50" />

            <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-cyan-400 bg-slate-950 text-xl font-bold text-cyan-300">
              +
            </div>

          </div>
        );
      }
    }


    // ------------------------------------------------
    // SWAP
    // ------------------------------------------------

    if (operation.gate === "SWAP") {

      if (
        operation.qubit1 === qubit ||
        operation.qubit2 === qubit
      ) {

        return (
          <div className="relative flex h-14 w-20 items-center justify-center">

            <div className="absolute h-14 w-px bg-purple-400/50" />

            <div className="relative z-10 text-xl font-bold text-purple-300">
              ×
            </div>

          </div>
        );
      }
    }


    // ------------------------------------------------
    // Normal Gate
    // ------------------------------------------------

    return (
      <div className="flex h-14 w-20 items-center justify-center">

        <div className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-2 font-bold text-cyan-300 shadow-lg shadow-cyan-500/10">

          {operation.gate}

        </div>

      </div>
    );
  };


  // ==================================================
  // Probability
  // ==================================================

  const getProbability = (
    count: number
  ) => {

    if (!result) {
      return 0;
    }

    return (
      (count / result.shots) *
      100
    );
  };


  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white lg:px-10">

      <div className="mx-auto max-w-7xl">


        {/* ==================================================
            Header
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
              href="/dashboard"
              className="text-sm text-slate-400 transition hover:text-cyan-300"
            >
              Quantum Lab
            </Link>

          </div>


          <div className="mt-8">

            <h1 className="text-4xl font-bold tracking-tight">
              Circuit Builder
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Build quantum circuits visually,
              simulate them with Qiskit, and
              explore the resulting measurement
              probabilities.
            </p>

          </div>

        </header>


        {/* ==================================================
            Main Builder
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">


          {/* ==================================================
              Toolbox
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl">

            <h2 className="text-lg font-semibold">
              Gate Toolbox
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a gate to add it to your circuit.
            </p>


            {/* Single-Qubit Gates */}

            <div className="mt-6">

              <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">
                Single Qubit
              </p>

              <div className="grid grid-cols-2 gap-2">

                {SINGLE_QUBIT_GATES.map(
                  (gate) => (

                    <button
                      key={gate}
                      onClick={() =>
                        setSelectedGate(gate)
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
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

            </div>


            {/* Multi-Qubit Gates */}

            <div className="mt-6">

              <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">
                Multi Qubit
              </p>

              <div className="grid grid-cols-2 gap-2">

                {CONTROLLED_GATES.map(
                  (gate) => (

                    <button
                      key={gate}
                      onClick={() =>
                        setSelectedGate(gate)
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        selectedGate === gate
                          ? "border-purple-400/50 bg-purple-400/10 text-purple-300 shadow-lg shadow-purple-500/10"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      {gate}
                    </button>

                  )
                )}

              </div>

            </div>


            {/* Qubit */}

            <div className="mt-7">

              <label className="text-xs uppercase tracking-wider text-slate-500">
                Qubit
              </label>

              <select
                value={selectedQubit}
                onChange={(event) =>
                  setSelectedQubit(
                    Number(event.target.value)
                  )
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              >

                {Array.from(
                  { length: QUBIT_COUNT },
                  (_, index) => (

                    <option
                      key={index}
                      value={index}
                    >
                      Qubit {index}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* Second Qubit */}

            {(selectedGate === "CNOT" ||
              selectedGate === "SWAP") && (

              <div className="mt-4">

                <label className="text-xs uppercase tracking-wider text-slate-500">

                  {selectedGate === "CNOT"
                    ? "Target Qubit"
                    : "Second Qubit"}

                </label>

                <select
                  value={secondQubit}
                  onChange={(event) =>
                    setSecondQubit(
                      Number(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                >

                  {Array.from(
                    { length: QUBIT_COUNT },
                    (_, index) => (

                      <option
                        key={index}
                        value={index}
                      >
                        Qubit {index}
                      </option>

                    )
                  )}

                </select>

              </div>

            )}


            {/* Rotation Angle */}

            {(selectedGate === "RX" ||
              selectedGate === "RY" ||
              selectedGate === "RZ") && (

              <div className="mt-4">

                <label className="text-xs uppercase tracking-wider text-slate-500">
                  Angle (Radians)
                </label>

                <input
                  type="number"
                  step="0.1"
                  value={angle}
                  onChange={(event) =>
                    setAngle(
                      Number(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Current: {angle.toFixed(2)} rad
                </p>

              </div>

            )}


            {/* Add */}

            <button
              onClick={addOperation}
              className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              + Add Gate
            </button>


            {/* Clear */}

            <button
              onClick={clearCircuit}
              disabled={circuit.length === 0}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear Circuit
            </button>

          </section>


          {/* ==================================================
              Circuit Area
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-semibold">
                  Quantum Circuit
                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {circuit.length === 0
                    ? "Your circuit is empty."
                    : `${circuit.length} circuit step${
                        circuit.length === 1
                          ? ""
                          : "s"
                      }`}

                </p>

              </div>


              <div className="flex flex-col gap-2 sm:flex-row">

                <button
                  onClick={runCircuit}
                  disabled={
                    loading ||
                    explaining ||
                    circuit.length === 0
                  }
                  className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {loading
                    ? "Running..."
                    : "Run Circuit →"}

                </button>


                <button
            onClick={fixCircuit}
            disabled={fixing || operations.length === 0}
            className="rounded-xl border border-orange-400/40 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fixing ? "🔧 Fixing..." : "🔧 Fix My Circuit"}
          </button>

          <button
                  onClick={explainCircuit}
                  disabled={
                    loading ||
                    explaining ||
                    circuit.length === 0
                  }
                  className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-6 py-3 font-semibold text-purple-300 transition hover:bg-purple-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {explaining
                    ? "Explaining..."
                    : "🧠 Explain My Circuit"}

                </button>

              </div>

            </div>


            {/* Circuit Canvas */}

            <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-[#030611] p-6">

              <div
                className="min-w-max"
                style={{
                  minWidth: `${Math.max(
                    520,
                    150 +
                      circuit.length * 90
                  )}px`,
                }}
              >

                {Array.from(
                  {
                    length: QUBIT_COUNT,
                  },
                  (_, qubit) => (

                    <div
                      key={qubit}
                      className="flex items-center"
                    >

                      <div className="w-16 shrink-0 text-sm font-semibold text-slate-400">
                        q{qubit}
                      </div>


                      <div className="flex flex-1 items-center">

                        {circuit.length === 0 ? (

                          <div className="h-px w-full bg-white/10" />

                        ) : (

                          circuit.map(
                            (column) => (

                              <div
                                key={column.id}
                                className="relative flex items-center"
                              >

                                <div className="absolute left-0 right-0 h-px bg-white/10" />

                                {renderGate(
                                  column,
                                  qubit
                                )}

                              </div>

                            )
                          )

                        )}

                      </div>

                    </div>

                  )
                )}


                {/* Remove Buttons */}

                {circuit.length > 0 && (

                  <div className="mt-2 flex pl-16">

                    {circuit.map(
                      (column) => (

                        <div
                          key={column.id}
                          className="flex w-20 justify-center"
                        >

                          <button
                            onClick={() =>
                              removeColumn(
                                column.id
                              )
                            }
                            className="text-xs text-slate-600 transition hover:text-red-400"
                          >
                            Remove
                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>


            {/* Summary */}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Qubits
                </p>

                <p className="mt-2 text-2xl font-bold text-cyan-300">
                  {QUBIT_COUNT}
                </p>

              </div>


              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Circuit Depth
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {circuit.length}
                </p>

              </div>


              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Status
                </p>

                <p className="mt-2 text-2xl font-bold">

                  {loading
                    ? "Running"
                    : result
                    ? "Complete"
                    : circuit.length > 0
                    ? "Ready"
                    : "Empty"}

                </p>

              </div>

            </div>


            {/* Error */}

            {error && (

              <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {error}
              </div>

            )}


            {/* ==================================================
                Results
            ================================================== */}

            {result && (

              <div className="mt-8">

                <h2 className="text-lg font-semibold">
                  Simulation Results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Results generated by the Qiskit
                  quantum simulator.
                </p>


                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Shots
                    </p>

                    <p className="mt-2 text-2xl font-bold text-cyan-300">
                      {result.shots}
                    </p>

                  </div>


                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      States Observed
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {
                        Object.keys(
                          result.counts
                        ).length
                      }
                    </p>

                  </div>

                </div>


                {/* Distribution */}

                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">

                  <h3 className="font-semibold">
                    Measurement Distribution
                  </h3>


                  <div className="mt-5 space-y-4">

                    {Object.entries(
                      result.counts
                    ).map(
                      ([state, count]) => {

                        const probability =
                          getProbability(
                            count
                          );

                        return (

                          <div
                            key={state}
                          >

                            <div className="mb-2 flex items-center justify-between text-sm">

                              <span className="font-mono text-cyan-300">
                                |{state}⟩
                              </span>

                              <span className="text-slate-400">
                                {count} shots ·{" "}
                                {probability.toFixed(
                                  1
                                )}
                                %
                              </span>

                            </div>


                            <div className="h-3 overflow-hidden rounded-full bg-white/5">

                              <div
                                className="h-full rounded-full bg-cyan-400 transition-all"
                                style={{
                                  width: `${Math.max(
                                    probability,
                                    1
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                </div>

              </div>

            )}

          </section>

        </div>


        {/* ==================================================
            AI Circuit Explanation
        ================================================== */}

        {fixResult && (
        <div className="mt-6 rounded-2xl border border-orange-400/30 bg-orange-500/5 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-orange-200">
                🔧 AI Circuit Analysis
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                The AI checked your circuit for problems and suggested improvements.
              </p>
            </div>

            <button
              onClick={fixCircuit}
              disabled={fixing || operations.length === 0}
              className="rounded-lg border border-orange-400/30 px-3 py-2 text-xs font-semibold text-orange-200 transition hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {fixing ? "Checking..." : "Check Again"}
            </button>
          </div>

          {fixResult.simulation_error && (
            <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/5 p-4">
              <p className="mb-1 text-sm font-semibold text-red-300">
                Simulation Error
              </p>
              <p className="text-sm text-slate-300">
                {fixResult.simulation_error}
              </p>
            </div>
          )}

          <div className="whitespace-pre-wrap rounded-xl bg-slate-950/60 p-5 text-sm leading-7 text-slate-200">
            {fixResult.explanation}
          </div>
        </div>
      )}

      {explanation && (

          <section className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-400/[0.04] p-6 shadow-xl">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-400/10 text-lg">
                    🧠
                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-purple-200">
                      AI Circuit Explanation
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your quantum tutor explains the current circuit step by step.
                    </p>

                  </div>

                </div>

              </div>


              <button
                onClick={explainCircuit}
                disabled={
                  explaining ||
                  circuit.length === 0
                }
                className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-5 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >

                {explaining
                  ? "Explaining..."
                  : "Explain Again"}

              </button>

            </div>


            <div className="mt-6 rounded-xl border border-white/10 bg-[#030611] p-5">

              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {explanation.explanation}
              </div>

            </div>

          </section>

        )}


        {/* ==================================================
            Gate Reference
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl">

          <h2 className="text-lg font-semibold">
            Available Gates
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {[
              ["H", "Hadamard", "Creates superposition."],
              ["X", "Pauli-X", "Quantum NOT operation."],
              ["Y", "Pauli-Y", "Rotates around the Y axis."],
              ["Z", "Pauli-Z", "Applies a phase flip."],
              ["S", "S Gate", "Quarter-turn phase gate."],
              ["T", "T Gate", "Eighth-turn phase gate."],
              ["CNOT", "Controlled-NOT", "Flips the target conditionally."],
              ["SWAP", "SWAP", "Exchanges two qubit states."],
              ["RX", "X Rotation", "Rotation around X axis."],
              ["RY", "Y Rotation", "Rotation around Y axis."],
              ["RZ", "Z Rotation", "Rotation around Z axis."],
              ["MEASURE", "Measurement", "Measures a qubit."],
            ].map(
              ([gate, name, description]) => (

                <div
                  key={gate}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/5 px-2 font-mono text-sm font-bold text-cyan-300">
                      {gate}
                    </div>

                    <p className="font-semibold">
                      {name}
                    </p>

                  </div>

                  <p className="mt-3 text-sm leading-5 text-slate-500">
                    {description}
                  </p>

                </div>

              )
            )}

          </div>

        </section>


        {/* ==================================================
            How It Works
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl">

          <h2 className="text-lg font-semibold">
            How this works
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 font-bold text-cyan-300">
                1
              </div>

              <h3 className="mt-4 font-semibold">
                Build
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Select gates, qubits, and
                rotation angles to construct
                your circuit.
              </p>

            </div>


            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 font-bold text-cyan-300">
                2
              </div>

              <h3 className="mt-4 font-semibold">
                Simulate
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                The circuit is converted into
                JSON and sent to FastAPI and
                Qiskit.
              </p>

            </div>


            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 font-bold text-cyan-300">
                3
              </div>

              <h3 className="mt-4 font-semibold">
                Understand
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Explore the measurement
                distribution and see how each
                circuit produces its result.
              </p>

            </div>

          </div>

        </section>


        {/* ==================================================
            Navigation
        ================================================== */}

        <div className="mt-8 flex flex-wrap gap-4">

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300 transition hover:bg-white/[0.06]"
          >
            ← Basic Quantum Lab
          </Link>

          <Link
            href="/tutor"
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-3 text-sm text-cyan-300 transition hover:bg-cyan-400/10"
          >
            Ask AI Tutor →
          </Link>

        </div>

      </div>

    </main>
  );
}


