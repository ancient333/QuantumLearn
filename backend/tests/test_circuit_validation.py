"""Regression tests for strict circuit-analysis request validation.

Proves that malformed gate payloads are rejected with 400 Bad Request
before any analysis runs, so the analyzer can never emit "qNone" /
None-valued qubit references, and that valid payloads keep their
existing successful behavior.

Run with pytest, or directly:  python tests/test_circuit_validation.py
"""

import os
import sys

sys.path.insert(
    0,
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
)

# Circuit answers come from the local analyzer during tests so the
# validation suite never spends Gemini quota. The env var alone is not
# enough when pytest imports another module first: api.tutor reads it at
# import time, so pin the already-imported module globals too.
os.environ["TUTOR_PROVIDER"] = "local"

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402

import api.tutor  # noqa: E402
import api.circuit  # noqa: E402

api.tutor.TUTOR_PROVIDER = "local"

# circuit.py imported the name directly, so patch its own binding too.
import api.circuit  # noqa: E402

api.circuit.TUTOR_PROVIDER = "local"

client = TestClient(app)


def _post(route, payload):
    return client.post(route, json=payload)


def _assert_400(response):
    assert response.status_code == 400, (
        f"expected 400, got {response.status_code}: {response.text[:300]}"
    )
    detail = str(response.json()["detail"])
    assert "Field required" not in detail
    assert detail, "400 response must carry a clear validation message"


# Swaps expressed with the wrong shape (a `qubits` list) are exactly the
# malformed payload that used to sail through /circuit/explain and make
# the analyzer say "qNone".
SWAP_WRONG_SHAPE = {"gate": "SWAP", "qubits": [0, 1]}

ROUTES = ["/circuit/explain", "/circuit/fix"]

MALFORMED_CASES = [
    SWAP_WRONG_SHAPE,
    {"gate": "SWAP", "qubit1": 0},
    {"gate": "SWAP", "qubit1": 0, "qubit2": 0},
    {"gate": "CNOT", "control": 0},
    {"gate": "CNOT", "target": 1},
    {"gate": "CNOT", "control": 0, "target": 0},
    {"gate": "RZ", "qubit": 0},
    {"gate": "RX", "qubit": 0, "angle": "not-a-number"},
    {"gate": "RY", "qubit": 0, "angle": None},
    {"gate": "H"},
    {"gate": "X", "qubit": None},
    {"gate": "MEASURE"},
    {"gate": "CCX", "control": 0, "target": 2, "qubit": 1},
    {"gate": "", "qubit": 0},
]


def test_malformed_payloads_rejected_on_explain_and_fix():
    for route in ROUTES:
        for operation in MALFORMED_CASES:
            response = _post(route, {"qubits": 3, "operations": [operation]})
            _assert_400(response)


def test_swap_with_qubits_list_returns_clear_message():
    response = _post("/circuit/explain", {"qubits": 2, "operations": [SWAP_WRONG_SHAPE]})
    _assert_400(response)
    assert "SWAP" in response.json()["detail"]
    assert "qubit1" in response.json()["detail"]
    assert "qubit2" in response.json()["detail"]


def test_cnot_missing_control_target_names_both_fields():
    response = _post(
        "/circuit/explain",
        {"qubits": 2, "operations": [{"gate": "CNOT", "control": 0}]},
    )
    _assert_400(response)
    assert "target" in response.json()["detail"]


def test_rotation_non_numeric_angle_rejected():
    response = _post(
        "/circuit/explain",
        {"qubits": 2, "operations": [{"gate": "RZ", "qubit": 0, "angle": "pi/2"}]},
    )
    _assert_400(response)
    assert "angle" in response.json()["detail"]


def test_out_of_range_qubit_index_rejected_on_analysis_routes():
    for route in ROUTES:
        response = _post(route, {"qubits": 2, "operations": [{"gate": "H", "qubit": 5}]})
        _assert_400(response)
        assert "out of range" in response.json()["detail"]


def test_negative_qubit_index_rejected():
    response = _post(
        "/circuit/explain", {"qubits": 2, "operations": [{"gate": "H", "qubit": -1}]}
    )
    _assert_400(response)


