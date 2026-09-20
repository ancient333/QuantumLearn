from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator

import math

from quantum_engine.circuit_simulator import simulate_circuit

from api.tutor import (
    MODEL_NAME,
    TUTOR_PROVIDER,
    TutorRequest,
    generate_gemini_answer,
    local_tutor_answer,
)


LOCAL_TUTOR_MODEL = "QuantumLearn Circuit Analysis"


def tutor_pipeline_answer(
    question: str,
    circuit_context: dict | None = None,
) -> dict:
    """
    Route a prompt through the same Gemini pipeline used by
    /tutor/chat. Gemini errors never leak into the answer:
    on failure we return the AI Tutor's local fallback.

    circuit_context marks the request as a circuit analysis
    so the offline fallback uses the circuit-aware path.
    """

    request = TutorRequest(
        question=question,
        circuit_context=circuit_context,
    )

    if TUTOR_PROVIDER == "local":
        return {
            "answer": local_tutor_answer(request),
            "model": LOCAL_TUTOR_MODEL,
            "provider": "local",
        }

    try:
        return {
            "answer": generate_gemini_answer(request),
            "model": MODEL_NAME,
            "provider": "gemini",
        }

    except Exception as error:

        print(
            "Circuit tutor Gemini unavailable, "
            f"using local fallback: {error}"
        )

        return {
            "answer": local_tutor_answer(request),
            "model": LOCAL_TUTOR_MODEL,
            "provider": "local-fallback",
        }


router = APIRouter(
    prefix="/circuit",
    tags=["Quantum Circuit Builder"],
)


# ==================================================
# Request Models
# ==================================================

SINGLE_QUBIT_GATES = {"H", "X", "Y", "Z", "S", "T"}
ROTATION_GATES = {"RX", "RY", "RZ"}
MEASUREMENT_GATES = {"MEASURE", "MEASUREMENT"}
SUPPORTED_GATES = SINGLE_QUBIT_GATES | ROTATION_GATES | MEASUREMENT_GATES | {"CNOT", "SWAP"}


class CircuitOperation(BaseModel):
    """One gate in a circuit-analysis request.

    Every gate must arrive with the qubit fields its type requires, so
    downstream analysis can never see a missing (None) qubit index.
    """

    gate: str

    qubit: int | None = None

    control: int | None = None
    target: int | None = None

    qubit1: int | None = None
    qubit2: int | None = None

    angle: float | None = None

    @model_validator(mode="after")
    def validate_gate_payload(self):
        try:
            self._validate_fields()
        except ValueError as error:
            raise ValueError(f"Invalid '{self.gate}' operation: {error}") from error

        return self

    def _validate_fields(self):
        self.gate = str(self.gate).strip().upper()

        if not self.gate:
            raise ValueError("gate name is missing.")

        if self.gate not in SUPPORTED_GATES:
            raise ValueError(
                "unsupported gate. Supported gates: "
                f"{', '.join(sorted(SUPPORTED_GATES))}."
            )

        problems: list[str] = []

        if self.gate in SINGLE_QUBIT_GATES | MEASUREMENT_GATES:
            self._check_int("qubit", problems)

        elif self.gate in ROTATION_GATES:
            self._check_int("qubit", problems)

            if self.angle is None or isinstance(self.angle, bool):
                problems.append(
                    "a numeric angle is required "
                    "(use 0 for a zero rotation)"
                )
            elif not math.isfinite(self.angle):
                problems.append("angle must be a finite number")

        elif self.gate == "CNOT":
            control = self._check_int("control", problems)
            target = self._check_int("target", problems)

            if (
                control is not None
                and target is not None
                and control == target
            ):
                problems.append(
                    "control and target must be different qubits"
                )

        elif self.gate == "SWAP":
            qubit1 = self._check_int("qubit1", problems)
            qubit2 = self._check_int("qubit2", problems)

            if (
                qubit1 is not None
                and qubit2 is not None
                and qubit1 == qubit2
            ):
                problems.append(
                    "qubit1 and qubit2 must be different qubits"
                )

        if problems:
            raise ValueError("; ".join(problems) + ".")

    def _check_int(self, field, problems):
        value = getattr(self, field)

        if value is None or isinstance(value, bool):
            problems.append(f"the '{field}' field is required")
            return None

        if value < 0:
            problems.append(
                f"'{field}' must be a non-negative qubit index"
            )

        return value


