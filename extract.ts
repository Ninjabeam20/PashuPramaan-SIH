import * as canonical from './src/lib/seed/canonical';
import fs from 'fs';
const data = {
  FARMS: canonical.FARMS,
  ANIMALS: canonical.ANIMALS,
  HEALTH_EVENTS: canonical.HEALTH_EVENTS,
  PRESCRIPTIONS: canonical.PRESCRIPTIONS,
  PRESCRIPTION_OPTIONS: canonical.PRESCRIPTION_OPTIONS,
  TREATMENTS: canonical.TREATMENTS,
  FARMER_DISPATCHES: canonical.FARMER_DISPATCHES,
  MEDICINE_STOCK: canonical.MEDICINE_STOCK,
  VETS: canonical.VETS,
  LAB_SAMPLES: canonical.LAB_SAMPLES,
  ADMIN_ANOMALIES: canonical.ADMIN_ANOMALIES,
  PRESCRIPTION_OPTIONS2: canonical.PRESCRIPTION_OPTIONS
};
fs.writeFileSync('backend/canonical.json', JSON.stringify(data, null, 2));