def test_valid_payloads_still_accepted():
    cases = [
        [
            {"gate": "H", "qubit": 0},
            {"gate": "CNOT", "control": 0, "target": 1},
        ],
        [
            {"gate": "H", "qubit": 0},
            {"gate": "RZ", "qubit": 0, "angle": 1.5707963267948966},
            {"gate": "SWAP", "qubit1": 0, "qubit2": 1},
            {"gate": "T", "qubit": 1},
        ],
        [
            {"gate": "RX", "qubit": 1, "angle": -0.7},
            {"gate": "MEASURE", "qubit": 1},
        ],
    ]
    for route in ROUTES:
        for operations in cases:
            response = _post(route, {"qubits": 2, "operations": operations})
            assert response.status_code == 200, response.text[:300]
            body = response.json()
            assert body["success"] is True
            assert body["explanation"]


def test_accepted_output_has_no_none_qubit_references():
    response = _post(
        "/circuit/explain",
        {
            "qubits": 2,
            "operations": [
                {"gate": "H", "qubit": 0},
                {"gate": "CNOT", "control": 0, "target": 1},
            ],
        },
    )
    answer = response.json()["explanation"]
    assert "qNone" not in answer
    assert "None" not in answer
    assert "undefined" not in answer


def test_simulate_and_code_reject_malformed_gates():
    for route in ("/circuit/simulate", "/circuit/code"):
        for operation in (SWAP_WRONG_SHAPE, {"gate": "CNOT", "control": 0}):
            response = _post(route, {"qubits": 2, "operations": [operation]})
            _assert_400(response)


def test_wellformed_swap_still_simulates():
    response = _post(
        "/circuit/simulate",
        {
            "qubits": 2,
            "operations": [{"gate": "SWAP", "qubit1": 0, "qubit2": 1}],
            "shots": 100,
        },
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_empty_operations_still_rejected():
    for route in ROUTES:
        response = _post(route, {"qubits": 2, "operations": []})
        _assert_400(response)
        assert "at least one gate" in response.json()["detail"]


# ==================================================
# /tutor/chat circuit_context — same guarantees
# ==================================================

def _tutor(operations, qubits=2):
    return _post(
        "/tutor/chat",
        {
            "question": "explain my circuit",
            "circuit_context": {
                "mode": "explain",
                "qubits": qubits,
                "operations": operations,
            },
        },
    )


def test_tutor_chat_rejects_malformed_circuit_context():
    for operation in MALFORMED_CASES:
        response = _tutor([operation])
        _assert_400(response)


def test_tutor_chat_rejects_out_of_range_qubit_references():
    response = _tutor([{"gate": "CNOT", "control": 0, "target": 4}])
    _assert_400(response)
    assert "out of range" in response.json()["detail"]


def test_tutor_chat_swap_wrong_shape_message_matches_circuit_routes():
    tutor_detail = _tutor([SWAP_WRONG_SHAPE]).json()["detail"]
    circuit_detail = _post(
        "/circuit/explain", {"qubits": 2, "operations": [SWAP_WRONG_SHAPE]}
    ).json()["detail"]
    assert tutor_detail == circuit_detail


def test_tutor_chat_rejects_non_object_operations():
    response = _tutor(["H on q0"])
    _assert_400(response)
    assert "object" in response.json()["detail"]


def test_tutor_chat_valid_circuit_context_still_answered():
    response = _tutor(
        [
            {"gate": "H", "qubit": 0},
            {"gate": "CNOT", "control": 0, "target": 1},
        ]
    )
    assert response.status_code == 200, response.text[:300]
    answer = response.json()["answer"]
    assert "qNone" not in answer
    assert "Bell" in answer


def test_tutor_chat_plain_questions_unchanged():
    response = _post("/tutor/chat", {"question": "what is a qubit"})
    assert response.status_code == 200
    assert response.json()["answer"]


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

    total = len([n for n in globals() if n.startswith("test_")])
    print(f"\n{total - failures} passed, {failures} failed")
    sys.exit(1 if failures else 0)
