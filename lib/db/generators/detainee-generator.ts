import { faker } from "@faker-js/faker";
import { NewDetainee } from "../schema";
import {
  LOCATIONS,
  NEIGHBORHOODS,
  PROVINCES,
  RELIGIONS,
  MARITAL_STATUS,
  EDUCATION_LEVELS,
  CRIME_REASONS,
  getRandomElement,
} from "./constants";

export interface DetaineeGeneratorOptions {
  userIds: string[]; // Required for createdBy/updatedBy
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Generates a single detainee record with realistic DR Congo data
 */
export function generateDetainee(
  options: DetaineeGeneratorOptions
): NewDetainee {
  const { userIds, dateRange } = options;

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  // Generate arrest date within range or default to last 4 years
  const arrestDateStart = dateRange?.start || new Date("2020-01-01");
  const arrestDateEnd = dateRange?.end || new Date();
  const arrestDate = faker.date.between({
    from: arrestDateStart,
    to: arrestDateEnd,
  });

  // Generate arrival time (usually within 1-6 hours after arrest)
  const arrivalTime = new Date(
    arrestDate.getTime() + faker.number.int({ min: 1, max: 6 }) * 3600000
  );

  // Generate status with realistic distribution
  const status = faker.helpers.weightedArrayElement([
    { weight: 70, value: "in_custody" }, // 70% still in custody
    { weight: 25, value: "released" }, // 25% released
    { weight: 5, value: "transferred" }, // 5% transferred
  ]);

  // If released, generate release date after arrest
  let releaseDate = null;
  let releaseReason = null;
  if (status === "released") {
    releaseDate = faker.date.between({ from: arrestDate, to: new Date() });
    releaseReason = faker.helpers.arrayElement([
      "Caution payée par la famille",
      "Acquittement",
      "Fin de détention préventive",
      "Libération conditionnelle",
      "Amnistie présidentielle",
    ]);
  }

  return {
    firstName,
    lastName,
    sex: getRandomElement(["Male", "Female"]),
    placeOfBirth: `${getRandomElement(LOCATIONS)}, ${getRandomElement(
      PROVINCES
    )}`,
    dateOfBirth: faker.date.between({ from: "1950-01-01", to: "2005-01-01" }),
    parentNames: `Père: ${faker.person.fullName()}, Mère: ${faker.person.fullName()}`,
    originNeighborhood: getRandomElement(NEIGHBORHOODS),
    education: getRandomElement(EDUCATION_LEVELS),
    employment: faker.person.jobTitle(),
    maritalStatus: getRandomElement(MARITAL_STATUS),
    maritalDetails: faker.datatype.boolean(0.6)
      ? `Marié(e) à ${faker.person.fullName()}${
          faker.datatype.boolean(0.7)
            ? `, ${faker.number.int({ min: 1, max: 6 })} enfant(s)`
            : ""
        }`
      : null,
    religion: getRandomElement(RELIGIONS),
    residence: `${getRandomElement(NEIGHBORHOODS)}, ${getRandomElement(
      LOCATIONS
    )}`,
    phoneNumber: `+243 ${faker.string.numeric(3)} ${faker.string.numeric(
      3
    )} ${faker.string.numeric(3)}`,
    crimeReason: getRandomElement(CRIME_REASONS),
    arrestDate,
    arrestLocation: getRandomElement(NEIGHBORHOODS),
    arrestedBy: `${faker.helpers.arrayElement([
      "Commissaire",
      "Inspecteur",
      "Agent",
    ])} ${faker.person.fullName()}`,
    arrestTime: arrestDate,
    arrivalDate: arrestDate,
    arrivalTime,
    cellNumber: `C-${String(faker.number.int({ min: 1, max: 50 })).padStart(
      3,
      "0"
    )}`,
    location: getRandomElement(["Bloc A", "Bloc B", "Bloc C", "Isolement"]),
    status,
    releaseDate,
    releaseReason,
    createdBy: getRandomElement(userIds),
    updatedBy: getRandomElement(userIds),
  };
}

/**
 * Generates multiple detainee records
 */
export function generateDetainees(
  count: number,
  options: DetaineeGeneratorOptions
): NewDetainee[] {
  const detainees: NewDetainee[] = [];

  for (let i = 0; i < count; i++) {
    const detainee = generateDetainee(options);
    detainees.push(detainee);
  }

  return detainees;
}

/**
 * Generates detainees in batches for memory efficiency
 */
export function* generateDetaineeBatches(
  totalCount: number,
  batchSize: number,
  options: DetaineeGeneratorOptions
): Generator<NewDetainee[], void, unknown> {
  let processed = 0;

  while (processed < totalCount) {
    const currentBatchSize = Math.min(batchSize, totalCount - processed);
    const batch = generateDetainees(currentBatchSize, options);

    processed += currentBatchSize;
    yield batch;
  }
}

/**
 * Generates detainees with specific status distribution for testing
 */
export function generateDetaineesWithStatus(
  count: number,
  statusDistribution: {
    inCustody: number;
    released: number;
    transferred: number;
  },
  options: DetaineeGeneratorOptions
): NewDetainee[] {
  const detainees: NewDetainee[] = [];
  const { inCustody, released, transferred } = statusDistribution;

  // Generate in-custody detainees
  for (let i = 0; i < inCustody; i++) {
    const detainee = generateDetainee(options);
    detainee.status = "in_custody";
    detainee.releaseDate = null;
    detainee.releaseReason = null;
    detainees.push(detainee);
  }

  // Generate released detainees
  for (let i = 0; i < released; i++) {
    const detainee = generateDetainee(options);
    detainee.status = "released";
    detainee.releaseDate = faker.date.between({
      from: detainee.arrestDate!,
      to: new Date(),
    });
    detainee.releaseReason = "Caution payée";
    detainees.push(detainee);
  }

  // Generate transferred detainees
  for (let i = 0; i < transferred; i++) {
    const detainee = generateDetainee(options);
    detainee.status = "transferred";
    detainee.releaseDate = null;
    detainee.releaseReason = null;
    detainees.push(detainee);
  }

  // Shuffle the array to randomize order
  return faker.helpers.shuffle(detainees);
}
