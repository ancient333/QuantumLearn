"use client";

import { useState } from "react";
import Link from "next/link";


// ==================================================
// Types
// ==================================================

type Transmission = {
  position: number;
  alice_bit: number;
  alice_basis: string;
  eve_basis: string | null;
  bob_basis: string;
  bob_bit: number;
  basis_match: boolean;
  kept: boolean;
  test_bit: boolean;
  error: boolean;
};

type BB84Result = {
  algorithm: string;
  bits: number;
  eavesdropper: boolean;

  qber_threshold: number;

  alice_bits: number[];
  alice_bases: string[];

  eve_bases: (string | null)[];

  bob_bases: string[];
  bob_bits: number[];

  matching_positions: number[];

  sifted_alice_key: number[];
  sifted_bob_key: number[];

  sifted_key_length: number;

  test_alice_bits: number[];
  test_bob_bits: number[];

  test_key_length: number;
  test_errors: number;

  qber: number;
  error_rate: number;

  secret_alice_key: number[];
  secret_bob_key: number[];

  secret_key_length: number;

  mismatches: number;

  secure: boolean;
  eve_detected: boolean;

  message: string;

  transmission: Transmission[];

  steps: {
    step: number;
    title: string;
    description: string;
  }[];

  workflow: string[];
};


type LearningProgress = {
  completedAlgorithms: string[];
  tutorUsed: boolean;
  labUsed: boolean;
  gatesExplored: string[];
  simulationsRun: number;
  lastGate?: string;
  xp?: number;
  quizzesCompleted?: number;
  bb84QuizCompleted?: boolean;
  bb84QuizScore?: number;
  bb84QuizAttempts?: number;
};


const defaultLearningProgress: LearningProgress = {
  completedAlgorithms: [],
  tutorUsed: false,
  labUsed: false,
  gatesExplored: [],
  simulationsRun: 0,
  lastGate: "",
  xp: 0,
  quizzesCompleted: 0,
  bb84QuizCompleted: false,
  bb84QuizScore: 0,
  bb84QuizAttempts: 0,
};


// ==================================================
// Main Page
// ==================================================

