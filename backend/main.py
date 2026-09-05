from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from quantum_engine.basic_circuits import run_gate

from api.tutor import router as tutor_router
from api.algorithms import router as algorithms_router
from api.circuit import router as circuit_router


app = FastAPI(
    title="QuantumLearn API",
    description=(
        "Backend API for the AI-Based Interactive "
        "Quantum Algorithm Learning Platform"
    ),
    version="1.0.0",
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://quantum-learn-coral.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# Basic API
# ==================================================

@app.get("/")
def root():
    return {
        "message": "QuantumLearn API is running"
    }


# ==================================================
# Health Check
# ==================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "QuantumLearn API",
        "quantum_engine": "available",
        "ai_tutor": "configured",
    }


# ==================================================
# Basic Quantum Gate Simulation
# ==================================================

@app.get("/quantum/{gate}")
def quantum_simulation(
    gate: str,
):

    gate = gate.upper()

    counts = run_gate(gate)

    return {
        "gate": gate,
        "shots": 1000,
        "counts": counts,
    }


# ==================================================
# AI Tutor
# ==================================================

app.include_router(
    tutor_router
)


# ==================================================
# Quantum Algorithms
# ==================================================

app.include_router(
    algorithms_router
)


# ==================================================
# Quantum Circuit Builder
# ==================================================

app.include_router(
    circuit_router
)