"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";


// --------------------------------------------------
// Types
// --------------------------------------------------

type Message = {
  role: "user" | "tutor";
  content: string;
};


type QuantumContext = {
  gate?: string;
  qubits?: number;
  initial_state?: string;
  description?: string;
  final_state?: string;
  operation?: string;
  explanation?: string;
};


type AlgorithmContext = {
  algorithm?: string;
  oracle_type?: string;
  oracleType?: string;
  classification?: string;
  result?: unknown;
  shots?: number;
  bits?: number;
  eavesdropper?: boolean;
  qber?: number;
  threshold?: number;
  secure?: boolean;
  eve_detected?: boolean;
  sifted_key_length?: number;
  secret_key_length?: number;
  test_errors?: number;
  explanation?: string;
};


type LearningProgress = {
  completedAlgorithms: string[];
  tutorUsed: boolean;
  labUsed: boolean;
  gatesExplored: string[];
  simulationsRun: number;
  lastGate?: string;
};


// --------------------------------------------------
// Default Context
// --------------------------------------------------

const defaultQuantumContext: QuantumContext = {
  gate: "H",
  qubits: 1,
  initial_state: "|0⟩",
  final_state: "|+⟩",
  operation: "H|0⟩ = |+⟩",
  description:
    "The Hadamard gate creates an equal superposition of |0⟩ and |1⟩.",
  explanation:
    "The H gate transforms |0⟩ into (|0⟩ + |1⟩)/√2.",
};


const defaultProgress: LearningProgress = {
  completedAlgorithms: [],
  tutorUsed: false,
  labUsed: false,
  gatesExplored: [],
  simulationsRun: 0,
  lastGate: "",
};


// --------------------------------------------------
// Component
// --------------------------------------------------

