// =================================================================================================
// Reliably Optimized AI-Powered I18N Translation Script
// =================================================================================================
// Strategy:
// 1. For very small files: Attempt whole JSON translation (1 NS -> 1 Lang).
// 2. For larger files:
//    a. (Optional Ambitious Step) Attempt to translate 1 NS -> Many Target Langs.
//    b. On failure of 2a, or if disabled: Fallback to Batched String Translation (1 NS -> 1 Lang).
// This prioritizes reliability while still offering significant optimization.
// =================================================================================================

import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenerativeAI, type SafetySetting } from '@google/generative-ai';
import dotenv from 'dotenv';
import { glob } from 'glob';

import { existsSync } from 'node:fs';
// Assuming your centralized config is correctly structured and path is valid
import { FALLBACK_LNG, LANGUAGES } from '../config'; // Use your unified config
import { PATHS } from '../config/server-paths';
import { createLogger } from './logger';

const logger = createLogger({ name: 'RELIABLE_AI_TRANSLATION' });

// --- Environment Variable Loading & Configuration ---
const envFilePath = PATHS.packageEnv;
dotenv.config({ path: envFilePath, override: true });
logger.info(
  `Attempting to load .env from: ${envFilePath}${existsSync(envFilePath) ? ' - Loaded.' : ' - Not found.'}`
);

const CONFIG = {
  geminiApiKey: process.env.TRANSLATION_AI_API_KEY,
  sourceLangDir: path.join(PATHS.publicLocales, FALLBACK_LNG),
  allLocalesRootDir: PATHS.publicLocales,
  apiCallDelayMs: Math.max(
    50,
    Number.parseInt(process.env.TRANSLATION_API_CALL_DELAY_MS || '800', 10)
  ),

  // For Whole JSON strategy (Strategy 1)
  wholeJsonMaxSizeKB:
    Number.parseInt(process.env.TRANSLATION_WHOLE_JSON_MAX_SIZE_KB || '5', 10) *
    1024,

  // For Batched String Translation (Strategy 2 - the workhorse)
  maxStringsPerBatch: Number.parseInt(
    process.env.TRANSLATION_MAX_STRINGS_PER_BATCH || '20',
    10
  ),
  maxCharsPerStringBatch: Number.parseInt(
    process.env.TRANSLATION_MAX_CHARS_PER_STRING_BATCH || '4000',
    10
  ),

  // For Ambitious Namespace-Level Multi-Language Batching (Strategy 3)
  enableNamespaceMultiLangBatch:
    process.env.ENABLE_NAMESPACE_MULTI_LANG_BATCH === 'true',
  maxTargetLangsPerNamespaceBatch: Number.parseInt(
    process.env.MAX_TARGET_LANGS_PER_NAMESPACE_BATCH || '3',
    10
  ),

  overwritePolicy: parseOverwritePolicy(),
  modelName: process.env.TRANSLATION_AI_MODEL_NAME || 'gemini-1.5-flash-latest',
  temperature: Number.parseFloat(
    process.env.TRANSLATION_AI_TEMPERATURE || '0.5'
  ), // Slightly lower for more deterministic output
};

if (!CONFIG.geminiApiKey) {
  logger.error('FATAL: TRANSLATION_AI_API_KEY is required.');
  process.exit(1);
}

logger.info(
  `CONFIG: ${JSON.stringify({ ...CONFIG, geminiApiKey: CONFIG.geminiApiKey ? 'SET' : 'NOT SET' }, null, 2)}`
);

function parseOverwritePolicy() {
  const input = process.env.OVERWRITE_TRANSLATIONS?.toLowerCase() || 'false';
  if (input === 'true' || input === 'all') return { type: 'all' as const };
  if (input === 'false' || input === 'none') return { type: 'none' as const };
  const locales = input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return { type: 'specific' as const, locales };
}

const genAI = new GoogleGenerativeAI(CONFIG.geminiApiKey);
const geminiModel = genAI.getGenerativeModel({ model: CONFIG.modelName });

const baseGenerationConfig = {
  temperature: CONFIG.temperature,
  topK: 1,
  topP: 0.95, // Keep some variability with topP
  maxOutputTokens: 8192,
};
const safetySettings = [] satisfies SafetySetting[];

