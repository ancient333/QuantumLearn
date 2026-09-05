from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


def simulate_circuit(
    qubits: int,
    operations: list[dict],
    shots: int = 1000,
):
    """
    Build and simulate a quantum circuit using Qiskit.

    Expected operation format:

    {
        "gate": "H",
        "qubit": 0
    }

    For CNOT:

    {
        "gate": "CNOT",
        "control": 0,
        "target": 1
    }

    For measurement:

    {
        "gate": "MEASURE",
        "qubit": 0
    }
    """

    # --------------------------------------------------
    # Validation
    # --------------------------------------------------

    if qubits < 1:
        raise ValueError("Circuit must contain at least one qubit.")

    if qubits > 8:
        raise ValueError("Circuit cannot contain more than 8 qubits.")

    if shots < 1:
        raise ValueError("Shots must be greater than 0.")

    if shots > 10000:
        raise ValueError("Shots cannot exceed 10000.")


    # --------------------------------------------------
    # Create circuit
    # --------------------------------------------------

    circuit = QuantumCircuit(
        qubits,
        qubits,
    )


    # --------------------------------------------------
    # Apply operations
    # --------------------------------------------------

    for operation in operations:

        gate = str(
            operation.get("gate", "")
        ).upper()


        # ----------------------------------------------
        # Single-qubit gates
        # ----------------------------------------------

        if gate in {
            "H",
            "X",
            "Y",
            "Z",
            "S",
            "T",
        }:

            qubit = operation.get("qubit")

            if qubit is None:
                raise ValueError(
                    f"{gate} gate requires a qubit."
                )

            if not 0 <= qubit < qubits:
                raise ValueError(
                    f"Invalid qubit index: {qubit}"
                )


            if gate == "H":
                circuit.h(qubit)

            elif gate == "X":
                circuit.x(qubit)

            elif gate == "Y":
                circuit.y(qubit)

            elif gate == "Z":
                circuit.z(qubit)

            elif gate == "S":
                circuit.s(qubit)

            elif gate == "T":
                circuit.t(qubit)


        # ----------------------------------------------
        # Rotation gates
        # ----------------------------------------------

        elif gate in {
            "RX",
            "RY",
            "RZ",
        }:

            qubit = operation.get("qubit")
            angle = operation.get("angle")

            if qubit is None:
                raise ValueError(
                    f"{gate} gate requires a qubit."
                )

            if angle is None:
                raise ValueError(
                    f"{gate} gate requires an angle."
                )

            if not 0 <= qubit < qubits:
                raise ValueError(
                    f"Invalid qubit index: {qubit}"
                )


            if gate == "RX":
                circuit.rx(angle, qubit)

            elif gate == "RY":
                circuit.ry(angle, qubit)

            elif gate == "RZ":
                circuit.rz(angle, qubit)


        # ----------------------------------------------
        # CNOT
        # ----------------------------------------------

        elif gate == "CNOT":

            control = operation.get("control")
            target = operation.get("target")

            if control is None or target is None:
                raise ValueError(
                    "CNOT requires control and target qubits."
                )

            if not 0 <= control < qubits:
                raise ValueError(
                    f"Invalid control qubit: {control}"
                )

            if not 0 <= target < qubits:
                raise ValueError(
                    f"Invalid target qubit: {target}"
                )

            if control == target:
                raise ValueError(
                    "CNOT control and target cannot be the same qubit."
                )

            circuit.cx(
                control,
                target,
            )


        # ----------------------------------------------
        # SWAP
        # ----------------------------------------------

        elif gate == "SWAP":

            qubit1 = operation.get("qubit1")
            qubit2 = operation.get("qubit2")

            if qubit1 is None or qubit2 is None:
                raise ValueError(
                    "SWAP requires two qubits."
                )

            if not 0 <= qubit1 < qubits:
                raise ValueError(
                    f"Invalid qubit index: {qubit1}"
                )

            if not 0 <= qubit2 < qubits:
                raise ValueError(
                    f"Invalid qubit index: {qubit2}"
                )

            if qubit1 == qubit2:
                raise ValueError(
                    "SWAP qubits must be different."
                )

            circuit.swap(
                qubit1,
                qubit2,
            )


        # ----------------------------------------------
        # Measurement
        # ----------------------------------------------

        elif gate in {
            "MEASURE",
            "MEASUREMENT",
        }:

            qubit = operation.get("qubit")

            if qubit is None:
                raise ValueError(
                    "Measurement requires a qubit."
                )

            if not 0 <= qubit < qubits:
                raise ValueError(
                    f"Invalid qubit index: {qubit}"
                )

            circuit.measure(
                qubit,
                qubit,
            )


        # ----------------------------------------------
        # Unsupported gate
        # ----------------------------------------------

        else:

            raise ValueError(
                f"Unsupported gate: {gate}"
            )


    # --------------------------------------------------
    # Automatically measure if no measurement exists
    # --------------------------------------------------

    has_measurement = any(
        instruction.operation.name == "measure"
        for instruction in circuit.data
    )

    if not has_measurement:

        circuit.measure_all()


    # --------------------------------------------------
    # Run Qiskit simulator
    # --------------------------------------------------

    simulator = AerSimulator()

    result = simulator.run(
        circuit,
        shots=shots,
    ).result()


    counts = result.get_counts()


    # --------------------------------------------------
    # Return result
    # --------------------------------------------------

    return {
        "qubits": qubits,
        "shots": shots,
        "counts": counts,
        "circuit": circuit,
    }