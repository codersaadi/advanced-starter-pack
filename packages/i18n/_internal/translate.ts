import fs from 'node:fs/promises';
import path from 'node:path';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { glob } from 'glob';
import { fallbackLng, languages } from '../settings'; // Your existing settings

import dotenv from 'dotenv'; // Import dotenv
import { createLogger } from './logger'; // Assuming logger.ts is in the same _internal directory

const _internalLogger = createLogger({ name: 'Translation_i18n' });

// --- Load .env file ---
const envFilePath = path.resolve(process.cwd(), '.env');
_internalLogger.info(`Attempting to load .env from: ${envFilePath}`);
const envConfigOutput = dotenv.config({ path: envFilePath, override: true });

if (envConfigOutput.error) {
  _internalLogger.warn(
    `⚠️  Warning: Could not load .env file from ${envFilePath}. Proceeding without it. Error: ${envConfigOutput.error.message}`
  );
} else if (envConfigOutput.parsed) {
  _internalLogger.info(`✅ Loaded environment variables from ${envFilePath}`);
}
// --- End .env loading ---

// --- Configuration for Overwriting Translations ---
const overwriteSetting =
  process.env.OVERWRITE_TRANSLATIONS?.toLowerCase() || 'false';
let overwritePolicy: 'all' | 'none' | 'specific' = 'none';
let specificLocalesToOverwrite: string[] = [];

if (overwriteSetting === 'true' || overwriteSetting === 'all') {
  overwritePolicy = 'all';
  _internalLogger.info(
    'Overwrite policy: ALL existing translation files will be overwritten.'
  );
} else if (overwriteSetting === 'false' || overwriteSetting === 'none') {
  overwritePolicy = 'none';
  _internalLogger.info(
    'Overwrite policy: NONE. Existing translation files will be skipped.'
  );
} else {
  overwritePolicy = 'specific';
  specificLocalesToOverwrite = overwriteSetting
    .split(',')
    .map((loc) => loc.trim())
    .filter(Boolean);
  _internalLogger.info(
    `Overwrite policy: SPECIFIC. Will overwrite for: [${specificLocalesToOverwrite.join(', ')}]. Other existing files will be skipped.`
  );
}
// --- End Overwrite Configuration ---

const localesDir = path.resolve(
  `${process.cwd()}/_internal`,
  '../../../apps/web/public/locales'
);
const defaultLangDir = path.join(localesDir, fallbackLng);

const GEMINI_API_KEY = process.env.TRANSLATION_AI_API_KEY;
_internalLogger.info(`GEMINI_API_KEY is ${GEMINI_API_KEY ? 'set' : 'NOT SET'}`);

