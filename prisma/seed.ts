import { UserRole } from '@prisma/client'
import prisma from '../src/lib/db/prisma'
import {
  FARMS, ANIMALS, HEALTH_EVENTS, PRESCRIPTIONS, PRESCRIPTION_OPTIONS,
  TREATMENTS, FARMER_DISPATCHES, MEDICINE_STOCK, VETS, LAB_SAMPLES,
  ADMIN_ANOMALIES
} from '../src/lib/seed/canonical'

async function main() {
  console.log('Seeding database from canonical in-memory state...')

  // 1. Create dummy users for Farmer, Vet, Admin, Lab
  const farmerUser = await prisma.user.upsert({
    where: { username: 'farmer1' },
    update: {},
    create: {
      username: 'farmer1',
      passwordHash: 'dummy_hash',
      fullName: 'Ramesh (Shree Krishna Dairy)',
      role: UserRole.FARMER,
    }
  })

  // 2. Insert Vets and their associated Users
  for (const vet of VETS) {
    const user = await prisma.user.upsert({
      where: { username: `vet_${vet.id}` },
      update: {},
      create: {
        username: `vet_${vet.id}`,
        passwordHash: 'dummy_hash',
        fullName: vet.name,
        role: UserRole.VET,
      }
    })

    await prisma.vet.upsert({
      where: { id: vet.id },
      update: {},
      create: {
        id: vet.id,
        name: vet.name,
        designation: vet.designation,
        pin: vet.pin,
        isCurrentUser: vet.isCurrentUser,
        userId: user.id
      }
    })
  }

  // 3. Insert Farms
  for (const farm of FARMS) {
    await prisma.farm.upsert({
      where: { id: farm.id },
      update: {},
      create: {
        id: farm.id,
        name: farm.name,
        kind: farm.kind.toUpperCase() as any,
        region: farm.region,
        aliases: farm.aliases,
        operatedByFarmer: farm.operatedByFarmer,
        ownerId: farm.operatedByFarmer ? farmerUser.id : null,
      }
    })
  }

  // 4. Insert Animals
  for (const animal of ANIMALS) {
    await prisma.animal.upsert({
      where: { id: animal.id },
      update: {},
      create: {
        id: animal.id,
        farmId: animal.farmId,
        species: animal.species.toUpperCase() as any,
        isFlock: animal.isFlock,
        breed: animal.breed,
        sex: animal.sex,
        productionType: animal.productionType,
        registeredOn: new Date(),
        onFarmerRoster: animal.onFarmerRoster,
        careStatus: animal.careStatus ? (animal.careStatus.toUpperCase() as any) : null,
        followUpDue: animal.followUpDue,
      }
    })
  }

  // 5. Insert Health Events
  for (const ev of HEALTH_EVENTS) {
    await prisma.healthEvent.upsert({
      where: { id: ev.id },
      update: {},
      create: {
        id: ev.id,
        animalId: ev.animalId,
        name: ev.name,
        onset: new Date(),
      }
    })
  }

  // 6. Insert Prescriptions & Options
  for (const rx of PRESCRIPTIONS) {
    await prisma.prescription.upsert({
      where: { id: rx.id },
      update: {},
      create: {
        id: rx.id,
        farmId: rx.farmId,
        animalId: rx.animalId,
        vetId: rx.vetId,
        diagnosis: rx.diagnosis,
        status: rx.status.toUpperCase() as any,
        aware: rx.aware ? (rx.aware.toUpperCase() as any) : null,
        drug: rx.drug,
        route: rx.route,
        dose: rx.dose,
        frequency: rx.frequency,
        duration: rx.duration,
        reason: rx.reason,
        dateLabel: rx.dateLabel,
        signedBy: rx.signedBy,
        signedAt: rx.signedAt ? new Date(rx.signedAt) : null,
        stewardshipGuidance: rx.stewardshipGuidance || [],
        treatmentHistory: rx.treatmentHistory as any || null,
        previousTreatment: rx.previousTreatment as any || null,
      }
    })
  }

  for (const opt of PRESCRIPTION_OPTIONS) {
    await prisma.prescriptionOption.upsert({
      where: { id: opt.id },
      update: {},
      create: {
        id: opt.id,
        drugName: opt.drugName,
        dosage: opt.dosage,
        route: opt.route,
        prescriptionId: opt.prescriptionId,
        isEmergencyException: opt.isEmergencyException,
      }
    })
  }

  // 7. Insert Treatments
  for (const t of TREATMENTS) {
    await prisma.treatment.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        animalId: t.animalId,
        farmId: t.farmId,
        prescriptionId: t.prescriptionId,
        drug: t.drug,
        route: t.route,
        dosage: t.dosage,
        administeredLabel: t.administeredLabel,
        administeredOn: new Date(t.administeredOn),
        phase: t.phase.toUpperCase() as any,
        signed: t.signed,
        emergency: t.emergency,
        reason: t.reason || '',
        feedBatch: t.feedBatch,
        labAssay: t.labAssay ? (t.labAssay.toUpperCase() as any) : null,
      }
    })
  }

  // 8. Insert Medicine Stock
  for (const stock of MEDICINE_STOCK) {
    await prisma.medicineStock.upsert({
      where: { farmId_name: { farmId: "farm-shree-krishna-dairy", name: stock.name } },
      update: {},
      create: {
        farmId: "farm-shree-krishna-dairy",
        name: stock.name,
        quantity: stock.quantity,
        unit: stock.unit,
        recentUsage: stock.recentUsage,
        level: stock.level.toUpperCase() as any,
      }
    })
  }

  // 9. Insert Lab Samples
  for (const sample of LAB_SAMPLES) {
    // Only insert sample. farmer dispatches insert dispatches referencing sample.
    await prisma.labSample.upsert({
      where: { dispatchId: sample.dispatchId },
      update: {},
      create: {
        dispatchId: sample.dispatchId,
        sampleId: sample.sampleId,
        product: sample.product.toUpperCase() as any,
        productSub: sample.productSub,
        productLabel: sample.productLabel,
        farmId: sample.farmId,
        animalId: sample.animalId,
        sourceName: sample.sourceName,
        quantity: sample.quantity,
        scheduledFor: sample.scheduledFor || "TBD",
        priority: sample.priority,
        stage: sample.stage.toUpperCase() as any,
      }
    })
  }

  // 10. Insert Farmer Dispatches
  for (const dispatch of FARMER_DISPATCHES) {
    await prisma.farmerDispatch.upsert({
      where: { id: dispatch.id },
      update: {},
      create: {
        id: dispatch.id,
        farmId: dispatch.farmId,
        animalId: dispatch.animalId,
        product: dispatch.product.toUpperCase() as any,
        dateLabel: dispatch.dateLabel,
        status: dispatch.status.toUpperCase() as any,
        treatmentId: dispatch.treatmentId,
        labDispatchId: dispatch.labDispatchId,
        mrlMeasuredPpm: dispatch.mrlMeasuredPpm,
        mrlPermittedPpm: dispatch.mrlPermittedPpm,
        prescriptionSigned: dispatch.prescriptionSigned ?? true,
      }
    })
  }

  // 11. Insert Admin Anomalies
  for (const anomaly of ADMIN_ANOMALIES) {
    await prisma.adminAnomaly.upsert({
      where: { id: anomaly.id },
      update: {},
      create: {
        id: anomaly.id,
        farmId: anomaly.farmId,
        farmName: anomaly.farm,
        species: anomaly.species.toUpperCase() === "POULTRY" ? "POULTRY" : "COW",
        issue: anomaly.status || "UNEXPLAINED",
        drug: anomaly.medicine,
        severity: anomaly.severity.toUpperCase() as any,
        confidence: anomaly.amuChange || 50,
        dateLabel: anomaly.date,
      }
    })
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
