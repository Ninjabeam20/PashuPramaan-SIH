from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, farmer, vet, lab, admin

app = FastAPI(title="PashuPramaan API", version="1.0.0")

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
