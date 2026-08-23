import enum
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum, JSON, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid

from .database import Base

# ─── ENUMS ───────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    VET = "VET"
    LAB_TECHNICIAN = "LAB_TECHNICIAN"
    ADMIN = "ADMIN"

class Species(str, enum.Enum):
    COW = "COW"
    BUFFALO = "BUFFALO"
    GOAT = "GOAT"
    POULTRY = "POULTRY"

class FarmKind(str, enum.Enum):
    DAIRY = "DAIRY"
    POULTRY = "POULTRY"
    LIVESTOCK = "LIVESTOCK"
    MIXED = "MIXED"

class ProductType(str, enum.Enum):
    MILK = "MILK"
    MEAT = "MEAT"
    EGGS = "EGGS"

class CareStatus(str, enum.Enum):
    UNDER_TREATMENT = "UNDER_TREATMENT"
    IMPROVED = "IMPROVED"
    RECOVERED = "RECOVERED"
    NO_CHANGE = "NO_CHANGE"
    HEALTHY = "HEALTHY"

class PrescriptionStatus(str, enum.Enum):
    SIGN_REQUIRED = "SIGN_REQUIRED"
    UNSIGNED_EMERGENCY = "UNSIGNED_EMERGENCY"
    SIGNED = "SIGNED"
    COUNTERSIGNED = "COUNTERSIGNED"
    VOIDED = "VOIDED"

class AwareClass(str, enum.Enum):
    ACCESS = "ACCESS"
    WATCH = "WATCH"
    RESERVE = "RESERVE"

class TreatmentPhase(str, enum.Enum):
    ACTIVE = "ACTIVE"
    WITHDRAWAL = "WITHDRAWAL"
    COMPLETED = "COMPLETED"

class LabAssayVerdict(str, enum.Enum):
    WITHIN_MRL = "WITHIN_MRL"
    UNAVAILABLE = "UNAVAILABLE"
    EXCEEDED = "EXCEEDED"

class DispatchStatus(str, enum.Enum):
    CLEARED = "CLEARED"
    WITHDRAWAL = "WITHDRAWAL"
    BLOCKED = "BLOCKED"

class StockLevel(str, enum.Enum):
    RESTOCK = "RESTOCK"
    MONITOR = "MONITOR"
    GOOD = "GOOD"

class LabStage(str, enum.Enum):
    AWAITING_RECEIPT = "AWAITING_RECEIPT"
    RECEIVED = "RECEIVED"
    TESTING = "TESTING"
    AWAITING_VERIFICATION = "AWAITING_VERIFICATION"
    VERIFIED = "VERIFIED"
    ON_HOLD = "ON_HOLD"

class LabTestState(str, enum.Enum):
    DONE = "DONE"
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"

class AnomalySeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

# ─── MODELS ──────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=True)
    phone = Column(String, unique=True, nullable=True)
    username = Column(String, unique=True, nullable=False)
    passwordHash = Column(String, nullable=False)
    fullName = Column(String, nullable=False)
    role = Column(Enum(UserRole, name="user_role_enum"), nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vetProfile = relationship("Vet", back_populates="user", uselist=False)
    farms = relationship("Farm", back_populates="owner")

class Vet(Base):
    __tablename__ = "vets"

    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("users.id"), unique=True, nullable=True)
    name = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    vciRegNo = Column(String, nullable=True)
    pin = Column(String, nullable=False, default="1234")
    isCurrentUser = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="vetProfile")
    prescriptions = relationship("Prescription", back_populates="vet")

class Farm(Base):
    __tablename__ = "farms"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    kind = Column(Enum(FarmKind, name="farm_kind_enum"), nullable=False)
    region = Column(String, nullable=False)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    aliases = Column(ARRAY(String), default=list)
    operatedByFarmer = Column(Boolean, default=False)
    ownerId = Column(String, ForeignKey("users.id"), nullable=True)
    
    cowsCount = Column(Integer, default=0)
    buffaloesCount = Column(Integer, default=0)
    goatsCount = Column(Integer, default=0)
    
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="farms")
    animals = relationship("Animal", back_populates="farm")
    prescriptions = relationship("Prescription", back_populates="farm")
    treatments = relationship("Treatment", back_populates="farm")
    dispatches = relationship("FarmerDispatch", back_populates="farm")
    medicineStocks = relationship("MedicineStock", back_populates="farm")
    labSamples = relationship("LabSample", back_populates="farm")
    anomalies = relationship("AdminAnomaly", back_populates="farm")