// --- Utility Functions ---
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// =================================================================================
// STRATEGY 1: Whole Small JSON Translation (1 Namespace -> 1 Language)
// =================================================================================
async function translateWholeJsonDirectly(
  jsonString: string,
  sourceLocale: string,
  targetLocale: string
): Promise<string | null> {
  logger.debug(
    `    Attempting STRATEGY 1: Whole JSON direct to ${targetLocale} (size: ${(jsonString?.length / 1024).toFixed(2)}KB)...`
  );
  const prompt = `
Translate the following JSON object from ${sourceLocale} to ${targetLocale}.
IMPORTANT:
1.  Return ONLY a valid JSON object with the IDENTICAL structure (keys, nesting).
2.  Translate ONLY string values. Preserve keys, numbers, booleans, nulls.
3.  Preserve ALL ICU placeholders (e.g., {{var}}) and HTML-like tags (e.g., <bold>) EXACTLY.
4.  Do NOT include markdown like \`\`\`json.

Source JSON (${sourceLocale}):
\`\`\`json
${jsonString}
\`\`\`

Translated JSON (${targetLocale}):
`;
  try {
    await delay(CONFIG.apiCallDelayMs);
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        ...baseGenerationConfig,
        responseMimeType: 'application/json',
      },
      safetySettings,
    });
    const responseText = result.response.text().trim(); // text() is a function
    JSON.parse(responseText); // Validate
    return responseText;
  } catch (error) {
    logger.warn(
      `    ⚠️ STRATEGY 1 FAILED for whole JSON to ${targetLocale}: ${(error as Error).message}`
    );
    return null;
  }
}

// =================================================================================
// STRATEGY 2: Batched String Translation (1 Namespace -> 1 Language) - WORKHORSE
// =================================================================================
interface TranslatableStringItem {
  pathSegments: string[];
  originalValue: string;
}
const collectedStringsForNamespace: TranslatableStringItem[] = [];

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function collectStringsRecursive(node: any, currentPath: string[] = []) {
  /* ... as in my previous batched script ... */
  if (typeof node === 'string') {
    const trimmedValue = node.trim();
    if (
      trimmedValue &&
      !/^\{\{.*\}\}$/.test(trimmedValue) &&
      !/^<[^>/]+(\s*\/)?>$/.test(trimmedValue) &&
      !(
        /^<[^>]+>.*<\/[^>]+>$/.test(trimmedValue) &&
        !trimmedValue.match(/[a-zA-Z]{2,}/)
      )
    ) {
      collectedStringsForNamespace.push({
        pathSegments: currentPath,
        originalValue: node,
      });
    }
    return;
  }
  if (Array.isArray(node))
    node.forEach((item, i) =>
      collectStringsRecursive(item, [...currentPath, String(i)])
    );
  else if (typeof node === 'object' && node !== null) {
    for (const key in node)
      if (Object.prototype.hasOwnProperty.call(node, key))
        collectStringsRecursive(node[key], [...currentPath, key]);
  }
}

async function processStringBatch(
  batch: TranslatableStringItem[],
  sourceLocale: string,
  targetLocale: string,
  resultsMap: Map<string, string | null>
): Promise<void> {
  /* ... as in my previous batched script, ensuring prompt is for JSON array output ... */
  if (batch.length === 0) return;
  const promptInput = batch
    .map(
      (item, i) =>
        `${i + 1}. (Context: ${item.pathSegments.join('.')}) Text: ${item.originalValue}`
    )
    .join('\n');
  const prompt = `
Translate each text item in the following numbered list from ${sourceLocale} to ${targetLocale}.
CRITICAL INSTRUCTIONS:
1.  RETURN A VALID JSON ARRAY of strings, with exactly ${batch.length} elements.
2.  Preserve ALL ICU placeholders (e.g., {{var}}) and HTML-like tags (e.g., <bold>).
3.  If an input is a placeholder or simple tag, return it UNCHANGED.

Input Items:
${promptInput}

Output (JSON Array of ${batch.length} translated strings):
`;
  try {
    await delay(CONFIG.apiCallDelayMs);
    logger.debug(
      `      Translating batch of ${batch.length} strings to ${targetLocale} (first path: ${batch[0]?.pathSegments.join('.')})...`
    );
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        ...baseGenerationConfig,
        responseMimeType: 'application/json',
      },
      safetySettings: safetySettings as SafetySetting[],
    });
    const responseText = result.response.text().trim();
    const translatedArray = JSON.parse(responseText) as string[];

    if (
      !Array.isArray(translatedArray) ||
      translatedArray.length !== batch.length
    )
      throw new Error('Mismatched translation count in batch response.');

    batch.forEach((item, i) => {
      let translated = translatedArray[i];
      if (typeof translated !== 'string')
        translated = item.originalValue; // Revert if not string
      else if (!translated.trim() && item.originalValue.trim())
        translated = item.originalValue; // Revert if empty for non-empty
      resultsMap.set(item.pathSegments.join('.'), translated);
    });
  } catch (error) {
    logger.warn(
      `      ⚠️ Error translating string batch to ${targetLocale}: ${(error as Error).message}. Items in batch revert to original.`
    );
    // biome-ignore lint/complexity/noForEach: <explanation>
    batch.forEach((item) =>
      resultsMap.set(item.pathSegments.join('.'), item.originalValue)
    );
  }
}

