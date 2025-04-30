
import { format, isValid, parse } from "date-fns";

/**
 * Formats a date string or Date object to DD/Mon/YYYY format
 * Examples: 01/Jan/2025, 15/Apr/2025
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Check if date is valid
  if (!isValid(dateObj)) return "Invalid Date";
  
  return format(dateObj, "dd/MMM/yyyy");
};

/**
 * Parses a date string in the format DD/Mon/YYYY back to a Date object
 */
export const parseDateString = (dateString: string): Date => {
  return parse(dateString, "dd/MMM/yyyy", new Date());
};