export default function TutorPage() {

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [quantumContext, setQuantumContext] =
    useState<QuantumContext>(defaultQuantumContext);

  const [algorithmContext, setAlgorithmContext] =
    useState<AlgorithmContext | null>(null);

  const [learningProgress, setLearningProgress] =
    useState<LearningProgress>(defaultProgress);


  // --------------------------------------------------
  // Load saved context
  // --------------------------------------------------

  useEffect(() => {

    // ----------------------------------------------
    // Quantum Lab Context
    // ----------------------------------------------

    const savedQuantumContext =
      localStorage.getItem("quantumLabContext");

    if (savedQuantumContext) {

      try {

        setQuantumContext(
          JSON.parse(savedQuantumContext)
        );

      } catch {

        console.error(
          "Could not load Quantum Lab context."
        );

      }

    }


    // ----------------------------------------------
    // Algorithm Context
    // ----------------------------------------------

    const savedAlgorithmContext =
      localStorage.getItem(
        "quantumAlgorithmContext"
      );

    if (savedAlgorithmContext) {

      try {

        setAlgorithmContext(
          JSON.parse(savedAlgorithmContext)
        );

      } catch {

        console.error(
          "Could not load algorithm context."
        );

      }

    }


    // ----------------------------------------------
    // Learning Progress
    // ----------------------------------------------

    const savedProgress =
      localStorage.getItem(
        "quantumLearningProgress"
      );

    if (savedProgress) {

      try {

        setLearningProgress(
          {
            ...defaultProgress,
            ...JSON.parse(savedProgress),
          }
        );

      } catch {

        console.error(
          "Could not load learning progress."
        );

      }

    }

  }, []);


  // --------------------------------------------------
  // Mark Tutor as Used
  // --------------------------------------------------

  const markTutorUsed = () => {

    const updatedProgress: LearningProgress = {
      ...learningProgress,
      tutorUsed: true,
    };


    setLearningProgress(
      updatedProgress
    );


    localStorage.setItem(
      "quantumLearningProgress",
      JSON.stringify(updatedProgress)
    );

  };


  // --------------------------------------------------
  // Ask Question
  // --------------------------------------------------

  const askQuestion = async () => {

    const questionToAsk =
      question.trim();


    if (!questionToAsk || isLoading) {
      return;
    }


    // ----------------------------------------------
    // Add user message
    // ----------------------------------------------

    const userMessage: Message = {
      role: "user",
      content: questionToAsk,
    };


    const conversationHistory =
      messages;


    setMessages(
      previous => [
        ...previous,
        userMessage,
      ]
    );


    setQuestion("");

    setIsLoading(true);


    try {

      // --------------------------------------------
      // Send request to backend
      // --------------------------------------------

      const response = await fetch(
        "https://quantumlearn-1.onrender.com/tutor/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            question: questionToAsk,

            history:
              conversationHistory,

            quantum_context:
              quantumContext,

            algorithm_context:
              algorithmContext,

            learning_progress:
              learningProgress,

          }),
        }
      );


      // --------------------------------------------
      // Handle HTTP error
      // --------------------------------------------

      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          "Tutor request failed."
        );

      }


      // --------------------------------------------
      // Read response
      // --------------------------------------------

      const data =
        await response.json();


      const tutorMessage: Message = {
        role: "tutor",
        content: data.answer,
      };


      // --------------------------------------------
      // Add AI response
      // --------------------------------------------

      setMessages(
        previous => [
          ...previous,
          tutorMessage,
        ]
      );


      // --------------------------------------------
      // Record Tutor usage
      // --------------------------------------------

      markTutorUsed();


    } catch (error) {

      console.error(
        "Tutor request failed:",
        error
      );


      setMessages(
        previous => [
          ...previous,
          {
            role: "tutor",
            content:
              "Sorry, I couldn't connect to the AI Tutor. Please make sure the backend server is running.",
          },
        ]
      );

    } finally {

      setIsLoading(false);

    }

  };


  // --------------------------------------------------
  // Quick Questions
  // --------------------------------------------------

  const quickQuestions = [

    "What is a qubit?",

    "Why does the Hadamard gate create superposition?",

    "How does Grover's algorithm work?",

    "What is quantum measurement?",

  ];


  // --------------------------------------------------
  // Handle Enter
  // --------------------------------------------------

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      askQuestion();

    }

  };


  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (

    <main className="min-h-screen bg-[#050816] text-white">

      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}

      <header className="border-b border-white/10 bg-[#070b1f]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-xl font-bold tracking-wide"
          >
            Quantum<span className="text-cyan-400">Learn</span>
          </Link>


          <nav className="flex items-center gap-6 text-sm text-slate-300">

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
              className="text-cyan-400"
            >
              AI Tutor
            </Link>

          </nav>

        </div>

      </header>


      {/* ------------------------------------------------ */}
      {/* Main */}
      {/* ------------------------------------------------ */}

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[300px_1fr]">


        {/* ------------------------------------------------ */}
        {/* Sidebar */}
        {/* ------------------------------------------------ */}

        <aside className="space-y-5">


          {/* Quantum Context */}

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="font-semibold">
                Quantum Lab
              </h2>

              <span className="text-xs text-cyan-400">
                LIVE
              </span>

            </div>


            <div className="space-y-3 text-sm">

              <div>

                <p className="text-xs text-slate-500">
                  Gate
                </p>

                <p className="font-medium">
                  {quantumContext.gate || "—"}
                </p>

              </div>


              <div>

                <p className="text-xs text-slate-500">
                  Initial State
                </p>

                <p>
                  {quantumContext.initial_state || "—"}
                </p>

              </div>


              <div>

                <p className="text-xs text-slate-500">
                  Final State
                </p>

                <p>
                  {quantumContext.final_state || "—"}
                </p>

              </div>

            </div>

          </div>


          {/* Algorithm Context */}

          {algorithmContext && (

            <div className="rounded-2xl border border-purple-400/20 bg-purple-400/5 p-5">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="font-semibold">
                  Algorithm
                </h2>

                <span className="text-xs text-purple-400">
                  ACTIVE
                </span>

              </div>


              <div className="space-y-3 text-sm">

                <div>

                  <p className="text-xs text-slate-500">
                    Algorithm
                  </p>

                  <p>
                    {algorithmContext.algorithm || "—"}
                  </p>

                </div>


                <div>

                  <p className="text-xs text-slate-500">
                    Oracle
                  </p>

                  <p>
                    {algorithmContext.oracle_type || "—"}
                  </p>

                </div>
                {algorithmContext.algorithm ===
                  "BB84" ? (
                  <>
                    {typeof algorithmContext.qber ===
                      "number" && (
                      <div>
                        <p className="text-xs text-slate-500">
                          QBER
                        </p>

                        <p className="font-medium">
                          {(algorithmContext.qber * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}

                    {typeof algorithmContext.secure ===
                      "boolean" && (
                      <div>
                        <p className="text-xs text-slate-500">
                          Security
                        </p>

                        <p
                          className={
                            algorithmContext.secure
                              ? "font-medium text-emerald-400"
                              : "font-medium text-red-400"
                          }
                        >
                          {algorithmContext.secure
                            ? "Secure"
                            : "Rejected"}
                        </p>
                      </div>
                    )}

                    {typeof algorithmContext.secret_key_length ===
                      "number" && (
                      <div>
                        <p className="text-xs text-slate-500">
                          Secret Key
                        </p>

                        <p className="font-medium">
                          {algorithmContext.secret_key_length} bits
                        </p>
                      </div>
                    )}

                    {Array.isArray(
                      algorithmContext.result
                    ) && (
                      <div>
                        <p className="text-xs text-slate-500">
                          Transmission
                        </p>

                        <p className="text-sm text-slate-300">
                          {algorithmContext.result.length} quantum
                          transmission records
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  algorithmContext.result !==
                    undefined &&
                  algorithmContext.result !== null && (
                    <div>
                      <p className="text-xs text-slate-500">
                        Measurement
                      </p>

                      <p className="break-all text-sm">
                        {typeof algorithmContext.result ===
                        "string"
                          ? algorithmContext.result
                          : JSON.stringify(
                              algorithmContext.result
                            )}
                      </p>
                    </div>
                  )
                )}


              </div>

            </div>

          )}


          {/* Learning Progress */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <h2 className="mb-4 font-semibold">
              Learning Progress
            </h2>


            <div className="space-y-4 text-sm">


              <div>

                <div className="mb-1 flex justify-between">

                  <span className="text-slate-400">
                    Algorithms
                  </span>

                  <span>
                    {learningProgress.completedAlgorithms.length}
                  </span>

                </div>

              </div>


              <div>

                <div className="mb-1 flex justify-between">

                  <span className="text-slate-400">
                    Gates Explored
                  </span>

                  <span>
                    {learningProgress.gatesExplored.length}
                  </span>

                </div>

              </div>


              <div>

                <div className="mb-1 flex justify-between">

                  <span className="text-slate-400">
                    Simulations
                  </span>

                  <span>
                    {learningProgress.simulationsRun}
                  </span>

                </div>

              </div>


              <div>

                <div className="mb-1 flex justify-between">

                  <span className="text-slate-400">
                    Tutor Used
                  </span>

                  <span
                    className={
                      learningProgress.tutorUsed
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    {learningProgress.tutorUsed
                      ? "Yes"
                      : "Not yet"}
                  </span>

                </div>

              </div>


              {learningProgress.lastGate && (

                <div>

                  <p className="text-xs text-slate-500">
                    Last Gate
                  </p>

                  <p className="mt-1">
                    {learningProgress.lastGate}
                  </p>

                </div>

              )}

            </div>

          </div>

        </aside>


        {/* ------------------------------------------------ */}
        {/* Tutor */}
        {/* ------------------------------------------------ */}

        <div className="flex min-h-[720px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">


          {/* Tutor Header */}

          <div className="border-b border-white/10 px-6 py-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
                🤖
              </div>


              <div>

                <h1 className="text-xl font-bold">
                  QuantumLearn AI Tutor
                </h1>

                <p className="text-sm text-slate-400">
                  Ask questions about quantum computing,
                  gates, circuits, and algorithms.
                </p>

              </div>

            </div>

          </div>


          {/* Messages */}

          <div className="flex-1 space-y-5 overflow-y-auto p-6">


            {messages.length === 0 && (

              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mx-auto max-w-2xl py-16 text-center"
              >

                <div className="mb-5 text-5xl">
                  ⚛️
                </div>


                <h2 className="mb-3 text-2xl font-bold">
                  Ask your quantum question
                </h2>


                <p className="mx-auto mb-8 max-w-lg text-slate-400">
                  I can explain quantum concepts,
                  analyze your experiments, and help
                  you understand quantum algorithms.
                </p>


                <div className="flex flex-wrap justify-center gap-3">

                  {quickQuestions.map(
                    (item) => (

                      <button
                        key={item}
                        onClick={() =>
                          setQuestion(item)
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
                      >
                        {item}
                      </button>

                    )
                  )}

                </div>

              </motion.div>

            )}


            {messages.map(
              (message, index) => (

                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >

                  <div
                    className={
                      message.role === "user"
                        ? "max-w-3xl rounded-2xl rounded-br-md bg-cyan-400 px-5 py-3 text-sm text-slate-950"
                        : "max-w-3xl rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-200"
                    }
                  >

                    {message.role === "tutor" ? (

                      <div className="prose prose-invert max-w-none prose-p:my-2 prose-headings:mb-2 prose-headings:mt-4 prose-li:my-0.5">

                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {message.content}
                        </ReactMarkdown>

                      </div>

                    ) : (

                      <p className="whitespace-pre-wrap">
                        {message.content}
                      </p>

                    )}

                  </div>

                </motion.div>

              )
            )}


            {isLoading && (

              <div className="flex justify-start">

                <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-5 py-4">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                      style={{
                        animationDelay: "120ms",
                      }}
                    />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                      style={{
                        animationDelay: "240ms",
                      }}
                    />

                  </div>

                </div>

              </div>

            )}

          </div>


          {/* Input */}

          <div className="border-t border-white/10 p-5">

            <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about quantum computing..."
                rows={2}
                className="min-h-[50px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600"
              />


              <button
                onClick={askQuestion}
                disabled={
                  isLoading ||
                  !question.trim()
                }
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading
                  ? "Thinking..."
                  : "Ask"}
              </button>

            </div>


            <p className="mt-2 text-center text-xs text-slate-600">
              Press Enter to send • Shift + Enter for a new line
            </p>

          </div>

        </div>

      </section>

    </main>

  );
}



