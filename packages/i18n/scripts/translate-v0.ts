// =================================================================================================
// AI-Powered I18N Translation Script for JSON Locale Files (Optimized with Batching)
// =================================================================================================
// Purpose:
// This script automates the translation of JSON-based i18n locale files from a fallback
// language to multiple target languages using Google's Gemini AI. It's optimized to
// reduce API calls for large files by batching string translations.
//
// Features:
// - Loads configuration from .env file.
// - Flexible overwrite policies for existing translations.
// - Uses Google Generative AI (Gemini Flash model by default).
// - Implements rate limiting for API calls.
// - Employs two translation strategies:
//   1. Whole JSON translation (for smaller files).
//   2. Batched string-by-string translation (for larger files, preserving structure).
// - Detailed logging for monitoring and debugging.
// - Graceful error handling.
// - Prompts engineered to preserve ICU placeholders and HTML-like tags.
//
// Setup:
// 1. Node.js (v18+), pnpm/npm/yarn.
// 2. Dependencies: `pnpm add @google/generative-ai glob dotenv`
// 3. `.env` file in monorepo root (see previous example for variables).
// 4. Configure i18n settings in `../config` (FALLBACK_LNG, LANGUAGES, PATHS).
//    `PATHS.monorepoRoot` and `PATHS.publicLocales` are crucial.
//    New optional .env vars for batching:
//    TRANSLATION_MAX_BATCH_STRINGS=10  (number of strings per batch)
//    TRANSLATION_MAX_BATCH_CHARS=3000 (approx. total characters in values per batch)
//
// Usage:
// `pnpm tsx ./path/to/this/script.ts`
// =================================================================================================

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import dotenv from 'dotenv';
import { glob } from 'glob';

// Assuming your centralized config is correctly structured and path is valid
import { FALLBACK_LNG, LANGUAGES } from '../config';
import { PATHS } from '../config/server.config';
import { createLogger } from './logger';

const logger = createLogger({ name: 'AI_TRANSLATION_SCRIPT_V2' });

// --- Environment Variable Loading ---
const envFilePath = path.resolve(PATHS.packageRoot, '.env');
logger.info(`Attempting to load .env from: ${envFilePath}`);
const envConfigOutput = dotenv.config({ path: envFilePath, override: true });
if (envConfigOutput.error)
  logger.warn(
    `⚠️  Could not load .env file from ${envFilePath}: ${envConfigOutput.error.message}`
  );
else if (envConfigOutput.parsed)
  logger.info(`✅ Loaded environment variables from ${envFilePath}`);

// --- Configuration & Constants ---
const GEMINI_API_KEY = process.env.TRANSLATION_AI_API_KEY;
if (!GEMINI_API_KEY) {
  logger.error(
    `FATAL: TRANSLATION_AI_API_KEY is not set. Define in ${envFilePath} or environment.`
  );
  process.exit(1);
}
logger.info('GEMINI_API_KEY: Configured.');

const sourceLangDir = path.join(PATHS.publicLocales, FALLBACK_LNG);
const allLocalesRootDir = PATHS.publicLocales;
logger.info(`Source Language (Fallback): ${FALLBACK_LNG}`);
logger.info(`Source Language Directory: ${sourceLangDir}`);
logger.info(`Root Directory for All Locales: ${allLocalesRootDir}`);

let apiCallDelayMs = Number.parseInt(
  process.env.TRANSLATION_API_CALL_DELAY_MS || '800',
  10
);
if (Number.isNaN(apiCallDelayMs) || apiCallDelayMs < 50) apiCallDelayMs = 800;
logger.info(`API Call Delay: ${apiCallDelayMs}ms`);

let thresholdForDeepChunkingBytes =
  Number.parseInt(
    process.env.TRANSLATION_DEEP_CHUNKING_THRESHOLD_KB || '15',
    10
  ) * 1024;
if (
  Number.isNaN(thresholdForDeepChunkingBytes) ||
  thresholdForDeepChunkingBytes <= 0
)
  thresholdForDeepChunkingBytes = 15 * 1024;