async function translateNamespaceByBatchedStrings(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  sourceJson: any,
  sourceLocale: string,
  targetLocale: string
): Promise<string | null> {
  logger.debug(
    `    Attempting STRATEGY 2: Batched String Translation to ${targetLocale}...`
  );
  collectedStringsForNamespace.length = 0; // Clear for current namespace
  collectStringsRecursive(sourceJson);

  if (collectedStringsForNamespace.length === 0) {
    logger.info(
      `    No translatable strings found for ${targetLocale} via collector. Returning original content.`
    );
    return JSON.stringify(sourceJson, null, 2);
  }
  logger.info(
    `    Collected ${collectedStringsForNamespace.length} strings for batched translation to ${targetLocale}.`
  );

  const translationResultsMap = new Map<string, string | null>();
  let currentBatch: TranslatableStringItem[] = [];
  let currentBatchChars = 0;

  for (const item of collectedStringsForNamespace) {
    currentBatch.push(item);
    currentBatchChars += item.originalValue.length;
    if (
      currentBatch.length >= CONFIG.maxStringsPerBatch ||
      currentBatchChars >= CONFIG.maxCharsPerStringBatch
    ) {
      await processStringBatch(
        currentBatch,
        sourceLocale,
        targetLocale,
        translationResultsMap
      );
      currentBatch = [];
      currentBatchChars = 0;
    }
  }
  if (currentBatch.length > 0)
    await processStringBatch(
      currentBatch,
      sourceLocale,
      targetLocale,
      translationResultsMap
    );

  // Pass 3: Apply translations (function from previous script)
  const applyTranslationsRecursive = (
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    originalNode: any,
    currentPath: string[] = []
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ): any => {
    const pathKey = currentPath.join('.');
    if (typeof originalNode === 'string') {
      if (translationResultsMap.has(pathKey)) {
        const translated = translationResultsMap.get(pathKey);
        return translated !== null && translated !== undefined
          ? translated
          : originalNode;
      }
      return originalNode;
    }
    if (Array.isArray(originalNode))
      return originalNode.map((item, i) =>
        applyTranslationsRecursive(item, [...currentPath, String(i)])
      );
    if (typeof originalNode === 'object' && originalNode !== null) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const res: Record<string, any> = {};
      for (const key in originalNode)
        if (Object.prototype.hasOwnProperty.call(originalNode, key))
          res[key] = applyTranslationsRecursive(originalNode[key], [
            ...currentPath,
            key,
          ]);
      return res;
    }
    return originalNode;
  };

  const translatedFullObject = applyTranslationsRecursive(sourceJson);
  return JSON.stringify(translatedFullObject, null, 2);
}

