"use client";

import Link from "next/link";

const algorithms = [
  {
    name: "Deutsch–Jozsa",
    description:
      "Determine whether a function is constant or balanced using quantum parallelism.",
    difficulty: "Intermediate",
    href: "/algorithms/deutsch-jozsa",
    icon: "🧠",
    available: true,
  },
  {
    name: "Grover's Algorithm",
    description:
      "Learn how quantum search can find a target item faster than classical brute-force search.",
    difficulty: "Intermediate",
    href: "/algorithms/grover",
    icon: "🔎",
    available: true,
  },
  {
    name: "Quantum Teleportation",
    description:
      "Understand how an unknown quantum state can be transferred using entanglement and classical communication.",
    difficulty: "Intermediate",
    href: "/algorithms/quantum-teleportation",
    icon: "⚛️",
    available: true,
  },
  {
    name: "Quantum Fourier Transform",
    description:
      "Learn how quantum states can be transformed using phase relationships and the quantum Fourier transform.",
    difficulty: "Advanced",
    href: "/algorithms/qft",
    icon: "〰️",
    available: true,
  },
  {
    name: "Shor's Algorithm",
    description:
      "Explore how quantum computers can use period finding to factor large integers.",
    difficulty: "Advanced",
    href: "/algorithms/shor",
    icon: "🔐",
    available: true,
  },
  {
    name: "BB84 Quantum Key Distribution",
    description:
      "Learn how quantum mechanics can create a shared secret key and detect eavesdropping.",
    difficulty: "Advanced",
    href: "/algorithms/bb84",
    icon: "🔑",
    available: true,
  },
];

const topics = [
  {
    title: "Quantum Gates",
    description:
      "Learn how fundamental gates manipulate qubits.",
    icon: "⚙️",
  },
  {
    title: "Superposition",
    description:
      "Understand how qubits can exist in combinations of states.",
    icon: "🌌",
  },
  {
    title: "Entanglement",
    description:
      "Explore correlations between quantum systems.",
    icon: "🔗",
  },
  {
    title: "Measurement",
    description:
      "Understand how quantum states become classical outcomes.",
    icon: "📊",
  },
  {
    title: "Hadamard",
    description:
      "Create quantum superposition using the H gate.",
    icon: "H",
  },
  {
    title: "Phase Rotation",
    description:
      "Learn how controlled phase operations manipulate quantum states.",
    icon: "θ",
  },
  {
    title: "Fourier Transform",
    description:
      "Understand the quantum Fourier transform and its role in quantum algorithms.",
    icon: "〰️",
  },
  {
    title: "Quantum Cryptography",
    description:
      "Learn how quantum mechanics can be used to establish secure communication.",
    icon: "🔐",
  },
];

const learningPath = [
  {
    step: 1,
    title: "Deutsch–Jozsa",
    description:
      "Start with quantum parallelism and oracle-based computation.",
    href: "/algorithms/deutsch-jozsa",
  },
  {
    step: 2,
    title: "Grover's Algorithm",
    description:
      "Learn quantum search and amplitude amplification.",
    href: "/algorithms/grover",
  },
  {
    step: 3,
    title: "Quantum Teleportation",
    description:
      "Understand entanglement and quantum state transfer.",
    href: "/algorithms/quantum-teleportation",
  },
  {
    step: 4,
    title: "Quantum Fourier Transform",
    description:
      "Learn the Fourier transform that powers important quantum algorithms.",
    href: "/algorithms/qft",
  },
  {
    step: 5,
    title: "BB84",
    description:
      "Explore quantum key distribution and eavesdropper detection.",
    href: "/algorithms/bb84",
  },
  {
    step: 6,
    title: "Shor's Algorithm",
    description:
      "Apply period finding and the QFT to integer factorization.",
    href: "/algorithms/shor",
  },
];

export default function AlgorithmsPage() {
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
        {/* Header */}
        <section
          style={{
            marginBottom: "42px",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Back to Home
          </Link>

          <h1
            style={{
              fontSize: "42px",
              color: "#f8fafc",
              marginTop: "20px",
              marginBottom: "12px",
            }}
          >
            ⚛️ Quantum Algorithms
          </h1>

          <p
            style={{
              maxWidth: "800px",
              color: "#94a3b8",
              fontSize: "17px",
              lineHeight: 1.7,
            }}
          >
            Explore interactive simulations of important quantum
            algorithms and learn how quantum computing solves
            problems using superposition, entanglement, phase,
            and measurement.
          </p>
        </section>

        {/* Algorithm Cards */}
        <section>
          <h2
            style={{
              color: "#f8fafc",
              marginBottom: "18px",
            }}
          >
            Interactive Algorithms
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            {algorithms.map((algorithm) => (
              <Link
                key={algorithm.name}
                href={algorithm.href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "16px",
                    padding: "24px",
                    transition:
                      "transform 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "36px",
                      marginBottom: "16px",
                    }}
                  >
                    {algorithm.icon}
                  </div>

                  <div
                    style={{
                      display: "inline-block",
                      padding: "5px 9px",
                      borderRadius: "999px",
                      background: "#172554",
                      color: "#93c5fd",
                      fontSize: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    {algorithm.difficulty}
                  </div>

                  <h3
                    style={{
                      margin: "0 0 10px",
                      color: "#f8fafc",
                    }}
                  >
                    {algorithm.name}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#94a3b8",
                      lineHeight: 1.7,
                      fontSize: "14px",
                    }}
                  >
                    {algorithm.description}
                  </p>

                  <div
                    style={{
                      marginTop: "20px",
                      color: "#60a5fa",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Explore Algorithm →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Core Topics */}
        <section
          style={{
            marginTop: "50px",
          }}
        >
          <h2
            style={{
              color: "#f8fafc",
              marginBottom: "18px",
            }}
          >
            Core Quantum Topics
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {topics.map((topic) => (
              <div
                key={topic.title}
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    marginBottom: "10px",
                  }}
                >
                  {topic.icon}
                </div>

                <h3
                  style={{
                    marginTop: 0,
                    color: "#f8fafc",
                  }}
                >
                  {topic.title}
                </h3>

                <p
                  style={{
                    color: "#94a3b8",
                    lineHeight: 1.6,
                    fontSize: "14px",
                    marginBottom: 0,
                  }}
                >
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Path */}
        <section
          style={{
            marginTop: "50px",
            marginBottom: "40px",
          }}
        >
          <h2
            style={{
              color: "#f8fafc",
              marginBottom: "18px",
            }}
          >
            🗺️ Recommended Learning Path
          </h2>

          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {learningPath.map((item) => (
              <Link
                key={item.step}
                href={item.href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    alignItems: "center",
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "14px",
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#1d4ed8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    {item.step}
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: "0 0 5px",
                        color: "#f8fafc",
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}