logger.info(
  `Deep Translation Threshold: ${(thresholdForDeepChunkingBytes / 1024).toFixed(2)}KB`
);

const MAX_BATCH_STRINGS = Number.parseInt(
  process.env.TRANSLATION_MAX_BATCH_STRINGS || '10',
  10
);
const MAX_BATCH_CHARS = Number.parseInt(
  process.env.TRANSLATION_MAX_BATCH_CHARS || '3000',
  10
);
logger.info(
  `Max strings per batch: ${MAX_BATCH_STRINGS}, Max chars per batch: ${MAX_BATCH_CHARS}`
);

const overwriteSettingInput =
  process.env.OVERWRITE_TRANSLATIONS?.toLowerCase() || 'false';
let overwritePolicy: 'all' | 'none' | 'specific' = 'none';
let specificLocalesToOverwrite: string[] = [];
if (overwriteSettingInput === 'true' || overwriteSettingInput === 'all')
  overwritePolicy = 'all';
else if (overwriteSettingInput === 'false' || overwriteSettingInput === 'none')
  overwritePolicy = 'none';
else {
  overwritePolicy = 'specific';
  specificLocalesToOverwrite = overwriteSettingInput
    .split(',')
    .map((loc) => loc.trim().toLowerCase())
    .filter(Boolean);
  if (specificLocalesToOverwrite?.length === 0) {
    logger.warn(
      "Overwrite policy 'specific' with no locales, defaulting to 'none'."
    );
    overwritePolicy = 'none';
  }
}
logger.info(
  `Overwrite Policy: ${overwritePolicy}${overwritePolicy === 'specific' ? ` (Locales: ${specificLocalesToOverwrite.join(', ')})` : ''}`
);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModelName =
  process.env.TRANSLATION_AI_MODEL_NAME || 'gemini-1.5-flash-latest';
const geminiModel = genAI.getGenerativeModel({ model: geminiModelName });
logger.info(`Using Gemini Model: ${geminiModelName}`);

let geminiTemperature = Number.parseFloat(
  process.env.TRANSLATION_AI_TEMPERATURE || '0.7'
);
if (
  Number.isNaN(geminiTemperature) ||
  geminiTemperature < 0.0 ||
  geminiTemperature > 1.0
)
  geminiTemperature = 0.7;

const baseGenerationConfig = {
  temperature: geminiTemperature,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};
logger.info(
  `Gemini Generation Config: Temperature=${baseGenerationConfig.temperature}`
);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

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

// --- Deep Translation: Multi-Pass Approach ---
interface TranslatableItem {
  pathSegments: string[]; // e.g., ['user', 'greeting'] or ['errors', '0', 'message']
  originalValue: string;
}
const allTranslatableItems: TranslatableItem[] = []; // Reset for each namespace file

// Pass 1: Collects all strings that need translation from a JSON node.
function collectTranslatableStringsRecursive(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  node: any,
  currentPath: string[] = []
) {
  if (typeof node === 'string') {
    const trimmedValue = node.trim();
    // Skip non-translatable strings (empty, pure placeholders, simple tags without much text)
    if (
      trimmedValue &&
      // biome-ignore lint/performance/useTopLevelRegex: <explanation>
      !/^\{\{.*\}\}$/.test(trimmedValue) &&
      // biome-ignore lint/performance/useTopLevelRegex: <explanation>
      !/^<[^>/]+(\s*\/)?>$/.test(trimmedValue) &&
      !(
        // biome-ignore lint/performance/useTopLevelRegex: <explanation>
        (
          /^<[^>]+>.*<\/[^>]+>$/.test(trimmedValue) &&
          // biome-ignore lint/performance/useTopLevelRegex: <explanation>
          !trimmedValue.match(/[a-zA-Z]{2,}/)
        )
      )
    ) {
      allTranslatableItems.push({
        pathSegments: currentPath,
        originalValue: node,
      });
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) =>
      collectTranslatableStringsRecursive(item, [...currentPath, String(index)])
    );
    return;
  }
  if (typeof node === 'object' && node !== null) {
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        collectTranslatableStringsRecursive(node[key], [...currentPath, key]);
      }
    }
  }
}

