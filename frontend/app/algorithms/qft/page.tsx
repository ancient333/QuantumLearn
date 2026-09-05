"use client";

import { useState } from "react";
import Link from "next/link";


type QFTStep = {
  step: number;
  title: string;
  description: string;
};


type QFTResult = {
  qubits: number;
  dimension: number;
  input_state: {
    real: number;
    imaginary: number;
  }[];
  output_state: {
    real: number;
    imaginary: number;
  }[];
  probabilities: number[];
  algorithm: string;
  steps: QFTStep[];
  workflow: string[];
};

type LearningProgress = {
  completedAlgorithms: string[];
  tutorUsed: boolean;
  labUsed: boolean;
  gatesExplored: string[];
  simulationsRun: number;
  lastGate: string;
  xp: number;
  quizzesCompleted?: number;
  bb84QuizCompleted?: boolean;
  bb84QuizScore?: number;
  bb84QuizAttempts?: number;
};


const formatNumber = (value: number) => {
  if (Math.abs(value) < 0.000001) {
    return "0";
  }

  return value.toFixed(3);
};


const formatComplex = (
  real: number,
  imaginary: number
) => {
  const realText = formatNumber(real);
  const imaginaryText = formatNumber(
    Math.abs(imaginary)
  );

  if (Math.abs(imaginary) < 0.000001) {
    return realText;
  }

  if (Math.abs(real) < 0.000001) {
    return imaginary >= 0
      ? `${imaginaryText}i`
      : `-${imaginaryText}i`;
  }

  return imaginary >= 0
    ? `${realText} + ${imaginaryText}i`
    : `${realText} - ${imaginaryText}i`;
};


