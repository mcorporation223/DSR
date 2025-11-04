import { faker } from "@faker-js/faker";
import { NewEmployee } from "../schema";
import {
  LOCATIONS,
  NEIGHBORHOODS,
  PROVINCES,
  MARITAL_STATUS,
  EDUCATION_LEVELS,
  POLICE_FUNCTIONS,
  getRandomElement,
} from "./constants";

export interface EmployeeGeneratorOptions {
  startIndex?: number; // For sequential employee IDs
  userIds: string[]; // Required for createdBy/updatedBy
}

/**
 * Generates a single employee record with realistic DR Congo data
 */
export function generateEmployee(
  options: EmployeeGeneratorOptions
): NewEmployee {
  const { startIndex = 1, userIds } = options;

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    firstName,
    lastName,
    sex: getRandomElement(["Male", "Female"]),
    placeOfBirth: `${getRandomElement(LOCATIONS)}, ${getRandomElement(
      PROVINCES
    )}`,
    dateOfBirth: faker.date.between({ from: "1960-01-01", to: "2000-01-01" }),
    education: getRandomElement(EDUCATION_LEVELS),
    maritalStatus: getRandomElement(MARITAL_STATUS),
    employeeId: `EMP${String(startIndex).padStart(6, "0")}`,
    function: getRandomElement(POLICE_FUNCTIONS),
    deploymentLocation: getRandomElement(LOCATIONS),
    residence: `${getRandomElement(NEIGHBORHOODS)}, ${getRandomElement(
      LOCATIONS
    )}`,
    phone: `+243 ${faker.string.numeric(3)} ${faker.string.numeric(
      3
    )} ${faker.string.numeric(3)}`,
    email:
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@police.gov.cd`.replace(
        /[^a-z@.]/g,
        ""
      ),
    isActive: faker.datatype.boolean(0.9), // 90% active
    createdBy: getRandomElement(userIds),
    updatedBy: getRandomElement(userIds),
  };
}

/**
 * Generates multiple employee records
 */
export function generateEmployees(
  count: number,
  options: EmployeeGeneratorOptions
): NewEmployee[] {
  const employees: NewEmployee[] = [];

  for (let i = 0; i < count; i++) {
    const employee = generateEmployee({
      ...options,
      startIndex: (options.startIndex || 1) + i,
    });
    employees.push(employee);
  }

  return employees;
}

/**
 * Generates employees in batches for memory efficiency
 */
export function* generateEmployeeBatches(
  totalCount: number,
  batchSize: number,
  options: EmployeeGeneratorOptions
): Generator<NewEmployee[], void, unknown> {
  let processed = 0;

  while (processed < totalCount) {
    const currentBatchSize = Math.min(batchSize, totalCount - processed);
    const batch = generateEmployees(currentBatchSize, {
      ...options,
      startIndex: (options.startIndex || 1) + processed,
    });

    processed += currentBatchSize;
    yield batch;
  }
}
