"""Unit tests for the circuit-aware offline tutor fallback.

Proves that /circuit/explain and /circuit/fix requests are answered by
the circuit-analysis path, never by the generic keyword concept cards,
and that different circuits produce different explanations.

Run with pytest, or directly:  python tests/test_circuit_fallback.py
"""

import os
import sys

sys.path.insert(
    0,
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
)

from api.tutor import TutorRequest, local_tutor_answer  # noqa: E402


QUBIT_CARD = local_tutor_answer(TutorRequest(question="what is a qubit"))

H_CNOT = [
    {"gate": "H", "qubit": 0},
    {"gate": "CNOT", "control": 0, "target": 1},
]

RX_RY = [
    {"gate": "RX", "qubit": 0, "angle": 0.5},
    {"gate": "RY", "qubit": 0, "angle": 1.2},
]

Z_Z = [
    {"gate": "Z", "qubit": 0},
    {"gate": "Z", "qubit": 0},
]


def _explain(operations, qubits=2):
    return local_tutor_answer(
        TutorRequest(
            question="Explain the following quantum circuit to a beginner.",
            circuit_context={
                "mode": "explain",
                "qubits": qubits,
                "operations": operations,
            },
        )
    )


def _fix(operations, qubits=2, simulation_error=None):
    return local_tutor_answer(
        TutorRequest(
            question="Fix this quantum circuit.",
            circuit_context={
                "mode": "fix",
                "qubits": qubits,
                "operations": operations,
                "simulation_error": simulation_error,
            },
        )
    )


def test_h_cnot_is_not_generic_qubit_card():
    answer = _explain(H_CNOT)
    assert answer != QUBIT_CARD
    assert "superposition" in answer.lower()
    assert "entangle" in answer.lower()
    assert "Bell" in answer


def test_rx_ry_is_not_generic_qubit_card():
    answer = _explain(RX_RY)
    assert answer != QUBIT_CARD
    assert "Bloch" in answer
    assert "rotation" in answer.lower()


def test_z_z_is_not_generic_qubit_card():
    answer = _explain(Z_Z)
    assert answer != QUBIT_CARD
    assert "phase" in answer.lower()


def test_different_circuits_produce_different_explanations():
    a = _explain(H_CNOT)
    b = _explain(RX_RY)
    c = _explain(Z_Z)
    assert a != b
    assert b != c
    assert a != c


def test_explain_and_fix_produce_different_outputs():
    assert _explain(H_CNOT) != _fix(H_CNOT)
    assert _explain(Z_Z) != _fix(Z_Z)


def test_fix_detects_canceling_z_pair():
    answer = _fix(Z_Z)
    assert "Gate cancellations" in answer
    assert "removed" in answer.lower()


def test_fix_reports_simulation_error():
    answer = _fix(
        [{"gate": "CNOT", "control": 0, "target": 0}],
        simulation_error="CNOT control and target cannot be the same qubit.",
    )
    assert "Simulation problems" in answer
    assert "cannot be the same qubit" in answer


def test_fix_merges_same_axis_rotations():
    answer = _fix(
        [
            {"gate": "RX", "qubit": 0, "angle": 0.5},
            {"gate": "RX", "qubit": 0, "angle": 0.7},
        ]
    )
    assert "Potential redundancies" in answer


def test_tutor_chat_keyword_cards_still_work():
    assert local_tutor_answer(TutorRequest(question="what is a qubit")) == QUBIT_CARD
    assert "Superposition" in local_tutor_answer(
        TutorRequest(question="tell me about superposition")
    )


def test_algorithm_branches_unchanged():
    answer = local_tutor_answer(
        TutorRequest(
            question="why did I get 11?",
            algorithm_context={"algorithm": "Grover's Algorithm", "target": "11"},
        )
    )
    assert "Grover" in answer
    assert answer != QUBIT_CARD