export default function BB84Page() {

  const [bits, setBits] = useState(16);
  const [quizScore, setQuizScore] = useState<number | null>(null);
const [quizCompleted, setQuizCompleted] = useState(false);

  const [eavesdropper, setEavesdropper] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<BB84Result | null>(null);

  const [error, setError] =
    useState("");


  // ==================================================
  // Run BB84
  // ==================================================

  async function runBB84() {

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/algorithms/bb84",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            bits,
            eavesdropper,
          }),
        }
      );


      if (!response.ok) {
        throw new Error(
          "Unable to run BB84 simulation."
        );
      }


      const data =
        await response.json();


      setResult(data);
      setQuizScore(null);
      setQuizCompleted(false);

      // ==================================================
      // Save BB84 Algorithm Context
      // ==================================================

      localStorage.setItem(
        "quantumAlgorithmContext",
        JSON.stringify({
          algorithm: "BB84",
          bits: data.bits,
          eavesdropper: data.eavesdropper,
          qber: data.qber,
          threshold: data.qber_threshold,
          secure: data.secure,
          eve_detected: data.eve_detected,
          result: data.transmission,
          explanation: data.message,
        })
      );

      // ==================================================
      // Update Shared Learning Progress
      // ==================================================

      const storedProgress =
        localStorage.getItem("quantumLearningProgress");

      let progress: LearningProgress = {
        ...defaultLearningProgress,
      };

      if (storedProgress) {
        try {
          progress = {
            ...defaultLearningProgress,
            ...JSON.parse(storedProgress),
          };
        } catch {
          console.error(
            "Could not load learning progress."
          );
        }
      }

      const completedAlgorithms = Array.from(
        new Set([
          ...(progress.completedAlgorithms || []),
          "BB84 Quantum Key Distribution",
        ])
      );

      localStorage.setItem(
        "quantumLearningProgress",
        JSON.stringify({
          ...progress,
          completedAlgorithms,
          simulationsRun:
            (progress.simulationsRun || 0) + 1,
        })
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

    } finally {

      setLoading(false);

    }
  }


  // ==================================================
  // Helpers
  // ==================================================

  function basisSymbol(
    basis: string | null
  ) {

    if (basis === "Z") {
      return "ï¼‹";
    }

    if (basis === "X") {
      return "Ã—";
    }

    return "â€”";
  }


  function formatPercent(
    value: number
  ) {

    return `${(
      value * 100
    ).toFixed(1)}%`;
  }

  // ==================================================
  // BB84 Knowledge Challenge
  // ==================================================

  function answerQuiz(index: number) {

    if (quizCompleted) {
      return;
    }

    const storedProgress =
      localStorage.getItem("quantumLearningProgress");

    let progress: LearningProgress = {
      ...defaultLearningProgress,
    };

    if (storedProgress) {
      try {
        progress = {
          ...defaultLearningProgress,
          ...JSON.parse(storedProgress),
        };
      } catch {
        console.error(
          "Could not load learning progress."
        );
      }
    }

    const attempts =
      (progress.bb84QuizAttempts || 0) + 1;

    if (index !== 2) {
      setQuizScore(0);

      localStorage.setItem(
        "quantumLearningProgress",
        JSON.stringify({
          ...progress,
          bb84QuizScore: 0,
          bb84QuizAttempts: attempts,
        })
      );

      return;
    }

    setQuizScore(100);
    setQuizCompleted(true);

    const quizAlreadyCompleted =
      localStorage.getItem("bb84QuizCompleted") === "true";

    const quizzesCompleted =
      progress.quizzesCompleted || 0;

    localStorage.setItem(
      "quantumLearningProgress",
      JSON.stringify({
        ...progress,
        bb84QuizCompleted: true,
        bb84QuizScore: 100,
        bb84QuizAttempts: attempts,
        quizzesCompleted:
          quizAlreadyCompleted
            ? quizzesCompleted
            : quizzesCompleted + 1,
      })
    );

    if (!quizAlreadyCompleted) {
      localStorage.setItem(
        "bb84QuizCompleted",
        "true"
      );

      const currentXp = Number(
        localStorage.getItem("xp") || "0"
      );

      localStorage.setItem(
        "xp",
        String(currentXp + 50)
      );
    }
  }


  // ==================================================
  // Render
  // ==================================================

  return (

    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        padding: "40px 24px",
      }}
    >

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >

        {/* ==========================================
            Header
        ========================================== */}

        <div
          style={{
            marginBottom: "40px",
          }}
        >

          <Link
            href="/algorithms"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            â† Back to Algorithms
          </Link>


          <h1
            style={{
              fontSize: "42px",
              marginTop: "20px",
              marginBottom: "12px",
              color: "#f8fafc",
            }}
          >
            ðŸ” BB84 Quantum Key Distribution
          </h1>


          <p
            style={{
              maxWidth: "850px",
              color: "#94a3b8",
              fontSize: "17px",
              lineHeight: 1.7,
            }}
          >
            Explore how quantum mechanics allows Alice
            and Bob to establish a shared secret key while
            detecting an eavesdropper.
          </p>

        </div>


        {/* ==========================================
            Explanation
        ========================================== */}

        <section
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >

          <h2
            style={{
              marginTop: 0,
              color: "#f8fafc",
            }}
          >
            What is BB84?
          </h2>


          <p
            style={{
              color: "#cbd5e1",
              lineHeight: 1.8,
              marginBottom: 0,
            }}
          >
            BB84 is a quantum key distribution protocol.
            Alice encodes random bits using randomly
            selected quantum bases. Bob independently
            chooses measurement bases. They compare only
            their bases and retain matching measurements.
            A sample of those bits is then checked to
            estimate the Quantum Bit Error Rate (QBER).
          </p>

        </section>


        {/* ==========================================
            Controls
        ========================================== */}

        <section
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >

          <h2
            style={{
              marginTop: 0,
              color: "#f8fafc",
            }}
          >
            Simulation Controls
          </h2>


          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "end",
              flexWrap: "wrap",
            }}
          >

            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#cbd5e1",
                  fontSize: "14px",
                }}
              >
                Number of quantum bits
              </label>


              <select
                value={bits}
                onChange={(event) =>
                  setBits(
                    Number(event.target.value)
                  )
                }
                style={{
                  background: "#020617",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  padding: "10px 14px",
                }}
              >

                {[8, 12, 16, 24, 32].map(
                  (value) => (

                    <option
                      key={value}
                      value={value}
                    >
                      {value} bits
                    </option>

                  )
                )}

              </select>

            </div>


            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                paddingBottom: "10px",
                cursor: "pointer",
              }}
            >

              <input
                type="checkbox"
                checked={eavesdropper}
                onChange={(event) =>
                  setEavesdropper(
                    event.target.checked
                  )
                }
                style={{
                  width: "18px",
                  height: "18px",
                }}
              />

              <span>
                Simulate Eve
              </span>

            </label>


            <button
              onClick={runBB84}
              disabled={loading}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "11px 22px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading
                  ? 0.7
                  : 1,
              }}
            >
              {loading
                ? "Running..."
                : "â–¶ Run BB84"}
            </button>

          </div>

        </section>


        {/* ==========================================
            Protocol Visualization
        ========================================== */}

        <section
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "24px",
          }}
        >

          <h2
            style={{
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            ðŸ“¡ BB84 Quantum Channel
          </h2>


          <p
            style={{
              color: "#94a3b8",
              lineHeight: 1.6,
              marginBottom: "28px",
            }}
          >
            Quantum states travel from Alice to Bob.
            If Eve intercepts the states, her measurements
            can disturb them and introduce errors.
          </p>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1.5fr 1fr",
              gap: "16px",
              alignItems: "center",
            }}
          >

            <ProtocolNode
              icon="ðŸ‘©"
              title="Alice"
              description="Encode"
              active
            />


            <div
              style={{
                position: "relative",
                padding: "24px 0",
              }}
            >

              <div
                style={{
                  height: "4px",
                  background: "#2563eb",
                  borderRadius: "999px",
                  position: "relative",
                }}
              >

                <div
                  style={{
                    position: "absolute",
                    left: "15%",
                    top: "-7px",
                    fontSize: "18px",
                  }}
                >
                  |ÏˆâŸ©
                </div>


                <div
                  style={{
                    position: "absolute",
                    left: "47%",
                    top: "-9px",
                    fontSize: "22px",
                  }}
                >
                  â†’
                </div>


                <div
                  style={{
                    position: "absolute",
                    right: "15%",
                    top: "-7px",
                    fontSize: "18px",
                  }}
                >
                  |ÏˆâŸ©
                </div>

              </div>


              <div
                style={{
                  textAlign: "center",
                  marginTop: "16px",
                  color: "#60a5fa",
                  fontSize: "13px",
                }}
              >
                Quantum Channel
              </div>


              {eavesdropper && (

                <div
                  style={{
                    margin: "20px auto 0",
                    width: "120px",
                    textAlign: "center",
                    padding: "10px",
                    background: "#451a03",
                    border:
                      "1px solid #92400e",
                    borderRadius: "10px",
                    color: "#fbbf24",
                    fontSize: "13px",
                  }}
                >
                  ðŸ•µï¸ Eve
                  <br />
                  Intercept
                </div>

              )}

            </div>


            <ProtocolNode
              icon="ðŸ‘¨"
              title="Bob"
              description="Measure"
              active
            />

          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "12px",
              marginTop: "32px",
            }}
          >

            <FlowCard
              number="1"
              title="Encode"
              text="Alice chooses random bits and bases."
            />

            <FlowCard
              number="2"
              title="Transmit"
              text="Quantum states travel through the channel."
            />

            <FlowCard
              number="3"
              title="Measure"
              text="Bob randomly chooses measurement bases."
            />

            <FlowCard
              number="4"
              title="Sift"
              text="Matching bases become candidate key bits."
            />

          </div>

        </section>


        {/* ==========================================
            Error
        ========================================== */}

        {error && (

          <div
            style={{
              background: "#450a0a",
              border: "1px solid #7f1d1d",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              color: "#fecaca",
            }}
          >
            {error}
          </div>

        )}


        {/* ==========================================
            Results
        ========================================== */}

        {result && (

          <>

            {/* ======================================
                Security Status
            ====================================== */}

            <section
              style={{
                background: result.secure
                  ? "#052e16"
                  : "#450a0a",

                border: result.secure
                  ? "1px solid #166534"
                  : "1px solid #7f1d1d",

                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >

              <h2
                style={{
                  marginTop: 0,
                  color: result.secure
                    ? "#bbf7d0"
                    : "#fecaca",
                }}
              >
                {result.secure
                  ? "âœ… Channel Passed Security Check"
                  : "âš ï¸ Key Should Be Rejected"}
              </h2>


              <p
                style={{
                  color: result.secure
                    ? "#dcfce7"
                    : "#fee2e2",
                  lineHeight: 1.7,
                  marginBottom: "10px",
                }}
              >
                {result.message}
              </p>


              {result.eve_detected && (

                <p
                  style={{
                    margin: 0,
                    color: "#fca5a5",
                    fontWeight: 600,
                  }}
                >
                  ðŸ•µï¸ Eve was detected by the QBER check.
                </p>

              )}

            </section>


            {/* ======================================
                Statistics
            ====================================== */}

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >

              <StatCard
                title="Qubits Sent"
                value={String(result.bits)}
              />


              <StatCard
                title="Sifted Bits"
                value={String(
                  result.sifted_key_length
                )}
              />


              <StatCard
                title="Test Bits"
                value={String(
                  result.test_key_length
                )}
              />


              <StatCard
                title="QBER"
                value={formatPercent(
                  result.qber
                )}
              />


              <StatCard
                title="Threshold"
                value={formatPercent(
                  result.qber_threshold
                )}
              />


              <StatCard
                title="Secret Key"
                value={String(
                  result.secret_key_length
                )}
              />

            </section>


            {/* ======================================
                QBER Explanation
            ====================================== */}

            <section
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >

              <h2
                style={{
                  marginTop: 0,
                }}
              >
                ðŸ“ Quantum Bit Error Rate
              </h2>


              <p
                style={{
                  color: "#cbd5e1",
                  lineHeight: 1.7,
                }}
              >
                QBER measures how many of the publicly
                tested sifted bits disagree between Alice
                and Bob.
              </p>


              <div
                style={{
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  padding: "18px",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  marginBottom: "18px",
                }}
              >
                QBER = Test Errors Ã· Test Bits
              </div>


              <div
                style={{
                  height: "14px",
                  background: "#1e293b",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >

                <div
                  style={{
                    width: `${Math.min(
                      result.qber * 100,
                      100
                    )}%`,
                    height: "100%",
                    background:
                      result.qber >=
                      result.qber_threshold
                        ? "#ef4444"
                        : "#22c55e",
                    borderRadius: "999px",
                  }}
                />

              </div>


              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginTop: "8px",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >

                <span>
                  0%
                </span>

                <span>
                  Security threshold:{" "}
                  {formatPercent(
                    result.qber_threshold
                  )}
                </span>

                <span>
                  100%
                </span>

              </div>

            </section>


            {/* ======================================
                Test Key
            ====================================== */}

            <section
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >

              <h2
                style={{
                  marginTop: 0,
                }}
              >
                ðŸ§ª Public Security Test
              </h2>


              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.7,
                }}
              >
                Alice and Bob reveal a small sample of
                their sifted bits. These bits are used
                only to estimate the error rate.
              </p>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >

                <KeyDisplay
                  title="Alice's Test Bits"
                  bits={
                    result.test_alice_bits
                  }
                />


                <KeyDisplay
                  title="Bob's Test Bits"
                  bits={
                    result.test_bob_bits
                  }
                  mismatch={
                    result.test_errors > 0
                  }
                />

              </div>


              <div
                style={{
                  marginTop: "18px",
                  color: "#cbd5e1",
                }}
              >
                Test errors:{" "}
                <strong>
                  {result.test_errors}
                </strong>
              </div>

            </section>


            {/* ======================================
                Secret Key
            ====================================== */}

            <section
              style={{
                background: result.secure
                  ? "#052e16"
                  : "#0f172a",

                border:
                  result.secure
                    ? "1px solid #166534"
                    : "1px solid #1e293b",

                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >

              <h2
                style={{
                  marginTop: 0,
                  color: result.secure
                    ? "#bbf7d0"
                    : "#f8fafc",
                }}
              >
                ðŸ”‘ Final Secret Key
              </h2>


              {result.secure ? (

                <>

                  <p
                    style={{
                      color: "#bbf7d0",
                      lineHeight: 1.7,
                    }}
                  >
                    The tested bits are removed from
                    the candidate key. The remaining
                    matching bits form the candidate
                    secret key.
                  </p>


                  <div
                    style={{
                      background: "#020617",
                      border:
                        "1px solid #166534",
                      borderRadius: "12px",
                      padding: "20px",
                      fontFamily: "monospace",
                      fontSize: "20px",
                      letterSpacing: "5px",
                      wordBreak: "break-all",
                    }}
                  >
                    {result.secret_alice_key.length >
                    0
                      ? result.secret_alice_key.join("")
                      : "No secret bits available"}
                  </div>

                </>

              ) : (

                <p
                  style={{
                    color: "#fca5a5",
                    lineHeight: 1.7,
                    marginBottom: 0,
                  }}
                >
                  The QBER check failed. The candidate
                  key should be discarded instead of
                  being used for secure communication.
                </p>

              )}

            </section>

{/* ======================================
    AI Tutor
====================================== */}

<section
  style={{
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  }}
>
  <h2
    style={{
      marginTop: 0,
      color: "#f8fafc",
    }}
  >
    ðŸ¤– Need Help Understanding BB84?
  </h2>

  <p
    style={{
      color: "#94a3b8",
      lineHeight: 1.7,
    }}
  >
    Ask the AI Tutor to explain this simulation,
    including the QBER, secret key, basis sifting,
    and eavesdropper detection.
  </p>

  <Link
    href={`/tutor?context=${encodeURIComponent(
      JSON.stringify({
        topic: "BB84 Quantum Key Distribution",
        qber: result.qber,
        threshold: result.qber_threshold,
        secure: result.secure,
        eveDetected: result.eve_detected,
        siftedKeyLength: result.sifted_key_length,
        secretKeyLength: result.secret_key_length,
        testErrors: result.test_errors,
      })
    )}`}
    style={{
      display: "inline-block",
      background: "#7c3aed",
      color: "#ffffff",
      textDecoration: "none",
      borderRadius: "8px",
      padding: "11px 20px",
      fontWeight: 600,
    }}
  >
    ðŸ¤– Ask AI Tutor
  </Link>
</section>
            {/* ======================================
                Transmission Table
            ====================================== */}

            <section
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                overflowX: "auto",
              }}
            >

              <h2
                style={{
                  marginTop: 0,
                }}
              >
                ðŸ“Š Quantum Transmission Details
              </h2>


              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.6,
                }}
              >
                Green rows were kept during sifting.
                Test rows were publicly compared.
                Red rows contain detected errors.
              </p>


              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "900px",
                }}
              >

                <thead>

                  <tr>

                    {[
                      "Position",
                      "Alice Bit",
                      "Alice Basis",
                      "Eve Basis",
                      "Bob Basis",
                      "Bob Bit",
                      "Type",
                      "Status",
                    ].map(
                      (heading) => (

                        <th
                          key={heading}
                          style={{
                            textAlign: "left",
                            padding: "12px",
                            borderBottom:
                              "1px solid #334155",
                            color: "#94a3b8",
                            fontSize: "13px",
                          }}
                        >
                          {heading}
                        </th>

                      )
                    )}

                  </tr>

                </thead>


                <tbody>

                  {result.transmission.map(
                    (row) => (

                      <tr
                        key={row.position}
                        style={{
                          background: row.error
                            ? "#450a0a"
                            : row.test_bit
                              ? "#422006"
                              : row.kept
                                ? "#052e16"
                                : "transparent",
                        }}
                      >

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #1e293b",
                          }}
                        >
                          {row.position + 1}
                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #1e293b",
                            fontWeight: 600,
                          }}
                        >
                          {row.alice_bit}
                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #1e293b",
                          }}
                        >
                          {basisSymbol(
                            row.alice_basis
                          )}{" "}
                          {row.alice_basis}
                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #1e293b",
                            color: row.eve_basis
                              ? "#fbbf24"
                              : "#64748b",
                          }}
                        >
                          {basisSymbol(
                            row.eve_basis
                          )}{" "}
                          {row.eve_basis ?? "â€”"}
                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #1e293b",
                          }}
                        >
                          {basisSymbol(
                            row.bob_basis
                          )}{" "}
                          {row.bob_basis}
                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #1e293b",
                            fontWeight: 600,
                          }}
                        >
                          {row.bob_bit}
                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #1e293b",
                          }}
                        >

                          {row.test_bit ? (
                            <span
                              style={{
                                color: "#fbbf24",
                              }}
                            >
                              ðŸ§ª Test
                            </span>
                          ) : row.kept ? (
                            <span
                              style={{
                                color: "#4ade80",
                              }}
                            >
                              ðŸ”‘ Key
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "#64748b",
                              }}
                            >
                              Discarded
                            </span>
                          )}

                        </td>


                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #1e293b",
                          }}
                        >

                          {row.error ? (

                            <span
                              style={{
                                color: "#f87171",
                                fontWeight: 600,
                              }}
                            >
                              âŒ Error
                            </span>

                          ) : row.kept ? (

                            <span
                              style={{
                                color: "#4ade80",
                              }}
                            >
                              âœ“ Match
                            </span>

                          ) : (

                            <span
                              style={{
                                color: "#64748b",
                              }}
                            >
                              â€”
                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </section>


            {/* ======================================
                Steps
            ====================================== */}

            <section
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >

              <h2
                style={{
                  marginTop: 0,
                }}
              >
                ðŸ§  Step-by-Step BB84
              </h2>


              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >

                {result.steps.map(
                  (step) => (

                    <div
                      key={step.step}
                      style={{
                        display: "flex",
                        gap: "18px",
                        padding: "18px",
                        background: "#020617",
                        borderRadius: "12px",
                        border:
                          "1px solid #1e293b",
                      }}
                    >

                      <div
                        style={{
                          minWidth: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "#1d4ed8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {step.step}
                      </div>


                      <div>

                        <h3
                          style={{
                            marginTop: 0,
                            marginBottom: "6px",
                            color: "#f8fafc",
                          }}
                        >
                          {step.title}
                        </h3>


                        <p
                          style={{
                            margin: 0,
                            color: "#94a3b8",
                            lineHeight: 1.6,
                          }}
                        >
                          {step.description}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>


            {/* ======================================
                Workflow
            ====================================== */}

            <section
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "32px",
              }}
            >

              <h2
                style={{
                  marginTop: 0,
                }}
              >
                ðŸ”„ BB84 Workflow
              </h2>


              <ol
                style={{
                  paddingLeft: "24px",
                  color: "#cbd5e1",
                  lineHeight: 1.9,
                }}
              >

                {result.workflow.map(
                  (item, index) => (

                    <li
                      key={index}
                    >
                      {item}
                    </li>

                  )
                )}

              </ol>

            </section>


            {/* ======================================
                BB84 Knowledge Challenge
            ====================================== */}

            <section
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color: "#f8fafc",
                }}
              >
                ðŸ§© BB84 Knowledge Challenge
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.7,
                }}
              >
                Test your understanding of the BB84 protocol.
              </p>

              <div
                style={{
                  background: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  padding: "20px",
                  marginTop: "18px",
                }}
              >
                <h3
                  style={{
                    color: "#f8fafc",
                    marginTop: 0,
                  }}
                >
                  What does a high QBER usually indicate?
                </h3>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {[
                    "The quantum channel is perfectly secure",
                    "The qubits were measured faster",
                    "The quantum channel may have been disturbed",
                    "Alice generated more bits",
                  ].map((option, index) => (
                    <button
                      key={option}
                      onClick={() => answerQuiz(index)}
                      disabled={quizCompleted}
                      style={{
                        textAlign: "left",
                        padding: "13px 16px",
                        borderRadius: "8px",
                        border: "1px solid #334155",
                        background: "#111827",
                        color: "#e2e8f0",
                        cursor: quizCompleted ? "default" : "pointer",
                        opacity: quizCompleted ? 0.8 : 1,
                      }}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>

                {quizScore !== null && (
                  <div
                    style={{
                      marginTop: "18px",
                      padding: "14px",
                      borderRadius: "10px",
                      background: quizScore === 100 ? "#052e16" : "#451a03",
                      color: quizScore === 100 ? "#86efac" : "#fdba74",
                    }}
                  >
                    {quizScore === 100 ? (
                      <>
                        ðŸŽ‰ Correct! A high QBER can indicate disturbance or eavesdropping.
                        <br />
                        <strong>+50 XP</strong>
                      </>
                    ) : (
                      <>
                        âŒ Not quite. A high QBER indicates that the quantum channel may have been disturbed. Try again!
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

          </>

        )}


        {/* ==========================================
            Initial Cards
        ========================================== */}

        {!result && (

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "18px",
            }}
          >

            <InfoCard
              icon="ðŸ‘©"
              title="Alice"
              text="Creates random bits and randomly selects Z or X bases to encode the quantum states."
            />


            <InfoCard
              icon="âš›ï¸"
              title="Quantum Channel"
              text="Carries the quantum states from Alice to Bob. Measuring a quantum state can disturb it."
            />


            <InfoCard
              icon="ðŸ•µï¸"
              title="Eve"
              text="An eavesdropper who may intercept and measure quantum states before sending them onward."
            />


            <InfoCard
              icon="ðŸ‘¨"
              title="Bob"
              text="Randomly chooses measurement bases and measures the incoming quantum states."
            />

          </section>

        )}


        {/* ==========================================
            Navigation
        ========================================== */}

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "36px",
            flexWrap: "wrap",
          }}
        >

          <Link
            href="/algorithms/qft"
            style={{
              color: "#93c5fd",
              textDecoration: "none",
            }}
          >
            â† Quantum Fourier Transform
          </Link>


          <Link
            href="/algorithms/shor"
            style={{
              color: "#93c5fd",
              textDecoration: "none",
            }}
          >
            Shor's Algorithm â†’
          </Link>

        </div>

      </div>

    </main>
  );
}


