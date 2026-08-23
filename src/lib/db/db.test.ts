import { describe, it, expect, beforeAll } from 'vitest'
import prisma from './prisma'

describe('Database Integration', () => {
  beforeAll(async () => {
    // Basic connectivity check
    await prisma.$connect()
  })

  it('should query farms and related animals', async () => {
    const farm = await prisma.farm.findFirst({
      where: { name: 'Shree Krishna Dairy' },
      include: { animals: true }
    })
    
    expect(farm).toBeDefined()
    if (farm) {
      expect(farm.name).toBe('Shree Krishna Dairy')
      expect(Array.isArray(farm.animals)).toBe(true)
    }
  })

  it('should query prescriptions with related treatments', async () => {
    const rx = await prisma.prescription.findFirst({
      where: { id: 'Rx-208' },
      include: { treatments: true }
    })
    
    expect(rx).toBeDefined()
    if (rx) {
      expect(rx.id).toBe('Rx-208')
      expect(rx.drug).toBe('Oxytetracycline')
    }
  })
})
