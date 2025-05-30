import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number with thousands separators
 * @param num The number to format
 * @returns Formatted string with thousands separators
 */
export const addThousandsSeparator = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Converts a decimal number to percentage string
 * @param num The decimal number to convert (e.g., 0.75)
 * @returns Formatted percentage string (e.g., "75.0%")
 */
export const numberToPercentage = (num: number): string => {
  return `${(num * 100).toFixed(1)}%`;
};
