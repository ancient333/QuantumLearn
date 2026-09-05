from fastapi import APIRouter
from pydantic import BaseModel, Field

from quantum_engine.algorithms import (
    deutsch_jozsa,
    grover,
    quantum_teleportation,
)

from quantum_engine.shor import (
    factor_number,
    build_shor_steps,
)

from quantum_engine.qft import (
    apply_qft,
    build_qft_steps,
)

from quantum_engine.bb84 import (
    simulate_bb84,
)


router = APIRouter(
    prefix="/algorithms",
    tags=["Quantum Algorithms"],
)


# ==================================================
# Request Models
# ==================================================

class DeutschJozsaRequest(BaseModel):

    function_type: str = "constant"

    shots: int = Field(
        default=1000,
        ge=100,
        le=10000,
    )


class GroverRequest(BaseModel):

    target: str = "00"

    shots: int = Field(
        default=1000,
        ge=100,
        le=10000,
    )


class TeleportationRequest(BaseModel):

    input_state: str = "0"

    shots: int = Field(
        default=1000,
        ge=100,
        le=10000,
    )


class ShorRequest(BaseModel):

    number: int = Field(
        default=15,
        ge=2,
    )

    base: int | None = None


class QFTRequest(BaseModel):

    qubits: int = Field(
        default=2,
        ge=1,
        le=6,
    )

    state: list[complex] | None = None


class BB84Request(BaseModel):

    bits: int = Field(
        default=8,
        ge=2,
        le=64,
    )

    eavesdropper: bool = False


# ==================================================
# Deutsch–Jozsa
# ==================================================

@router.post("/deutsch-jozsa")
def run_deutsch_jozsa_algorithm(
    request: DeutschJozsaRequest,
):

    return deutsch_jozsa(
        function_type=request.function_type,
        shots=request.shots,
    )


# ==================================================
# Grover
# ==================================================

@router.post("/grover")
def run_grover_algorithm(
    request: GroverRequest,
):

    return grover(
        target=request.target,
        shots=request.shots,
    )


# ==================================================
# Quantum Teleportation
# ==================================================

@router.post("/quantum-teleportation")
def run_teleportation_algorithm(
    request: TeleportationRequest,
):

    return quantum_teleportation(
        input_state=request.input_state,
        shots=request.shots,
    )


# ==================================================
# Shor's Algorithm
# ==================================================

@router.post("/shor")
def run_shor_algorithm(
    request: ShorRequest,
):

    result = factor_number(
        number=request.number,
        base=request.base,
    )

    result["steps"] = build_shor_steps(
        number=request.number,
        base=result["base"],
        period=result["period"],
        factors=result["factors"],
    )

    result["qft_explanation"] = (
        "Shor's algorithm uses the Quantum Fourier "
        "Transform to extract the periodic structure "
        "of modular exponentiation."
    )

    result["workflow"] = [
        "Choose a number N to factor.",
        "Choose a base a that is coprime with N.",
        "Prepare a quantum superposition of possible exponents.",
        "Evaluate the periodic function a^x mod N.",
        "Use the Quantum Fourier Transform to reveal the period.",
        "Use the period to calculate non-trivial factors.",
    ]

    return result


# ==================================================
# Quantum Fourier Transform
# ==================================================

@router.post("/qft")
def run_qft_algorithm(
    request: QFTRequest,
):

    result = apply_qft(
        qubits=request.qubits,
        state=request.state,
    )

    result["algorithm"] = (
        "Quantum Fourier Transform"
    )

    result["steps"] = build_qft_steps(
        request.qubits
    )

    result["workflow"] = [
        "Prepare the quantum state.",
        "Create superposition.",
        "Apply controlled phase rotations.",
        "Apply the Quantum Fourier Transform.",
        "Measure the resulting state.",
    ]

    return result


# ==================================================
# BB84 Quantum Key Distribution
# ==================================================

@router.post("/bb84")
def run_bb84_algorithm(
    request: BB84Request,
):

    result = simulate_bb84(
        bits=request.bits,
        eavesdropper=request.eavesdropper,
    )


    result["steps"] = [
        {
            "step": 1,
            "title": "Alice generates random bits",
            "description": (
                "Alice creates a random sequence of "
                "classical bits that will be encoded "
                "into quantum states."
            ),
        },
        {
            "step": 2,
            "title": "Alice chooses random bases",
            "description": (
                "For every bit, Alice randomly chooses "
                "either the computational Z basis or "
                "the X basis."
            ),
        },
        {
            "step": 3,
            "title": "Quantum transmission",
            "description": (
                "Alice sends the encoded quantum states "
                "to Bob through the quantum channel."
            ),
        },
        {
            "step": 4,
            "title": "Bob measures the qubits",
            "description": (
                "Bob independently chooses a random basis "
                "for each incoming quantum state."
            ),
        },
        {
            "step": 5,
            "title": "Basis comparison",
            "description": (
                "Alice and Bob publicly compare their bases "
                "without revealing the actual bit values."
            ),
        },
        {
            "step": 6,
            "title": "Key sifting",
            "description": (
                "Only the positions where Alice and Bob "
                "used the same basis are retained."
            ),
        },
        {
            "step": 7,
            "title": "Eavesdropper detection",
            "description": (
                "Errors in the sifted key can indicate that "
                "the quantum channel was disturbed."
            ),
        },
    ]


    result["workflow"] = [
        "Alice generates random bits and random bases.",
        "Alice encodes each bit using its selected basis.",
        "The quantum states are transmitted to Bob.",
        "Bob independently chooses random measurement bases.",
        "Alice and Bob compare their bases.",
        "They keep only matching-basis measurements.",
        "The resulting errors are checked for possible eavesdropping.",
    ]


    return result