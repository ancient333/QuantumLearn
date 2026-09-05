"use client";

import { useState } from "react";
import Link from "next/link";


type Question = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};


type TopicScore = {
  correct: number;
  total: number;
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
    TopicScore
  >;

  xp?: number;
};


// ==================================================
// QUESTIONS
// ==================================================

const questions: Question[] = [

  {
    id: 1,
    topic: "Qubits",

    question:
      "What is a qubit?",

    options: [
      "A classical bit that can only store 0",
      "A quantum unit of information that can exist in a superposition of states",
      "A quantum computer processor",
      "A type of quantum gate",
    ],

    answer:
      "A quantum unit of information that can exist in a superposition of states",

    explanation:
      "A qubit is the basic unit of quantum information. Unlike a classical bit, a qubit can exist in a combination of |0âŸ© and |1âŸ© until it is measured.",
  },


  {
    id: 2,
    topic: "Quantum Gates",

    question:
      "What does the Hadamard (H) gate primarily create?",

    options: [
      "Entanglement between all qubits",
      "A superposition of quantum states",
      "A measurement result",
      "A classical bit",
    ],

    answer:
      "A superposition of quantum states",

    explanation:
      "The Hadamard gate transforms basis states into superposition states. For example, H|0âŸ© = (|0âŸ© + |1âŸ©)/âˆš2.",
  },


  {
    id: 3,
    topic: "Quantum Gates",

    question:
      "What does the X gate do to the state |0âŸ©?",

    options: [
      "It keeps the qubit in |0âŸ©",
      "It changes |0âŸ© to |1âŸ©",
      "It creates entanglement",
      "It measures the qubit",
    ],

    answer:
      "It changes |0âŸ© to |1âŸ©",

    explanation:
      "The X gate is the quantum equivalent of a classical NOT operation. It swaps |0âŸ© and |1âŸ©.",
  },


  {
    id: 4,
    topic: "Deutschâ€“Jozsa",

    question:
      "What does the Deutschâ€“Jozsa algorithm determine?",

    options: [
      "Whether a function is constant or balanced",
      "The exact value of every input",
      "Whether two qubits are entangled",
      "The temperature of a quantum processor",
    ],

    answer:
      "Whether a function is constant or balanced",

    explanation:
      "Deutschâ€“Jozsa determines whether an oracle implements a constant function or a balanced function using quantum interference.",
  },


  {
    id: 5,
    topic: "Grover's Algorithm",

    question:
      "What is the main purpose of Grover's algorithm?",

    options: [
      "To simulate classical computers",
      "To search an unstructured space more efficiently",
      "To create a permanent quantum memory",
      "To measure every qubit simultaneously",
    ],

    answer:
      "To search an unstructured space more efficiently",

    explanation:
      "Grover's algorithm provides a quadratic speedup for searching an unstructured database by using an oracle and amplitude amplification.",
  },


  {
    id: 6,
    topic: "Quantum Teleportation",

    question:
      "What is transferred during quantum teleportation?",

    options: [
      "A physical qubit through space",
      "The information describing a quantum state",
      "Only a classical bit",
      "The entire quantum computer",
    ],

    answer:
      "The information describing a quantum state",

    explanation:
      "Quantum teleportation transfers the information describing a quantum state to another qubit using entanglement and classical communication. The physical qubit itself is not transported.",
  },


  {
    id: 7,
    topic: "Quantum Teleportation",

    question:
      "What is an essential resource for quantum teleportation?",

    options: [
      "An entangled pair of qubits",
      "A classical hard drive",
      "A GPU",
      "A random password",
    ],

    answer:
      "An entangled pair of qubits",

    explanation:
      "Quantum teleportation requires a shared entangled Bell pair, along with classical communication of the measurement results.",
  },


  {
    id: 8,
    topic: "Measurement",

    question:
      "What generally happens when a quantum state is measured?",

    options: [
      "It remains in exactly the same superposition",
      "The state collapses to a measurement outcome",
      "The qubit is automatically duplicated",
      "The qubit becomes permanently entangled with every other qubit",
    ],

    answer:
      "The state collapses to a measurement outcome",

    explanation:
      "Measurement produces a classical outcome and changes the quantum state into the corresponding measured basis state.",
  },

];


