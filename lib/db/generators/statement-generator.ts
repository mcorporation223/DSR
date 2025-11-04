import { faker } from "@faker-js/faker";
import { NewStatement } from "../schema";
import { getRandomElement } from "./constants";

export interface StatementGeneratorOptions {
  detaineeIds: string[]; // Required - statements must be linked to detainees
  userIds: string[]; // Required for createdBy/updatedBy
  dateRange?: {
    start: Date;
    end: Date;
  };
  filePathPrefix?: string; // Custom file path prefix, defaults to "/uploads/statements/"
}

// Statement file types and naming patterns
const STATEMENT_TYPES = [
  "statement",
  "witness_statement",
  "confession",
  "interrogation",
  "testimony",
  "declaration",
  "deposition",
  "interview",
];

const FILE_EXTENSIONS = ["pdf", "doc", "docx"];

/**
 * Generates a realistic file URL for a statement
 */
function generateStatementFileUrl(
  detaineeId: string,
  statementType: string,
  extension: string,
  prefix: string = "/uploads/statements/"
): string {
  const timestamp = faker.date
    .recent({ days: 30 })
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "");
  const uniqueId = faker.string.alphanumeric(6).toLowerCase();

  return `${prefix}${statementType}_${detaineeId.substring(
    0,
    8
  )}_${timestamp}_${uniqueId}.${extension}`;
}

/**
 * Generates a single statement record with realistic file paths
 */
export function generateStatement(
  options: StatementGeneratorOptions
): NewStatement {
  const { detaineeIds, userIds, filePathPrefix } = options;

  const detaineeId = getRandomElement(detaineeIds);
  const statementType = getRandomElement(STATEMENT_TYPES);
  const fileExtension = getRandomElement(FILE_EXTENSIONS);

  const fileUrl = generateStatementFileUrl(
    detaineeId,
    statementType,
    fileExtension,
    filePathPrefix
  );

  return {
    fileUrl,
    detaineeId,
    createdBy: getRandomElement(userIds),
    updatedBy: getRandomElement(userIds),
  };
}

/**
 * Generates multiple statement records
 */
export function generateStatements(
  count: number,
  options: StatementGeneratorOptions
): NewStatement[] {
  const statements: NewStatement[] = [];

  for (let i = 0; i < count; i++) {
    const statement = generateStatement(options);
    statements.push(statement);
  }

  return statements;
}

/**
 * Generates statements in batches for memory efficiency
 */
export function* generateStatementBatches(
  totalCount: number,
  batchSize: number,
  options: StatementGeneratorOptions
): Generator<NewStatement[], void, unknown> {
  let processed = 0;

  while (processed < totalCount) {
    const currentBatchSize = Math.min(batchSize, totalCount - processed);
    const batch = generateStatements(currentBatchSize, options);

    processed += currentBatchSize;
    yield batch;
  }
}

/**
 * Generates statements ensuring each detainee has at least one statement
 */
export function generateStatementsForAllDetainees(
  options: StatementGeneratorOptions,
  extraStatementsCount: number = 0
): NewStatement[] {
  const { detaineeIds } = options;
  const statements: NewStatement[] = [];

  // Generate one statement per detainee first
  for (const detaineeId of detaineeIds) {
    const statementOptions = {
      ...options,
      detaineeIds: [detaineeId], // Force this specific detainee
    };

    const statement = generateStatement(statementOptions);
    statements.push(statement);
  }

  // Generate additional random statements
  if (extraStatementsCount > 0) {
    const extraStatements = generateStatements(extraStatementsCount, options);
    statements.push(...extraStatements);
  }

  // Shuffle to randomize order
  return faker.helpers.shuffle(statements);
}

/**
 * Generates statements with specific type distribution
 */
export function generateStatementsByType(
  typeDistribution: Record<string, number>,
  options: StatementGeneratorOptions
): NewStatement[] {
  const statements: NewStatement[] = [];

  for (const [statementType, count] of Object.entries(typeDistribution)) {
    if (!STATEMENT_TYPES.includes(statementType)) {
      console.warn(`Unknown statement type: ${statementType}`);
      continue;
    }

    for (let i = 0; i < count; i++) {
      const statement = generateStatement(options);

      // Override the file URL to use the specific statement type
      const detaineeId = statement.detaineeId;
      const fileExtension = getRandomElement(FILE_EXTENSIONS);
      statement.fileUrl = generateStatementFileUrl(
        detaineeId,
        statementType,
        fileExtension,
        options.filePathPrefix
      );

      statements.push(statement);
    }
  }

  // Shuffle to randomize order
  return faker.helpers.shuffle(statements);
}

/**
 * Generates multiple statements for specific detainees (simulating multiple interviews)
 */
export function generateMultipleStatementsPerDetainee(
  detaineeStatementCounts: Record<string, number>,
  options: StatementGeneratorOptions
): NewStatement[] {
  const statements: NewStatement[] = [];

  for (const [detaineeId, statementCount] of Object.entries(
    detaineeStatementCounts
  )) {
    // Verify this detainee exists in our list
    if (!options.detaineeIds.includes(detaineeId)) {
      console.warn(`Detainee ID ${detaineeId} not found in detaineeIds list`);
      continue;
    }

    for (let i = 0; i < statementCount; i++) {
      const statementOptions = {
        ...options,
        detaineeIds: [detaineeId], // Force this specific detainee
      };

      const statement = generateStatement(statementOptions);

      // Add sequence number to file name for multiple statements
      if (statementCount > 1) {
        const parts = statement.fileUrl.split(".");
        const extension = parts.pop();
        const baseName = parts.join(".");
        statement.fileUrl = `${baseName}_${String(i + 1).padStart(
          2,
          "0"
        )}.${extension}`;
      }

      statements.push(statement);
    }
  }

  return statements;
}