// Pass 2.1: Processes one batch of collected items.
async function processTranslationBatch(
  batchItems: TranslatableItem[],
  sourceLocale: string,
  targetLocale: string,
  translationResultsMap: Map<string, string | null> // pathString -> translatedValue or null on error
): Promise<void> {
  if (batchItems?.length === 0) return;

  const promptInputItems = batchItems
    .map(
      (item, index) =>
        `${index + 1}. (Path Context: "${item.pathSegments.join('.')}") Text: ${item.originalValue}`
    )
    .join('\n');

  const prompt = `
Translate each text item in the following numbered list from ${sourceLocale} to ${targetLocale}.

CRITICAL INSTRUCTIONS:
1.  RETURN A VALID JSON ARRAY of strings. The array MUST have exactly ${batchItems?.length} string elements, corresponding to the input items.
2.  PRESERVE ALL ORIGINAL ICU placeholders (e.g., {{variableName}}) and HTML-like tags (e.g., <bold>, <0/>) within each string.
3.  If an input item is essentially a placeholder or a simple tag, return it UNCHANGED in its position in the output array.
4.  Provide only the translated text for each item. Do not add item numbers or context paths in your output strings.

Input Text Items to Translate:
${promptInputItems}

Output (JSON Array of ${batchItems?.length} translated strings):
`;

  try {
    await delay(apiCallDelayMs);
    logger.info(
      `    🌐 Translating batch of ${batchItems?.length} strings to ${targetLocale}... (First item path: ${batchItems[0]?.pathSegments.join('.') || 'root'})`
    );

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        ...baseGenerationConfig,
        responseMimeType: 'application/json',
      }, // Expect JSON array
      safetySettings,
    });

    let responseText = '';
    if (result.response && typeof result.response.text === 'function')
      responseText = result.response.text().trim();
    else if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text)
      responseText = result.response.candidates[0].content.parts[0].text.trim();
    else
      throw new Error(
        'Unexpected API response structure for batched translation.'
      );

    const cleanedResponse = responseText
      .replace(/^```json\s*|```$/gim, '')
      .trim();
    const translatedArray = JSON.parse(cleanedResponse) as string[];

    if (
      !Array.isArray(translatedArray) ||
      translatedArray?.length !== batchItems?.length
    ) {
      throw new Error(
        `Mismatched translation count: expected ${batchItems?.length} strings in array, got ${translatedArray?.length || 'not an array'}. Response: ${cleanedResponse.substring(0, 200)}`
      );
    }

    batchItems.forEach((item, index) => {
      const pathKey = item.pathSegments.join('.');
      let translatedText = translatedArray[index];
      if (typeof translatedText !== 'string') {
        logger.warn(
          `    ⚠️ Non-string translation received for item at path [${pathKey}] in batch. Original: "${item.originalValue.substring(0, 50)}...". Reverting.`
        );
        translatedText = item.originalValue;
      } else if (!translatedText.trim() && item.originalValue.trim()) {
        logger.warn(
          `    ⚠️ Empty translation for non-empty string in batch at [${pathKey}]. Original: "${item.originalValue.substring(0, 50)}...". Reverting.`
        );
        translatedText = item.originalValue;
      }
      translationResultsMap.set(pathKey, translatedText);
    });
    logger.info(
      `    ✅ Successfully processed batch of ${batchItems?.length} strings for ${targetLocale}.`
    );
  } catch (error) {
    const err = error as Error;
    logger.error(
      `    ❌ Error translating batch to ${targetLocale}: ${err.message}. Items in this batch will use original values.`
    );
    // biome-ignore lint/complexity/noForEach: <explanation>
    batchItems.forEach((item) => {
      const pathKey = item.pathSegments.join('.');
      logger.error(
        `      Failed Item Context: ${pathKey}, Value: "${item.originalValue.substring(0, 70)}..."`
      );
      translationResultsMap.set(pathKey, item.originalValue); // Revert to original on batch failure
    });
  }
}