class Animal(Base):
    __tablename__ = "animals"

    id = Column(String, primary_key=True)
    farmId = Column(String, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    species = Column(Enum(Species, name="species_enum"), nullable=False)
    isFlock = Column(Boolean, default=False)
    breed = Column(String, nullable=False)
    sex = Column(String, nullable=False)
    dateOfBirth = Column(DateTime, nullable=True)
    productionType = Column(String, nullable=False)
    registeredOn = Column(DateTime, default=datetime.utcnow)
    onFarmerRoster = Column(Boolean, default=True)
    careStatus = Column(Enum(CareStatus, name="care_status_enum"), nullable=True)
    lastFollowUp = Column(DateTime, nullable=True)
    followUpDue = Column(Boolean, default=False)
    
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farm = relationship("Farm", back_populates="animals")
    healthEvents = relationship("HealthEvent", back_populates="animal")
    prescriptions = relationship("Prescription", back_populates="animal")
    treatments = relationship("Treatment", back_populates="animal")
    dispatches = relationship("FarmerDispatch", back_populates="animal")
    labSamples = relationship("LabSample", back_populates="animal")

    __table_args__ = (
        Index('idx_animal_farm', 'farmId'),
        Index('idx_animal_species', 'species'),
        Index('idx_animal_care', 'careStatus'),
    )

class HealthEvent(Base):
    __tablename__ = "health_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    animalId = Column(String, ForeignKey("animals.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    onset = Column(DateTime, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)

    animal = relationship("Animal", back_populates="healthEvents")

    __table_args__ = (
        Index('idx_health_animal', 'animalId'),
    )

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String, primary_key=True)
    farmId = Column(String, ForeignKey("farms.id"), nullable=False)
    animalId = Column(String, ForeignKey("animals.id"), nullable=False)
    vetId = Column(String, ForeignKey("vets.id"), nullable=True)
    diagnosis = Column(String, nullable=False)
    status = Column(Enum(PrescriptionStatus, name="prescription_status_enum"), nullable=False)
    aware = Column(Enum(AwareClass, name="aware_class_enum"), nullable=True)
    cia = Column(Boolean, default=False)
    drug = Column(String, nullable=False)
    route = Column(String, nullable=False)
    dose = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    dateLabel = Column(String, nullable=False)
    stewardshipGuidance = Column(ARRAY(String), default=list)
    
    previousTreatment = Column(JSON, nullable=True)
    treatmentHistory = Column(JSON, nullable=True)
    
    signedBy = Column(String, nullable=True)
    signedAt = Column(DateTime, nullable=True)
    signatureRef = Column(String, nullable=True)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farm = relationship("Farm", back_populates="prescriptions")
    animal = relationship("Animal", back_populates="prescriptions")
    vet = relationship("Vet", back_populates="prescriptions")
    treatments = relationship("Treatment", back_populates="prescription")
    prescriptionOptions = relationship("PrescriptionOption", back_populates="prescription")

    __table_args__ = (
        Index('idx_rx_farm', 'farmId'),
        Index('idx_rx_animal', 'animalId'),
        Index('idx_rx_status', 'status'),
    )

class PrescriptionOption(Base):
    __tablename__ = "prescription_options"

    id = Column(String, primary_key=True)
    drugName = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    route = Column(String, nullable=False)
    prescriptionId = Column(String, ForeignKey("prescriptions.id"), nullable=True)
    isEmergencyException = Column(Boolean, default=False)

    prescription = relationship("Prescription", back_populates="prescriptionOptions")