/**
 * Generates statements for detainees with realistic distribution patterns
 */
export function generateRealisticStatementDistribution(
  totalStatements: number,
  options: StatementGeneratorOptions
): NewStatement[] {
  const { detaineeIds } = options;

  // Realistic distribution:
  // 70% of detainees have 1 statement
  // 20% of detainees have 2 statements
  // 8% of detainees have 3 statements
  // 2% of detainees have 4+ statements

  const oneStatementCount = Math.floor(detaineeIds.length * 0.7);
  const twoStatementCount = Math.floor(detaineeIds.length * 0.2);
  const threeStatementCount = Math.floor(detaineeIds.length * 0.08);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const multipleStatementCount =
    detaineeIds.length -
    oneStatementCount -
    twoStatementCount -
    threeStatementCount;

  const statements: NewStatement[] = [];
  let detaineeIndex = 0;

  // Shuffle detainees for random distribution
  const shuffledDetaineeIds = faker.helpers.shuffle([...detaineeIds]);

  // 1 statement each
  for (
    let i = 0;
    i < oneStatementCount && detaineeIndex < shuffledDetaineeIds.length;
    i++, detaineeIndex++
  ) {
    const detaineeId = shuffledDetaineeIds[detaineeIndex];
    const statement = generateStatement({
      ...options,
      detaineeIds: [detaineeId],
    });
    statements.push(statement);
  }

  // 2 statements each
  for (
    let i = 0;
    i < twoStatementCount && detaineeIndex < shuffledDetaineeIds.length;
    i++, detaineeIndex++
  ) {
    const detaineeId = shuffledDetaineeIds[detaineeIndex];
    for (let j = 0; j < 2; j++) {
      const statement = generateStatement({
        ...options,
        detaineeIds: [detaineeId],
      });
      statements.push(statement);
    }
  }

  // 3 statements each
  for (
    let i = 0;
    i < threeStatementCount && detaineeIndex < shuffledDetaineeIds.length;
    i++, detaineeIndex++
  ) {
    const detaineeId = shuffledDetaineeIds[detaineeIndex];
    for (let j = 0; j < 3; j++) {
      const statement = generateStatement({
        ...options,
        detaineeIds: [detaineeId],
      });
      statements.push(statement);
    }
  }

  // 4+ statements each for remaining detainees
  while (detaineeIndex < shuffledDetaineeIds.length) {
    const detaineeId = shuffledDetaineeIds[detaineeIndex];
    const statementCount = faker.number.int({ min: 4, max: 6 });

    for (let j = 0; j < statementCount; j++) {
      const statement = generateStatement({
        ...options,
        detaineeIds: [detaineeId],
      });
      statements.push(statement);
    }

    detaineeIndex++;
  }

  // If we have fewer statements than requested, generate additional random ones
  while (statements.length < totalStatements) {
    const statement = generateStatement(options);
    statements.push(statement);
  }

  // If we have too many, trim to exact count
  return faker.helpers.shuffle(statements).slice(0, totalStatements);
}

/**
 * Helper function to get statistics about generated statements
 */
export function getStatementStatistics(statements: NewStatement[]) {
  const stats = {
    totalStatements: statements.length,
    uniqueDetainees: new Set(statements.map((s) => s.detaineeId)).size,
    fileTypes: {} as Record<string, number>,
    statementTypes: {} as Record<string, number>,
    averageStatementsPerDetainee: 0,
    maxStatementsForSingleDetainee: 0,
    detaineesWithMultipleStatements: 0,
  };

  // Count statements per detainee
  const statementsPerDetainee = {} as Record<string, number>;

  for (const statement of statements) {
    // Count file types
    const extension = statement.fileUrl.split(".").pop() || "unknown";
    stats.fileTypes[extension] = (stats.fileTypes[extension] || 0) + 1;

    // Extract statement type from file URL
    const fileName = statement.fileUrl.split("/").pop() || "";
    const statementType = fileName.split("_")[0];
    stats.statementTypes[statementType] =
      (stats.statementTypes[statementType] || 0) + 1;

    // Count statements per detainee
    statementsPerDetainee[statement.detaineeId] =
      (statementsPerDetainee[statement.detaineeId] || 0) + 1;
  }

  // Calculate detainee statistics
  const statementCounts = Object.values(statementsPerDetainee);
  stats.averageStatementsPerDetainee =
    statementCounts.reduce((a, b) => a + b, 0) / stats.uniqueDetainees;
  stats.maxStatementsForSingleDetainee = Math.max(...statementCounts);
  stats.detaineesWithMultipleStatements = statementCounts.filter(
    (count) => count > 1
  ).length;

  return stats;
}

/**
 * Helper function to validate statement data
 */
export function validateStatements(
  statements: NewStatement[],
  validDetaineeIds: string[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const detaineeIdSet = new Set(validDetaineeIds);

  for (const [index, statement] of statements.entries()) {
    // Check if detainee ID exists
    if (!detaineeIdSet.has(statement.detaineeId)) {
      errors.push(
        `Statement ${index}: Invalid detainee ID ${statement.detaineeId}`
      );
    }

    // Check file URL format
    if (!statement.fileUrl || !statement.fileUrl.includes("/")) {
      errors.push(`Statement ${index}: Invalid file URL format`);
    }

    // Check file extension
    const extension = statement.fileUrl.split(".").pop();
    if (!extension || !FILE_EXTENSIONS.includes(extension)) {
      errors.push(`Statement ${index}: Invalid or missing file extension`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