def validate_operation_qubit_indices(operations, qubits):
    """Reject qubit indices beyond the declared register size.

    Called by the analysis routes before the analyzer runs; the
    simulator and code generator already enforce this themselves.
    """

    for index, operation in enumerate(operations, start=1):
        for field in ("qubit", "control", "target", "qubit1", "qubit2"):
            value = operation.get(field)

            if value is not None and value >= qubits:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Step {index}: {field} q{value} is out of range "
                        f"for a {qubits}-qubit circuit. "
                        f"Valid indices are 0 to {qubits - 1}."
                    ),
                )


class CircuitSimulationRequest(BaseModel):
    qubits: int = Field(
        default=2,
        ge=1,
        le=8,
    )

    operations: list[CircuitOperation] = Field(
        default_factory=list
    )

    shots: int = Field(
        default=1000,
        ge=1,
        le=10000,
    )


class CircuitExplanationRequest(BaseModel):
    qubits: int = Field(
        default=2,
        ge=1,
        le=8,
    )

    operations: list[CircuitOperation] = Field(
        default_factory=list
    )


class CircuitFixRequest(BaseModel):
    qubits: int = Field(
        default=2,
        ge=1,
        le=8,
    )

    operations: list[CircuitOperation] = Field(
        default_factory=list
    )


class CircuitCodeRequest(BaseModel):
    qubits: int = Field(
        default=2,
        ge=1,
        le=8,
    )

    operations: list[CircuitOperation] = Field(
        default_factory=list
    )


# ==================================================
# Circuit Simulation
# ==================================================

@router.post("/simulate")
def simulate_quantum_circuit(
    request: CircuitSimulationRequest,
):

    try:

        operations = [
            operation.model_dump(
                exclude_none=True
            )
            for operation in request.operations
        ]

        result = simulate_circuit(
            qubits=request.qubits,
            operations=operations,
            shots=request.shots,
        )

        return {
            "success": True,
            "qubits": result["qubits"],
            "shots": result["shots"],
            "counts": result["counts"],
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Quantum circuit simulation failed: "
                f"{str(error)}"
            ),
        )


# ==================================================
# Explain My Circuit
# ==================================================

@router.post("/explain")
def explain_quantum_circuit(
    request: CircuitExplanationRequest,
):

    try:

        if not request.operations:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Add at least one gate "
                    "before requesting an explanation."
                ),
            )

        operations = [
            operation.model_dump(
                exclude_none=True
            )
            for operation in request.operations
        ]

        validate_operation_qubit_indices(
            operations,
            request.qubits,
        )

        circuit_description = []

        for index, operation in enumerate(
            operations,
            start=1,
        ):

            gate = operation.get(
                "gate",
                "",
            ).upper()

            if gate == "CNOT":

                description = (
                    f"Step {index}: "
                    f"CNOT with control qubit "
                    f"q{operation.get('control')} "
                    f"and target qubit "
                    f"q{operation.get('target')}."
                )

            elif gate == "SWAP":

                description = (
                    f"Step {index}: "
                    f"SWAP between qubit "
                    f"q{operation.get('qubit1')} "
                    f"and qubit "
                    f"q{operation.get('qubit2')}."
                )

            elif gate in {
                "RX",
                "RY",
                "RZ",
            }:

                description = (
                    f"Step {index}: "
                    f"{gate} rotation on qubit "
                    f"q{operation.get('qubit')} "
                    f"with angle "
                    f"{operation.get('angle')} radians."
                )

            elif gate in {
                "MEASURE",
                "MEASUREMENT",
            }:

                description = (
                    f"Step {index}: "
                    f"Measurement of qubit "
                    f"q{operation.get('qubit')}."
                )

            else:

                description = (
                    f"Step {index}: "
                    f"{gate} gate on qubit "
                    f"q{operation.get('qubit')}."
                )

            circuit_description.append(
                description
            )

        circuit_text = "\n".join(
            circuit_description
        )

        prompt = f"""
You are an AI quantum computing tutor.

Explain the following quantum circuit to a beginner.

Number of qubits:
{request.qubits}

Circuit operations:
{circuit_text}

Your explanation must:

1. Explain what each gate does.
2. Explain what happens to the qubits step by step.
3. Explain the overall purpose or behavior of the circuit.
4. Explain important concepts such as superposition,
   entanglement, phase, or measurement when relevant.
5. Use simple language suitable for a student
   who is new to quantum computing.
6. Use Dirac notation such as |0⟩ and |1⟩
   when it makes the explanation clearer.
7. Do not assume advanced mathematical knowledge.
8. Do not invent gates or operations that are not
   present in the circuit.

Structure the answer as:

### Circuit Overview

A short explanation of what the circuit does.

### Step-by-Step

Explain every operation in order.

### What Happens to the Qubits

Explain the state changes in intuitive terms.

### Final Result

Explain what a student should expect when
the circuit is measured.
"""

        tutor_result = tutor_pipeline_answer(
            question=prompt,
            circuit_context={
                "mode": "explain",
                "qubits": request.qubits,
                "operations": operations,
            },
        )

        return {
            "success": True,
            "qubits": request.qubits,
            "operations": operations,
            "explanation": tutor_result["answer"],
            "model": tutor_result["model"],
            "provider": tutor_result["provider"],
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Circuit explanation failed: "
                f"{str(error)}"
            ),
        )


