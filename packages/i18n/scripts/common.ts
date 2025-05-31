import fs from "node:fs/promises";
// --- Utility Functions ---
/**
 * Checks if a file exists at the given path.
 * @param filePath Absolute path to the file.
 * @returns Promise<boolean> True if the file exists, false otherwise.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.F_OK); // Check for file existence
    return true;
  } catch {
    return false;
  }
}

/**
 * Simple delay function.
 * @param ms Milliseconds to delay.
 * @returns Promise<void>
 */
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
