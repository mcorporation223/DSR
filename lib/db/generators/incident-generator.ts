import { faker } from "@faker-js/faker";
import { NewIncident, NewVictim } from "../schema";
import {
  LOCATIONS,
  NEIGHBORHOODS,
  INCIDENT_TYPES,
  CAUSES_OF_DEATH,
  getRandomElement,
} from "./constants";

export interface IncidentGeneratorOptions {
  userIds: string[]; // Required for createdBy/updatedBy
  dateRange?: {
    start: Date;
    end: Date;
  };
  victimRange?: {
    min: number;
    max: number;
  };
}

export interface IncidentWithVictims {
  incident: NewIncident;
  victims: NewVictim[];
}

/**
 * Generates a single incident record with realistic DR Congo data
 */
export function generateIncident(
  options: IncidentGeneratorOptions
): NewIncident {
  const { userIds, dateRange, victimRange } = options;

  // Generate incident date within range or default to last 4 years
  const incidentDateStart = dateRange?.start || new Date("2020-01-01");
  const incidentDateEnd = dateRange?.end || new Date();
  const incidentDate = faker.date.between({
    from: incidentDateStart,
    to: incidentDateEnd,
  });

  // Generate realistic number of victims based on incident type
  const numberOfVictims = faker.number.int({
    min: victimRange?.min || 1,
    max: victimRange?.max || 5,
  });

  return {
    incidentDate,
    location: `${getRandomElement(NEIGHBORHOODS)}, ${getRandomElement(
      LOCATIONS
    )}`,
    eventType: getRandomElement(INCIDENT_TYPES),
    numberOfVictims,
    createdBy: getRandomElement(userIds),
    updatedBy: getRandomElement(userIds),
  };
}

/**
 * Generates victims for a specific incident
 */
export function generateVictimsForIncident(
  incidentId: string,
  numberOfVictims: number,
  userIds: string[]
): NewVictim[] {
  const victims: NewVictim[] = [];

  for (let i = 0; i < numberOfVictims; i++) {
    victims.push({
      incidentId,
      name: faker.person.fullName(),
      sex: getRandomElement(["Male", "Female"]),
      causeOfDeath: getRandomElement(CAUSES_OF_DEATH),
      createdBy: getRandomElement(userIds),
      updatedBy: getRandomElement(userIds),
    });
  }

  return victims;
}

/**
 * Generates a complete incident with its victims
 */
export function generateIncidentWithVictims(
  options: IncidentGeneratorOptions
): IncidentWithVictims {
  const { userIds } = options;

  // Generate the incident first
  const incident = generateIncident(options);

  // Generate victims for this incident (we'll need the actual ID after insertion)
  // For now, we'll use a placeholder that will be replaced during insertion
  const victims: NewVictim[] = [];
  const numberOfVictims = incident.numberOfVictims || 1;

  for (let i = 0; i < numberOfVictims; i++) {
    victims.push({
      incidentId: "placeholder", // Will be replaced with actual incident ID
      name: faker.person.fullName(),
      sex: getRandomElement(["Male", "Female"]),
      causeOfDeath: getRandomElement(CAUSES_OF_DEATH),
      createdBy: getRandomElement(userIds),
      updatedBy: getRandomElement(userIds),
    });
  }

  return {
    incident,
    victims,
  };
}

/**
 * Generates multiple incidents with their victims
 */
export function generateIncidentsWithVictims(
  count: number,
  options: IncidentGeneratorOptions
): IncidentWithVictims[] {
  const incidentsWithVictims: IncidentWithVictims[] = [];

  for (let i = 0; i < count; i++) {
    const incidentWithVictims = generateIncidentWithVictims(options);
    incidentsWithVictims.push(incidentWithVictims);
  }

  return incidentsWithVictims;
}

/**
 * Generates incidents and victims in batches for memory efficiency
 */
export function* generateIncidentBatches(
  totalCount: number,
  batchSize: number,
  options: IncidentGeneratorOptions
): Generator<IncidentWithVictims[], void, unknown> {
  let processed = 0;

  while (processed < totalCount) {
    const currentBatchSize = Math.min(batchSize, totalCount - processed);
    const batch = generateIncidentsWithVictims(currentBatchSize, options);

    processed += currentBatchSize;
    yield batch;
  }
}

/**
 * Generates incidents with specific event type distribution for testing
 */
export function generateIncidentsByType(
  typeDistribution: Record<string, number>,
  options: IncidentGeneratorOptions
): IncidentWithVictims[] {
  const incidentsWithVictims: IncidentWithVictims[] = [];

  for (const [eventType, count] of Object.entries(typeDistribution)) {
    for (let i = 0; i < count; i++) {
      const incidentWithVictims = generateIncidentWithVictims(options);
      incidentWithVictims.incident.eventType = eventType;

      // Adjust victim count based on incident type
      if (eventType === "Assassinats") {
        incidentWithVictims.incident.numberOfVictims = faker.number.int({
          min: 1,
          max: 3,
        });
      } else if (eventType === "Attaque armée") {
        incidentWithVictims.incident.numberOfVictims = faker.number.int({
          min: 1,
          max: 5,
        });
      } else if (eventType === "Explosions") {
        incidentWithVictims.incident.numberOfVictims = faker.number.int({
          min: 2,
          max: 10,
        });
      }

      // Regenerate victims with correct count
      const numberOfVictims = incidentWithVictims.incident.numberOfVictims || 1;
      incidentWithVictims.victims = [];

      for (let j = 0; j < numberOfVictims; j++) {
        incidentWithVictims.victims.push({
          incidentId: "placeholder",
          name: faker.person.fullName(),
          sex: getRandomElement(["Male", "Female"]),
          causeOfDeath: getRandomElement(CAUSES_OF_DEATH),
          createdBy: getRandomElement(options.userIds),
          updatedBy: getRandomElement(options.userIds),
        });
      }

      incidentsWithVictims.push(incidentWithVictims);
    }
  }

  // Shuffle to randomize order
  return faker.helpers.shuffle(incidentsWithVictims);
}

/**
 * Helper function to calculate total victims from incidents
 */
export function calculateTotalVictims(
  incidentsWithVictims: IncidentWithVictims[]
): number {
  return incidentsWithVictims.reduce(
    (total, item) => total + item.victims.length,
    0
  );
}

/**
 * Helper function to get statistics about generated incidents
 */
export function getIncidentStatistics(
  incidentsWithVictims: IncidentWithVictims[]
) {
  const stats = {
    totalIncidents: incidentsWithVictims.length,
    totalVictims: calculateTotalVictims(incidentsWithVictims),
    incidentTypes: {} as Record<string, number>,
    averageVictimsPerIncident: 0,
    maxVictimsInSingleIncident: 0,
    minVictimsInSingleIncident: Infinity,
  };

  let totalVictimCount = 0;

  for (const item of incidentsWithVictims) {
    const { incident, victims } = item;

    // Count incident types
    stats.incidentTypes[incident.eventType] =
      (stats.incidentTypes[incident.eventType] || 0) + 1;

    // Track victim statistics
    const victimCount = victims.length;
    totalVictimCount += victimCount;
    stats.maxVictimsInSingleIncident = Math.max(
      stats.maxVictimsInSingleIncident,
      victimCount
    );
    stats.minVictimsInSingleIncident = Math.min(
      stats.minVictimsInSingleIncident,
      victimCount
    );
  }

  stats.averageVictimsPerIncident = totalVictimCount / stats.totalIncidents;

  return stats;
}
