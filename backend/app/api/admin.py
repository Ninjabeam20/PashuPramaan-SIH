from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.models import (
    User, AdminAnomaly, AnomalySeverity
)
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.get("/overview")
def get_overview(db: Session = Depends(get_db)):
    anomalies = db.query(AdminAnomaly).all()
    active_anomalies = len(anomalies)
    unexplained = sum(1 for a in anomalies if a.issue == "UNEXPLAINED")
    
    top_attention = []
    for a in anomalies[:3]:
        top_attention.append({
            "id": a.id,
            "region": a.farmName,
            "type": "AMU Spike",
            "severity": a.severity.name,
            "detail": f"{a.drug} usage up {a.confidence}%",
            "action": "Investigate"
        })

    return {
        "summary_metrics": {
            "total_amu_kg": 4250,
            "amu_change_pct": 12,
            "active_anomalies": active_anomalies,
            "unexplained_anomalies": unexplained
        },
        "top_attention_items": top_attention,
        "regional_hotspots": [
            { "region": "Maharashtra", "amu_index": 8.4, "status": "CRITICAL" },
            { "region": "Punjab", "amu_index": 6.2, "status": "WARNING" }
        ],
        "national_trend": {
            "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "amu_values": [3800, 3950, 4100, 3900, 4200, 4250]
        }
    }

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    return {
        "states": [
            {"id": "MH", "name": "Maharashtra", "amu_kg": 1250, "farms": 450, "vets": 120, "trend": "up", "status": "warning"},
            {"id": "MP", "name": "Madhya Pradesh", "amu_kg": 850, "farms": 320, "vets": 85, "trend": "stable", "status": "good"}
        ],
        "districts_by_state": {
            "MH": [
                {"name": "Pune", "amu_kg": 450, "trend": "up", "status": "critical"}
            ]
        }
    }

@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    anomalies = db.query(AdminAnomaly).all()
    items = []
    for a in anomalies:
        items.append({
            "id": a.id,
            "date": a.dateLabel,
            "farm": a.farmName,
            "species": a.species.name.capitalize(),
            "medicine": a.drug,
            "amu_change": a.confidence,
            "severity": a.severity.name,
            "status": a.issue,
            "action": "Investigate"
        })
    return { "items": items }

@router.get("/health-amu")
def get_health_amu(db: Session = Depends(get_db)):
    return {
        "items": [
            {"disease": "Mastitis", "amu_share_pct": 45, "cases": 1250, "trend": "up"}
        ],
        "monthly_trend": {
            "months": ["Jan", "Feb"],
            "health_incidents": [120, 135],
            "amu_kg": [380, 410]
        }
    }

@router.get("/forecast")
def get_forecast(
    medicine: str = "All Medicines",
    species: str = "All Species",
    region: str = "All Regions",
    period: str = "Next 30 days",
):
    from app.forecast.service import build_forecast

    try:
        return build_forecast(medicine, species, region, period)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@router.get("/workspace/insights")
def get_insights(db: Session = Depends(get_db)):
    return {
        "saved_insights": [
            {"id": "INS-001", "title": "Mastitis outbreak correlation", "date": "12 Aug 2026"}
        ],
        "research_notes": "Monitoring emerging resistance patterns in central MP."
    }
