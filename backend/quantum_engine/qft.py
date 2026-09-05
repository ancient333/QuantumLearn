import numpy as np


def qft_amplitudes(qubits: int):
    """
    Calculate the Quantum Fourier Transform matrix
    for the given number of qubits.

    The dimension of the quantum state space is 2^qubits.
    """

    if qubits < 1:
        raise ValueError(
            "QFT requires at least 1 qubit."
        )

    if qubits > 6:
        raise ValueError(
            "QFT supports at most 6 qubits."
        )

    dimension = 2 ** qubits

    matrix = np.zeros(
        (dimension, dimension),
        dtype=complex,
    )

    for y in range(dimension):

        for x in range(dimension):

            angle = (
                2
                * np.pi
                * x
                * y
                / dimension
            )

            matrix[y, x] = (
                np.exp(1j * angle)
                / np.sqrt(dimension)
            )

    return matrix


def apply_qft(
    qubits: int,
    state: list[complex] | None = None,
):
    """
    Apply the Quantum Fourier Transform
    to a quantum state.

    If no state is provided, the circuit starts
    in |0...0>.
    """

    if qubits < 1:
        raise ValueError(
            "QFT requires at least 1 qubit."
        )

    dimension = 2 ** qubits

    if state is None:

        state_vector = np.zeros(
            dimension,
            dtype=complex,
        )

        state_vector[0] = 1.0

    else:

        if len(state) != dimension:
            raise ValueError(
                f"State must contain exactly "
                f"{dimension} amplitudes."
            )

        state_vector = np.array(
            state,
            dtype=complex,
        )

    matrix = qft_amplitudes(qubits)

    transformed_state = (
        matrix @ state_vector
    )

    probabilities = (
        np.abs(transformed_state) ** 2
    )

    return {
        "qubits": qubits,
        "dimension": dimension,
        "input_state": [
            {
                "real": float(value.real),
                "imaginary": float(value.imag),
            }
            for value in state_vector
        ],
        "output_state": [
            {
                "real": float(value.real),
                "imaginary": float(value.imag),
            }
            for value in transformed_state
        ],
        "probabilities": [
            float(probability)
            for probability in probabilities
        ],
    }


def build_qft_steps(qubits: int):
    """
    Build educational step-by-step information
    for the QFT algorithm.
    """

    return [
        {
            "step": 1,
            "title": "Prepare the quantum state",
            "description": (
                "Start with a quantum register containing "
                f"{qubits} qubit(s). The initial state is "
                "|0...0>."
            ),
        },
        {
            "step": 2,
            "title": "Create superposition",
            "description": (
                "Hadamard gates can place qubits into "
                "superposition so that multiple basis states "
                "can be processed simultaneously."
            ),
        },
        {
            "step": 3,
            "title": "Apply controlled phase rotations",
            "description": (
                "Controlled phase rotations introduce "
                "relative phases between components of "
                "the quantum state."
            ),
        },
        {
            "step": 4,
            "title": "Apply the Fourier transform",
            "description": (
                "The Quantum Fourier Transform changes the "
                "representation of the quantum state from "
                "the computational basis into a frequency-like "
                "representation."
            ),
        },
        {
            "step": 5,
            "title": "Measure the result",
            "description": (
                "Measurement converts the final quantum state "
                "into classical outcomes according to the "
                "resulting probability distribution."
            ),
        },
    ]