// Pass 2: Orchestrates batching of all collected items.
async function translateAllCollectedItemsInBatches(
  items: TranslatableItem[],
  sourceLocale: string,
  targetLocale: string
): Promise<Map<string, string | null>> {
  const translationResultsMap = new Map<string, string | null>();
  let currentBatch: TranslatableItem[] = [];
  let currentBatchChars = 0;

  logger.info(
    `    Starting batch translation for ${items?.length} items to ${targetLocale}...`
  );

  for (const item of items) {
    currentBatch.push(item);
    currentBatchChars += item.originalValue.length; // Approximation of token size

    if (
      currentBatch.length >= MAX_BATCH_STRINGS ||
      currentBatchChars >= MAX_BATCH_CHARS
    ) {
      await processTranslationBatch(
        currentBatch,
        sourceLocale,
        targetLocale,
        translationResultsMap
      );
      currentBatch = [];
      currentBatchChars = 0;
    }
  }
  if (currentBatch.length > 0) {
    // Process any remaining items
    await processTranslationBatch(
      currentBatch,
      sourceLocale,
      targetLocale,
      translationResultsMap
    );
  }
  logger.info(
    `    Finished batch translation for ${targetLocale}. Total items processed: ${items?.length}. Results map size: ${translationResultsMap.size}`
  );
  return translationResultsMap;
}

// Pass 3: Applies translations from the map back to a deep copy of the original JSON.
function applyTranslationsRecursive(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  originalNode: any,
  translationsMap: Map<string, string | null>,
  currentPath: string[] = []
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): any {
  const pathKey = currentPath.join('.');

  if (typeof originalNode === 'string') {
    // Check if this specific path was targeted for translation (it would be in allTranslatableItems if so)
    // and if its translation exists in the map.
    if (translationsMap.has(pathKey)) {
      const translatedValue = translationsMap.get(pathKey);
      // If translation failed (null) or somehow missing from map (shouldn't happen if collected), use original.
      return translatedValue !== null && translatedValue !== undefined
        ? translatedValue
        : originalNode;
    }
    return originalNode; // String was not in the collected items or no translation found
  }

  if (Array.isArray(originalNode)) {
    return originalNode.map((item, index) =>
      applyTranslationsRecursive(item, translationsMap, [
        ...currentPath,
        String(index),
      ])
    );
  }
  if (typeof originalNode === 'object' && originalNode !== null) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const translatedObject: Record<string, any> = {};
    for (const key in originalNode) {
      if (Object.prototype.hasOwnProperty.call(originalNode, key)) {
        translatedObject[key] = applyTranslationsRecursive(
          originalNode[key],
          translationsMap,
          [...currentPath, key]
        );
      }
    }
    return translatedObject;
  }
  return originalNode; // Numbers, booleans, nulls
}
// --- End Deep Translation Multi-Pass ---

