from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from quantum_engine.basic_circuits import run_gate

from api.tutor import router as tutor_router
from api.algorithms import router as algorithms_router
from api.circuit import router as circuit_router
from api.qml import router as qml_router


app = FastAPI(
    title="QuantumLearn API",
    description=(
        "Backend API for the AI-Based Interactive "
        "Quantum Algorithm Learning Platform"
    ),
    version="1.0.0",
)


# ==================================================
# Malformed requests answer 400, not FastAPI's
# default 422, with one clear validation message.
# ==================================================

@app.exception_handler(RequestValidationError)
async def validation_error_as_bad_request(
    request: Request,
    exc: RequestValidationError,
):
    return JSONResponse(
        status_code=400,
        content={"detail": format_validation_error(exc)},
    )


def format_validation_error(exc: RequestValidationError) -> str:
    for error in exc.errors():
        if str(error.get("type", "")).startswith("value_"):
            message = error.get("msg", "")
            return message.removeprefix("Value error, ")

    error = exc.errors()[0]
    location = ".".join(str(part) for part in error.get("loc", []))
    return f"Invalid request at {location}: {error.get('msg', 'malformed value')}"


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
    allow_origin_regex=r"https://.*\.vercel\.app",
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


# ==================================================
# Quantum Machine Learning
# ==================================================

app.include_router(
    qml_router
)