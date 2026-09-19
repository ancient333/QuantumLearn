from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from quantum_engine.qml_engine import run_vqc_experiment, run_qsvc_experiment

router = APIRouter(
    prefix="/qml",
    tags=["Quantum Machine Learning"],
)

class QMLRequest(BaseModel):
    algorithm: str = Field(..., pattern="^(VQC|QSVC)$")
    dataset: str = Field(default="moons", pattern="^(moons|circles)$")
    iterations: Optional[int] = Field(default=20, ge=1, le=100)

@router.post("/run")
def run_qml_experiment(request: QMLRequest):
    try:
        if request.algorithm == "VQC":
            result = run_vqc_experiment(
                dataset_type=request.dataset,
                iterations=request.iterations or 20
            )
        else:
            result = run_qsvc_experiment(
                dataset_type=request.dataset
            )

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"QML experiment failed: {str(e)}"
        )