// --- Whole JSON Translation (for smaller files) ---
async function translateJsonContentAsWhole(
  jsonString: string,
  sourceLocale: string,
  targetLocale: string
): Promise<string | null> {
  const prompt = `
Translate the following JSON object from ${sourceLocale} to ${targetLocale}.

KEY INSTRUCTIONS:
1.  VALID JSON OUTPUT: The entire output MUST be a single, valid JSON object.
2.  IDENTICAL STRUCTURE: Maintain the exact same JSON structure (keys, nesting, arrays) as the input.
3.  TRANSLATE STRING VALUES ONLY: Only translate string values. Do NOT translate keys. Numbers, booleans, nulls must remain unchanged.
4.  PRESERVE PLACEHOLDERS & TAGS: All ICU placeholders (e.g., {{var}}) and HTML-like tags (e.g., <bold>) within string values MUST be preserved EXACTLY.
5.  NO EXTRA TEXT: Return ONLY the translated JSON object. Do NOT include markdown like \`\`\`json.

Source JSON (${sourceLocale}):
\`\`\`json
${jsonString}
\`\`\`

Translated JSON (${targetLocale}):
`;
  try {
    await delay(apiCallDelayMs);
    logger.debug(
      `    Attempting whole JSON translation to ${targetLocale} (size: ${(jsonString.length / 1024).toFixed(2)}KB)...`
    );

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        ...baseGenerationConfig,
        responseMimeType: 'application/json',
      },
      safetySettings,
    });
    let responseText = '';
    if (result.response && typeof result.response.text === 'function')
      responseText = result.response.text().trim();
    else if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text)
      responseText = result.response.candidates[0].content.parts[0].text.trim();
    else throw new Error('Unexpected API response for whole JSON translation.');

    const cleanedResponse = responseText
      .replace(/^```json\s*|```$/gim, '')
      .trim();
    JSON.parse(cleanedResponse); // Validate
    return cleanedResponse;
  } catch (error) {
    /* ... (error logging as before, slightly more concise) ... */
    const err = error as Error;
    logger.error(
      `    ❌ Error translating whole JSON to ${targetLocale}: ${err.message}. Input size: ${(jsonString.length / 1024).toFixed(2)}KB`
    );
    return null;
  }
}
// --- End Whole JSON Translation ---

