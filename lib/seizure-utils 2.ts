/**
 * Utility functions for seizure-related display and formatting
 */

/**
 * Converts seizure type to French display label
 */
export function getSeizureTypeLabel(type: string): string {
  switch (type) {
    case "car":
      return "Voiture";
    case "motorcycle":
      return "Moto";
    // Handle legacy French values that might still be in the database
    case "Voiture":
      return "Voiture";
    case "Moto":
      return "Moto";
    default:
      return type; // Return as-is if unknown
  }
}

/**
 * Normalizes seizure type from any format to English values
 */
export function normalizeSeizureType(type: string): "car" | "motorcycle" {
  if (type === "Voiture" || type === "car") return "car";
  if (type === "Moto" || type === "motorcycle") return "motorcycle";
  return "car"; // default fallback
}

/**
 * Valid seizure type values (for TypeScript and validation)
 */
export const SEIZURE_TYPES = ["car", "motorcycle"] as const;
export type SeizureType = (typeof SEIZURE_TYPES)[number];

/**
 * Seizure type options for form selects
 */
export const SEIZURE_TYPE_OPTIONS = [
  { value: "car" as const, label: "Voiture" },
  { value: "motorcycle" as const, label: "Moto" },
] as const;
