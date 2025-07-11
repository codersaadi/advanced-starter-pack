import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { FALLBACK_LNG } from '../config/client';
import { PATHS } from '../config/server-paths';
import { createLogger } from './logger';
export const readJSON = (filePath: string) => {
  const data = readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};
import { dirname as getNodeDirname, resolve } from 'node:path'; // Renamed to avoid conflict if 'dirname' is used elsewhere

const logger = createLogger({ name: 'DEFAULT_LOCALE_GEN' });
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const writeJSON = (filePath: string, data: any) => {
  const jsonStr = JSON.stringify(data, null, 2);
  writeFileSync(filePath, jsonStr, 'utf8');
};
/**
 * Resolves the full file path for a given file within the fallback language directory.
 * It also ensures that the target directory for the fallback language exists, creating it if necessary.
 *
 * @param file The name of the file (e.g., "common.json").
 * @returns The absolute path to the file.
 */
export const entryLocaleJsonFilepath = (file: string): string => {
  if (!PATHS || !PATHS.publicLocales) {
    throw new Error(
      '[entryLocaleJsonFilepath] PATHS.publicLocales is not defined in the configuration.'
    );
  }
  if (!FALLBACK_LNG) {
    throw new Error(
      '[entryLocaleJsonFilepath] FALLBACK_LNG is not defined in the configuration.'
    );
  }

  // 1. Resolve the full target file path
  const fullFilePath = resolve(PATHS.publicLocales, FALLBACK_LNG, file);

  // 2. Get the directory path where the file wi  ll reside
  const targetDirectory = getNodeDirname(fullFilePath);

  // 3. Check if the directory exists. If not, create it.
  if (!existsSync(targetDirectory)) {
    try {
      // The recursive: true option will create parent directories if they don't exist.
      // This is important if PATHS.publicLocales or the FALLBACK_LNG folder itself doesn't exist.
      mkdirSync(targetDirectory, { recursive: true });
      // Optional: Log when a directory is created for visibility during script execution.
      // biome-ignore lint/suspicious/noConsoleLog: <explanation>
      console.log(`[i18n-script] Created directory: ${targetDirectory}`);
    } catch (error) {
      console.error(
        `[i18n-script] Failed to create directory ${targetDirectory}:`,
        error
      );
      // Depending on the script's criticality, you might want to re-throw the error
      // to halt execution if the directory cannot be created.
      throw new Error(
        `Failed to create directory ${targetDirectory}: ${(error as Error).message}`
      );
    }
  }

  return fullFilePath;
};

export const genNamespaceList = (files: string[], locale: string) => {
  return files.map((file) => ({
    name: file.replace('.json', ''),
    path: resolve(PATHS.publicLocales, locale, file),
  }));
};

export const genDefaultLocale = () => {
  logger.info(`Default locale is ${FALLBACK_LNG}...`);

  const resources = require(PATHS.defaultTranslations);
  const data = Object.entries(resources.default);
  logger.info(
    `Generate default locale json, found ${data?.length} namespaces...`
  );

  for (const [ns, value] of data) {
    const filepath = entryLocaleJsonFilepath(`${ns}.json`);
    writeJSON(filepath, value);
  }
};