// --- Main Execution Function ---
async function main() {
  logger.info(
    '====================================================================='
  );
  logger.info('🚀 Starting AI Translation Script (Optimized with Batching)');
  logger.info(
    '====================================================================='
  );
  // ... (Log configurations as before) ...

  try {
    await fs.access(sourceLangDir);
    logger.info(`Verified source language directory: ${sourceLangDir}`);
  } catch {
    /* ... (FATAL error logging and exit as before) ... */
    logger.error(
      `FATAL: Source language directory does not exist or is not accessible: ${sourceLangDir}`
    );
    process.exit(1);
  }

  const sourceNamespaceFiles = glob.sync('*.json', {
    cwd: sourceLangDir,
    absolute: false,
  });
  if (sourceNamespaceFiles.length === 0) {
    /* ... (Warn and return as before) ... */
    logger.warn(
      `No JSON files found in ${sourceLangDir}. Nothing to translate.`
    );
    return;
  }
  logger.info(
    `Found ${sourceNamespaceFiles.length} source namespace files: [${sourceNamespaceFiles.join(', ')}]`
  );

  const targetLocales = LANGUAGES.filter(
    (lang) => lang.toLowerCase() !== FALLBACK_LNG.toLowerCase()
  );
  if (targetLocales.length === 0) {
    /* ... (Warn and return as before) ... */
    logger.warn('No target languages configured (excluding fallback).');
    return;
  }
  logger.info(`Target languages: [${targetLocales.join(', ')}]`);

  for (const nsFile of sourceNamespaceFiles) {
    const nsName = path.basename(nsFile, '.json');
    logger.info(`\n--- Processing Namespace: "${nsName}" ---`);
    const sourceFilePath = path.join(sourceLangDir, nsFile);
    let sourceContentRaw: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let sourceJson: any;

    try {
      sourceContentRaw = await fs.readFile(sourceFilePath, 'utf-8');
      sourceJson = JSON.parse(sourceContentRaw);
    } catch (e) {
      /* ... (Error and continue as before) ... */
      logger.error(
        `Failed to read/parse ${sourceFilePath}. Skipping. Error:`,
        e
      );
      continue;
    }
    const fileSize = Buffer.byteLength(sourceContentRaw, 'utf8');
    logger.info(
      `  Source file: ${nsFile} (Size: ${(fileSize / 1024).toFixed(2)}KB)`
    );

    for (const targetLocale of targetLocales) {
      const targetLangSpecificDir = path.join(allLocalesRootDir, targetLocale);
      const targetFilePath = path.join(targetLangSpecificDir, nsFile);
      logger.info(
        `  -> Targeting locale: ${targetLocale} (Output: ${path.relative(PATHS.monorepoRoot, targetFilePath)})`
      );

      try {
        await fs.mkdir(targetLangSpecificDir, { recursive: true });
      } catch (e) {
        /* ... (Error and continue to next locale as before) ... */
        logger.error(
          `Failed to create dir ${targetLangSpecificDir}. Skipping locale ${targetLocale} for ${nsName}. Error:`,
          e
        );
        continue;
      }

      const targetFileExists = await fileExists(targetFilePath);
      let shouldTranslate = true;
      if (targetFileExists) {
        const targetLocaleLower = targetLocale.toLowerCase();
        if (overwritePolicy === 'none') {
          logger.info("    SKIPPING: File exists, policy 'none'.");
          shouldTranslate = false;
        } else if (
          overwritePolicy === 'specific' &&
          !specificLocalesToOverwrite.includes(targetLocaleLower)
        ) {
          logger.info(
            `    SKIPPING: File exists, policy 'specific', '${targetLocale}' not in overwrite list.`
          );
          shouldTranslate = false;
        } else {
          logger.info(
            `    OVERWRITING: File exists, proceeding based on policy '${overwritePolicy}'.`
          );
        }
      }
      if (!shouldTranslate) continue;

      let translatedJsonString: string | null = null;
      logger.info(
        `    Attempting translation from ${FALLBACK_LNG} to ${targetLocale} for "${nsName}"...`
      );

      if (fileSize > thresholdForDeepChunkingBytes) {
        logger.info(
          '    Strategy: Deep translation (batched string-by-string) due to file size.'
        );
        allTranslatableItems.length = 0; // Clear for current namespace file
        collectTranslatableStringsRecursive(sourceJson); // Pass 1

        if (allTranslatableItems?.length > 0) {
          logger.info(
            `    Collected ${allTranslatableItems?.length} strings for batch translation.`
          );
          const translatedItemsMap = await translateAllCollectedItemsInBatches(
            // Pass 2
            allTranslatableItems,
            FALLBACK_LNG,
            targetLocale
          );
          const translatedFullObject = applyTranslationsRecursive(
            sourceJson,
            translatedItemsMap
          ); // Pass 3
          translatedJsonString = JSON.stringify(translatedFullObject, null, 2);
          logger.info(
            `    ✅ Deep batched translation successful for "${nsName}" to ${targetLocale}.`
          );
        } else {
          logger.info(
            `    No translatable strings found by collector for "${nsName}". Using original content.`
          );
          translatedJsonString = sourceContentRaw; // Use original if no strings to translate
        }
      } else {
        logger.info('    Strategy: Whole JSON translation.');
        translatedJsonString = await translateJsonContentAsWhole(
          sourceContentRaw,
          FALLBACK_LNG,
          targetLocale
        );
        if (translatedJsonString)
          logger.info(
            `    ✅ Whole JSON translation successful for "${nsName}" to ${targetLocale}.`
          );
      }

      if (translatedJsonString) {
        try {
          await fs.writeFile(targetFilePath, translatedJsonString, 'utf-8');
          logger.info(
            `    💾 Saved: ${path.relative(PATHS.monorepoRoot, targetFilePath)}`
          );
        } catch (writeError) {
          /* ... (Error logging as before) ... */
          logger.error(
            `    ❌ Failed to write ${path.relative(PATHS.monorepoRoot, targetFilePath)}. Error:`,
            writeError
          );
        }
      } else {
        logger.warn(
          `    ⚠️ Translation failed or was skipped for "${nsName}" to ${targetLocale}. No file written.`
        );
      }
    }
  }
  logger.info(
    '\n====================================================================='
  );
  logger.info('🏁 AI Translation Script Finished Execution');
  logger.info(
    '====================================================================='
  );
  // ... (Recommendations as before) ...
}
// --- End Main Execution Function ---

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
