import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes
from qiskit_machine_learning.algorithms import VQC
from qiskit_machine_learning.kernels import FidelityQuantumKernel
from qiskit_machine_learning.optimizers import COBYLA
from qiskit_machine_learning.utils import algorithm_globals
from sklearn.datasets import make_moons, make_circles
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from qiskit.primitives import StatevectorSampler as Sampler

algorithm_globals.random_seed = 42

def generate_data(dataset_type="moons", n_samples=100):
    if dataset_type == "moons":
        X, y = make_moons(n_samples=n_samples, noise=0.1)
    elif dataset_type == "circles":
        X, y = make_circles(n_samples=n_samples, factor=0.5, noise=0.1)
    else:
        # Default simple binary classification
        X = np.random.rand(n_samples, 2)
        y = (X[:, 0] + X[:, 1] > 1).astype(int)

    # Scale to [0, 1] for feature mapping
    scaler = MinMaxScaler(feature_range=(0, np.pi))
    X = scaler.fit_transform(X)

    # Convert y to one-hot for VQC if needed, but here we keep it as 0, 1
    # VQC expects labels in {0, 1} for binary classification
    return train_test_split(X, y, test_size=0.2, random_state=42)

def run_vqc_experiment(dataset_type="moons", iterations=10):
    X_train, X_test, y_train, y_test = generate_data(dataset_type)

    num_qubits = 2
    feature_map = ZZFeatureMap(feature_dimension=num_qubits, reps=1)
    ansatz = RealAmplitudes(num_qubits=num_qubits, reps=1)

    # Callback to capture training history
    history = []
    def callback(weights, loss):
        history.append(float(loss))

    sampler = Sampler()
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=COBYLA(maxiter=iterations),
        callback=callback,
        sampler=sampler
    )

    vqc.fit(X_train, y_train)

    score = vqc.score(X_test, y_test)
    predictions = vqc.predict(X_test)

    # Circuit metrics
    full_circuit = vqc.circuit
    # Actually we need to transpile or just look at the components
    gate_count = feature_map.size() + ansatz.size()
    depth = feature_map.depth() + ansatz.depth()

    return {
        "algorithm": "VQC",
        "accuracy": float(score),
        "loss_history": history,
        "qubit_count": num_qubits,
        "gate_count": gate_count,
        "circuit_depth": depth,
        "test_data": X_test.tolist(),
        "test_labels": y_test.tolist(),
        "predictions": predictions.tolist()
    }

def run_qsvc_experiment(dataset_type="moons"):
    # QSVC is usually slower as it computes the kernel matrix
    X_train, X_test, y_train, y_test = generate_data(dataset_type, n_samples=40)

    num_qubits = 2
    feature_map = ZZFeatureMap(feature_dimension=num_qubits, reps=1)

    kernel = FidelityQuantumKernel(feature_map=feature_map)

    # QSVC from qiskit_machine_learning.algorithms doesn't exist anymore in latest versions
    # Use SKLearn SVC with custom kernel
    from sklearn.svm import SVC

    # Precompute kernels
    matrix_train = kernel.evaluate(x_vec=X_train, y_vec=X_train)
    matrix_test = kernel.evaluate(x_vec=X_test, y_vec=X_train)

    svc = SVC(kernel="precomputed")
    svc.fit(matrix_train, y_train)
    score = svc.score(matrix_test, y_test)
    predictions = svc.predict(matrix_test)

    return {
        "algorithm": "QSVC",
        "accuracy": float(score),
        "qubit_count": num_qubits,
        "gate_count": feature_map.size(),
        "circuit_depth": feature_map.depth(),
        "test_data": X_test.tolist(),
        "test_labels": y_test.tolist(),
        "predictions": predictions.tolist()
    }