export default function QuizPage() {

  // ==================================================
  // STATE
  // ==================================================

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [score, setScore] =
    useState(0);

  const [answered, setAnswered] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  const [topicScores, setTopicScores] =
    useState<
      Record<string, TopicScore>
    >({});


  // ==================================================
  // CURRENT QUESTION
  // ==================================================

  const question =
    questions[currentQuestion];


  // ==================================================
  // ANSWER QUESTION
  // ==================================================

  const handleAnswer = (
    option: string
  ) => {

    if (answered) {
      return;
    }


    setSelectedAnswer(option);

    setAnswered(true);


    const isCorrect =
      option === question.answer;


    if (isCorrect) {

      setScore(
        previous =>
          previous + 1
      );

    }


    setTopicScores(
      previous => {

        const previousTopic =
          previous[
            question.topic
          ] || {
            correct: 0,
            total: 0,
          };


        return {
          ...previous,

          [question.topic]: {
            correct:
              previousTopic.correct +
              (isCorrect ? 1 : 0),

            total:
              previousTopic.total + 1,
          },
        };

      }
    );

  };


  // ==================================================
  // NEXT QUESTION
  // ==================================================

  const nextQuestion = () => {

    if (
      currentQuestion <
      questions.length - 1
    ) {

      setCurrentQuestion(
        previous =>
          previous + 1
      );

      setSelectedAnswer("");

      setAnswered(false);

      return;

    }


    finishQuiz();

  };


  // ==================================================
  // FINISH QUIZ
  // ==================================================

  const finishQuiz = () => {

    /*
     * Because the final answer updates React state
     * asynchronously, calculate the final score using
     * the current selected answer as well.
     */

    const finalCorrect =
      selectedAnswer === question.answer
        ? score + 1
        : score;


    const percentage =
      Math.round(
        (finalCorrect /
          questions.length) *
          100
      );


    /*
     * Quiz XP:
     *
     * 100%  â†’ 100 XP
     * 80%+  â†’ 80 XP
     * 60%+  â†’ 60 XP
     * 40%+  â†’ 40 XP
     * below â†’ 20 XP
     */

    let earnedXP = 20;


    if (percentage >= 80) {

      earnedXP = 80;

    } else if (percentage >= 60) {

      earnedXP = 60;

    } else if (percentage >= 40) {

      earnedXP = 40;

    }


    if (percentage === 100) {

      earnedXP = 100;

    }


    // ==================================================
    // LOAD EXISTING PROGRESS
    // ==================================================

    const storedProgress =
      localStorage.getItem(
        "quantumLearningProgress"
      );


    let progress:
      LearningProgress = {

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


    // ==================================================
    // MERGE TOPIC PERFORMANCE
    // ==================================================

    const previousTopicPerformance =
      progress.topicPerformance ||
      {};


    const mergedTopicPerformance:
      Record<string, TopicScore> =
      {
        ...previousTopicPerformance,
      };


    Object.entries(
      topicScores
    ).forEach(
      (
        [
          topic,
          currentTopic,
        ]
      ) => {

        const previousTopic =
          mergedTopicPerformance[
            topic
          ] || {
            correct: 0,
            total: 0,
          };


        mergedTopicPerformance[
          topic
        ] = {

          correct:
            previousTopic.correct +
            currentTopic.correct,

          total:
            previousTopic.total +
            currentTopic.total,

        };

      }
    );


    // ==================================================
    // UPDATE MAIN XP
    // ==================================================

    const updatedXP =
      (progress.xp || 0) +
      earnedXP;


    // ==================================================
    // SAVE PROGRESS
    // ==================================================

    const updatedProgress:
      LearningProgress = {

      ...progress,

      quizScore:
        percentage,

      quizXP:
        (progress.quizXP || 0) +
        earnedXP,

      quizzesCompleted:
        (progress.quizzesCompleted || 0) +
        1,

      topicPerformance:
        mergedTopicPerformance,

      xp:
        updatedXP,
    };


    localStorage.setItem(
      "quantumLearningProgress",
      JSON.stringify(
        updatedProgress
      )
    );


    setFinished(true);

  };


  // ==================================================
  // RESTART QUIZ
  // ==================================================

  const restartQuiz = () => {

    setCurrentQuestion(0);

    setSelectedAnswer("");

    setScore(0);

    setAnswered(false);

    setFinished(false);

    setTopicScores({});

  };


  // ==================================================
  // FINISHED SCREEN
  // ==================================================

  if (finished) {

    const percentage =
      Math.round(
        (score /
          questions.length) *
          100
      );


    let earnedXP = 20;


    if (percentage >= 80) {

      earnedXP = 80;

    } else if (percentage >= 60) {

      earnedXP = 60;

    } else if (percentage >= 40) {

      earnedXP = 40;

    }


    if (percentage === 100) {

      earnedXP = 100;

    }


    let resultMessage =
      "Keep practicing!";


    if (percentage === 100) {

      resultMessage =
        "Perfect score! Excellent work!";

    } else if (percentage >= 80) {

      resultMessage =
        "Great job! Your quantum fundamentals are strong.";

    } else if (percentage >= 60) {

      resultMessage =
        "Good work! A little more practice will strengthen your understanding.";

    }


    return (

      <main className="min-h-screen bg-[#050816] px-6 py-8 text-white">

        <div className="mx-auto max-w-5xl">


          {/* Navigation */}

          <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">

            <Link
              href="/"
              className="text-xl font-bold"
            >
              Quantum
              <span className="text-cyan-400">
                Learn
              </span>
            </Link>


            <div className="flex flex-wrap gap-5 text-sm text-slate-400">

              <Link
                href="/learn"
                className="hover:text-white"
              >
                Learning Hub
              </Link>

              <Link
                href="/dashboard"
                className="hover:text-white"
              >
                Quantum Lab
              </Link>

              <Link
                href="/tutor"
                className="hover:text-white"
              >
                AI Tutor
              </Link>

            </div>

          </nav>


          {/* Result */}

          <section className="py-14 text-center">

            <div className="text-6xl">
              {percentage >= 80
                ? "ðŸ†"
                : percentage >= 60
                  ? "ðŸŽ¯"
                  : "ðŸ“š"}
            </div>


            <h1 className="mt-6 text-4xl font-bold">

              Quiz Complete!

            </h1>


            <p className="mt-3 text-lg text-slate-400">

              {resultMessage}

            </p>


            {/* Score */}

            <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-3">


              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-7">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Score
                </p>

                <p className="mt-3 text-4xl font-bold text-cyan-300">
                  {percentage}%
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {score} / {questions.length} correct
                </p>

              </div>


              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-7">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  XP Earned
                </p>

                <p className="mt-3 text-4xl font-bold text-emerald-400">
                  +{earnedXP}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Added to your total XP
                </p>

              </div>


              <div className="rounded-2xl border border-purple-400/20 bg-purple-400/[0.05] p-7">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Questions
                </p>

                <p className="mt-3 text-4xl font-bold text-purple-300">
                  {questions.length}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Quantum concepts tested
                </p>

              </div>


            </div>


            {/* Topic Performance */}

            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-left">

              <h2 className="text-xl font-bold">
                Topic Performance
              </h2>


              <p className="mt-2 text-sm text-slate-500">
                Your performance in this quiz.
              </p>


              <div className="mt-6 space-y-4">

                {Object.entries(
                  topicScores
                ).map(
                  (
                    [
                      topic,
                      topicScore,
                    ]
                  ) => {

                    const topicPercentage =
                      topicScore.total >
                      0
                        ? Math.round(
                            (topicScore.correct /
                              topicScore.total) *
                              100
                          )
                        : 0;


                    return (

                      <div
                        key={topic}
                      >

                        <div className="mb-2 flex items-center justify-between">

                          <span className="text-sm font-medium">
                            {topic}
                          </span>

                          <span className="text-sm text-slate-400">
                            {
                              topicScore.correct
                            }
                            /
                            {
                              topicScore.total
                            }
                            {" "}
                            ({topicPercentage}%)
                          </span>

                        </div>


                        <div className="h-2 overflow-hidden rounded-full bg-white/10">

                          <div
                            className="h-full rounded-full bg-cyan-400 transition-all"
                            style={{
                              width:
                                `${topicPercentage}%`,
                            }}
                          />

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            </div>


            {/* Actions */}

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

              <button
                onClick={
                  restartQuiz
                }
                className="rounded-xl bg-cyan-400 px-7 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Retake Quiz
              </button>


              <Link
                href="/learn"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Back to Learning Hub
              </Link>


              <Link
                href="/tutor"
                className="rounded-xl border border-purple-400/20 bg-purple-400/10 px-7 py-4 font-semibold text-purple-300 transition hover:bg-purple-400/20"
              >
                Ask AI Tutor
              </Link>

            </div>

          </section>


        </div>

      </main>

    );

  }


  // ==================================================
  // QUIZ SCREEN
  // ==================================================

  const progressPercentage =
    Math.round(
      (currentQuestion /
        questions.length) *
        100
    );


  return (

    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white">

      <div className="mx-auto max-w-5xl">


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">

          <Link
            href="/"
            className="text-xl font-bold"
          >
            Quantum
            <span className="text-cyan-400">
              Learn
            </span>
          </Link>


          <div className="flex flex-wrap gap-5 text-sm text-slate-400">

            <Link
              href="/learn"
              className="transition hover:text-white"
            >
              Learning Hub
            </Link>


            <Link
              href="/dashboard"
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

          </div>

        </nav>


        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="py-10">

          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">

            Quantum Practice

          </div>


          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">

            Quantum Quiz

          </h1>


          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">

            Test your understanding of qubits,
            gates, algorithms, measurement,
            and quantum teleportation.

          </p>

        </section>


        {/* ==================================================
            PROGRESS
        ================================================== */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs uppercase tracking-wider text-slate-500">
                Question
              </p>

              <p className="mt-1 font-semibold">
                {currentQuestion + 1} /{" "}
                {questions.length}
              </p>

            </div>


            <div className="text-right">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                Score
              </p>

              <p className="mt-1 font-semibold text-cyan-300">
                {score}
              </p>

            </div>

          </div>


          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">

            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-300"
              style={{
                width:
                  `${Math.max(
                    progressPercentage,
                    8
                  )}%`,
              }}
            />

          </div>

        </section>


        {/* ==================================================
            QUESTION
        ================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-10">


          <div className="flex flex-wrap items-center justify-between gap-3">

            <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-xs font-semibold text-purple-300">

              {question.topic}

            </span>


            <span className="text-sm text-slate-500">

              Question {currentQuestion + 1}

            </span>

          </div>


          <h2 className="mt-7 text-2xl font-bold leading-9 sm:text-3xl">

            {question.question}

          </h2>


          {/* Options */}

          <div className="mt-8 space-y-4">

            {question.options.map(
              (option, index) => {

                const isSelected =
                  selectedAnswer ===
                  option;


                const isCorrect =
                  option ===
                  question.answer;


                let optionClass =
                  "border-white/10 bg-white/[0.02] hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]";


                if (answered) {

                  if (isCorrect) {

                    optionClass =
                      "border-emerald-400/40 bg-emerald-400/[0.08]";

                  } else if (
                    isSelected &&
                    !isCorrect
                  ) {

                    optionClass =
                      "border-red-400/40 bg-red-400/[0.08]";

                  }

                } else if (
                  isSelected
                ) {

                  optionClass =
                    "border-cyan-400/40 bg-cyan-400/[0.08]";

                }


                return (

                  <button
                    key={option}
                    onClick={() =>
                      handleAnswer(
                        option
                      )
                    }
                    disabled={answered}
                    className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${optionClass} ${
                      answered
                        ? "cursor-default"
                        : ""
                    }`}
                  >

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm font-semibold text-slate-400">

                      {String.fromCharCode(
                        65 + index
                      )}

                    </span>


                    <span className="pt-1 text-sm leading-6 text-slate-200">

                      {option}

                    </span>


                    {answered &&
                      isCorrect && (

                        <span className="ml-auto text-emerald-400">
                          âœ“
                        </span>

                      )}


                    {answered &&
                      isSelected &&
                      !isCorrect && (

                        <span className="ml-auto text-red-400">
                          âœ•
                        </span>

                      )}

                  </button>

                );

              }
            )}

          </div>


          {/* Explanation */}

          {answered && (

            <div className="mt-7 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-6">

              <p className="text-sm font-semibold text-cyan-300">
                Explanation
              </p>


              <p className="mt-3 text-sm leading-7 text-slate-400">

                {question.explanation}

              </p>

            </div>

          )}


          {/* Next */}

          {answered && (

            <button
              onClick={
                nextQuestion
              }
              className="mt-7 w-full rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >

              {currentQuestion ===
              questions.length - 1
                ? "Finish Quiz â†’"
                : "Next Question â†’"}

            </button>

          )}

        </section>


        {/* ==================================================
            QUICK LINKS
        ================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/20"
          >

            <p className="text-sm font-semibold">
              Quantum Lab
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Practice gates and run simulations.
            </p>

          </Link>


          <Link
            href="/algorithms"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-purple-400/20"
          >

            <p className="text-sm font-semibold">
              Algorithms
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Explore quantum algorithms interactively.
            </p>

          </Link>


          <Link
            href="/tutor"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/20"
          >

            <p className="text-sm font-semibold">
              AI Tutor
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Get help with concepts and results.
            </p>

          </Link>

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