if (!GEMINI_API_KEY) {
  _internalLogger.error(
    `ERROR: TRANSLATION_AI_API_KEY environment variable is not set. Please ensure it's in ${envFilePath} or set in the environment.`
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};

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

const API_CALL_DELAY_MS = process.env.TRANSLATION_API_CALL_DELAY_MS
  ? Number.parseInt(process.env.TRANSLATION_API_CALL_DELAY_MS, 10)
  : 800;
const THRESHOLD_FOR_DEEP_CHUNKING_BYTES = 15 * 1024;

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Function to translate a single string value
async function translateSingleStringValue(
  value: string,
  sourceLocale: string,
  targetLocale: string,
  contextPath = 'value'
): Promise<string | null> {
  if (!value.trim()) return value;

  const prompt = `
    Translate the following text content from ${sourceLocale} to ${targetLocale}.
    Context: This text is part of a larger JSON structure, at path "${contextPath}".
    IMPORTANT:
    1.  Preserve any ICU message format placeholders like {{variable}} or <tag>content</tag> exactly as they are.
    2.  Return ONLY the translated text, without any surrounding text or markdown code blocks.

    Text to translate:
    ${value}
  `;

  try {
    await new Promise((resolve) => setTimeout(resolve, API_CALL_DELAY_MS));
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    const responseText = result.response.text().trim();
    return responseText;
  } catch (error) {
    _internalLogger.error(
      {
        message: `Error translating string at [${contextPath}] to ${targetLocale}`,
        value: `"${value.substring(0, 100)}${value.length > 100 ? '...' : ''}"`,
        originalError: error,
      },
      `Failed to translate string for path [${contextPath}]`
    );
    return null;
  }
}

// Recursive function to traverse JSON and translate string values
async function traverseAndTranslateStrings(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  node: any,
  sourceLocale: string,
  targetLocale: string,
  currentPath: string[] = []
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  if (typeof node === 'string') {
    const translatedString = await translateSingleStringValue(
      node,
      sourceLocale,
      targetLocale,
      currentPath.join('.') || 'root_string'
    );
    return translatedString !== null ? translatedString : node;
  }
  if (Array.isArray(node)) {
    const translatedArray = [];
    for (let i = 0; i < node.length; i++) {
      translatedArray.push(
        await traverseAndTranslateStrings(node[i], sourceLocale, targetLocale, [
          ...currentPath,
          `[${i}]`,
        ])
      );
    }
    return translatedArray;
  }
  if (typeof node === 'object' && node !== null) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const translatedObject: Record<string, any> = {};
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        translatedObject[key] = await traverseAndTranslateStrings(
          node[key],
          sourceLocale,
          targetLocale,
          [...currentPath, key]
        );
      }
    }
    return translatedObject;
  }
  return node;
}

// Original function to translate entire JSON content (for smaller files)
async function translateJsonContentAsWhole(
  jsonString: string,
  sourceLocale: string,
  targetLocale: string
): Promise<string | null> {
  const prompt = `
    Translate the following JSON content from ${sourceLocale} to ${targetLocale}.
    IMPORTANT:
    1.  Maintain the exact same JSON structure and keys. Only translate the string values.
    2.  Preserve any ICU message format placeholders like {{variable}} or <tag>content</tag> exactly as they are.
    3.  Return ONLY the translated JSON object as a valid JSON string, without any surrounding text or markdown code blocks.

    JSON to translate:
    \`\`\`json
    ${jsonString}
    \`\`\`
  `;

  try {
    await new Promise((resolve) => setTimeout(resolve, API_CALL_DELAY_MS));
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    const responseText = result.response.text().trim();
    const cleanedResponse = responseText
      .replace(/^```json\s*|```$/g, '')
      .trim();
    JSON.parse(cleanedResponse);
    return cleanedResponse;
  } catch (error) {
    _internalLogger.error(
      `Error translating whole JSON to ${targetLocale}:`,
      error
    );
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    if (error instanceof Error && (error as any).response) {
      _internalLogger.error(
        'Gemini API Response (raw for whole JSON):',
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (error as any).response?.text()
      );
    }
    return null;
  }
}

