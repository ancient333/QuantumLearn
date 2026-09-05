"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

const algorithms = [
  {
    name: "Deutschâ€“Jozsa",
    description:
      "Determine whether a function is constant or balanced using quantum parallelism.",
    difficulty: "Beginner",
    href: "/algorithms/deutsch-jozsa",
    available: true,
  },
  {
    name: "Grover's Algorithm",
    description:
      "Explore quantum search and amplitude amplification to find a target state.",
    difficulty: "Intermediate",
    href: "/algorithms/grover",
    available: true,
  },
  {
    name: "Quantum Teleportation",
    description:
      "Learn how a quantum state can be transferred using entanglement and classical communication.",
    difficulty: "Intermediate",
    href: "/algorithms/quantum-teleportation",
    available: true,
  },
  {
    name: "Quantum Fourier Transform",
    description:
      "Learn how quantum states can be transformed using phase relationships and the quantum Fourier transform.",
    difficulty: "Advanced",
    href: "/algorithms/qft",
    available: true,
  },
  {
    name: "Shor's Algorithm",
    description:
      "Explore how quantum computers can use period finding to factor integers.",
    difficulty: "Advanced",
    href: "/algorithms/shor",
    available: true,
  },
  {
    name: "BB84 Quantum Key Distribution",
    description:
      "Learn how quantum mechanics can establish a shared secret key and detect eavesdropping.",
    difficulty: "Advanced",
    href: "/algorithms/bb84",
    available: true,
  },
];

