"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://quantumlearn-1.onrender.com";

function TutorMarkdown({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-slate-950/60 p-5 text-sm leading-7 text-slate-300">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3 className="mb-2 mt-6 border-b border-white/10 pb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-100 first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-2 mt-6 border-b border-white/10 pb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-100 first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 border-b border-white/10 pb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-100 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h3 className="mb-2 mt-6 border-b border-white/10 pb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-100 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-7 first:mt-0 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-2 pl-6 marker:text-slate-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-slate-400">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-7 pl-1">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-200">{children}</em>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

// ==================================================
// Real Quantum Machine Learning Lab state
// ==================================================
// Data is fetched from the backend QML API and reflects actual execution.

type QmlExperimentTab = "qml" | "hybrid" | "metrics" | "results";

type QmlData = {
  algorithm: string;
  accuracy: number;
  loss_history?: number[];
  final_parameters?: number[];
  parameter_history?: number[][];
  train_size?: number;
  test_size?: number;
  total_samples?: number;
  qubit_count: number;
  gate_count: number;
  circuit_depth: number;
  test_data: number[][];
  test_labels?: number[];
  predictions?: number[];
};

// QML data starts null and is populated from the backend /qml/run response.
const initialQmlData: QmlData | null = null;

// ==================================================
// Hybrid experiment pipeline & shared components
// ==================================================

type HybridStep = {
  phase: string;
  detail: string;
};

function getHybridSteps(qmlData: QmlData | null): HybridStep[] {
  return [
    {
      phase: "Classical Preprocessing",
      detail: "MinMaxScaler normalizes 2-dimensional feature coordinates to [0, π] for quantum rotation encoding.",
    },
    {
      phase: "Data Encoding",
      detail: `ZZFeatureMap encodes classical features into ${qmlData?.qubit_count ?? "—"} qubits using non-linear entanglement.`,
    },
    {
      phase: "Quantum Circuit",
      detail: `RealAmplitudes variational ansatz with parameterized rotation layers (${qmlData?.gate_count ?? "—"} gates, circuit depth ${qmlData?.circuit_depth ?? "—"}).`,
    },
    {
      phase: "Measurement",
      detail: "Statevector expectation values are sampled on the Aer simulator to obtain class probabilities.",
    },
    {
      phase: "Classical Optimization",
      detail: `COBYLA gradient-free optimizer executed over ${qmlData?.loss_history?.length ?? "—"} iterations minimizing classification loss.`,
    },
    {
      phase: "Final Prediction",
      detail: qmlData
        ? `Live model achieved ${(qmlData.accuracy * 100).toFixed(1)}% accuracy on unseen test samples.`
        : "Live model accuracy will appear here once the backend run completes.",
    },
  ];
}

function StatCard({
  label,
  value,
  accent = "text-cyan-300",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-400/10 text-lg">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-purple-400/50 bg-purple-400/10 text-purple-300"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      <span className="mr-1.5">{icon}</span>
      {label}
    </button>
  );
}

function HybridTrainingDemo({
  qmlData,
  onRerun,
  isLoading,
}: {
  qmlData: QmlData | null;
  onRerun: () => void;
  isLoading: boolean;
}) {
  const lossHistory = qmlData?.loss_history ?? [];
  const parameterHistory = qmlData?.parameter_history ?? [];
  const finalParameters = qmlData?.final_parameters ?? [];

  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);

  const trainingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalEpochs = lossHistory.length;
  const hasRunData = qmlData != null && totalEpochs > 0;
  const finished = hasRunData && epoch >= totalEpochs;

  const displayLoss = hasRunData
    ? lossHistory[Math.min(epoch, totalEpochs - 1)].toFixed(3)
    : null;

  const displayAccuracy = !qmlData
    ? null
    : finished
      ? `${(qmlData.accuracy * 100).toFixed(1)}%`
      : "50.0%";

  const activeParams = !hasRunData
    ? null
    : finished && finalParameters.length > 0
      ? finalParameters
      : (parameterHistory[Math.min(epoch, Math.max(parameterHistory.length - 1, 0))] ??
        (finalParameters.length > 0 ? finalParameters : null));

  const startTraining = () => {
    if (isTraining || !hasRunData) return;
    if (epoch >= totalEpochs) setEpoch(0);
    setIsTraining(true);
  };

  const stopTraining = () => {
    setIsTraining(false);
  };

  const resetTraining = () => {
    setIsTraining(false);
    setEpoch(0);
  };

  useEffect(() => {
    if (isTraining) {
      trainingIntervalRef.current = setInterval(() => {
        setEpoch((prevEpoch) => {
          const nextEpoch = prevEpoch + 1;

          if (nextEpoch >= totalEpochs) {
            if (trainingIntervalRef.current) {
              clearInterval(trainingIntervalRef.current);
              trainingIntervalRef.current = null;
            }
            setIsTraining(false);
            return totalEpochs;
          }

          return nextEpoch;
        });
      }, 150);
    } else {
      if (trainingIntervalRef.current) {
        clearInterval(trainingIntervalRef.current);
        trainingIntervalRef.current = null;
      }
    }

    return () => {
      if (trainingIntervalRef.current) {
        clearInterval(trainingIntervalRef.current);
      }
    };
  }, [isTraining, totalEpochs]);

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>🧠</span> Active Training Simulator
          </h3>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
            {qmlData ? `Aer Live ${qmlData.algorithm}` : "Awaiting Backend Data"}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Replays the actual COBYLA iterations returned by the backend VQC run. Loss values and variational angles &theta; come directly from the optimizer history; accuracy shows the 50% random baseline until the loop converges, then the measured test accuracy.
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Optimization Iteration</span>
              <span className="font-semibold text-white">{hasRunData ? `${epoch} / ${totalEpochs}` : "— / —"}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-150"
                style={{ width: `${hasRunData ? (epoch / totalEpochs) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Cost Loss</span>
              <span className="text-lg font-bold text-cyan-300 font-mono mt-1 block">
                {displayLoss ?? "—"}
              </span>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Accuracy</span>
              <span className="text-lg font-bold text-purple-300 font-mono mt-1 block">
                {displayAccuracy ?? "—"}
              </span>
              {displayAccuracy !== null && !finished && (
                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">random baseline until converged</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-mono mb-2">
              Trainable Parameters (&theta;) {finished && finalParameters.length > 0 ? "· optimized" : ""}
            </span>
            {activeParams && activeParams.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {activeParams.map((p, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-950 border border-white/5 text-center">
                    <span className="text-[9px] text-slate-500 block font-mono">&theta;{idx}</span>
                    <span className="text-xs font-mono font-semibold text-slate-300">{p >= 0 ? `+${p.toFixed(2)}` : p.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded bg-slate-950 border border-white/5 p-3 text-center text-[10px] font-mono text-slate-500">
                {isLoading ? "Loading trained parameters..." : "No Data Yet"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
        {!isTraining && !finished ? (
          <button
            onClick={startTraining}
            disabled={isLoading || !hasRunData}
            className="flex-1 rounded-lg bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 shadow-md shadow-cyan-400/10 disabled:opacity-50"
          >
            {hasRunData ? "Start Optimizer Loop" : isLoading ? "Loading..." : "No Data Yet"}
          </button>
        ) : isTraining ? (
          <button
            onClick={stopTraining}
            className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            Pause Optimization
          </button>
        ) : (
          <button
            onClick={resetTraining}
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06]"
          >
            Reset Simulation
          </button>
        )}
        <button
          onClick={onRerun}
          disabled={isLoading}
          title="Re-run backend quantum experiment"
          className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20 disabled:opacity-50"
        >
          {isLoading ? "⚡" : "🔄"}
        </button>
      </div>
    </div>
  );
}


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
  // Quantum Machine Learning Lab
  // ==================================================

  const [experimentTab, setExperimentTab] =
    useState<QmlExperimentTab>("qml");

  // QML experiment state
  const [qmlData, setQmlData] = useState<QmlData | null>(initialQmlData);
  const [qmlLoading, setQmlLoading] = useState(false);
  const [qmlError, setQmlError] = useState<string>("");

  const fetchQmlData = useCallback(async () => {
    setQmlLoading(true);
    setQmlError("");
    try {
      const res = await fetch(`${API_BASE}/qml/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ algorithm: "VQC", dataset: "moons", iterations: 20 }),
      });
      const data = await res.json();
      if (data.success) {
        setQmlData(data.data);
      } else {
        setQmlError(data.detail || "Failed to load QML data");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to connect to backend";
      setQmlError(msg);
    } finally {
      setQmlLoading(false);
    }
  }, []);

  // Fetch QML data automatically once on mount for all tabs
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchQmlData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchQmlData]);

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
        `${API_BASE}/circuit/fix`,
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
        `${API_BASE}/circuit/simulate`,
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
        `${API_BASE}/circuit/explain`,
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


  // ==================================================
  // Quantum Machine Learning Lab (live backend data)
  // ==================================================

  const qmlTabs: {
    id: QmlExperimentTab;
    label: string;
    icon: string;
  }[] = [
    { id: "qml", label: "QML Experiment", icon: "🔬" },
    { id: "hybrid", label: "Hybrid Experiment", icon: "🔀" },
    { id: "metrics", label: "Metrics Panel", icon: "📊" },
    { id: "results", label: "Results", icon: "📈" },
  ];

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
              href="/quantum-lab"
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
                                |{state.includes(" ") ? state.split(" ")[0] : state}⟩
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

          <TutorMarkdown text={fixResult.explanation} />
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

            <div className="mt-4">
              <TutorMarkdown text={explanation.explanation} />
            </div>

          </section>

        )}


        {/* ==================================================
            Quantum Machine Learning Lab
        ================================================== */}

        <section className="mt-8 rounded-2xl border border-purple-500/20 bg-[#090518]/60 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
            <SectionHeader
              icon="🧠"
              title="Quantum Machine Learning Lab"
              subtitle="Explore quantum-enhanced models, hybrid classical-quantum experiments, and key performance metrics."
            />

            <div className="flex flex-wrap gap-2">
              {qmlTabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  active={experimentTab === tab.id}
                  onClick={() => setExperimentTab(tab.id)}
                  label={tab.label}
                  icon={tab.icon}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            {/* Tab: QML Experiment */}
            {experimentTab === "qml" && (
              <div className="space-y-6 animate-fadeIn">
                {qmlLoading && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-center text-sm text-cyan-300">
                    ⚡ Running quantum machine learning simulation on backend Aer engine...
                  </div>
                )}
                {qmlError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-300">
                    ⚠️ {qmlError}
                  </div>
                )}
                {qmlData && (
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                      <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                            <span>🔬</span> {qmlData.algorithm} Experiment (Live Execution)
                          </h3>
                          <button
                            onClick={fetchQmlData}
                            disabled={qmlLoading}
                            className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20 disabled:opacity-50"
                          >
                            {qmlLoading ? "Simulating..." : "Re-run Experiment"}
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">
                         Variational Quantum Classifier results simulated using StatevectorSampler.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <StatCard label="Accuracy" value={`${(qmlData.accuracy * 100).toFixed(1)}%`} accent="text-cyan-300" />
                          <StatCard label="Qubits" value={qmlData.qubit_count} accent="text-pink-300" />
                          <StatCard label="Gate Count" value={qmlData.gate_count} accent="text-emerald-300" />
                          <StatCard label="Circuit Depth" value={qmlData.circuit_depth} accent="text-amber-300" />
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                          <span>📉</span> Training Loss History ({qmlData.loss_history?.length ?? 0} Iterations)
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={(qmlData.loss_history ?? []).map((v, i) => ({ epoch: i + 1, loss: Number(v.toFixed(4)) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="epoch" stroke="#64748b" fontSize={11} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} labelFormatter={(label) => `Iteration: ${label}`} />
                            <Line type="monotone" name="Loss" dataKey="loss" stroke="#c084fc" strokeWidth={2} dot={{ r: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                          <span>📋</span> Sample Predictions ({qmlData.predictions?.length ?? 0} Test Samples)
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-white/10 text-slate-500 text-xs uppercase">
                                <th className="pb-3 font-medium">Sample</th>
                                <th className="pb-3 font-medium">True Label</th>
                                <th className="pb-3 font-medium">Prediction</th>
                                <th className="pb-3 font-medium">Result</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-300">
                              {(qmlData.predictions ?? []).map((pred, idx) => {
                                const trueLabel = qmlData.test_labels?.[idx] ?? pred;
                                const isCorrect = trueLabel === pred;
                                return (
                                  <tr key={idx}>
                                    <td className="py-2 font-mono text-xs text-slate-400">#{idx + 1}</td>
                                    <td className="py-2 text-white">Class {trueLabel}</td>
                                    <td className="py-2 font-semibold text-cyan-300">Class {pred}</td>
                                    <td className="py-2">
                                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${isCorrect ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                                        {isCorrect ? "CORRECT" : "MISCLASSIFIED"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6 h-full flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <span>⚡</span> Execution Architecture
                          </h3>
                          <div className="space-y-3 text-xs text-slate-300">
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                              <span className="text-slate-500 block font-mono text-[10px] uppercase">Simulator</span>
                              <span className="font-semibold text-white">Qiskit AerSimulator (StatevectorSampler)</span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                              <span className="text-slate-500 block font-mono text-[10px] uppercase">Feature Map</span>
                              <span className="font-semibold text-white">ZZFeatureMap (2 qubits, reps=1)</span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                              <span className="text-slate-500 block font-mono text-[10px] uppercase">Ansatz</span>
                              <span className="font-semibold text-white">RealAmplitudes (2 qubits, reps=1)</span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                              <span className="text-slate-500 block font-mono text-[10px] uppercase">Optimizer</span>
                              <span className="font-semibold text-white">COBYLA ({qmlData.loss_history?.length ?? 0} iterations)</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5">
                          <button
                            onClick={fetchQmlData}
                            disabled={qmlLoading}
                            className="w-full rounded-lg bg-purple-500/20 border border-purple-500/30 px-4 py-2.5 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/30 disabled:opacity-50"
                          >
                            {qmlLoading ? "Running Simulation..." : "Re-run QML Simulation"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Hybrid Experiment */}
            {experimentTab === "hybrid" && (
              <div className="space-y-6 animate-fadeIn">
                {qmlLoading && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-center text-sm text-cyan-300">
                    ⚡ Running quantum variational circuit simulation on backend Aer simulator...
                  </div>
                )}
                {qmlError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-300">
                    ⚠️ {qmlError}
                  </div>
                )}
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6">
                      <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                        <span>🔀</span> {qmlData?.algorithm || "VQC"} Hybrid Quantum-Classical Classifier
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Combines parameter-heavy classical optimization with high-dimensional quantum Hilbert space encoding. Train parameters classically using COBYLA based on cost evaluation computed on the Aer quantum simulator.
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-white/[0.02] p-4 border border-white/5">
                          <p className="text-xs text-slate-500 uppercase font-mono">Features Simulated</p>
                          <p className="mt-1 text-sm font-semibold text-white">{qmlData ? qmlData.qubit_count : 2} features (ZZFeatureMap encoding)</p>
                        </div>
                        <div className="rounded-lg bg-white/[0.02] p-4 border border-white/5">
                          <p className="text-xs text-slate-500 uppercase font-mono">Total Samples</p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {qmlData
                              ? `${qmlData.total_samples ?? "—"} samples (${qmlData.train_size ?? "—"} train / ${qmlData.test_size ?? "—"} test)`
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                        <span>⚙️</span> Hybrid Execution Pipeline
                      </h3>
                      <div className="relative border-l border-cyan-500/20 ml-3 pl-6 space-y-6">
                        {getHybridSteps(qmlData).map((step, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 border border-cyan-400 text-xs font-bold text-cyan-300">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{step.phase}</h4>
                              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{step.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <HybridTrainingDemo qmlData={qmlData} onRerun={fetchQmlData} isLoading={qmlLoading} />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Metrics Panel */}
            {experimentTab === "metrics" && (
              <div className="space-y-6 animate-fadeIn">
                {qmlLoading && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-center text-sm text-cyan-300">
                    ⚡ Loading live metrics from quantum backend...
                  </div>
                )}
                {qmlError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-300">
                    ⚠️ {qmlError}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <StatCard label="Accuracy Score" value={qmlData ? `${(qmlData.accuracy * 100).toFixed(1)}%` : "—"} accent="text-cyan-300" />
                  <StatCard label="Final Loss" value={qmlData && (qmlData.loss_history?.length ?? 0) > 0 ? qmlData.loss_history![qmlData.loss_history!.length - 1].toFixed(3) : "—"} accent="text-purple-300" />
                  <StatCard label="Qubit Allocation" value={qmlData ? qmlData.qubit_count : "—"} accent="text-pink-300" />
                  <StatCard label="Quantum Gate Count" value={qmlData ? qmlData.gate_count : "—"} accent="text-emerald-300" />
                  <StatCard label="Circuit Depth" value={qmlData ? qmlData.circuit_depth : "—"} accent="text-amber-300" />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-mono">Performance vs Baseline</p>
                    <div className="relative flex items-center justify-center h-40 w-40">
                      {/* Live accuracy gauge SVG */}
                      <svg className="absolute h-full w-full transform -rotate-90">
                        <circle cx="80" cy="80" r="64" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                        <circle cx="80" cy="80" r="64" stroke="url(#cyan-glow)" strokeWidth="12" fill="transparent" strokeDasharray={402} strokeDashoffset={402 * (1 - Math.min(1, Math.max(0, qmlData ? qmlData.accuracy : 0)))} strokeLinecap="round" />
                        <defs>
                          <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#c084fc" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="z-10 text-center">
                        <span className="text-3xl font-extrabold text-white">{qmlData ? (qmlData.accuracy * 100).toFixed(0) : "0"}%</span>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1">Accuracy</span>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                      Live {qmlData?.algorithm ?? "VQC"} model vs 50.0% random baseline:{" "}
                      <span className="text-emerald-400 font-semibold">
                        {qmlData ? (qmlData.accuracy >= 0.5 ? "+" : "") + ((qmlData.accuracy - 0.5) * 100).toFixed(1) + "%" : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6 md:col-span-2 space-y-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <span>📉</span> Loss and Optimization History
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <p className="text-xs text-slate-500 uppercase font-mono">Optimization Iterations</p>
                        <p className="mt-2 text-2xl font-bold text-white">{qmlData ? qmlData.loss_history?.length ?? 0 : "—"}</p>
                        <p className="mt-1 text-xs text-slate-400">COBYLA gradient-free optimizer</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <p className="text-xs text-slate-500 uppercase font-mono">Training Set Size</p>
                        <p className="mt-2 text-2xl font-bold text-white">{qmlData ? qmlData.train_size ?? "—" : "—"}</p>
                        <p className="mt-1 text-xs text-slate-400">Labeled instances ({qmlData?.algorithm || "VQC"})</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <p className="text-xs text-slate-500 uppercase font-mono">Validation / Test Set</p>
                        <p className="mt-2 text-2xl font-bold text-white">{qmlData ? qmlData.test_size ?? qmlData.test_data?.length ?? "—" : "—"}</p>
                        <p className="mt-1 text-xs text-slate-400">Unseen test instances</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10 text-xs text-purple-200 leading-relaxed">
                      💡 <strong>Performance Note:</strong> The quantum variational circuit uses a ZZFeatureMap and RealAmplitudes ansatz on {qmlData?.qubit_count ?? "—"} qubits with {qmlData?.gate_count ?? "—"} gates at depth {qmlData?.circuit_depth ?? "—"}, executed using StatevectorSampler to identify non-linear decision boundaries.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Results */}
            {experimentTab === "results" && (
              <div className="space-y-6 animate-fadeIn">
                {qmlLoading && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-center text-sm text-cyan-300">
                    ⚡ Running quantum evaluation on test samples...
                  </div>
                )}
                {qmlError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-300">
                    ⚠️ {qmlError}
                  </div>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <span>📈</span> Live Optimization Loss Convergence
                    </h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={qmlData?.loss_history ? qmlData.loss_history.map((loss, idx) => ({ epoch: idx + 1, loss: Number(loss.toFixed(3)) })) : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="epoch" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} labelFormatter={(label) => `Iteration: ${label}`} />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                          <Line type="monotone" name="COBYLA Loss" dataKey="loss" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <span>📊</span> Architecture Performance Comparison
                    </h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              experiment: `${qmlData?.algorithm || "VQC"} (Live Aer Run)`,
                              accuracy: qmlData ? Number(qmlData.accuracy.toFixed(2)) : 0,
                            },
                            {
                              experiment: "Random Chance Baseline",
                              accuracy: 0.50,
                            },
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="experiment" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} domain={[0, 1.0]} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                          <Bar name="Accuracy" dataKey="accuracy" fill="#c084fc" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <span>📋</span> Individual Sample Predictions (Live Inference Stage)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-500 text-xs uppercase">
                          <th className="pb-3 font-medium">Sample ID</th>
                          <th className="pb-3 font-medium">True Label</th>
                          <th className="pb-3 font-medium">Predicted Label</th>
                          <th className="pb-3 font-medium">Features [x0, x1]</th>
                          <th className="pb-3 font-medium">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {qmlData && (qmlData.predictions ?? []).map((pred, idx) => {
                          const trueLabel = qmlData.test_labels?.[idx] ?? pred;
                          const isCorrect = trueLabel === pred;
                          return (
                            <tr key={idx}>
                              <td className="py-3 font-mono text-xs text-slate-400">#{(idx + 1).toString().padStart(3, "0")}</td>
                              <td className="py-3 text-white">Class {trueLabel}</td>
                              <td className="py-3 font-semibold text-cyan-300">Class {pred}</td>
                              <td className="py-3 font-mono text-xs text-slate-400">
                                {qmlData.test_data?.[idx] ? `[${qmlData.test_data[idx].map((v: number) => v.toFixed(2)).join(", ")}]` : "—"}
                              </td>
                              <td className="py-3">
                                {isCorrect ? (
                                  <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">CORRECT</span>
                                ) : (
                                  <span className="px-2 py-0.5 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-400 font-medium">MISCLASSIFIED</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {(!qmlData || (qmlData.predictions?.length ?? 0) === 0) && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-500">
                              {qmlLoading ? "Loading real test predictions from quantum engine..." : "No prediction data available. Run the QML experiment to view results."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>


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
            href="/quantum-lab"
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