class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(String, primary_key=True)
    animalId = Column(String, ForeignKey("animals.id"), nullable=False)
    farmId = Column(String, ForeignKey("farms.id"), nullable=False)
    prescriptionId = Column(String, ForeignKey("prescriptions.id"), nullable=True)
    drug = Column(String, nullable=False)
    route = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    administeredLabel = Column(String, nullable=False)
    administeredOn = Column(DateTime, nullable=False)
    phase = Column(Enum(TreatmentPhase, name="treatment_phase_enum"), nullable=False)
    signed = Column(Boolean, default=False)
    emergency = Column(Boolean, default=False)
    labAssay = Column(Enum(LabAssayVerdict, name="lab_assay_verdict_enum"), nullable=True)
    feedBatch = Column(String, nullable=True)
    reason = Column(String, nullable=False)
    
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    animal = relationship("Animal", back_populates="treatments")
    farm = relationship("Farm", back_populates="treatments")
    prescription = relationship("Prescription", back_populates="treatments")
    withdrawal = relationship("Withdrawal", back_populates="treatment", uselist=False)
    dispatches = relationship("FarmerDispatch", back_populates="treatment")

    __table_args__ = (
        Index('idx_trt_farm', 'farmId'),
        Index('idx_trt_animal', 'animalId'),
        Index('idx_trt_phase', 'phase'),
    )

class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    treatmentId = Column(String, ForeignKey("treatments.id", ondelete="CASCADE"), unique=True, nullable=False)
    doseTime = Column(DateTime, nullable=False)
    nowPct = Column(Float, default=0.0)
    clearLabel = Column(String, nullable=False)
    productMessage = Column(String, nullable=False)
    clearsAt = Column(DateTime, nullable=False)

    treatment = relationship("Treatment", back_populates="withdrawal")

class FarmerDispatch(Base):
    __tablename__ = "farmer_dispatches"

    id = Column(String, primary_key=True)
    farmId = Column(String, ForeignKey("farms.id"), nullable=False)
    animalId = Column(String, ForeignKey("animals.id"), nullable=False)
    product = Column(Enum(ProductType, name="product_type_enum"), nullable=False)
    dateLabel = Column(String, nullable=False)
    status = Column(Enum(DispatchStatus, name="dispatch_status_enum"), nullable=False)
    treatmentId = Column(String, ForeignKey("treatments.id"), nullable=True)
    labDispatchId = Column(String, ForeignKey("lab_samples.dispatchId"), nullable=True)
    
    mrlMeasuredPpm = Column(String, nullable=True)
    mrlPermittedPpm = Column(String, nullable=True)
    prescriptionSigned = Column(Boolean, default=True)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farm = relationship("Farm", back_populates="dispatches")
    animal = relationship("Animal", back_populates="dispatches")
    treatment = relationship("Treatment", back_populates="dispatches")
    labSample = relationship("LabSample", back_populates="farmerDispatch")

    __table_args__ = (
        Index('idx_dsp_farm', 'farmId'),
        Index('idx_dsp_status', 'status'),
    )

class MedicineStock(Base):
    __tablename__ = "medicine_stocks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    farmId = Column(String, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String, nullable=False)
    recentUsage = Column(Integer, default=0)
    level = Column(Enum(StockLevel, name="stock_level_enum"), default=StockLevel.GOOD)
    usageTotal = Column(Integer, nullable=True)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farm = relationship("Farm", back_populates="medicineStocks")

    __table_args__ = (
        UniqueConstraint('farmId', 'name', name='uq_stock_farm_name'),
    )

class LabSample(Base):
    __tablename__ = "lab_samples"

    dispatchId = Column(String, primary_key=True)
    sampleId = Column(String, unique=True, nullable=False)
    product = Column(Enum(ProductType, name="product_type_enum"), nullable=False)
    productSub = Column(String, nullable=False)
    productLabel = Column(String, nullable=False)
    farmId = Column(String, ForeignKey("farms.id"), nullable=True)
    animalId = Column(String, ForeignKey("animals.id"), nullable=True)
    sourceName = Column(String, nullable=False)
    quantity = Column(String, nullable=False)
    scheduledFor = Column(String, nullable=False)
    priority = Column(String, default="Standard")
    stage = Column(Enum(LabStage, name="lab_stage_enum"), default=LabStage.AWAITING_RECEIPT)
    receivedOn = Column(DateTime, nullable=True)
    
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farm = relationship("Farm", back_populates="labSamples")
    animal = relationship("Animal", back_populates="labSamples")
    farmerDispatch = relationship("FarmerDispatch", back_populates="labSample")
    tests = relationship("LabTest", back_populates="sample")
    report = relationship("LabReport", back_populates="sample", uselist=False)

    __table_args__ = (
        Index('idx_ls_stage', 'stage'),
    )