// ==================================================
// Protocol Node
// ==================================================

function ProtocolNode(
  {
    icon,
    title,
    description,
    active = false,
  }: {
    icon: string;
    title: string;
    description: string;
    active?: boolean;
  }
) {

  return (

    <div
      style={{
        textAlign: "center",
        background: "#020617",
        border:
          active
            ? "1px solid #2563eb"
            : "1px solid #334155",
        borderRadius: "14px",
        padding: "22px",
      }}
    >

      <div
        style={{
          fontSize: "40px",
          marginBottom: "10px",
        }}
      >
        {icon}
      </div>


      <h3
        style={{
          margin: "0 0 6px",
          color: "#f8fafc",
        }}
      >
        {title}
      </h3>


      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        {description}
      </div>

    </div>

  );
}


// ==================================================
// Flow Card
// ==================================================

function FlowCard(
  {
    number,
    title,
    text,
  }: {
    number: string;
    title: string;
    text: string;
  }
) {

  return (

    <div
      style={{
        background: "#020617",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        padding: "16px",
      }}
    >

      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#1d4ed8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 700,
          marginBottom: "10px",
        }}
      >
        {number}
      </div>


      <h4
        style={{
          margin: "0 0 6px",
          color: "#f8fafc",
        }}
      >
        {title}
      </h4>


      <p
        style={{
          margin: 0,
          color: "#94a3b8",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        {text}
      </p>

    </div>

  );
}


