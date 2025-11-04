import { faker } from "@faker-js/faker";
import { NewSeizure } from "../schema";
import {
  LOCATIONS,
  NEIGHBORHOODS,
  SEIZURE_TYPES,
  SEIZURE_ITEMS,
  getRandomElement,
} from "./constants";

export interface SeizureGeneratorOptions {
  userIds: string[]; // Required for createdBy/updatedBy
  dateRange?: {
    start: Date;
    end: Date;
  };
  statusDistribution?: {
    inCustody: number;
    released: number;
    disposed: number;
    evidence: number;
  };
}

/**
 * Generates vehicle-specific details (chassis and plate numbers)
 */
function generateVehicleDetails(type: string) {
  if (type === "cars" || type === "motorcycles") {
    return {
      chassisNumber: faker.vehicle.vin(),
      plateNumber: `CD-${faker.string.numeric(3)}-${faker.helpers.arrayElement([
        "NK",
        "SK",
        "KS",
        "EQ",
        "OR",
      ])}`,
    };
  }
  return {
    chassisNumber: null,
    plateNumber: null,
  };
}

/**
 * Generates a single seizure record with realistic DR Congo data
 */
export function generateSeizure(options: SeizureGeneratorOptions): NewSeizure {
  const { userIds, dateRange } = options;

  // Generate seizure date within range or default to last 4 years
  const seizureDateStart = dateRange?.start || new Date("2020-01-01");
  const seizureDateEnd = dateRange?.end || new Date();
  const seizureDate = faker.date.between({
    from: seizureDateStart,
    to: seizureDateEnd,
  });

  // Select seizure type and corresponding item
  const type = getRandomElement(SEIZURE_TYPES);
  const itemName = getRandomElement(
    SEIZURE_ITEMS[type as keyof typeof SEIZURE_ITEMS]
  );

  // Generate vehicle details if applicable
  const vehicleDetails = generateVehicleDetails(type);

  // Generate status with realistic distribution
  const status = faker.helpers.weightedArrayElement([
    { weight: 60, value: "in_custody" }, // 60% still in custody
    { weight: 25, value: "released" }, // 25% released back to owner
    { weight: 10, value: "evidence" }, // 10% kept as evidence
    { weight: 5, value: "disposed" }, // 5% disposed/destroyed
  ]);

  // If released, generate release date after seizure
  let releaseDate = null;
  if (status === "released") {
    releaseDate = faker.date.between({ from: seizureDate, to: new Date() });
  }

  return {
    itemName,
    type,
    seizureLocation: `${getRandomElement(NEIGHBORHOODS)}, ${getRandomElement(
      LOCATIONS
    )}`,
    chassisNumber: vehicleDetails.chassisNumber,
    plateNumber: vehicleDetails.plateNumber,
    ownerName: faker.person.fullName(),
    ownerResidence: `${getRandomElement(NEIGHBORHOODS)}, ${getRandomElement(
      LOCATIONS
    )}`,
    seizureDate,
    status,
    releaseDate,
    createdBy: getRandomElement(userIds),
    updatedBy: getRandomElement(userIds),
  };
}

/**
 * Generates multiple seizure records
 */
export function generateSeizures(
  count: number,
  options: SeizureGeneratorOptions
): NewSeizure[] {
  const seizures: NewSeizure[] = [];

  for (let i = 0; i < count; i++) {
    const seizure = generateSeizure(options);
    seizures.push(seizure);
  }

  return seizures;
}

/**
 * Generates seizures in batches for memory efficiency
 */
export function* generateSeizureBatches(
  totalCount: number,
  batchSize: number,
  options: SeizureGeneratorOptions
): Generator<NewSeizure[], void, unknown> {
  let processed = 0;

  while (processed < totalCount) {
    const currentBatchSize = Math.min(batchSize, totalCount - processed);
    const batch = generateSeizures(currentBatchSize, options);

    processed += currentBatchSize;
    yield batch;
  }
}

/**
 * Generates seizures with specific type distribution for testing
 */
export function generateSeizuresByType(
  typeDistribution: Record<string, number>,
  options: SeizureGeneratorOptions
): NewSeizure[] {
  const seizures: NewSeizure[] = [];

  for (const [seizureType, count] of Object.entries(typeDistribution)) {
    if (!SEIZURE_TYPES.includes(seizureType)) {
      console.warn(`Unknown seizure type: ${seizureType}`);
      continue;
    }

    for (let i = 0; i < count; i++) {
      const seizure = generateSeizure(options);
      seizure.type = seizureType;
      seizure.itemName = getRandomElement(
        SEIZURE_ITEMS[seizureType as keyof typeof SEIZURE_ITEMS]
      );

      // Update vehicle details if type changed
      const vehicleDetails = generateVehicleDetails(seizureType);
      seizure.chassisNumber = vehicleDetails.chassisNumber;
      seizure.plateNumber = vehicleDetails.plateNumber;

      seizures.push(seizure);
    }
  }

  // Shuffle to randomize order
  return faker.helpers.shuffle(seizures);
}