class LabTest(Base):
    __tablename__ = "lab_tests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    dispatchId = Column(String, ForeignKey("lab_samples.dispatchId", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    checks = Column(ARRAY(String), default=list)
    state = Column(Enum(LabTestState, name="lab_test_state_enum"), default=LabTestState.PENDING)
    result = Column(String, nullable=True)
    ok = Column(Boolean, default=True)
    trigger = Column(String, nullable=True)

    sample = relationship("LabSample", back_populates="tests")

    __table_args__ = (
        Index('idx_lt_dispatch', 'dispatchId'),
    )

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    dispatchId = Column(String, ForeignKey("lab_samples.dispatchId", ondelete="CASCADE"), unique=True, nullable=False)
    refNo = Column(String, unique=True, nullable=False)
    verifiedBy = Column(String, nullable=False)
    verifiedOn = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)
    statusColor = Column(String, default="green")
    
    mrlDrug = Column(String, nullable=False)
    mrlMeasured = Column(Float, nullable=False)
    mrlLimit = Column(Float, nullable=False)
    mrlUnit = Column(String, default="mg/kg")
    mrlRatio = Column(Float, nullable=False)
    mrlVerdict = Column(String, nullable=False)
    mrlVerdictOk = Column(Boolean, default=True)
    
    withdrawalDrug = Column(String, nullable=False)
    withdrawalAdministered = Column(String, nullable=False)
    withdrawalCompleted = Column(String, nullable=False)
    withdrawalStatus = Column(String, nullable=False)
    
    outcome = Column(String, nullable=False)
    outcomeOk = Column(Boolean, default=True)

    createdAt = Column(DateTime, default=datetime.utcnow)

    sample = relationship("LabSample", back_populates="report")
    assessments = relationship("LabAssessment", back_populates="report")

class LabAssessment(Base):
    __tablename__ = "lab_assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reportId = Column(String, ForeignKey("lab_reports.id", ondelete="CASCADE"), nullable=False)
    label = Column(String, nullable=False)
    result = Column(String, nullable=False)
    ok = Column(Boolean, default=True)
    detail = Column(String, nullable=False)

    report = relationship("LabReport", back_populates="assessments")

    __table_args__ = (
        Index('idx_la_report', 'reportId'),
    )

class AdminAnomaly(Base):
    __tablename__ = "admin_anomalies"

    id = Column(String, primary_key=True)
    farmId = Column(String, ForeignKey("farms.id"), nullable=True)
    farmName = Column(String, nullable=False)
    species = Column(Enum(Species, name="species_enum"), nullable=False)
    issue = Column(String, nullable=False)
    drug = Column(String, nullable=False)
    severity = Column(Enum(AnomalySeverity, name="anomaly_severity_enum"), nullable=False)
    confidence = Column(Integer, nullable=False)
    dateLabel = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="anomalies")

class DistrictStat(Base):
    __tablename__ = "district_stats"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    activeFarms = Column(Integer, nullable=False)
    totalHeadcount = Column(Integer, nullable=False)
    riskLevel = Column(String, nullable=False)
    topConcern = Column(String, nullable=False)
    complianceRate = Column(Float, nullable=False)
    dataSeries = Column(JSON, nullable=True)

class RegionMetric(Base):
    __tablename__ = "region_metrics"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    amrIndex = Column(Float, nullable=False)
    activeAlerts = Column(Integer, nullable=False)
    complianceRate = Column(Float, nullable=False)
    samplingRate = Column(Float, nullable=False)
