"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type LearningProgress = {
  completedAlgorithms: string[];
  tutorUsed: boolean;
  labUsed: boolean;
  gatesExplored: string[];
  simulationsRun: number;
  lastGate?: string;
  xp?: number;
  quizXP?: number;
  quizScore?: number;
  quizzesCompleted?: number;
  bb84QuizCompleted?: boolean;
  bb84QuizScore?: number;
  bb84QuizAttempts?: number;
  topicPerformance?: Record<
    string,
    {
      correct: number;
      total: number;
      score: number;
    }
  >;
};

const algorithms = [
  {
    name: "Deutsch–Jozsa",
    href: "/algorithms/deutsch-jozsa",
  },
  {
    name: "Grover's Algorithm",
    href: "/algorithms/grover",
  },
  {
    name: "Quantum Teleportation",
    href: "/algorithms/quantum-teleportation",
  },
  {
    name: "Quantum Fourier Transform",
    href: "/algorithms/qft",
  },
  {
    name: "Shor's Algorithm",
    href: "/algorithms/shor",
  },
  {
    name: "BB84 Quantum Key Distribution",
    href: "/algorithms/bb84",
  },
];

const badges = [
  {
    name: "Quantum Explorer",
    icon: "⚛️",
    description: "Used the Quantum Lab.",
    unlocked: (p: LearningProgress) => !!p.labUsed,
  },
  {
    name: "Simulation Starter",
    icon: "▶️",
    description: "Ran at least one simulation.",
    unlocked: (p: LearningProgress) =>
      (p.simulationsRun || 0) > 0,
  },
  {
    name: "Algorithm Explorer",
    icon: "🧠",
    description: "Completed at least one algorithm.",
    unlocked: (p: LearningProgress) =>
      (p.completedAlgorithms || []).length > 0,
  },
  {
    name: "Quantum Scholar",
    icon: "🎓",
    description: "Used the AI Tutor.",
    unlocked: (p: LearningProgress) => !!p.tutorUsed,
  },
  {
    name: "BB84 Defender",
    icon: "🔐",
    description: "Completed the BB84 challenge.",
    unlocked: (p: LearningProgress) =>
      !!p.bb84QuizCompleted,
  },
];

function getLevel(xp: number) {
  return Math.floor(xp / 500) + 1;
}

function getLevelTitle(level: number) {
  if (level >= 10) return "Quantum Expert";
  if (level >= 7) return "Quantum Algorithmist";
  if (level >= 4) return "Circuit Builder";
  if (level >= 2) return "Qubit Explorer";
  return "Quantum Beginner";
}