export default function QFTPage() {

  const [qubits, setQubits] = useState("2");

  const [loading, setLoading] = useState(false);

  const [result, setResult] =
    useState<QFTResult | null>(null);

  const [error, setError] =
    useState("");


  const runQFT = async () => {

    setLoading(true);
    setError("");
    setResult(null);

    try {

      const response = await fetch(
        "https://quantumlearn-1.onrender.com/algorithms/qft",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            qubits: Number(qubits),
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "QFT simulation failed."
        );
      }


      setResult(data);

      // ==================================================
      // Save Algorithm Context
      // ==================================================

      localStorage.setItem(
        "quantumAlgorithmContext",
        JSON.stringify({
          algorithm: data.algorithm,
          qubits: data.qubits,
          dimension: data.dimension,
          input_state: data.input_state,
          output_state: data.output_state,
          probabilities: data.probabilities,
          steps: data.steps,
          workflow: data.workflow,
        })
      );

      // ==================================================
      // Update Learning Progress
      // ==================================================

      const storedProgress =
        localStorage.getItem("quantumLearningProgress");

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
            ...JSON.parse(storedProgress),
          };
        } catch {
          console.error(
            "Could not load learning progress."
          );
        }
      }

      const algorithmName = "Quantum Fourier Transform";

      const alreadyCompleted =
        (progress.completedAlgorithms || []).includes(
          algorithmName
        );

      const earnedXP = alreadyCompleted ? 0 : 100;

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

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend."
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 50%, #111827 100%)",
        color: "#f8fafc",
        paddingBottom: "80px",
      }}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <header
        style={{
          borderBottom:
            "1px solid rgba(148,163,184,0.15)",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >

        <Link
          href="/algorithms"
          style={{
            color: "#cbd5e1",
            textDecoration: "none",
            fontSize: "15px",
          }}
        >
          ← Back to Algorithms
        </Link>


        <div
          style={{
            fontWeight: 700,
            fontSize: "20px",
            letterSpacing: "-0.02em",
          }}
        >
          QuantumLearn
        </div>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/progress"
            style={{
              color: "#cbd5e1",
              textDecoration: "none",
              fontSize: "15px",
            }}
          >
            Progress
          </Link>

          <Link
            href="/tutor"
            style={{
              color: "#cbd5e1",
              textDecoration: "none",
              fontSize: "15px",
            }}
          >
            AI Tutor →
          </Link>
        </div>

      </header>


      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "50px 24px",
        }}
      >

        {/* ==================================================
            TITLE
        ================================================== */}

        <section
          style={{
            textAlign: "center",
            marginBottom: "45px",
          }}
        >

          <div
            style={{
              display: "inline-block",
              padding: "7px 14px",
              borderRadius: "999px",
              background:
                "rgba(99,102,241,0.12)",
              border:
                "1px solid rgba(129,140,248,0.25)",
              color: "#a5b4fc",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "18px",
            }}
          >
            Quantum Algorithm
          </div>


          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 58px)",
              margin: 0,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            Quantum Fourier Transform
          </h1>


          <p
            style={{
              maxWidth: "760px",
              margin:
                "18px auto 0",
              color: "#94a3b8",
              lineHeight: 1.8,
              fontSize: "17px",
            }}
          >
            Learn how the Quantum Fourier Transform
            changes the representation of a quantum
            state into a frequency-like representation.
          </p>

        </section>


        {/* ==================================================
            WHAT IS QFT?
        ================================================== */}

        <section
          style={{
            background:
              "rgba(15,23,42,0.8)",
            border:
              "1px solid rgba(148,163,184,0.15)",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px",
          }}
        >

          <h2
            style={{
              marginTop: 0,
              fontSize: "25px",
            }}
          >
            🧠 What is the Quantum Fourier Transform?
          </h2>


          <p
            style={{
              color: "#cbd5e1",
              lineHeight: 1.8,
            }}
          >
            The Quantum Fourier Transform, or QFT,
            is the quantum version of the discrete
            Fourier transform. It transforms the
            amplitudes of a quantum state into a
            representation based on phase and frequency.
          </p>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "25px",
            }}
          >

            {[
              {
                title: "1. Superposition",
                text:
                  "Qubits can represent multiple basis states simultaneously.",
              },
              {
                title: "2. Phase",
                text:
                  "Controlled rotations encode relationships between quantum amplitudes.",
              },
              {
                title: "3. Fourier Transform",
                text:
                  "QFT changes the representation of the quantum state.",
              },
              {
                title: "4. Measurement",
                text:
                  "Measurement produces classical outcomes from the final state.",
              },
            ].map((item) => (

              <div
                key={item.title}
                style={{
                  padding: "20px",
                  borderRadius: "14px",
                  background:
                    "rgba(30,41,59,0.7)",
                  border:
                    "1px solid rgba(148,163,184,0.12)",
                }}
              >

                <h3
                  style={{
                    marginTop: 0,
                    fontSize: "16px",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color: "#94a3b8",
                    lineHeight: 1.7,
                    marginBottom: 0,
                    fontSize: "14px",
                  }}
                >
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </section>


        {/* ==================================================
            QFT CIRCUIT
        ================================================== */}

        <section
          style={{
            background:
              "rgba(15,23,42,0.8)",
            border:
              "1px solid rgba(148,163,184,0.15)",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px",
          }}
        >

          <h2
            style={{
              marginTop: 0,
              fontSize: "25px",
            }}
          >
            ⚛️ Conceptual Quantum Circuit
          </h2>


          <p
            style={{
              color: "#94a3b8",
              lineHeight: 1.7,
            }}
          >
            A QFT circuit is built from Hadamard gates,
            controlled phase rotations, and usually
            swap operations.
          </p>


          <div
            style={{
              marginTop: "30px",
              overflowX: "auto",
              paddingBottom: "10px",
            }}
          >

            <div
              style={{
                minWidth: "720px",
                padding: "20px",
                background:
                  "rgba(2,6,23,0.75)",
                borderRadius: "16px",
              }}
            >

              {[0, 1, 2].map((qubit) => (

                <div
                  key={qubit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom:
                      qubit === 2
                        ? 0
                        : "22px",
                  }}
                >

                  <div
                    style={{
                      width: "55px",
                      color: "#94a3b8",
                      fontWeight: 600,
                    }}
                  >
                    q{qubit}
                  </div>


                  <div
                    style={{
                      width: "55px",
                      height: "2px",
                      background:
                        "#475569",
                    }}
                  />


                  <div
                    style={{
                      minWidth: "55px",
                      height: "42px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "rgba(99,102,241,0.2)",
                      border:
                        "1px solid rgba(129,140,248,0.5)",
                      color: "#c7d2fe",
                      fontWeight: 700,
                    }}
                  >
                    H
                  </div>


                  <div
                    style={{
                      width: "70px",
                      height: "2px",
                      background:
                        "#475569",
                    }}
                  />


                  <div
                    style={{
                      minWidth: "105px",
                      height: "42px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "rgba(14,165,233,0.12)",
                      border:
                        "1px solid rgba(56,189,248,0.35)",
                      color: "#bae6fd",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    Controlled R
                  </div>


                  <div
                    style={{
                      width: "70px",
                      height: "2px",
                      background:
                        "#475569",
                    }}
                  />


                  <div
                    style={{
                      minWidth: "65px",
                      height: "42px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "rgba(168,85,247,0.12)",
                      border:
                        "1px solid rgba(192,132,252,0.35)",
                      color: "#e9d5ff",
                      fontWeight: 700,
                    }}
                  >
                    QFT
                  </div>


                  <div
                    style={{
                      width: "70px",
                      height: "2px",
                      background:
                        "#475569",
                    }}
                  />


                  <div
                    style={{
                      minWidth: "55px",
                      height: "42px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "rgba(34,197,94,0.1)",
                      border:
                        "1px solid rgba(74,222,128,0.3)",
                      color: "#bbf7d0",
                      fontWeight: 700,
                    }}
                  >
                    M
                  </div>

                </div>

              ))}

            </div>

          </div>


          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "18px",
            }}
          >

            {[
              "H = Hadamard",
              "Controlled R = Phase rotation",
              "QFT = Fourier transformation",
              "M = Measurement",
            ].map((item) => (

              <span
                key={item}
                style={{
                  padding:
                    "7px 11px",
                  borderRadius: "8px",
                  background:
                    "rgba(30,41,59,0.8)",
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                {item}
              </span>

            ))}

          </div>

        </section>


        {/* ==================================================
            SIMULATOR
        ================================================== */}

        <section
          style={{
            background:
              "rgba(15,23,42,0.8)",
            border:
              "1px solid rgba(148,163,184,0.15)",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px",
          }}
        >

          <h2
            style={{
              marginTop: 0,
              fontSize: "25px",
            }}
          >
            🧪 Interactive QFT Simulator
          </h2>


          <p
            style={{
              color: "#94a3b8",
              lineHeight: 1.7,
            }}
          >
            Choose the number of qubits and run the
            Quantum Fourier Transform using the
            QuantumLearn simulation backend.
          </p>


          <div
            style={{
              display: "flex",
              alignItems: "end",
              gap: "15px",
              flexWrap: "wrap",
              marginTop: "25px",
            }}
          >

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                color: "#cbd5e1",
                fontSize: "14px",
              }}
            >

              Number of Qubits

              <select
                value={qubits}
                onChange={(event) => {
                  setQubits(
                    event.target.value
                  );
                  setResult(null);
                  setError("");
                }}
                style={{
                  width: "180px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border:
                    "1px solid rgba(148,163,184,0.25)",
                  background:
                    "#0f172a",
                  color: "#f8fafc",
                  fontSize: "15px",
                }}
              >

                <option value="1">
                  1 qubit
                </option>

                <option value="2">
                  2 qubits
                </option>

                <option value="3">
                  3 qubits
                </option>

                <option value="4">
                  4 qubits
                </option>

                <option value="5">
                  5 qubits
                </option>

                <option value="6">
                  6 qubits
                </option>

              </select>

            </label>


            <button
              onClick={runQFT}
              disabled={loading}
              style={{
                padding:
                  "12px 22px",
                borderRadius: "10px",
                border: "none",
                background:
                  loading
                    ? "#475569"
                    : "#6366f1",
                color: "#ffffff",
                fontWeight: 700,
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
                fontSize: "15px",
              }}
            >
              {loading
                ? "Running..."
                : "▶ Run QFT"}
            </button>

          </div>


          {error && (

            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "10px",
                background:
                  "rgba(127,29,29,0.25)",
                border:
                  "1px solid rgba(248,113,113,0.3)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>

          )}

        </section>


        {/* ==================================================
            RESULTS
        ================================================== */}

        {result && (

          <section
            style={{
              background:
                "rgba(15,23,42,0.8)",
              border:
                "1px solid rgba(148,163,184,0.15)",
              borderRadius: "20px",
              padding: "30px",
              marginBottom: "30px",
            }}
          >

            <h2
              style={{
                marginTop: 0,
                fontSize: "25px",
              }}
            >
              📊 Simulation Result
            </h2>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginBottom: "30px",
              }}
            >

              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background:
                    "rgba(30,41,59,0.7)",
                }}
              >
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  Algorithm
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "7px",
                  }}
                >
                  {result.algorithm}
                </strong>
              </div>


              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background:
                    "rgba(30,41,59,0.7)",
                }}
              >
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  Qubits
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "7px",
                  }}
                >
                  {result.qubits}
                </strong>
              </div>


              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background:
                    "rgba(30,41,59,0.7)",
                }}
              >
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  State Dimension
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "7px",
                  }}
                >
                  {result.dimension}
                </strong>
              </div>

            </div>


            {/* State comparison */}

            <h3
              style={{
                fontSize: "18px",
              }}
            >
              Input → Output State
            </h3>


            <div
              style={{
                overflowX: "auto",
              }}
            >

              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  marginTop: "15px",
                }}
              >

                <thead>

                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px",
                        borderBottom:
                          "1px solid rgba(148,163,184,0.15)",
                        color: "#94a3b8",
                      }}
                    >
                      Basis State
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px",
                        borderBottom:
                          "1px solid rgba(148,163,184,0.15)",
                        color: "#94a3b8",
                      }}
                    >
                      Input Amplitude
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px",
                        borderBottom:
                          "1px solid rgba(148,163,184,0.15)",
                        color: "#94a3b8",
                      }}
                    >
                      Output Amplitude
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px",
                        borderBottom:
                          "1px solid rgba(148,163,184,0.15)",
                        color: "#94a3b8",
                      }}
                    >
                      Probability
                    </th>
                  </tr>

                </thead>


                <tbody>

                  {result.output_state.map(
                    (output, index) => (

                      <tr
                        key={index}
                      >

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid rgba(148,163,184,0.08)",
                            fontWeight: 700,
                          }}
                        >
                          |{index.toString(2).padStart(
                            result.qubits,
                            "0"
                          )}⟩
                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid rgba(148,163,184,0.08)",
                            color: "#cbd5e1",
                            fontFamily:
                              "monospace",
                          }}
                        >
                          {formatComplex(
                            result.input_state[index]
                              ?.real ?? 0,
                            result.input_state[index]
                              ?.imaginary ?? 0
                          )}
                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid rgba(148,163,184,0.08)",
                            color: "#c7d2fe",
                            fontFamily:
                              "monospace",
                          }}
                        >
                          {formatComplex(
                            output.real,
                            output.imaginary
                          )}
                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid rgba(148,163,184,0.08)",
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: "10px",
                            }}
                          >

                            <div
                              style={{
                                width: "100px",
                                height: "8px",
                                borderRadius:
                                  "999px",
                                background:
                                  "#1e293b",
                                overflow:
                                  "hidden",
                              }}
                            >

                              <div
                                style={{
                                  width: `${Math.min(
                                    100,
                                    result.probabilities[
                                      index
                                    ] * 100
                                  )}%`,
                                  height:
                                    "100%",
                                  background:
                                    "#818cf8",
                                }}
                              />

                            </div>


                            <span
                              style={{
                                color:
                                  "#cbd5e1",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {(
                                result.probabilities[
                                  index
                                ] * 100
                              ).toFixed(2)}
                              %
                            </span>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* ==================================================
                STEP BY STEP
            ================================================== */}

            <h3
              style={{
                marginTop: "40px",
                fontSize: "20px",
              }}
            >
              📚 Step-by-Step QFT
            </h3>


            <div
              style={{
                display: "grid",
                gap: "14px",
                marginTop: "18px",
              }}
            >

              {result.steps.map(
                (step) => (

                  <div
                    key={step.step}
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "18px",
                      borderRadius: "14px",
                      background:
                        "rgba(30,41,59,0.65)",
                      border:
                        "1px solid rgba(148,163,184,0.1)",
                    }}
                  >

                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        flexShrink: 0,
                        borderRadius:
                          "50%",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          "rgba(99,102,241,0.2)",
                        color:
                          "#c7d2fe",
                        fontWeight: 800,
                      }}
                    >
                      {step.step}
                    </div>


                    <div>

                      <h4
                        style={{
                          margin:
                            "3px 0 7px",
                          fontSize:
                            "16px",
                        }}
                      >
                        {step.title}
                      </h4>


                      <p
                        style={{
                          margin: 0,
                          color:
                            "#94a3b8",
                          lineHeight:
                            1.7,
                          fontSize:
                            "14px",
                        }}
                      >
                        {step.description}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>


            {/* ==================================================
                WORKFLOW
            ================================================== */}

            <h3
              style={{
                marginTop: "40px",
                fontSize: "20px",
              }}
            >
              🔄 QFT Workflow
            </h3>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginTop: "18px",
              }}
            >

              {result.workflow.map(
                (item, index) => (

                  <div
                    key={index}
                    style={{
                      padding: "17px",
                      borderRadius:
                        "12px",
                      background:
                        "rgba(30,41,59,0.65)",
                      border:
                        "1px solid rgba(148,163,184,0.1)",
                      color:
                        "#cbd5e1",
                      fontSize:
                        "14px",
                      lineHeight:
                        1.6,
                    }}
                  >
                    <strong>
                      {index + 1}.
                    </strong>{" "}
                    {item}
                  </div>

                )
              )}

            </div>

          </section>

        )}


        {/* ==================================================
            AI TUTOR
        ================================================== */}

        {result && (

          <section
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "28px",
              marginBottom: "30px",
            }}
          >

            <h2
              style={{
                marginTop: 0,
                fontSize: "25px",
              }}
            >
              Understand the Result
            </h2>

            <p
              style={{
                color: "#94a3b8",
                lineHeight: 1.8,
                marginTop: "8px",
              }}
            >
              Your actual Quantum Fourier Transform simulation result has been saved for the AI Tutor.
              Ask it to explain the transformed amplitudes, probabilities, phase behavior, and the QFT workflow.
            </p>

            <Link
              href="/tutor"
              style={{
                display: "inline-block",
                marginTop: "20px",
                padding: "12px 24px",
                borderRadius: "12px",
                background: "#22d3ee",
                color: "#000000",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Ask AI Tutor →
            </Link>

          </section>

        )}


        {/* ==================================================
            WHY QFT MATTERS
        ================================================== */}

        <section
          style={{
            background:
              "rgba(15,23,42,0.8)",
            border:
              "1px solid rgba(148,163,184,0.15)",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px",
          }}
        >

          <h2
            style={{
              marginTop: 0,
              fontSize: "25px",
            }}
          >
            🚀 Why is QFT Important?
          </h2>


          <p
            style={{
              color: "#cbd5e1",
              lineHeight: 1.8,
            }}
          >
            The Quantum Fourier Transform is an
            important building block in several quantum
            algorithms. It is particularly important
            for algorithms that need to discover
            periodic structure.
          </p>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
              marginTop: "20px",
            }}
          >

            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
                background:
                  "rgba(30,41,59,0.7)",
              }}
            >

              <h3
                style={{
                  marginTop: 0,
                }}
              >
                Shor's Algorithm
              </h3>

              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.7,
                  fontSize: "14px",
                }}
              >
                QFT helps extract periodic information
                during the period-finding part of
                Shor's algorithm.
              </p>

            </div>


            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
                background:
                  "rgba(30,41,59,0.7)",
              }}
            >

              <h3
                style={{
                  marginTop: 0,
                }}
              >
                Phase Information
              </h3>

              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.7,
                  fontSize: "14px",
                }}
              >
                QFT converts phase relationships into
                measurable probability patterns.
              </p>

            </div>


            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
                background:
                  "rgba(30,41,59,0.7)",
              }}
            >

              <h3
                style={{
                  marginTop: 0,
                }}
              >
                Quantum Algorithms
              </h3>

              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.7,
                  fontSize: "14px",
                }}
              >
                QFT is a fundamental component of
                several quantum computing techniques.
              </p>

            </div>

          </div>

        </section>


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginTop: "35px",
          }}
        >

          <Link
            href="/algorithms"
            style={{
              padding:
                "12px 20px",
              borderRadius: "10px",
              background:
                "rgba(30,41,59,0.8)",
              border:
                "1px solid rgba(148,163,184,0.15)",
              color: "#cbd5e1",
              textDecoration:
                "none",
              fontWeight: 600,
            }}
          >
            ← Algorithms
          </Link>


          <Link
            href="/algorithms/shor"
            style={{
              padding:
                "12px 20px",
              borderRadius: "10px",
              background:
                "rgba(99,102,241,0.15)",
              border:
                "1px solid rgba(129,140,248,0.3)",
              color: "#c7d2fe",
              textDecoration:
                "none",
              fontWeight: 600,
            }}
          >
            Explore Shor's Algorithm →
          </Link>

        </div>

      </div>

    </main>
  );
}