// ==================================================
// Stat Card
// ==================================================

function StatCard(
  {
    title,
    value,
  }: {
    title: string;
    value: string;
  }
) {

  return (

    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "14px",
        padding: "20px",
      }}
    >

      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>


      <div
        style={{
          color: "#f8fafc",
          fontSize: "28px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>

    </div>

  );
}


// ==================================================
// Key Display
// ==================================================

function KeyDisplay(
  {
    title,
    bits,
    mismatch = false,
  }: {
    title: string;
    bits: number[];
    mismatch?: boolean;
  }
) {

  return (

    <div>

      <h3
        style={{
          marginTop: 0,
          color: mismatch
            ? "#fca5a5"
            : "#cbd5e1",
        }}
      >
        {title}
      </h3>


      <div
        style={{
          background: "#020617",
          border:
            mismatch
              ? "1px solid #7f1d1d"
              : "1px solid #334155",
          borderRadius: "10px",
          padding: "16px",
          fontFamily: "monospace",
          fontSize: "18px",
          letterSpacing: "4px",
          wordBreak: "break-all",
        }}
      >

        {bits.length > 0
          ? bits.join("")
          : "No bits available"}

      </div>

    </div>

  );
}


// ==================================================
// Information Card
// ==================================================

function InfoCard(
  {
    icon,
    title,
    text,
  }: {
    icon: string;
    title: string;
    text: string;
  }
) {

  return (

    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "14px",
        padding: "22px",
      }}
    >

      <div
        style={{
          fontSize: "30px",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>


      <h3
        style={{
          marginTop: 0,
          color: "#f8fafc",
        }}
      >
        {title}
      </h3>


      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.7,
          marginBottom: 0,
        }}
      >
        {text}
      </p>

    </div>

  );
}