# ==================================================
# Fix My Circuit
# ==================================================

@router.post("/fix")
def fix_quantum_circuit(
    request: CircuitFixRequest,
):

    try:

        if not request.operations:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Add at least one gate "
                    "before requesting a circuit fix."
                ),
            )

        operations = [
            operation.model_dump(
                exclude_none=True
            )
            for operation in request.operations
        ]

        validate_operation_qubit_indices(
            operations,
            request.qubits,
        )

        simulation_error = None

        try:

            simulate_circuit(
                qubits=request.qubits,
                operations=operations,
                shots=100,
            )

        except Exception as error:

            simulation_error = str(error)

        circuit_description = []

        for index, operation in enumerate(
            operations,
            start=1,
        ):

            gate = operation.get(
                "gate",
                "",
            ).upper()

            if gate == "CNOT":

                description = (
                    f"Step {index}: "
                    f"CNOT control=q{operation.get('control')}, "
                    f"target=q{operation.get('target')}"
                )

            elif gate == "SWAP":

                description = (
                    f"Step {index}: "
                    f"SWAP q{operation.get('qubit1')} "
                    f"and q{operation.get('qubit2')}"
                )

            elif gate in {
                "RX",
                "RY",
                "RZ",
            }:

                description = (
                    f"Step {index}: "
                    f"{gate} q{operation.get('qubit')} "
                    f"angle={operation.get('angle')}"
                )

            elif gate in {
                "MEASURE",
                "MEASUREMENT",
            }:

                description = (
                    f"Step {index}: "
                    f"MEASURE q{operation.get('qubit')}"
                )

            else:

                description = (
                    f"Step {index}: "
                    f"{gate} q{operation.get('qubit')}"
                )

            circuit_description.append(
                description
            )

        circuit_text = "\n".join(
            circuit_description
        )

        if simulation_error:

            problem_description = (
                "The circuit produced this simulation error:\n"
                f"{simulation_error}"
            )

        else:

            problem_description = (
                "The circuit is syntactically valid and "
                "can be simulated. Look for logical or "
                "educational issues in the circuit."
            )

        prompt = f"""
You are an expert quantum computing tutor helping
a beginner fix a quantum circuit.

Number of qubits:
{request.qubits}

Circuit:
{circuit_text}

{problem_description}

Analyze the circuit carefully.

Your task is to:

1. Identify any invalid operation or likely mistake.
2. Explain why it is a problem.
3. Suggest how the circuit should be corrected.
4. Provide a corrected list of operations.
5. Keep the correction beginner-friendly.
6. Do not invent unnecessary operations.
7. Preserve correct operations whenever possible.

IMPORTANT:

Return the response using exactly this structure:

### Problem

Explain the detected problem.

### Why It Is a Problem

Explain the quantum computing reason.

### Suggested Fix

Explain what should be changed.

### Corrected Circuit

List the corrected operations in order.

If the circuit has no obvious error, say:

"No obvious circuit error was detected."

Then explain one improvement that could make
the circuit clearer or more useful for learning.

Do not claim that an operation is invalid unless
the provided circuit actually contains evidence
of that problem.
"""

        tutor_result = tutor_pipeline_answer(
            question=prompt,
            circuit_context={
                "mode": "fix",
                "qubits": request.qubits,
                "operations": operations,
                "simulation_error": simulation_error,
            },
        )

        return {
            "success": True,
            "qubits": request.qubits,
            "operations": operations,
            "simulation_error": simulation_error,
            "explanation": tutor_result["answer"],
            "model": tutor_result["model"],
            "provider": tutor_result["provider"],
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Circuit fix analysis failed: "
                f"{str(error)}"
            ),
        )