async function main() {
  _internalLogger.info(`Starting translation process from ${fallbackLng}...`);

  const sourceNamespaceFiles = glob.sync('*.json', { cwd: defaultLangDir });

  if (sourceNamespaceFiles.length === 0) {
    _internalLogger.warn(
      `No JSON files found in ${defaultLangDir}. Nothing to translate.`
    );
    return;
  }
  _internalLogger.info(
    `Found source namespaces: ${sourceNamespaceFiles.join(', ')}`
  );

  const targetLocales = languages.filter((lang) => lang !== fallbackLng);

  if (targetLocales.length === 0) {
    _internalLogger.warn(
      'No target languages configured (excluding fallbackLng).'
    );
    return;
  }
  _internalLogger.info(`Target languages: ${targetLocales.join(', ')}`);

  for (const nsFile of sourceNamespaceFiles) {
    const nsName = path.basename(nsFile, '.json');
    _internalLogger.info(`\n--- Processing namespace: ${nsName} ---`); // Changed from "Translating"

    const sourceFilePath = path.join(defaultLangDir, nsFile);
    const sourceContentRaw = await fs.readFile(sourceFilePath, 'utf-8');
    const fileSize = Buffer.byteLength(sourceContentRaw, 'utf8');

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let sourceJson: any;
    try {
      sourceJson = JSON.parse(sourceContentRaw);
    } catch (e) {
      _internalLogger.error(
        `Error parsing source JSON file ${sourceFilePath}:`,
        e
      );
      continue;
    }

    for (const targetLocale of targetLocales) {
      const targetLangDir = path.join(localesDir, targetLocale);
      await fs.mkdir(targetLangDir, { recursive: true });
      const targetFilePath = path.join(targetLangDir, nsFile);

      // --- Check overwrite policy ---
      const targetFileAlreadyExists = await fileExists(targetFilePath);
      let shouldTranslate = true;

      if (targetFileAlreadyExists) {
        if (overwritePolicy === 'none') {
          _internalLogger.info(
            `    Skipping ${nsName} for ${targetLocale} (file exists, policy: none).`
          );
          shouldTranslate = false;
        } else if (
          overwritePolicy === 'specific' &&
          !specificLocalesToOverwrite.includes(targetLocale)
        ) {
          _internalLogger.info(
            `    Skipping ${nsName} for ${targetLocale} (file exists, policy: specific, locale not in overwrite list).`
          );
          shouldTranslate = false;
        } else {
          _internalLogger.info(
            `    Overwriting existing ${nsName} for ${targetLocale} (policy: ${overwritePolicy === 'all' ? 'all' : 'specific & in list'}).`
          );
        }
      }
      // --- End Check overwrite policy ---

      if (!shouldTranslate) {
        continue; // Move to the next targetLocale or nsFile
      }

      _internalLogger.info(`  Translating ${nsName} to ${targetLocale}...`);
      let translatedJsonString: string | null = null;

      if (fileSize > THRESHOLD_FOR_DEEP_CHUNKING_BYTES) {
        _internalLogger.info(
          `    File ${nsFile} (${(fileSize / 1024).toFixed(2)}KB) is large. Performing deep translation.`
        );
        try {
          const translatedObject = await traverseAndTranslateStrings(
            sourceJson,
            fallbackLng,
            targetLocale
          );
          translatedJsonString = JSON.stringify(translatedObject, null, 2);
          _internalLogger.info(
            `    ✅ Successfully deep-translated ${nsFile} for ${targetLocale}.`
          );
        } catch (deepTranslateError) {
          _internalLogger.error(
            `    ❌ Error during deep translation of ${nsFile} for ${targetLocale}:`,
            deepTranslateError
          );
          // translatedJsonString remains null
        }
      } else {
        _internalLogger.info(
          `    File ${nsFile} (${(fileSize / 1024).toFixed(2)}KB) is small. Translating as a whole.`
        );
        translatedJsonString = await translateJsonContentAsWhole(
          sourceContentRaw,
          fallbackLng,
          targetLocale
        );
      }

      if (translatedJsonString) {
        try {
          await fs.writeFile(targetFilePath, translatedJsonString, 'utf-8');
          _internalLogger.info(
            `    💾 Successfully saved translated ${nsFile} to ${targetFilePath}`
          );
        } catch (writeError) {
          _internalLogger.error(
            `    ❌ Failed to write translated JSON for ${targetLocale}/${nsName}. Error:`,
            writeError
          );
          _internalLogger.error(
            `    Problematic (but parsed) Gemini output for ${targetLocale}/${nsName}:\n${translatedJsonString.substring(0, 500)}...`
          );
        }
      } else {
        _internalLogger.warn(
          `    ⚠️ Translation failed or was skipped for ${targetLocale}/${nsName} (due to API error or policy). Check previous errors.`
        );
      }
    }
  }

  _internalLogger.info('\nTranslation process finished.');
  _internalLogger.info(
    'Remember to run your type generation script (e.g., pnpm generate:types) if translations were successful.'
  );
}

main().catch((error) => {
  _internalLogger.error('Unhandled error in translation script:', error);
  process.exit(1);
});
