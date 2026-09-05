from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


def run_gate(gate: str, shots: int = 1000):
    if gate == "CNOT":
        circuit = QuantumCircuit(2, 2)

        circuit.cx(0, 1)

        circuit.measure(0, 0)
        circuit.measure(1, 1)

    else:
        circuit = QuantumCircuit(1, 1)

        if gate == "H":
            circuit.h(0)
        elif gate == "X":
            circuit.x(0)
        elif gate == "Z":
            circuit.z(0)
        else:
            raise ValueError(f"Unsupported gate: {gate}")

        circuit.measure(0, 0)

    simulator = AerSimulator()
    result = simulator.run(circuit, shots=shots).result()

    return result.get_counts()