export default function LearningHub() {
  const [progress, setProgress] = useState<LearningProgress>({
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
  });

  useEffect(() => {
    const storedProgress =
      localStorage.getItem("quantumLearningProgress");

    if (storedProgress) {
      try {
        setProgress({
          completedAlgorithms: [],
          tutorUsed: false,
          labUsed: false,
          gatesExplored: [],
          simulationsRun: 0,
          lastGate: "",
          ...JSON.parse(storedProgress),
        });
      } catch {
        console.error(
          "Could not load learning progress."
        );
      }
    }
  }, []);

  // BB84 was previously stored as "BB84".
  // Normalize that old value so existing progress is preserved.
  const normalizedCompletedAlgorithms = Array.from(
    new Set(
      (progress.completedAlgorithms || []).map(
        (algorithmName) =>
          algorithmName === "BB84"
            ? "BB84 Quantum Key Distribution"
            : algorithmName
      )
    )
  );

  const completedCount = algorithms.filter(
    (algorithm) =>
      normalizedCompletedAlgorithms.includes(
        algorithm.name
      )
  ).length;

  const algorithmCount = algorithms.length;

  const algorithmProgress =
    algorithmCount > 0
      ? Math.round(
          (completedCount / algorithmCount) * 100
        )
      : 0;

  const gatesCount =
    progress.gatesExplored?.length || 0;

  const totalProgressItems = 3;

  let completedProgressItems = 0;

  if (progress.labUsed) {
    completedProgressItems += 1;
  }

  if (progress.tutorUsed) {
    completedProgressItems += 1;
  }

  if (completedCount > 0) {
    completedProgressItems += 1;
  }

  const overallProgress = Math.round(
    (completedProgressItems / totalProgressItems) * 100
  );

  let recommendation = {
    title: "Start with the Quantum Lab",
    description:
      "Explore your first quantum gate and see how a quantum state changes.",
    href: "/dashboard",
    button: "Open Quantum Lab",
  };

  if (progress.labUsed && !progress.tutorUsed) {
    recommendation = {
      title: "Ask the AI Tutor",
      description:
        "You have explored the Quantum Lab. Now ask the AI Tutor to explain what you observed.",
      href: "/tutor",
      button: "Open AI Tutor",
    };
  }

  if (
    progress.labUsed &&
    progress.tutorUsed &&
    completedCount === 0
  ) {
    recommendation = {
      title: "Try Your First Algorithm",
      description:
        "Use Deutschâ€“Jozsa to connect quantum gates with a complete quantum algorithm.",
      href: "/algorithms/deutsch-jozsa",
      button: "Explore Deutschâ€“Jozsa",
    };
  }

  if (
    completedCount > 0 &&
    completedCount < algorithmCount
  ) {
    const nextAlgorithm =
      algorithms.find(
        (algorithm) =>
          !normalizedCompletedAlgorithms.includes(
            algorithm.name
          )
      );

    if (nextAlgorithm) {
      recommendation = {
        title: `Continue with ${nextAlgorithm.name}`,
        description:
          nextAlgorithm.description,
        href: nextAlgorithm.href,
        button: "Continue Learning",
      };
    }
  }

  if (completedCount === algorithmCount) {
    recommendation = {
      title: "Test Your Knowledge",
      description:
        "You have explored all available algorithms. Take the Quantum Quiz to test your understanding.",
      href: "/quiz",
      button: "Take Quantum Quiz",
    };
  }

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">

          <Link
            href="/"
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
              className="text-cyan-400 transition hover:text-cyan-300"
            >
              Learning Hub
            </Link>

            <Link
              href="/algorithms"
              className="transition hover:text-white"
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

        <header className="py-12">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Learning Hub
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Learn Quantum Computing
              <span className="text-cyan-400">
                {" "}Interactively.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
              Build your quantum knowledge through
              interactive simulations, algorithms,
              AI explanations, and practice quizzes.
            </p>

          </div>

        </header>


        {/* ==================================================
            PROGRESS OVERVIEW
        ================================================== */}

        <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-sm text-slate-500">
              Overall Progress
            </p>

            <div className="mt-3 flex items-end justify-between">

              <p className="text-3xl font-bold">
                {overallProgress}%
              </p>

              <span className="text-sm text-cyan-400">
                Learning
              </span>

            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full rounded-full bg-cyan-400 transition-all"
                style={{
                  width: `${overallProgress}%`,
                }}
              />

            </div>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-sm text-slate-500">
              Algorithms Completed
            </p>

            <p className="mt-3 text-3xl font-bold">
              {completedCount}
              <span className="ml-1 text-lg text-slate-500">
                / {algorithmCount}
              </span>
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {algorithmProgress}% complete
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-sm text-slate-500">
              Gates Explored
            </p>

            <p className="mt-3 text-3xl font-bold">
              {gatesCount}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Quantum Lab
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-sm text-slate-500">
              Simulations
            </p>

            <p className="mt-3 text-3xl font-bold">
              {progress.simulationsRun || 0}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Experiments performed
            </p>

          </div>

        </section>


        {/* ==================================================
            RECOMMENDATION
        ================================================== */}

        <section className="mb-10 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-400/[0.08] to-blue-500/[0.04] p-7">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Recommended Next
              </div>

              <h2 className="text-2xl font-bold">
                {recommendation.title}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {recommendation.description}
              </p>

            </div>

            <Link
              href={recommendation.href}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              {recommendation.button}
            </Link>

          </div>

        </section>


        {/* ==================================================
            BB84 LEARNING ANALYTICS
        ================================================== */}

        <section className="mb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              BB84 Learning Performance
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Track your progress in the BB84 quantum
              cryptography challenge.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-slate-500">
                Challenge Status
              </p>

              <p className="mt-3 text-2xl font-bold">
                {progress.bb84QuizCompleted
                  ? "âœ“ Completed"
                  : "Not Completed"}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                BB84 Knowledge Challenge
              </p>
            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-slate-500">
                BB84 Score
              </p>

              <p className="mt-3 text-3xl font-bold">
                {progress.bb84QuizScore || 0}
                <span className="ml-1 text-lg text-slate-500">
                  / 100
                </span>
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Latest challenge score
              </p>
            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-slate-500">
                Challenge Attempts
              </p>

              <p className="mt-3 text-3xl font-bold">
                {progress.bb84QuizAttempts || 0}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                BB84 attempts
              </p>
            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-slate-500">
                Quizzes Completed
              </p>

              <p className="mt-3 text-3xl font-bold">
                {progress.quizzesCompleted || 0}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Learning challenges
              </p>
            </div>

          </div>


          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">
                  BB84 Challenge
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {progress.bb84QuizCompleted
                    ? "Great work â€” you understand the core security concept."
                    : "Complete the BB84 Knowledge Challenge to measure your understanding."}
                </h3>
              </div>

              <Link
                href="/algorithms/bb84"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                {progress.bb84QuizCompleted
                  ? "Review BB84 â†’"
                  : "Take Challenge â†’"}
              </Link>

            </div>
          </div>

        </section>


        {/* ==================================================
            ACHIEVEMENTS & BADGES
        ================================================== */}

        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Achievements & Badges</h2>
            <p className="mt-2 text-sm text-slate-500">
              Earn badges as you explore the QuantumLearn platform.
            </p>
          </div>

          {(() => {
            const achievements = [
              {
                title: "Quantum Explorer",
                description: "Open the Quantum Lab and explore your first gate.",
                icon: "âš›ï¸",
                unlocked: progress.labUsed,
              },
              {
                title: "Simulation Starter",
                description: "Run your first quantum simulation.",
                icon: "â–¶ï¸",
                unlocked: (progress.simulationsRun || 0) > 0,
              },
              {
                title: "Algorithm Explorer",
                description: "Complete your first quantum algorithm.",
                icon: "ðŸ§ ",
                unlocked: completedCount > 0,
              },
              {
                title: "Quantum Scholar",
                description: "Use the AI Tutor to deepen your understanding.",
                icon: "ðŸŽ“",
                unlocked: progress.tutorUsed,
              },
              {
                title: "BB84 Defender",
                description: "Complete the BB84 Knowledge Challenge.",
                icon: "ðŸ”",
                unlocked: Boolean(progress.bb84QuizCompleted),
              },
              {
                title: "Quantum Master",
                description: "Complete every available quantum algorithm.",
                icon: "ðŸ†",
                unlocked: completedCount === algorithmCount,
              },
            ];

            const unlockedCount = achievements.filter(
              (achievement) => achievement.unlocked
            ).length;

            return (
              <>
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <div>
                    <p className="text-sm text-slate-500">
                      Badges unlocked
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {unlockedCount} / {achievements.length}
                    </p>
                  </div>

                  <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                      style={{
                        width: `${(unlockedCount / achievements.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.title}
                      className={`rounded-2xl border p-6 transition ${
                        achievement.unlocked
                          ? "border-cyan-400/20 bg-cyan-400/[0.04]"
                          : "border-white/10 bg-white/[0.02] opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                            achievement.unlocked
                              ? "bg-cyan-400/10"
                              : "bg-white/5 grayscale"
                          }`}
                        >
                          {achievement.icon}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            achievement.unlocked
                              ? "bg-cyan-400/10 text-cyan-300"
                              : "bg-white/5 text-slate-500"
                          }`}
                        >
                          {achievement.unlocked ? "Unlocked" : "Locked"}
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-bold">
                        {achievement.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {achievement.description}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </section>


        {/* ==================================================
            CORE LEARNING TOOLS
        ================================================== */}

        <section className="mb-12">

          <div className="mb-6">

            <h2 className="text-2xl font-bold">
              Interactive Learning
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Learn by experimenting, asking questions,
              and testing your understanding.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">


            {/* Quantum Lab */}

            <Link
              href="/dashboard"
              className="group rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/[0.04]"
            >

              <div className="flex items-center justify-between">

                <span className="text-3xl">
                  âš›
                </span>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                  Interactive
                </span>

              </div>

              <h3 className="mt-6 text-2xl font-bold transition group-hover:text-cyan-300">
                Quantum Lab
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Experiment with quantum gates,
                execute circuits, and observe real
                measurement results from Qiskit simulations.
              </p>

              <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition group-hover:border-cyan-400/30 group-hover:text-cyan-300">
                Open Quantum Lab â†’
              </div>

            </Link>


            {/* AI Tutor */}

            <Link
              href="/tutor"
              className="group rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-purple-400/40 hover:bg-purple-400/[0.04]"
            >

              <div className="flex items-center justify-between">

                <span className="text-3xl">
                  ðŸ¤–
                </span>

                <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-xs font-semibold text-purple-300">
                  AI Powered
                </span>

              </div>

              <h3 className="mt-6 text-2xl font-bold transition group-hover:text-purple-300">
                AI Quantum Tutor
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Ask questions about qubits, gates,
                superposition, algorithms, circuits,
                mathematics, and quantum programming.
              </p>

              <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition group-hover:border-purple-400/30 group-hover:text-purple-300">
                Ask AI Tutor â†’
              </div>

            </Link>


            {/* Quiz */}

            <Link
              href="/quiz"
              className="group rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/[0.04]"
            >

              <div className="flex items-center justify-between">

                <span className="text-3xl">
                  ðŸ§ 
                </span>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                  Practice
                </span>

              </div>

              <h3 className="mt-6 text-2xl font-bold transition group-hover:text-cyan-300">
                Quantum Quiz
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Test your understanding of quantum
                concepts, gates, algorithms,
                measurement, and teleportation.
              </p>

              <div className="mt-6 inline-flex rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition group-hover:bg-cyan-400/20">
                Start Quiz â†’
              </div>

            </Link>

          </div>

        </section>


        {/* ==================================================
            ALGORITHM EXPLORER
        ================================================== */}

        <section className="mb-12">

          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Algorithm Explorer
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Learn quantum algorithms through
                visual explanations and simulations.
              </p>

            </div>

            <Link
              href="/algorithms"
              className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              View All Algorithms â†’
            </Link>

          </div>


          <div className="grid gap-5 lg:grid-cols-3">

            {algorithms.map((algorithm) => {

              const completed =
                normalizedCompletedAlgorithms.includes(
                  algorithm.name
                );

              return (
                <Link
                  key={algorithm.name}
                  href={algorithm.href}
                  className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]"
                >

                  <div className="flex items-center justify-between">

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                      {algorithm.difficulty}
                    </span>

                    {completed && (
                      <span className="text-xs font-semibold text-emerald-400">
                        âœ“ Completed
                      </span>
                    )}

                  </div>

                  <h3 className="mt-6 text-xl font-bold transition group-hover:text-cyan-300">
                    {algorithm.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {algorithm.description}
                  </p>

                  <div className="mt-6 text-sm font-semibold text-slate-300 transition group-hover:text-cyan-300">
                    {completed
                      ? "Review Algorithm â†’"
                      : "Start Learning â†’"}
                  </div>

                </Link>
              );
            })}

          </div>

        </section>


        {/* ==================================================
            LEARNING ROADMAP
        ================================================== */}

        <section className="mb-12">

          <div className="mb-6">

            <h2 className="text-2xl font-bold">
              Quantum Learning Roadmap
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Build your understanding from the
              fundamentals toward quantum algorithms.
            </p>

          </div>


          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              {[
                "Quantum Basics",
                "Qubits & States",
                "Superposition",
                "Measurement",
                "Quantum Gates",
                "Quantum Circuits",
                "Entanglement",
                "Quantum Algorithms",
              ].map((topic, index) => (

                <div
                  key={topic}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                >

                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-bold text-cyan-400">
                    {index + 1}
                  </div>

                  <h3 className="font-semibold">
                    {topic}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Build the concepts needed for
                    the next stage of your quantum journey.
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* ==================================================
            QUICK ACCESS
        ================================================== */}

        <section className="border-t border-white/10 pt-8">

          <div className="flex flex-wrap items-center gap-3">

            <span className="mr-2 text-sm text-slate-500">
              Quick access:
            </span>

            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              Quantum Lab
            </Link>

            <Link
              href="/algorithms"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              Algorithms
            </Link>

            <Link
              href="/quiz"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              Quiz
            </Link>

            <Link
              href="/tutor"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:border-purple-400/30 hover:text-purple-300"
            >
              AI Tutor
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


