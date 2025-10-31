/**
 * Date and time formatting utilities for the DSR application
 * Provides safe date rendering with null checks and consistent French localization
 */

/**
 * Safely formats a date with null checks and French locale
 * @param date - The date to format (can be string, Date object, or null/undefined)
 * @returns Formatted date string in French locale or "N/A" if date is invalid/null
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }

    return dateObj.toLocaleDateString("fr-FR");
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "N/A";
  }
};

/**
 * Safely formats a date with time with null checks and French locale
 * @param date - The date to format (can be string, Date object, or null/undefined)
 * @returns Formatted date and time string in French locale or "N/A" if date is invalid/null
 */
export const formatDateTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }

    return dateObj.toLocaleString("fr-FR");
  } catch (error) {
    console.warn("Error formatting datetime:", error);
    return "N/A";
  }
};

/**
 * Safely formats time only with null checks and French locale
 * @param date - The date to format (can be string, Date object, or null/undefined)
 * @returns Formatted time string in French locale or "N/A" if date is invalid/null
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }

    return dateObj.toLocaleTimeString("fr-FR");
  } catch (error) {
    console.warn("Error formatting time:", error);
    return "N/A";
  }
};

/**
 * Safely formats a date and time with detailed format (includes day/month/year and hour/minute)
 * @param date - The date to format (can be string, Date object, or null/undefined)
 * @returns Formatted date and time string with detailed French format or "N/A" if date is invalid/null
 */
export const formatDetailedDateTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }

    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.warn("Error formatting detailed datetime:", error);
    return "N/A";
  }
};