/**
 * Generates seizures with specific status distribution for testing
 */
export function generateSeizuresWithStatus(
  count: number,
  statusDistribution: {
    inCustody: number;
    released: number;
    disposed: number;
    evidence: number;
  },
  options: SeizureGeneratorOptions
): NewSeizure[] {
  const seizures: NewSeizure[] = [];
  const { inCustody, released, disposed, evidence } = statusDistribution;

  // Generate in-custody seizures
  for (let i = 0; i < inCustody; i++) {
    const seizure = generateSeizure(options);
    seizure.status = "in_custody";
    seizure.releaseDate = null;
    seizures.push(seizure);
  }

  // Generate released seizures
  for (let i = 0; i < released; i++) {
    const seizure = generateSeizure(options);
    seizure.status = "released";
    seizure.releaseDate = faker.date.between({
      from: seizure.seizureDate!,
      to: new Date(),
    });
    seizures.push(seizure);
  }

  // Generate disposed seizures
  for (let i = 0; i < disposed; i++) {
    const seizure = generateSeizure(options);
    seizure.status = "disposed";
    seizure.releaseDate = null;
    seizures.push(seizure);
  }

  // Generate evidence seizures
  for (let i = 0; i < evidence; i++) {
    const seizure = generateSeizure(options);
    seizure.status = "evidence";
    seizure.releaseDate = null;
    seizures.push(seizure);
  }

  // Shuffle the array to randomize order
  return faker.helpers.shuffle(seizures);
}

/**
 * Generates seizures for specific date periods (useful for time-based testing)
 */
export function generateSeizuresByPeriod(
  periods: Array<{ start: Date; end: Date; count: number }>,
  options: SeizureGeneratorOptions
): NewSeizure[] {
  const allSeizures: NewSeizure[] = [];

  for (const period of periods) {
    const periodOptions = {
      ...options,
      dateRange: { start: period.start, end: period.end },
    };

    const periodSeizures = generateSeizures(period.count, periodOptions);
    allSeizures.push(...periodSeizures);
  }

  return allSeizures;
}

/**
 * Helper function to get statistics about generated seizures
 */
export function getSeizureStatistics(seizures: NewSeizure[]) {
  const stats = {
    totalSeizures: seizures.length,
    seizureTypes: {} as Record<string, number>,
    statusDistribution: {} as Record<string, number>,
    vehiclesWithPlates: 0,
    vehiclesWithChassis: 0,
    releasedItems: 0,
    averageTimeInCustody: 0,
  };

  let totalCustodyDays = 0;
  let custodyItemsCount = 0;

  for (const seizure of seizures) {
    // Count seizure types
    stats.seizureTypes[seizure.type] =
      (stats.seizureTypes[seizure.type] || 0) + 1;

    // Count status distribution
    if (seizure.status) {
      stats.statusDistribution[seizure.status] =
        (stats.statusDistribution[seizure.status] || 0) + 1;
    }

    // Count vehicles with details
    if (seizure.plateNumber) stats.vehiclesWithPlates++;
    if (seizure.chassisNumber) stats.vehiclesWithChassis++;

    // Count released items
    if (seizure.releaseDate) stats.releasedItems++;

    // Calculate custody time for released items
    if (seizure.releaseDate && seizure.seizureDate) {
      const custodyDays = Math.floor(
        (seizure.releaseDate.getTime() - seizure.seizureDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      totalCustodyDays += custodyDays;
      custodyItemsCount++;
    }
  }

  // Calculate average custody time
  if (custodyItemsCount > 0) {
    stats.averageTimeInCustody = Math.round(
      totalCustodyDays / custodyItemsCount
    );
  }

  return stats;
}

/**
 * Helper function to validate seizure data consistency
 */
export function validateSeizures(seizures: NewSeizure[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [index, seizure] of seizures.entries()) {
    // Check vehicle details consistency
    const isVehicle = seizure.type === "cars" || seizure.type === "motorcycles";

    if (isVehicle && !seizure.chassisNumber) {
      errors.push(`Seizure ${index}: Vehicle missing chassis number`);
    }

    if (isVehicle && !seizure.plateNumber) {
      errors.push(`Seizure ${index}: Vehicle missing plate number`);
    }

    if (!isVehicle && (seizure.chassisNumber || seizure.plateNumber)) {
      errors.push(`Seizure ${index}: Non-vehicle has vehicle details`);
    }

    // Check release date logic
    if (seizure.status !== "released" && seizure.releaseDate) {
      errors.push(`Seizure ${index}: Non-released item has release date`);
    }

    if (
      seizure.releaseDate &&
      seizure.seizureDate &&
      seizure.releaseDate < seizure.seizureDate
    ) {
      errors.push(`Seizure ${index}: Release date before seizure date`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