def test_explain_is_state_evolution_narrative():
    answer = _explain(H_CNOT)
    assert "### Circuit Overview" in answer
    assert "### How the Circuit Evolves" in answer
    assert "**Step 1**" in answer
    assert "**Step 2**" in answer
    assert "### Expected Measurement Results" in answer


def test_explain_has_relevant_concepts_and_takeaway():
    answer = _explain(H_CNOT)
    assert "### Key Quantum Concepts" in answer
    assert "**Superposition**" in answer
    assert "**Entanglement**" in answer
    assert "### Takeaway" in answer
    assert "Bell-state generator" in answer

    phase_only = _explain([{"gate": "Z", "qubit": 0}])
    assert "**Superposition**" not in phase_only
    assert "**Entanglement**" not in phase_only


def test_fix_sections_match_phase4_structure():
    answer = _fix(H_CNOT)
    for heading in (
        "### Circuit Analysis",
        "### Findings",
        "### Suggested Improvements",
        "### Optimized Circuit",
        "### Expected Benefit",
    ):
        assert heading in answer

    assert "✓" in answer
    assert "1. " in answer


def test_no_provider_internals_in_circuit_output():
    for answer in (_explain(H_CNOT), _fix(H_CNOT), _fix(Z_Z)):
        lowered = answer.lower()
        assert "offline" not in lowered
        assert "fallback" not in lowered
        assert "gemini" not in lowered
        assert "provider" not in lowered
        assert "quota" not in lowered


def test_fix_detects_hh_cancellation_and_optimizes():
    answer = _fix(
        [
            {"gate": "H", "qubit": 0},
            {"gate": "H", "qubit": 0},
            {"gate": "RZ", "qubit": 0, "angle": 0.4},
        ]
    )
    assert "Gate cancellations" in answer
    assert "H·H = I" in answer
    assert "### Optimized Circuit" in answer
    assert "RZ on q0 with angle 0.4" in answer
    assert "1 operation" in answer or "only 1" in answer


def test_fix_detects_xx_cancellation():
    answer = _fix([{"gate": "X", "qubit": 1}, {"gate": "X", "qubit": 1}])
    assert "Gate cancellations" in answer
    assert "X·X = I" in answer
    assert "acts as the identity" in answer


def test_fix_detects_cnot_pair_cancellation():
    cnot = {"gate": "CNOT", "control": 0, "target": 1}
    answer = _fix([cnot, dict(cnot)])
    assert "Gate cancellations" in answer
    assert "CNOT·CNOT = I" in answer


def test_fix_detects_ss_as_z():
    answer = _fix([{"gate": "S", "qubit": 0}, {"gate": "S", "qubit": 0}])
    assert "S·S = Z" in answer
    assert "Z on q0" in answer


def test_full_cancellation_optimizes_to_empty_circuit():
    answer = _fix([{"gate": "Z", "qubit": 0}, {"gate": "Z", "qubit": 0}])
    assert "empty circuit" in answer


def test_explain_hh_rz_reports_self_undo():
    answer = _explain(
        [
            {"gate": "H", "qubit": 0},
            {"gate": "H", "qubit": 0},
            {"gate": "RZ", "qubit": 0, "angle": 0.4},
        ]
    )
    assert "own inverse" in answer
    assert "measures 0" in answer


def test_explain_and_fix_differ_on_same_circuit():
    circuit = [
        {"gate": "H", "qubit": 0},
        {"gate": "H", "qubit": 0},
        {"gate": "RZ", "qubit": 0, "angle": 0.4},
    ]
    assert _explain(circuit) != _fix(circuit)


if __name__ == "__main__":
    failures = 0

    for name, function in sorted(globals().items()):
        if name.startswith("test_") and callable(function):
            try:
                function()
                print(f"PASS  {name}")
            except AssertionError as error:
                failures += 1
                print(f"FAIL  {name}: {error}")

    print(f"\n{len([n for n in globals() if n.startswith('test_')]) - failures} passed, {failures} failed")
    sys.exit(1 if failures else 0)