// =================================================================================
// STRATEGY 3 (Ambitious): 1 Namespace -> Many Target Languages
// =================================================================================
async function translateNamespaceToMultipleLangs(
  namespaceName: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  sourceJsonContent: any, // Parsed JSON
  sourceLocale: string,
  targetLocalesChunk: string[]
): Promise<Record<string, string | null> | null> {
  // Returns map of { locale: translatedJsonString | null }
  if (!CONFIG.enableNamespaceMultiLangBatch || targetLocalesChunk.length === 0)
    return null;

  logger.debug(
    `    Attempting STRATEGY 3: Namespace "${namespaceName}" to [${targetLocalesChunk.join(', ')}]...`
  );
  const prompt = `
Translate the following JSON namespace ("${namespaceName}") from ${sourceLocale} to EACH of the target languages: ${targetLocalesChunk.join(', ')}.

SOURCE JSON (${sourceLocale}) for namespace "${namespaceName}":
\`\`\`json
${JSON.stringify(sourceJsonContent, null, 2)}
\`\`\`

CRITICAL OUTPUT FORMAT:
Return a single valid JSON object where each key is a target language code (from the list [${targetLocalesChunk.join(', ')}]) and its value is the complete translated JSON structure for that language.
Example for target locales ["fr-FR", "es-ES"]:
{
  "fr-FR": { /* ... translated content for French ... */ },
  "es-ES": { /* ... translated content for Spanish ... */ }
}

IMPORTANT TRANSLATION RULES:
1.  Maintain the EXACT JSON structure (keys, nesting) for EACH language's translated version.
2.  Translate ONLY string values. Preserve keys, numbers, booleans, nulls.
3.  Preserve ALL ICU placeholders (e.g., {{var}}) and HTML-like tags (e.g., <bold>) EXACTLY.
4.  Do NOT include markdown like \`\`\`json around the final output JSON object.
`;

  try {
    await delay(CONFIG.apiCallDelayMs);
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        ...baseGenerationConfig,
        responseMimeType: 'application/json',
      },
      safetySettings,
    });
    const responseText = result.response.text().trim();
    const parsedResponse = JSON.parse(responseText);

    // Validate structure
    const finalResults: Record<string, string | null> = {};
    let allValid = true;
    for (const locale of targetLocalesChunk) {
      if (
        parsedResponse &&
        typeof parsedResponse === 'object' &&
        parsedResponse[locale] &&
        typeof parsedResponse[locale] === 'object'
      ) {
        finalResults[locale] = JSON.stringify(parsedResponse[locale], null, 2);
      } else {
        logger.warn(
          `    ⚠️ STRATEGY 3: Missing or invalid structure for locale ${locale} in multi-lang response for namespace "${namespaceName}".`
        );
        finalResults[locale] = null; // Mark as failed for this locale
        allValid = false;
      }
    }
    if (!allValid)
      logger.warn(
        `    ⚠️ STRATEGY 3: Some locales failed in multi-lang batch for "${namespaceName}".`
      );
    return finalResults;
  } catch (error) {
    logger.warn(
      `    ⚠️ STRATEGY 3 FAILED for namespace "${namespaceName}" to [${targetLocalesChunk.join(', ')}]: ${(error as Error).message}`
    );
    return null; // Indicates overall failure for this batch of languages for this namespace
  }
}

