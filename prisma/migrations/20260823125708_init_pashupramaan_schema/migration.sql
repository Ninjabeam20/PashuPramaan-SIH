-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FARMER', 'VET', 'LAB_TECHNICIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "Species" AS ENUM ('COW', 'BUFFALO', 'GOAT', 'POULTRY');

-- CreateEnum
CREATE TYPE "FarmKind" AS ENUM ('DAIRY', 'POULTRY', 'LIVESTOCK', 'MIXED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('MILK', 'MEAT', 'EGGS');

-- CreateEnum
CREATE TYPE "CareStatus" AS ENUM ('UNDER_TREATMENT', 'IMPROVED', 'RECOVERED', 'NO_CHANGE', 'HEALTHY');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('SIGN_REQUIRED', 'UNSIGNED_EMERGENCY', 'SIGNED', 'COUNTERSIGNED', 'VOIDED');

-- CreateEnum
CREATE TYPE "AwareClass" AS ENUM ('ACCESS', 'WATCH', 'RESERVE');

-- CreateEnum
CREATE TYPE "TreatmentPhase" AS ENUM ('ACTIVE', 'WITHDRAWAL', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LabAssayVerdict" AS ENUM ('WITHIN_MRL', 'UNAVAILABLE', 'EXCEEDED');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('CLEARED', 'WITHDRAWAL', 'BLOCKED');

-- CreateEnum
CREATE TYPE "StockLevel" AS ENUM ('RESTOCK', 'MONITOR', 'GOOD');

-- CreateEnum
CREATE TYPE "LabStage" AS ENUM ('AWAITING_RECEIPT', 'RECEIVED', 'TESTING', 'AWAITING_VERIFICATION', 'VERIFIED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "LabTestState" AS ENUM ('DONE', 'ACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "AnomalySeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vet" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "vciRegNo" TEXT,
    "pin" TEXT NOT NULL DEFAULT '1234',
    "isCurrentUser" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "FarmKind" NOT NULL,
    "region" TEXT NOT NULL,
    "district" TEXT,
    "state" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "operatedByFarmer" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "cowsCount" INTEGER NOT NULL DEFAULT 0,
    "buffaloesCount" INTEGER NOT NULL DEFAULT 0,
    "goatsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "isFlock" BOOLEAN NOT NULL DEFAULT false,
    "breed" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "productionType" TEXT NOT NULL,
    "registeredOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onFarmerRoster" BOOLEAN NOT NULL DEFAULT true,
    "careStatus" "CareStatus",
    "lastFollowUp" TIMESTAMP(3),
    "followUpDue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthEvent" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "onset" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "vetId" TEXT,
    "diagnosis" TEXT NOT NULL,
    "status" "PrescriptionStatus" NOT NULL,
    "aware" "AwareClass",
    "cia" BOOLEAN NOT NULL DEFAULT false,
    "drug" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "stewardshipGuidance" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "previousTreatment" JSONB,
    "treatmentHistory" JSONB,
    "signedBy" TEXT,
    "signedAt" TIMESTAMP(3),
    "signatureRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionOption" (
    "id" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "isEmergencyException" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PrescriptionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "drug" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "administeredLabel" TEXT NOT NULL,
    "administeredOn" TIMESTAMP(3) NOT NULL,
    "phase" "TreatmentPhase" NOT NULL,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "emergency" BOOLEAN NOT NULL DEFAULT false,
    "labAssay" "LabAssayVerdict",
    "feedBatch" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "doseTime" TIMESTAMP(3) NOT NULL,
    "nowPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clearLabel" TEXT NOT NULL,
    "productMessage" TEXT NOT NULL,
    "clearsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmerDispatch" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "product" "ProductType" NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "status" "DispatchStatus" NOT NULL,
    "treatmentId" TEXT,
    "labDispatchId" TEXT,
    "mrlMeasuredPpm" TEXT,
    "mrlPermittedPpm" TEXT,
    "prescriptionSigned" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmerDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicineStock" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "recentUsage" INTEGER NOT NULL DEFAULT 0,
    "level" "StockLevel" NOT NULL DEFAULT 'GOOD',
    "usageTotal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabSample" (
    "dispatchId" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "product" "ProductType" NOT NULL,
    "productSub" TEXT NOT NULL,
    "productLabel" TEXT NOT NULL,
    "farmId" TEXT,
    "animalId" TEXT,
    "sourceName" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "scheduledFor" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Standard',
    "stage" "LabStage" NOT NULL DEFAULT 'AWAITING_RECEIPT',
    "receivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabSample_pkey" PRIMARY KEY ("dispatchId")
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "checks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "state" "LabTestState" NOT NULL DEFAULT 'PENDING',
    "result" TEXT,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "trigger" TEXT,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabReport" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "refNo" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,
    "verifiedOn" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "statusColor" TEXT NOT NULL DEFAULT 'green',
    "mrlDrug" TEXT NOT NULL,
    "mrlMeasured" DOUBLE PRECISION NOT NULL,
    "mrlLimit" DOUBLE PRECISION NOT NULL,
    "mrlUnit" TEXT NOT NULL DEFAULT 'mg/kg',
    "mrlRatio" DOUBLE PRECISION NOT NULL,
    "mrlVerdict" TEXT NOT NULL,
    "mrlVerdictOk" BOOLEAN NOT NULL DEFAULT true,
    "withdrawalDrug" TEXT NOT NULL,
    "withdrawalAdministered" TEXT NOT NULL,
    "withdrawalCompleted" TEXT NOT NULL,
    "withdrawalStatus" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "outcomeOk" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabAssessment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "detail" TEXT NOT NULL,

    CONSTRAINT "LabAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAnomaly" (
    "id" TEXT NOT NULL,
    "farmId" TEXT,
    "farmName" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "issue" TEXT NOT NULL,
    "drug" TEXT NOT NULL,
    "severity" "AnomalySeverity" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAnomaly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistrictStat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "activeFarms" INTEGER NOT NULL,
    "totalHeadcount" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "topConcern" TEXT NOT NULL,
    "complianceRate" DOUBLE PRECISION NOT NULL,
    "dataSeries" JSONB,

    CONSTRAINT "DistrictStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionMetric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amrIndex" DOUBLE PRECISION NOT NULL,
    "activeAlerts" INTEGER NOT NULL,
    "complianceRate" DOUBLE PRECISION NOT NULL,
    "samplingRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RegionMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Vet_userId_key" ON "Vet"("userId");

-- CreateIndex
CREATE INDEX "Animal_farmId_idx" ON "Animal"("farmId");

-- CreateIndex
CREATE INDEX "Animal_species_idx" ON "Animal"("species");

-- CreateIndex
CREATE INDEX "Animal_careStatus_idx" ON "Animal"("careStatus");

-- CreateIndex
CREATE INDEX "HealthEvent_animalId_idx" ON "HealthEvent"("animalId");

-- CreateIndex
CREATE INDEX "Prescription_farmId_idx" ON "Prescription"("farmId");

-- CreateIndex
CREATE INDEX "Prescription_animalId_idx" ON "Prescription"("animalId");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "Prescription"("status");

-- CreateIndex
CREATE INDEX "Treatment_farmId_idx" ON "Treatment"("farmId");

-- CreateIndex
CREATE INDEX "Treatment_animalId_idx" ON "Treatment"("animalId");

-- CreateIndex
CREATE INDEX "Treatment_phase_idx" ON "Treatment"("phase");

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_treatmentId_key" ON "Withdrawal"("treatmentId");

-- CreateIndex
CREATE INDEX "FarmerDispatch_farmId_idx" ON "FarmerDispatch"("farmId");

-- CreateIndex
CREATE INDEX "FarmerDispatch_status_idx" ON "FarmerDispatch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MedicineStock_farmId_name_key" ON "MedicineStock"("farmId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LabSample_sampleId_key" ON "LabSample"("sampleId");

-- CreateIndex
CREATE INDEX "LabSample_stage_idx" ON "LabSample"("stage");

-- CreateIndex
CREATE INDEX "LabTest_dispatchId_idx" ON "LabTest"("dispatchId");

-- CreateIndex
CREATE UNIQUE INDEX "LabReport_dispatchId_key" ON "LabReport"("dispatchId");

-- CreateIndex
CREATE UNIQUE INDEX "LabReport_refNo_key" ON "LabReport"("refNo");

-- CreateIndex
CREATE INDEX "LabAssessment_reportId_idx" ON "LabAssessment"("reportId");

-- AddForeignKey
ALTER TABLE "Vet" ADD CONSTRAINT "Vet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthEvent" ADD CONSTRAINT "HealthEvent_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "Vet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionOption" ADD CONSTRAINT "PrescriptionOption_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerDispatch" ADD CONSTRAINT "FarmerDispatch_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerDispatch" ADD CONSTRAINT "FarmerDispatch_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerDispatch" ADD CONSTRAINT "FarmerDispatch_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerDispatch" ADD CONSTRAINT "FarmerDispatch_labDispatchId_fkey" FOREIGN KEY ("labDispatchId") REFERENCES "LabSample"("dispatchId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicineStock" ADD CONSTRAINT "MedicineStock_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSample" ADD CONSTRAINT "LabSample_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSample" ADD CONSTRAINT "LabSample_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "LabSample"("dispatchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "LabSample"("dispatchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabAssessment" ADD CONSTRAINT "LabAssessment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LabReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAnomaly" ADD CONSTRAINT "AdminAnomaly_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
