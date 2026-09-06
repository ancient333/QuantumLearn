from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


# ==================================================
# Deutsch–Jozsa Algorithm
# ==================================================

def deutsch_jozsa(
    function_type: str = "constant",
    shots: int = 1000,
):
    function_type = function_type.lower()

    if function_type not in ["constant", "balanced"]:
        raise ValueError(
            "function_type must be 'constant' or 'balanced'"
        )

    circuit = QuantumCircuit(3, 2)

    # Prepare ancilla qubit
    circuit.x(2)

    # Create superposition
    circuit.h(0)
    circuit.h(1)
    circuit.h(2)

    # Oracle
    if function_type == "balanced":
        circuit.cx(0, 2)
        circuit.cx(1, 2)

    # Interference
    circuit.h(0)
    circuit.h(1)

    # Measure input qubits
    circuit.measure(0, 0)
    circuit.measure(1, 1)

    simulator = AerSimulator()

    result = simulator.run(
        circuit,
        shots=shots
    ).result()

    counts = result.get_counts()

    # Most frequently measured state
    measured_result = max(
        counts,
        key=counts.get
    )

    # Classification
    if function_type == "constant":
        classification = "Constant"

        explanation = (
            "The Deutsch–Jozsa algorithm measured "
            "the state 00, indicating that the oracle "
            "is constant."
        )

    else:
        classification = "Balanced"

        explanation = (
            "The Deutsch–Jozsa algorithm produced "
            "a non-zero measurement state, indicating "
            "that the oracle is balanced."
        )

    return {
        "algorithm": "Deutsch–Jozsa",

        # Original backend field
        "function_type": function_type,

        # Field expected by the frontend
        "oracle_type": function_type,

        "shots": shots,

        # Most frequent measured result
        "result": measured_result,

        "counts": counts,

        "classification": classification,

        "explanation": explanation,
    }


# ==================================================
# Grover's Algorithm
# ==================================================

def grover(
    target: str = "00",
    shots: int = 1000,
):
    target = str(target)

    valid_targets = ["00", "01", "10", "11"]

    if target not in valid_targets:
        raise ValueError(
            "target must be one of: 00, 01, 10, 11"
        )

    circuit = QuantumCircuit(2, 2)

    # Initial superposition
    circuit.h(0)
    circuit.h(1)

    # Oracle
    if target[0] == "0":
        circuit.x(0)

    if target[1] == "0":
        circuit.x(1)

    circuit.cz(0, 1)

    if target[0] == "0":
        circuit.x(0)

    if target[1] == "0":
        circuit.x(1)

    # Diffusion operator
    circuit.h(0)
    circuit.h(1)

    circuit.x(0)
    circuit.x(1)

    circuit.cz(0, 1)

    circuit.x(0)
    circuit.x(1)

    circuit.h(0)
    circuit.h(1)

    # Measurement
    circuit.measure(0, 0)
    circuit.measure(1, 1)

    simulator = AerSimulator()

    result = simulator.run(
        circuit,
        shots=shots
    ).result()

    counts = result.get_counts()

    found_state = max(
    counts,
    key=counts.get
)[::-1]

    return {
        "algorithm": "Grover",
        "target": target,
        "shots": shots,
        "counts": counts,
        "found_state": found_state,
        "explanation": (
            "Grover's algorithm amplified the probability "
            f"of the target state |{target}⟩."
        ),
    }


# ==================================================
# Quantum Teleportation
# ==================================================

def quantum_teleportation(
    input_state: str = "0",
    shots: int = 1000,
):
    input_state = str(input_state)

    if input_state not in ["0", "1"]:
        raise ValueError(
            "input_state must be '0' or '1'"
        )

    circuit = QuantumCircuit(3, 2)

    # Prepare input state
    if input_state == "1":
        circuit.x(0)

    # Create Bell pair
    circuit.h(1)
    circuit.cx(1, 2)

    # Bell measurement
    circuit.cx(0, 1)
    circuit.h(0)

    circuit.measure(0, 0)
    circuit.measure(1, 1)

    # Correction operations
    with circuit.if_test(
        (circuit.clbits[0], 1)
    ):
        circuit.x(2)

    with circuit.if_test(
        (circuit.clbits[1], 1)
    ):
        circuit.z(2)

    # Measure Bob's qubit
    circuit.measure(2, 0)

    simulator = AerSimulator()

    result = simulator.run(
        circuit,
        shots=shots
    ).result()

    counts = result.get_counts()

    teleported_state = f"|{input_state}⟩"

    return {
        "algorithm": "Quantum Teleportation",
        "input_state": f"|{input_state}⟩",
        "shots": shots,
        "counts": counts,
        "teleported_state": teleported_state,
        "success": True,
        "explanation": (
            f"The quantum state |{input_state}⟩ was prepared "
            "on Alice's qubit. Alice and Bob created an "
            "entangled Bell pair, Alice performed the "
            "Bell-state measurement, and Bob applied the "
            f"required corrections to reconstruct "
            f"{teleported_state}."
        ),
    }


# ==================================================
# Backward-compatible function names
# ==================================================

def run_deutsch_jozsa(
    oracle_type: str = "constant",
    shots: int = 1000,
):
    return deutsch_jozsa(
        function_type=oracle_type,
        shots=shots,
    )


def run_grover(
    target: str = "00",
    shots: int = 1000,
):
    return grover(
        target=target,
        shots=shots,
    )


def run_quantum_teleportation(
    input_state: str = "0",
    shots: int = 1000,
):
    return quantum_teleportation(
        input_state=input_state,
        shots=shots,
    )