// --- Main Execution ---
async function main() {
  logger.info(
    '====================================================================='
  );
  logger.info('🚀 Starting RELIABLY OPTIMIZED AI Translation Script');
  // ... (Log other CONFIG details as needed) ...

  try {
    await fs.access(CONFIG.sourceLangDir);
  } catch {
    logger.error(`FATAL: Source dir not found: ${CONFIG.sourceLangDir}`);
    process.exit(1);
  }

  const sourceNamespaceFiles = glob.sync('*.json', {
    cwd: CONFIG.sourceLangDir,
    absolute: false,
  });
  if (sourceNamespaceFiles.length === 0) {
    logger.warn('No JSON files in source. Exiting.');
    return;
  }
  logger.info(
    `Found ${sourceNamespaceFiles.length} source files: [${sourceNamespaceFiles.join(', ')}]`
  );

  const allTargetLocales = LANGUAGES.filter(
    (l) => l.toLowerCase() !== FALLBACK_LNG.toLowerCase()
  );
  if (allTargetLocales.length === 0) {
    logger.warn('No target locales. Exiting.');
    return;
  }
  logger.info(`Target locales: [${allTargetLocales.join(', ')}]`);

  for (const nsFile of sourceNamespaceFiles) {
    const nsName = path.basename(nsFile, '.json');
    logger.info(`\n--- Processing Namespace: "${nsName}" ---`);
    const sourceFilePath = path.join(CONFIG.sourceLangDir, nsFile);
    // biome-ignore lint/suspicious/noEvolvingTypes: <explanation>
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let sourceContentRaw, sourceJson;
    try {
      sourceContentRaw = await fs.readFile(sourceFilePath, 'utf-8');
      sourceJson = JSON.parse(sourceContentRaw);
    } catch (e) {
      logger.error(`Failed to read/parse ${sourceFilePath}. Skipping.`, e);
      continue;
    }

    const fileSize = Buffer.byteLength(sourceContentRaw, 'utf8');
    logger.info(
      `  Source: ${nsFile} (Size: ${(fileSize / 1024).toFixed(2)}KB)`
    );

    // Group target locales for Strategy 3
    const targetLocaleChunks: string[][] = [];
    if (CONFIG.enableNamespaceMultiLangBatch) {
      for (
        let i = 0;
        i < allTargetLocales.length;
        i += CONFIG.maxTargetLangsPerNamespaceBatch
      ) {
        targetLocaleChunks.push(
          allTargetLocales.slice(i, i + CONFIG.maxTargetLangsPerNamespaceBatch)
        );
      }
    } else {
      // Each locale is its own "chunk" if multi-lang batch is disabled
      for (const locale of allTargetLocales) targetLocaleChunks.push([locale]);
    }

    for (const localeChunk of targetLocaleChunks) {
      logger.info(
        `  -> Processing target locale(s): [${localeChunk.join(', ')}] for "${nsName}"`
      );

      let multiLangResults: Record<string, string | null> | null = null;

      // Attempt Strategy 3 if enabled and chunk has multiple locales (or even single if strategy is on)
      if (
        CONFIG.enableNamespaceMultiLangBatch &&
        fileSize <= CONFIG.wholeJsonMaxSizeKB * localeChunk.length
      ) {
        // Rough check for total output size
        multiLangResults = await translateNamespaceToMultipleLangs(
          nsName,
          sourceJson,
          FALLBACK_LNG,
          localeChunk
        );
      }

      for (const targetLocale of localeChunk) {
        const targetLangSpecificDir = path.join(
          CONFIG.allLocalesRootDir,
          targetLocale
        );
        const targetFilePath = path.join(targetLangSpecificDir, nsFile);

        // Overwrite check
        const targetFileExists = await fileExists(targetFilePath);
        let shouldTranslate = true;
        if (targetFileExists) {
          const pol = CONFIG.overwritePolicy;
          if (pol.type === 'none') {
            logger.info(
              `    SKIPPING ${targetLocale}: File exists, policy 'none'.`
            );
            shouldTranslate = false;
          } else if (
            pol.type === 'specific' &&
            !pol.locales.includes(targetLocale.toLowerCase())
          ) {
            logger.info(
              `    SKIPPING ${targetLocale}: File exists, policy 'specific', locale not in list.`
            );
            shouldTranslate = false;
          } else {
            logger.info(
              `    OVERWRITING ${targetLocale}: File exists, proceeding by policy '${pol.type}'.`
            );
          }
        }
        if (!shouldTranslate) continue;

        let translatedJsonString: string | null = null;

        // Use result from Strategy 3 if successful for this locale
        if (multiLangResults?.[targetLocale]) {
          translatedJsonString = multiLangResults[targetLocale];
          logger.info(
            `    ✅ Using result from STRATEGY 3 (1 NS -> Many Langs) for ${targetLocale}.`
          );
        } else {
          if (multiLangResults !== null) {
            // Attempted Strategy 3 but it failed for this specific locale
            logger.warn(
              `    ⚠️ STRATEGY 3 failed or yielded no result for ${targetLocale}, falling back for "${nsName}".`
            );
          }
          // Fallback logic: Strategy 1 or 2
          if (fileSize <= CONFIG.wholeJsonMaxSizeKB) {
            translatedJsonString = await translateWholeJsonDirectly(
              sourceContentRaw,
              FALLBACK_LNG,
              targetLocale
            );
            if (translatedJsonString)
              logger.info(
                `    ✅ STRATEGY 1 (Whole Small JSON) successful for ${targetLocale}.`
              );
          }

          if (!translatedJsonString) {
            // If Strategy 1 failed or was skipped
            // Default to Strategy 2 (Batched String Translation)
            logger.info(
              `    Fallback to STRATEGY 2 (Batched Strings) for ${targetLocale} for "${nsName}".`
            );
            translatedJsonString = await translateNamespaceByBatchedStrings(
              sourceJson,
              FALLBACK_LNG,
              targetLocale
            );
            if (translatedJsonString)
              logger.info(
                `    ✅ STRATEGY 2 (Batched Strings) successful for ${targetLocale}.`
              );
          }
        }

        // Save the file
        if (translatedJsonString) {
          try {
            await fs.mkdir(targetLangSpecificDir, { recursive: true });
            await fs.writeFile(targetFilePath, translatedJsonString, 'utf-8');
            logger.info(
              `    💾 Saved: ${path.relative(PATHS.monorepoRoot, targetFilePath)}`
            );
          } catch (e) {
            logger.error(`    ❌ Failed to write ${targetFilePath}`, e);
          }
        } else {
          logger.warn(
            `    ⚠️ All translation strategies failed for "${nsName}" to ${targetLocale}. No file written.`
          );
        }
      } // End loop for individual targetLocale within a chunk
    } // End loop for localeChunk
  } // End loop for nsFile

  logger.info('\n🏁 AI Translation Script Finished.');
}

// --- Script Entry Point ---
(async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    logger.error('💥 UNHANDLED CRITICAL ERROR:', error);
    process.exit(1);
  }
})();
