"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


type Step = {
  title: string;
  description: string;
};


type AlgorithmResult = {
  algorithm: string;
  target: string;
  shots: number;
  counts: Record<string, number>;
  found_state: string;
  explanation: string;
};


type LearningProgress = {
  completedAlgorithms: string[];
  tutorUsed: boolean;
  labUsed: boolean;
  gatesExplored: string[];
  simulationsRun: number;
  lastGate?: string;
  xp?: number;
};


const steps: Step[] = [
  {
    title: "Choose Target",
    description:
      "Choose which two-qubit state Grover's algorithm should search for.",
  },
  {
    title: "Initialize",
    description:
      "Prepare the two qubits in the |00âŸ© state.",
  },
  {
    title: "Superposition",
    description:
      "Hadamard gates create an equal superposition of all possible states.",
  },
  {
    title: "Oracle",
    description:
      "The oracle marks the target state by changing its phase.",
  },
  {
    title: "Diffusion",
    description:
      "The diffusion operator amplifies the probability of the target state.",
  },
  {
    title: "Measure",
    description:
      "Measure the qubits to determine which state was found.",
  },
];


export default function GroverPage() {

  const [target, setTarget] =
    useState("00");

  const [currentStep, setCurrentStep] =
    useState(0);

  const [running, setRunning] =
    useState(false);

  const [result, setResult] =
    useState<AlgorithmResult | null>(null);

  const [earnedXP, setEarnedXP] =
    useState<number | null>(null);


  // ======================================================
  // RUN SIMULATION
  // ======================================================

  const runSimulation = async () => {

    setRunning(true);
    setEarnedXP(null);

    try {

      // ==================================================
      // CALL BACKEND
      // ==================================================

      const response =
        await fetch(
          "https://quantumlearn-1.onrender.com/algorithms/grover",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              target,
              shots: 1000,
            }),
          }
        );


      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          "Simulation failed."
        );
      }


      const data: AlgorithmResult =
        await response.json();


      setResult(data);

      setCurrentStep(
        steps.length - 1
      );


      // ==================================================
      // SAVE ALGORITHM CONTEXT
      // ==================================================

      localStorage.setItem(
        "quantumAlgorithmContext",
        JSON.stringify({

          algorithm:
            "Grover's Algorithm",

          target:
            data.target,

          result:
            data.counts,

          found_state:
            data.found_state,

          shots:
            data.shots,

          explanation:
            data.explanation,

        })
      );


      // ==================================================
      // LOAD LEARNING PROGRESS
      // ==================================================

      const storedProgress =
        localStorage.getItem(
          "quantumLearningProgress"
        );


      let progress: LearningProgress = {

        completedAlgorithms:
          [],

        tutorUsed:
          false,

        labUsed:
          false,

        gatesExplored:
          [],

        simulationsRun:
          0,

        lastGate:
          "",

        xp:
          0,

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
      // ALGORITHM XP
      // ==================================================

      const algorithmName =
        "Grover's Algorithm";


      const alreadyCompleted =
        (
          progress.completedAlgorithms ||
          []
        ).includes(
          algorithmName
        );


      const algorithmXP =
        alreadyCompleted
          ? 0
          : 100;


      const updatedXP =
        (progress.xp || 0) +
        algorithmXP;


      setEarnedXP(
        algorithmXP
      );


      // ==================================================
      // UPDATE COMPLETED ALGORITHMS
      // ==================================================

      const completedAlgorithms =
        Array.from(
          new Set([
            ...(progress.completedAlgorithms || []),
            algorithmName,
          ])
        );


      // ==================================================
      // SAVE LEARNING PROGRESS
      // ==================================================

      localStorage.setItem(
        "quantumLearningProgress",
        JSON.stringify({

          ...progress,

          completedAlgorithms,

          simulationsRun:
            (progress.simulationsRun || 0) + 1,

          xp:
            updatedXP,

        })
      );


    } catch (error) {

      console.error(
        "Grover simulation error:",
        error
      );


      alert(
        "Could not run the Grover simulation."
      );


    } finally {

      setRunning(false);

    }
  };


  // ======================================================
  // CHART DATA
  // ======================================================

  const chartData =
    result
      ? Object.entries(
          result.counts
        ).map(
          ([state, count]) => ({
            state,
            count,
            probability:
              (
                count /
                result.shots
              ) *
              100,
          })
        )
      : [];


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <main
      className="
        min-h-screen
        bg-[#050816]
        text-white
        px-6
        py-10
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
        "
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-10">

          <Link
            href="/algorithms"
            className="
              text-sm
              text-cyan-400
              hover:text-cyan-300
            "
          >
            â† Back to Algorithms
          </Link>


          <p
            className="
              mt-6
              text-sm
              uppercase
              tracking-[0.3em]
              text-cyan-400
            "
          >
            Quantum Search
          </p>


          <h1
            className="
              text-4xl
              md:text-6xl
              font-bold
              mt-3
            "
          >
            Grover's Algorithm
          </h1>


          <p
            className="
              text-gray-400
              max-w-3xl
              mt-4
              text-lg
            "
          >
            Learn how amplitude amplification allows
            a quantum computer to search for a target
            state efficiently.
          </p>

        </div>


        {/* ==================================================
            TARGET SELECTOR
        ================================================== */}

        <section
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-7
            mb-8
          "
        >

          <h2
            className="
              text-2xl
              font-semibold
            "
          >
            Choose Search Target
          </h2>


          <p
            className="
              text-gray-400
              mt-2
            "
          >
            Select the two-qubit state that Grover's
            algorithm should search for.
          </p>


          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-4
              gap-4
              mt-6
            "
          >

            {[
              "00",
              "01",
              "10",
              "11",
            ].map(
              (state) => (

                <button
                  key={state}
                  onClick={() =>
                    setTarget(state)
                  }
                  className={`
                    rounded-2xl
                    border
                    p-6
                    font-mono
                    text-xl
                    transition
                    ${
                      target === state
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-white/[0.03]"
                    }
                  `}
                >
                  |{state}âŸ©
                </button>

              )
            )}

          </div>

        </section>


        {/* ==================================================
            STEP NAVIGATION
        ================================================== */}

        <section
          className="
            grid
            grid-cols-2
            md:grid-cols-6
            gap-3
            mb-8
          "
        >

          {steps.map(
            (step, index) => (

              <button
                key={step.title}
                onClick={() =>
                  setCurrentStep(index)
                }
                className={`
                  rounded-xl
                  border
                  p-4
                  text-left
                  transition
                  ${
                    currentStep === index
                      ? "border-cyan-400 bg-cyan-400/10"
                      : "border-white/10 bg-white/[0.03]"
                  }
                `}
              >

                <span
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  Step {index + 1}
                </span>


                <p
                  className="
                    mt-1
                    font-medium
                  "
                >
                  {step.title}
                </p>

              </button>

            )
          )}

        </section>


        {/* ==================================================
            CURRENT STEP
        ================================================== */}

        <motion.section
          key={currentStep}
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-8
            mb-8
          "
        >

          <p
            className="
              text-sm
              text-cyan-400
              uppercase
              tracking-wider
            "
          >
            Step {currentStep + 1}
          </p>


          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >
            {steps[currentStep].title}
          </h2>


          <p
            className="
              text-gray-400
              mt-4
              max-w-3xl
              leading-relaxed
            "
          >
            {steps[currentStep].description}
          </p>


          <div
            className="
              mt-8
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-6
            "
          >

            <div
              className="
                text-center
                font-mono
                text-xl
                text-cyan-300
              "
            >
              |00âŸ© + |01âŸ© + |10âŸ© + |11âŸ©
            </div>


            <div
              className="
                text-center
                text-gray-500
                mt-3
              "
            >
              Equal superposition of possible states
            </div>

          </div>

        </motion.section>


        {/* ==================================================
            CONTROLS
        ================================================== */}

        <section
          className="
            flex
            flex-wrap
            gap-4
            mb-10
          "
        >

          <button
            onClick={() =>
              setCurrentStep(
                Math.max(
                  0,
                  currentStep - 1
                )
              )
            }
            disabled={currentStep === 0}
            className="
              px-5
              py-3
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              disabled:opacity-40
            "
          >
            â† Previous
          </button>


          <button
            onClick={() =>
              setCurrentStep(
                Math.min(
                  steps.length - 1,
                  currentStep + 1
                )
              )
            }
            disabled={
              currentStep ===
              steps.length - 1
            }
            className="
              px-5
              py-3
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              disabled:opacity-40
            "
          >
            Next â†’
          </button>


          <button
            onClick={runSimulation}
            disabled={running}
            className="
              px-6
              py-3
              rounded-xl
              bg-cyan-400
              text-black
              font-semibold
              hover:bg-cyan-300
              disabled:opacity-50
            "
          >
            {running
              ? "Running..."
              : "Run Quantum Simulation"}
          </button>

        </section>


        {/* ==================================================
            XP RESULT
        ================================================== */}

        {earnedXP !== null && (

          <section
            className="
              rounded-2xl
              border
              border-cyan-400/20
              bg-cyan-400/[0.05]
              p-6
              mb-8
            "
          >

            {earnedXP > 0 ? (

              <div>

                <p
                  className="
                    text-cyan-400
                    text-sm
                    uppercase
                    tracking-wider
                  "
                >
                  XP Earned
                </p>


                <p
                  className="
                    text-3xl
                    font-bold
                    mt-2
                  "
                >
                  +{earnedXP} XP
                </p>


                <p
                  className="
                    text-gray-400
                    mt-2
                  "
                >
                  You completed Grover's Algorithm
                  for the first time.
                </p>

              </div>

            ) : (

              <div>

                <p
                  className="
                    text-gray-300
                    font-semibold
                  "
                >
                  Simulation completed again.
                </p>


                <p
                  className="
                    text-gray-500
                    mt-2
                  "
                >
                  You already earned the 100 XP
                  completion reward for Grover's Algorithm.
                </p>

              </div>

            )}

          </section>

        )}


        {/* ==================================================
            RESULTS
        ================================================== */}

        {result && (

          <section
            className="
              rounded-3xl
              border
              border-cyan-400/20
              bg-cyan-400/[0.04]
              p-8
              mb-10
            "
          >

            <div
              className="
                flex
                flex-col
                md:flex-row
                md:items-start
                md:justify-between
                gap-5
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-cyan-400
                    uppercase
                    tracking-wider
                  "
                >
                  Simulation Result
                </p>


                <h2
                  className="
                    text-3xl
                    font-bold
                    mt-2
                  "
                >
                  Found |{result.found_state}âŸ©
                </h2>


                <p
                  className="
                    text-gray-400
                    mt-3
                    max-w-2xl
                  "
                >
                  {result.explanation}
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  bg-green-400/10
                  border
                  border-green-400/20
                  px-5
                  py-3
                  text-green-400
                  font-semibold
                "
              >
                Algorithm Completed âœ“
              </div>

            </div>


            {/* ==================================================
                CHART
            ================================================== */}

            <div
              className="
                h-80
                mt-8
              "
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />


                  <XAxis
                    dataKey="state"
                    stroke="#9ca3af"
                  />


                  <YAxis
                    stroke="#9ca3af"
                  />


                  <Tooltip />


                  <Bar
                    dataKey="count"
                    fill="#22d3ee"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/* ==================================================
                PROBABILITY CARDS
            ================================================== */}

            <div
              className="
                mt-6
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-4
                gap-4
              "
            >

              {chartData.map(
                (item) => (

                  <div
                    key={item.state}
                    className="
                      rounded-xl
                      border
                      border-white/10
                      bg-black/20
                      p-4
                    "
                  >

                    <div
                      className="
                        flex
                        justify-between
                      "
                    >

                      <span
                        className="
                          font-mono
                          text-cyan-300
                        "
                      >
                        |{item.state}âŸ©
                      </span>


                      <span
                        className="
                          text-gray-300
                        "
                      >
                        {item.probability.toFixed(1)}%
                      </span>

                    </div>

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
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
            "
          >

            <h2
              className="
                text-2xl
                font-semibold
              "
            >
              Understand the Result
            </h2>


            <p
              className="
                text-gray-400
                mt-2
              "
            >
              Your actual Grover simulation result
              has been saved for the AI Tutor.
            </p>


            <Link
              href="/tutor"
              className="
                inline-block
                mt-5
                px-6
                py-3
                rounded-xl
                bg-cyan-400
                text-black
                font-semibold
                hover:bg-cyan-300
              "
            >
              Ask AI Tutor â†’
            </Link>

          </section>

        )}

      </div>

    </main>

  );
}



