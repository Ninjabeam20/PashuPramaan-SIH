from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, farmer, vet, lab, admin

import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from app.database import SessionLocal
from app.models import Withdrawal, Treatment, TreatmentPhase

async def cleanup_withdrawals():
    while True:
        try:
            db = SessionLocal()
            now = datetime.utcnow()
            
            # Find all expired withdrawals
            expired_withdrawals = db.query(Withdrawal).filter(Withdrawal.clearsAt <= now).all()
            
            for w in expired_withdrawals:
                # Update treatment phase if it was in WITHDRAWAL
                trt = db.query(Treatment).filter(Treatment.id == w.treatmentId).first()
                if trt and trt.phase == TreatmentPhase.WITHDRAWAL:
                    trt.phase = TreatmentPhase.COMPLETED
                
                # Delete the withdrawal log
                db.delete(w)
                
            if expired_withdrawals:
                db.commit()
                
            db.close()
        except Exception as e:
            print(f"Error in withdrawal cleanup: {e}")
            
        await asyncio.sleep(60) # Check every 60 seconds

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start cleanup task
    task = asyncio.create_task(cleanup_withdrawals())
    yield
    # Cancel task on shutdown
    task.cancel()

app = FastAPI(title="PashuPramaan API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(farmer.router, prefix="/api/farmer", tags=["farmer"])
app.include_router(vet.router, prefix="/api/vet", tags=["vet"])
app.include_router(lab.router, prefix="/api/lab", tags=["lab"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
@app.get("/health")
def health_check():
    return {"status": "ok"}
