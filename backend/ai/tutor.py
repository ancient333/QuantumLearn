import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types


# ==================================================
# Load environment variables
# ==================================================

load_dotenv(
    os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        ".env"
    )
)


# ==================================================
# Gemini API
# ==================================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. "
        "Please add it to backend/.env"
    )


client = genai.Client(
    api_key=api_key
)


# ==================================================
# AI Tutor
# ==================================================

def generate_tutor_response(
    question: str,
    history: list[dict] | None = None,
    quantum_context: dict | None = None,
    algorithm_context: dict | None = None,
    learning_progress: dict | None = None
) -> str:

    history = history or []


    # ==================================================
    # Convert conversation history to Gemini format
    # ==================================================

    gemini_history = []

    for message in history:

        role = message.get("role")
        content = message.get("content", "")

        if role == "user":

            gemini_history.append(
                types.Content(
                    role="user",
                    parts=[
                        types.Part(text=content)
                    ]
                )
            )

        elif role == "tutor":

            gemini_history.append(
                types.Content(
                    role="model",
                    parts=[
                        types.Part(text=content)
                    ]
                )
            )


    # ==================================================
    # System instructions
    # ==================================================

    system_instruction = """
You are QuantumLearn AI Tutor.

You are a friendly, intelligent tutor specializing in
quantum computing.

Your goal is to help students actually understand concepts,
not overwhelm them with information.


TEACHING STYLE:

1. Be concise and clear.
   Usually answer in 3-6 short paragraphs or bullet points.

2. Start with the direct answer.

3. Explain difficult concepts using simple language.

4. Use quantum notation when it genuinely helps:
   |0⟩, |1⟩, α|0⟩ + β|1⟩, etc.

5. When using mathematics, explain what the symbols mean.

6. Use examples when they make the concept easier.

7. Avoid unnecessarily long textbook-style explanations.

8. Do not repeat information that was already explained
   unless it is necessary for the student's follow-up question.

9. Use the conversation history to understand follow-up
   questions.

10. If the student says:
    "why?", "how?", "what about it?", "explain that",
    "give an example", etc., determine what they
    are referring to from the previous conversation.

11. Correct misconceptions politely.

12. Do not pretend that a quantum circuit was simulated
    unless actual simulation results were provided.

13. When algorithm execution context is provided, use the
    actual algorithm, oracle, measurement result, and
    classification when explaining the student's question.

14. If the student asks about a measurement result,
    explain that specific result rather than giving only
    a generic explanation.

15. Never invent a measurement result.
    Use the provided simulation result when one is available.

16. Stay focused on quantum computing.

17. Do not end every answer with:
    "Would you like to learn more?"
    Only suggest the next concept when it is genuinely useful.

18. When explaining a quantum gate, explain:
    - What it does
    - Which qubit(s) it acts on
    - The important state transformation
    - A simple example when useful

19. When explaining an algorithm, explain it step by step.

20. Treat the student as a beginner unless their question
    clearly demonstrates advanced knowledge.


LEARNING PROGRESS ADAPTATION:

The CURRENT LEARNING PROGRESS contains actual information
about the student's activity.

Use it to adapt explanations.

Important rules:

1. Never claim that the student completed something unless
   it appears in the provided progress.

2. Never invent learning progress.

3. If no algorithms have been completed, focus on foundations
   and simple examples.

4. If one algorithm has been completed, connect foundational
   concepts to the next algorithm instead of repeating all
   introductory material.

5. If multiple algorithms have been completed, gradually move
   toward deeper comparisons, oracle design, interference,
   amplitude amplification, complexity, and algorithm
   intuition when relevant.

6. If no gates have been explored, explain basic gates before
   assuming the student understands them.

7. If several gates have been explored, avoid unnecessarily
   repeating basic gate definitions.

8. If the student has performed many simulations, help them
   interpret measurement results and understand why those
   results occur.

9. If the Quantum Lab has been used, connect explanations to
   experiments and measurement results when useful.

10. If the Tutor has already been used, use the conversation
    history rather than restarting explanations from scratch.

11. Use the student's current algorithm or Quantum Lab context
    before making assumptions from general progress.

12. Progress should influence difficulty and examples, but
    should never prevent the student from asking basic
    questions.

13. Never tell the student that their progress is better or
    worse than it actually is.

14. If progress data is missing, simply teach the concept
    normally.


RESPONSE FORMAT:

Prefer a structure like:

Direct explanation

Key idea:
- Point 1
- Point 2

Example:
Simple example if useful.

Keep the response readable and conversational.
"""


    # ==================================================
    # Build current context
    # ==================================================

    context_text = ""


    # ==================================================
    # Quantum Lab Context
    # ==================================================

    if quantum_context:

        context_text += (
            "\n\nCURRENT QUANTUM LAB CONTEXT:\n"
            f"Gate: "
            f"{quantum_context.get('gate')}\n"
            f"Qubits: "
            f"{quantum_context.get('qubits')}\n"
            f"Initial state: "
            f"{quantum_context.get('initial_state')}\n"
            f"Final state: "
            f"{quantum_context.get('final_state')}\n"
            f"Operation: "
            f"{quantum_context.get('operation')}\n"
            f"Description: "
            f"{quantum_context.get('description')}\n"
            f"Explanation: "
            f"{quantum_context.get('explanation')}\n"
            "Use this context when relevant to the student's question."
        )


    # ==================================================
    # Quantum Algorithm Context
    # ==================================================

    if algorithm_context:

        context_text += (
            "\n\nCURRENT QUANTUM ALGORITHM CONTEXT:\n"
            f"Algorithm: "
            f"{algorithm_context.get('algorithm')}\n"
            f"Oracle type: "
            f"{algorithm_context.get('oracle_type')}\n"
            f"Classification: "
            f"{algorithm_context.get('classification')}\n"
            f"Measurement result: "
            f"{algorithm_context.get('result')}\n"
            f"Shots: "
            f"{algorithm_context.get('shots')}\n"
            f"Explanation: "
            f"{algorithm_context.get('explanation')}\n"
            "Use this algorithm context when answering questions "
            "about the student's current algorithm run."
        )


    # ==================================================
    # Learning Progress Context
    # ==================================================

    if learning_progress:

        completed_algorithms = (
            learning_progress.get(
                "completedAlgorithms",
                []
            )
        )

        gates_explored = (
            learning_progress.get(
                "gatesExplored",
                []
            )
        )

        simulations_run = (
            learning_progress.get(
                "simulationsRun",
                0
            )
        )

        lab_used = (
            learning_progress.get(
                "labUsed",
                False
            )
        )

        tutor_used = (
            learning_progress.get(
                "tutorUsed",
                False
            )
        )

        last_gate = (
            learning_progress.get(
                "lastGate",
                ""
            )
        )


        context_text += (
            "\n\nCURRENT LEARNING PROGRESS:\n"
            f"Completed algorithms: "
            f"{completed_algorithms}\n"
            f"Gates explored: "
            f"{gates_explored}\n"
            f"Simulations run: "
            f"{simulations_run}\n"
            f"Quantum Lab used: "
            f"{lab_used}\n"
            f"AI Tutor used before: "
            f"{tutor_used}\n"
            f"Last explored gate: "
            f"{last_gate}\n"
            "Use this progress to adapt the difficulty, "
            "examples, and explanation depth. "
            "Do not claim progress that is not listed."
        )


    # ==================================================
    # Create Gemini chat
    # ==================================================

    chat = client.chats.create(

        model="gemini-3.7-flash",

        history=gemini_history,

        config=types.GenerateContentConfig(

            system_instruction=system_instruction,

            temperature=0.6,

            max_output_tokens=600,
        ),
    )


    # ==================================================
    # Send message with retry and error handling
    # ==================================================

    max_attempts = 3

    for attempt in range(max_attempts):

        try:

            message = f"""
Current Quantum Learning Context:
{context_text}

Student question:
{question}
"""


            response = chat.send_message(
                message=message
            )


            # ------------------------------------------
            # Successful response
            # ------------------------------------------

            return response.text


        except Exception as error:

            error_text = str(error)


            # ==================================================
            # Gemini quota exceeded
            # ==================================================

            if (
                "RESOURCE_EXHAUSTED" in error_text
                or "429" in error_text
                or "Quota exceeded" in error_text
            ):

                return (
                    "The AI Tutor has temporarily reached the "
                    "Gemini API free-tier limit. "
                    "Your Quantum Lab and algorithm simulations "
                    "are still available. Please try the AI Tutor "
                    "again after the Gemini quota resets."
                )


            # ==================================================
            # Gemini temporary service overload
            # ==================================================

            if (
                "503" in error_text
                or "UNAVAILABLE" in error_text
            ):

                if attempt < max_attempts - 1:

                    time.sleep(2)

                    continue


                return (
                    "The Gemini AI service is temporarily "
                    "unavailable. Please try again shortly."
                )


            # ==================================================
            # Other Gemini errors
            # ==================================================

            return (
                "The AI Tutor is temporarily unavailable. "
                "Please check the backend server and try again."
            )