# ==================================================
# Code Generator
# ==================================================

@router.post("/code")
def generate_circuit_code(
    request: CircuitCodeRequest,
):

    try:

        if not request.operations:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Add at least one gate "
                    "before generating code."
                ),
            )

        operations = [
            operation.model_dump(
                exclude_none=True
            )
            for operation in request.operations
        ]

        # --------------------------------------------------
        # Validate the circuit first
        # --------------------------------------------------

        try:

            simulate_circuit(
                qubits=request.qubits,
                operations=operations,
                shots=10,
            )

        except Exception as error:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Cannot generate code for this circuit: "
                    f"{str(error)}"
                ),
            )

        # --------------------------------------------------
        # Generate Qiskit code
        # --------------------------------------------------

        code_lines = [
            "from qiskit import QuantumCircuit",
            "from qiskit_aer import AerSimulator",
            "",
            "",
            f"# Create a {request.qubits}-qubit quantum circuit",
            f"circuit = QuantumCircuit({request.qubits}, {request.qubits})",
            "",
        ]

        has_measurement = False

        for operation in operations:

            gate = str(
                operation.get(
                    "gate",
                    "",
                )
            ).upper()

            # ----------------------------------------------
            # Single-qubit gates
            # ----------------------------------------------

            if gate == "H":

                qubit = operation["qubit"]

                code_lines.append(
                    f"circuit.h({qubit})"
                )

            elif gate == "X":

                qubit = operation["qubit"]

                code_lines.append(
                    f"circuit.x({qubit})"
                )

            elif gate == "Y":

                qubit = operation["qubit"]

                code_lines.append(
                    f"circuit.y({qubit})"
                )

            elif gate == "Z":

                qubit = operation["qubit"]

                code_lines.append(
                    f"circuit.z({qubit})"
                )

            elif gate == "S":

                qubit = operation["qubit"]

                code_lines.append(
                    f"circuit.s({qubit})"
                )

            elif gate == "T":

                qubit = operation["qubit"]

                code_lines.append(
                    f"circuit.t({qubit})"
                )

            # ----------------------------------------------
            # Rotation gates
            # ----------------------------------------------

            elif gate == "RX":

                qubit = operation["qubit"]
                angle = operation["angle"]

                code_lines.append(
                    f"circuit.rx({angle}, {qubit})"
                )

            elif gate == "RY":

                qubit = operation["qubit"]
                angle = operation["angle"]

                code_lines.append(
                    f"circuit.ry({angle}, {qubit})"
                )

            elif gate == "RZ":

                qubit = operation["qubit"]
                angle = operation["angle"]

                code_lines.append(
                    f"circuit.rz({angle}, {qubit})"
                )

            # ----------------------------------------------
            # CNOT
            # ----------------------------------------------

            elif gate == "CNOT":

                control = operation["control"]
                target = operation["target"]

                code_lines.append(
                    f"circuit.cx({control}, {target})"
                )

            # ----------------------------------------------
            # SWAP
            # ----------------------------------------------

            elif gate == "SWAP":

                qubit1 = operation["qubit1"]
                qubit2 = operation["qubit2"]

                code_lines.append(
                    f"circuit.swap({qubit1}, {qubit2})"
                )

            # ----------------------------------------------
            # Measurement
            # ----------------------------------------------

            elif gate in {
                "MEASURE",
                "MEASUREMENT",
            }:

                qubit = operation["qubit"]

                code_lines.append(
                    f"circuit.measure({qubit}, {qubit})"
                )

                has_measurement = True

        # --------------------------------------------------
        # Automatically measure if needed
        # --------------------------------------------------

        if not has_measurement:

            code_lines.append("")
            code_lines.append(
                "# Measure all qubits"
            )
            code_lines.append(
                "circuit.measure_all()"
            )

        # --------------------------------------------------
        # Add simulator code
        # --------------------------------------------------

        code_lines.extend([
            "",
            "",
            "# Run the circuit",
            "simulator = AerSimulator()",
            "result = simulator.run(",
            "    circuit,",
            "    shots=1000,",
            ").result()",
            "",
            "# Get measurement results",
            "counts = result.get_counts()",
            "",
            "print(counts)",
        ])

        code = "\n".join(
            code_lines
        )

        return {
            "success": True,
            "language": "python",
            "framework": "Qiskit",
            "qubits": request.qubits,
            "operations": operations,
            "code": code,
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Code generation failed: "
                f"{str(error)}"
            ),
        )