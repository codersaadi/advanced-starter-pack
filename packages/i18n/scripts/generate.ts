import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { FALLBACK_LNG } from '../config/client';
import { PATHS } from '../config/server-paths';
import { genDefaultLocale } from './gen-default-locale';

const outputFile = path.join(PATHS.generatedTypes, 'generated.d.ts');

// Get all namespace JSON files for a given language
async function getBaseStructure(baseLang = FALLBACK_LNG) {
  const langPath = path.join(PATHS.publicLocales, baseLang);
  if (!existsSync(langPath)) {
    console.warn(
      `[i18n-types] Fallback language directory not found: ${langPath}. Cannot generate types from it.`
    );
    return {}; // Return empty structure if dir doesn't exist
  }

  const namespaceFiles = glob.sync('*.json', { cwd: langPath });
  if (namespaceFiles?.length === 0) {
    console.warn(
      `[i18n-types] No JSON files found in ${langPath}. Types might be incomplete.`
    );
  }

  // biome-ignore lint/suspicious/noExplicitAny:
  const structure: { [key: string]: any } = {};

  for (const nsFile of namespaceFiles) {
    const nsName = path.basename(nsFile, '.json');
    try {
      const content = await fs.readFile(path.join(langPath, nsFile), 'utf-8');
      structure[nsName] = JSON.parse(content);
    } catch (error) {
      console.error(
        `[i18n-types] Error reading or parsing ${nsFile} in ${langPath}:`,
        error
      );
      // Decide how to handle: skip file, throw error, etc.
      // For now, it will skip this file and continue.
    }
  }
  return structure;
}

// Flatten nested object to dot notation keys
function flattenKeys<T>(obj: T, prefix = ''): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        keys.push(...flattenKeys(value, newKey));
      } else {
        keys.push(newKey);
      }
    }
  }

  return keys;
}

// Generate type from object structure (for individual namespace interfaces)
function generateTypeFromObject(
  obj: Record<string, unknown>,
  indentLevel = 1
): string {
  let typeString = '{\n';
  const indent = '  '.repeat(indentLevel);

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // biome-ignore lint/performance/useTopLevelRegex: <explanation>
      const safeKey = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(key) ? key : `"${key}"`;

      typeString += `${indent}${safeKey}: `;

      if (typeof value === 'string') {
        typeString += 'string;\n';
      } else if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        typeString += `${generateTypeFromObject(value as Record<string, unknown>, indentLevel + 1)}${indent};\n`;
      } else {
        typeString += 'any;\n';
      }
    }
  }

  typeString += `${'  '.repeat(indentLevel - 1)}}`;
  return typeString;
}

async function main() {
  console.log('Generating i18n types...');
  await genDefaultLocale();

  const baseStructure = await getBaseStructure(FALLBACK_LNG);

  let outputContent = '// THIS FILE IS AUTOGENERATED. DO NOT EDIT MANUALLY.\n';
  outputContent += '// Run the generation script to regenerate.\n\n';

  // Generate individual namespace interfaces
  // biome-ignore lint/nursery/useGuardForIn: <explanation>
  for (const namespace in baseStructure) {
    const interfaceName =
      namespace.charAt(0).toUpperCase() + namespace.slice(1);
    outputContent += `export interface ${interfaceName} ${generateTypeFromObject(baseStructure[namespace])}\n\n`;
  }

  // Generate Resources interface
  outputContent += 'export interface Resources {\n';
  // biome-ignore lint/nursery/useGuardForIn: <explanation>
  for (const namespace in baseStructure) {
    const interfaceName =
      namespace.charAt(0).toUpperCase() + namespace.slice(1);
    // biome-ignore lint/performance/useTopLevelRegex: <explanation>
    const safeNamespace = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(namespace)
      ? namespace
      : `"${namespace}"`;
    outputContent += `  ${safeNamespace}: ${interfaceName};\n`;
  }
  outputContent += '}\n\n';

  // Generate flattened key types for each namespace (this is what you need for t('welcome.title'))
  // biome-ignore lint/nursery/useGuardForIn: <explanation>
  for (const namespace in baseStructure) {
    const flatKeys = flattenKeys(baseStructure[namespace]);
    const keyUnion = flatKeys.map((key) => `"${key}"`).join(' | ');
    const interfaceName =
      namespace.charAt(0).toUpperCase() + namespace.slice(1);
    outputContent += `export type ${interfaceName}Keys = ${keyUnion};\n`;
  }
  outputContent += '\n';

  // Generate a union of all possible translation keys
  const allKeys: string[] = [];
  // biome-ignore lint/nursery/useGuardForIn: <explanation>
  for (const namespace in baseStructure) {
    const flatKeys = flattenKeys(baseStructure[namespace]);
    allKeys.push(...flatKeys.map((key) => `${namespace}.${key}`));
  }
  const allKeysUnion = allKeys.map((key) => `"${key}"`).join(' | ');
  outputContent += `export type TranslationKeys = ${allKeysUnion};\n\n`;

  // Default namespace
  outputContent += 'export type DefaultNamespace = keyof Resources;\n';

  await fs.mkdir(PATHS.generatedTypes, { recursive: true });
  await fs.writeFile(outputFile, outputContent, 'utf-8');

  console.log(`Types generated successfully at ${outputFile}`);
}

main().catch(console.error);