export default function ProgressDashboard() {
  const [progress, setProgress] =
    useState<LearningProgress>({
      completedAlgorithms: [],
      tutorUsed: false,
      labUsed: false,
      gatesExplored: [],
      simulationsRun: 0,
      lastGate: "",
      xp: 0,
      quizXP: 0,
      quizScore: 0,
      quizzesCompleted: 0,
      bb84QuizCompleted: false,
      bb84QuizScore: 0,
      bb84QuizAttempts: 0,
      topicPerformance: {},
    });

  useEffect(() => {
    const storedProgress = localStorage.getItem(
      "quantumLearningProgress"
    );

    if (!storedProgress) return;

    try {
      setProgress((current) => ({
        ...current,
        ...JSON.parse(storedProgress),
      }));
    } catch {
      console.error(
        "Could not load learning progress."
      );
    }
  }, []);

  const xp = progress.xp || 0;
  const level = getLevel(xp);
  const levelTitle = getLevelTitle(level);

  const xpIntoLevel = xp % 500;
  const levelProgress = Math.round(
    (xpIntoLevel / 500) * 100
  );
  const xpToNextLevel = 500 - xpIntoLevel;

  const completedAlgorithms = useMemo(() => {
    const names = new Set(
      progress.completedAlgorithms || []
    );

    if (names.has("BB84")) {
      names.add(
        "BB84 Quantum Key Distribution"
      );
    }

    return names;
  }, [progress.completedAlgorithms]);

  const completedCount = algorithms.filter(
    (algorithm) =>
      completedAlgorithms.has(algorithm.name)
  ).length;

  const algorithmProgress =
    algorithms.length > 0
      ? Math.round(
          (completedCount / algorithms.length) * 100
        )
      : 0;

  const quizzesCompleted =
    progress.quizzesCompleted || 0;

  const quizScore = progress.quizScore || 0;
  const bb84Score =
    progress.bb84QuizScore || 0;

  const unlockedBadges = badges.filter(
    (badge) => badge.unlocked(progress)
  );

  const nextAlgorithm = algorithms.find(
    (algorithm) =>
      !completedAlgorithms.has(algorithm.name)
  );

  const overallItems = [
    progress.labUsed,
    progress.tutorUsed,
    completedCount > 0,
    quizzesCompleted > 0,
    unlockedBadges.length > 0,
  ];

  const overallProgress = Math.round(
    (overallItems.filter(Boolean).length /
      overallItems.length) *
      100
  );

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* NAVIGATION */}

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
              className="transition hover:text-white"
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
              href="/quantum-lab"
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

            <Link
              href="/progress"
              className="text-cyan-400"
            >
              Progress
            </Link>

          </div>

        </nav>


        {/* HEADER */}

        <header className="py-10">

          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Student Dashboard
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            Welcome back,
            <span className="text-cyan-400">
              {" "}Quantum Explorer
            </span>
          </h1>

          <p className="mt-4 max-w-3xl text-slate-400">
            Track your quantum learning journey,
            achievements, simulations, algorithms,
            and quiz performance in one place.
          </p>

        </header>


        {/* LEVEL + XP */}

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.04] p-7">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">
                  Current Level
                </p>

                <h2 className="mt-2 text-4xl font-bold">
                  Level {level}
                </h2>

                <p className="mt-2 text-slate-400">
                  {levelTitle}
                </p>

              </div>

              <div className="text-left md:text-right">

                <p className="text-sm text-slate-500">
                  Total XP
                </p>

                <p className="mt-1 text-4xl font-bold text-cyan-300">
                  {xp}
                </p>

              </div>

            </div>

            <div className="mt-7">

              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Level progress
                </span>

                <span>
                  {levelProgress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full rounded-full bg-cyan-400 transition-all"
                  style={{
                    width: `${levelProgress}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-sm text-slate-500">
                {xpToNextLevel} XP needed
                for the next level.
              </p>

            </div>

          </div>


          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Overall Progress
            </p>

            <div className="mt-4 flex items-end justify-between">

              <p className="text-5xl font-bold">
                {overallProgress}%
              </p>

              <span className="text-sm text-slate-500">
                Learning journey
              </span>

            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full rounded-full bg-cyan-400 transition-all"
                style={{
                  width: `${overallProgress}%`,
                }}
              />

            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Keep exploring the Lab, Tutor,
              algorithms, and quizzes to increase
              your overall progress.
            </p>

          </div>

        </section>


        {/* STATISTICS */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-sm text-slate-500">
              Algorithms
            </p>

            <p className="mt-2 text-3xl font-bold">
              {completedCount}
              <span className="text-lg text-slate-500">
                /6
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {algorithmProgress}%
              completed
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-sm text-slate-500">
              Simulations
            </p>

            <p className="mt-2 text-3xl font-bold">
              {progress.simulationsRun || 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Circuit runs
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-sm text-slate-500">
              Gates Explored
            </p>

            <p className="mt-2 text-3xl font-bold">
              {progress.gatesExplored?.length || 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Unique gates
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-sm text-slate-500">
              Quizzes
            </p>

            <p className="mt-2 text-3xl font-bold">
              {quizzesCompleted}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Completed
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-sm text-slate-500">
              Badges
            </p>

            <p className="mt-2 text-3xl font-bold">
              {unlockedBadges.length}
              <span className="text-lg text-slate-500">
                /{badges.length}
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Unlocked
            </p>

          </div>

        </section>


        {/* CONTINUE LEARNING */}

        <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.04] p-7">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">
                Continue Learning
              </p>

              <h2 className="mt-2 text-2xl font-bold">

                {nextAlgorithm
                  ? `Continue with ${nextAlgorithm.name}`
                  : "All algorithms completed!"}

              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">

                {nextAlgorithm
                  ? "Continue your algorithm learning path and build toward completing all six quantum algorithms."
                  : "You have completed every available algorithm. Test your understanding with the Quantum Quiz."}

              </p>

            </div>

            <Link
              href={
                nextAlgorithm
                  ? nextAlgorithm.href
                  : "/quiz"
              }
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >

              {nextAlgorithm
                ? "Continue Learning →"
                : "Take Quantum Quiz →"}

            </Link>

          </div>

        </section>


        {/* QUIZ PERFORMANCE */}

        <section className="mt-8">

          <div className="mb-5">

            <h2 className="text-2xl font-bold">
              Quiz Performance
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Review your latest quiz and
              BB84 challenge performance.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <p className="text-sm text-slate-500">
                Latest Quiz Score
              </p>

              <p className="mt-3 text-4xl font-bold">
                {quizScore}

                <span className="text-lg text-slate-500">
                  /100
                </span>
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Main Quantum Quiz
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <p className="text-sm text-slate-500">
                BB84 Score
              </p>

              <p className="mt-3 text-4xl font-bold">
                {bb84Score}

                <span className="text-lg text-slate-500">
                  /100
                </span>
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Knowledge Challenge
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <p className="text-sm text-slate-500">
                BB84 Status
              </p>

              <p className="mt-3 text-2xl font-bold">

                {progress.bb84QuizCompleted
                  ? "✓ Completed"
                  : "Not Completed"}

              </p>

              <p className="mt-2 text-sm text-slate-500">
                {progress.bb84QuizAttempts || 0}
                {" "}attempt(s)
              </p>

            </div>

          </div>

        </section>


        {/* ACHIEVEMENTS */}

        <section className="mt-8">

          <div className="mb-5 flex items-end justify-between gap-4">

            <div>

              <h2 className="text-2xl font-bold">
                Achievements
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {unlockedBadges.length} of{" "}
                {badges.length} badges unlocked.
              </p>

            </div>

            <Link
              href="/learn"
              className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              View Learning Hub →
            </Link>

          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {badges.map((badge) => {

              const isUnlocked =
                badge.unlocked(progress);

              return (
                <div
                  key={badge.name}
                  className={`rounded-2xl border p-6 transition ${
                    isUnlocked
                      ? "border-cyan-400/20 bg-cyan-400/[0.04]"
                      : "border-white/10 bg-white/[0.02] opacity-60"
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-2xl">
                      {isUnlocked
                        ? badge.icon
                        : "🔒"}
                    </div>

                    <div>

                      <h3 className="font-bold">
                        {badge.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {isUnlocked
                          ? "Unlocked"
                          : "Locked"}
                      </p>

                    </div>

                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {badge.description}
                  </p>

                </div>
              );
            })}

          </div>

        </section>


        {/* LEARNING TOOLS */}

        <section className="mt-8 mb-12">

          <div className="mb-5">

            <h2 className="text-2xl font-bold">
              Quick Access
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Jump directly into the platform's
              main learning tools.
            </p>

          </div>


          <div className="grid gap-4 md:grid-cols-3">

            <Link
              href="/quantum-lab"
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30"
            >

              <div className="text-3xl">
                ⚛️
              </div>

              <h3 className="mt-4 text-lg font-bold">
                Quantum Lab
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Build circuits, simulate quantum
                gates, and inspect results.
              </p>

            </Link>


            <Link
              href="/tutor"
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-purple-400/30"
            >

              <div className="text-3xl">
                🤖
              </div>

              <h3 className="mt-4 text-lg font-bold">
                AI Tutor
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Ask questions and get
                beginner-friendly quantum explanations.
              </p>

            </Link>


            <Link
              href="/algorithms"
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30"
            >

              <div className="text-3xl">
                🧠
              </div>

              <h3 className="mt-4 text-lg font-bold">
                Algorithms
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Explore all six interactive
                quantum algorithms.
              </p>

            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}



