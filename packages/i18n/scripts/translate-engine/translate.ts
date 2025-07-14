import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { glob } from 'glob';

// Import configurations
import { FALLBACK_LNG, LANGUAGES } from '../../config';
import { PATHS } from '../../config/server-paths';
import { createLogger } from '../_internal/logger';
import { MetricsCollector } from './metrics';
import { AIProviderFactory } from './providers/factory';
import { QualityAssurance } from './quality';
import { RateLimiter } from './rate-limit';
import { TokenLimitChecker } from './token-limiter';
import type {
  AIProvider,
  OverwritePolicy,
  TranslationConfig,
  TranslationRequest,
  TranslationResponse,
} from './types';

function validateTranslationConfig(config: TranslationConfig): void {
  const errors: string[] = [];

  // Provider validation
  const validProviders = ['gemini', 'openai', 'anthropic'];
  if (!validProviders.includes(config.provider.toLowerCase())) {
    errors.push(`Invalid provider: ${config.provider}`);
  }

  // API key validation
  if (!config.apiKey || config.apiKey.length < 10) {
    errors.push('API key appears to be invalid');
  }

  // Batch size validation
  if (config.maxStringsPerBatch < 1 || config.maxStringsPerBatch > 100) {
    errors.push('maxStringsPerBatch must be between 1 and 100');
  }

  // Rate limiting validation
  if (config.apiCallDelayMs < 50 || config.apiCallDelayMs > 10000) {
    errors.push('apiCallDelayMs must be between 50ms and 10s');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}
// Enhanced Translation Strategy Manager
class TranslationStrategyManager {
  private provider: AIProvider;
  private config: TranslationConfig;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private logger: any;
  private rateLimiter: RateLimiter;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  constructor(config: TranslationConfig, logger: any) {
    this.config = config;
    this.logger = logger;
    this.provider = AIProviderFactory.createProvider(config);
    this.rateLimiter = new RateLimiter(config.apiCallDelayMs);
  }

  async translateWithFallback(
    request: TranslationRequest
  ): Promise<TranslationResponse> {
    let lastError = '';

    // Try primary provider with retries
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      if (attempt > 0) {
        await this.delay(this.config.apiCallDelayMs * 2 ** attempt);
      }

      await this.rateLimiter.waitForNext();

      const result = await this.provider.translate(request);

      if (result.success) {
        this.rateLimiter.recordSuccess();
        return result;
      }

      lastError = result.error || 'Unknown error';
      this.rateLimiter.recordFailure();
      this.logger.warn(
        `${this.provider.name} attempt ${attempt + 1} failed: ${lastError}`
      );
    }

    // Try fallback providers
    for (const fallbackProvider of this.config.fallbackProviders) {
      try {
        const fallbackConfig = { ...this.config, provider: fallbackProvider };
        const fallbackAI = AIProviderFactory.createProvider(fallbackConfig);

        this.logger.info(`Trying fallback provider: ${fallbackProvider}`);

        const result = await fallbackAI.translate(request);

        if (result.success) {
          this.logger.info(`Fallback provider ${fallbackProvider} succeeded`);
          return result;
        }
      } catch (error) {
        this.logger.warn(
          `Fallback provider ${fallbackProvider} failed: ${error}`
        );
      }
    }

    return {
      translatedContent: '',
      success: false,
      error: `All providers failed. Last error: ${lastError}`,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Enhanced Translation Engine
class EnhancedTranslationEngine {
  private config: TranslationConfig;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private logger: any;
  private strategyManager: TranslationStrategyManager;
  private metricsCollector: MetricsCollector;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  constructor(config: TranslationConfig, logger: any) {
    this.config = config;
    this.logger = logger;
    this.strategyManager = new TranslationStrategyManager(config, logger);
    this.metricsCollector = new MetricsCollector();
  }

  async translateWholeJson(
    jsonString: string,
    sourceLocale: string,
    targetLocale: string
  ): Promise<string | null> {
    this.logger.debug(`Attempting whole JSON translation to ${targetLocale}`);

    // Check token limits
    if (!TokenLimitChecker.checkTokenLimit(jsonString, this.config.provider)) {
      this.logger.warn(
        `JSON too large for ${this.config.provider}, falling back to batch mode`
      );
      return null;
    }

    const startTime = Date.now();
    const request: TranslationRequest = {
      content: jsonString,
      sourceLocale,
      targetLocale,
      format: 'json',
      context: 'Complete JSON namespace translation',
    };

    const result = await this.strategyManager.translateWithFallback(request);
    const latency = Date.now() - startTime;

    this.metricsCollector.recordTranslation(
      this.config.provider,
      result.success,
      latency,
      result.tokensUsed
    );

    if (result.success) {
      // Quality check
      const quality = QualityAssurance.checkTranslationQuality(
        jsonString,
        result.translatedContent,
        'json'
      );

      if (quality.score < 70) {
        this.logger.warn(
          `Quality check failed (score: ${quality.score}), falling back to batch mode`
        );
        return null;
      }

      this.logger.info(
        `✅ Whole JSON translation successful for ${targetLocale}`
      );
      return result.translatedContent;
    }

    this.logger.warn(
      `⚠️ Whole JSON translation failed for ${targetLocale}: ${result.error}`
    );
    return null;
  }

  async translateStringBatch(
    batch: TranslatableStringItem[],
    sourceLocale: string,
    targetLocale: string
  ): Promise<Map<string, string>> {
    const resultsMap = new Map<string, string>();

    if (batch.length === 0) return resultsMap;

    const promptInput = batch
      .map((item, i) => `${i + 1}. ${item.originalValue}`)
      .join('\n');

    const startTime = Date.now();
    const request: TranslationRequest = {
      content: promptInput,
      sourceLocale,
      targetLocale,
      format: 'array',
      context: `Batch translation of ${batch.length} strings`,
    };

    const result = await this.strategyManager.translateWithFallback(request);
    const latency = Date.now() - startTime;

    this.metricsCollector.recordTranslation(
      this.config.provider,
      result.success,
      latency,
      result.tokensUsed
    );

    if (result.success) {
      try {
        const translatedArray = JSON.parse(
          result.translatedContent
        ) as string[];

        if (
          Array.isArray(translatedArray) &&
          translatedArray.length === batch.length
        ) {
          batch.forEach((item, i) => {
            const translated = translatedArray[i];
            const finalTranslation =
              typeof translated === 'string' && translated.trim()
                ? translated
                : item.originalValue;
            resultsMap.set(item.pathSegments.join('.'), finalTranslation);
          });
        } else {
          throw new Error('Mismatched array length in translation response');
        }
      } catch (error) {
        this.logger.warn(`Error parsing batch translation: ${error}`);
        // Fallback to original values
        // biome-ignore lint/complexity/noForEach: <explanation>
        batch.forEach((item) => {
          resultsMap.set(item.pathSegments.join('.'), item.originalValue);
        });
      }
    }
    return resultsMap;
  }

  async translateToMultipleLanguages(
    namespaceName: string,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    sourceJson: any,
    sourceLocale: string,
    targetLocales: string[]
  ): Promise<Record<string, string | null>> {
    if (!this.config.enableNamespaceMultiLangBatch) {
      return {};
    }

    this.logger.debug(
      `Attempting multi-language translation for namespace "${namespaceName}"`
    );

    const request: TranslationRequest = {
      content: JSON.stringify(sourceJson, null, 2),
      sourceLocale,
      targetLocale: targetLocales.join(', '),
      format: 'json',
      context: `Multi-language translation for namespace "${namespaceName}" to languages: ${targetLocales.join(', ')}`,
    };

    const result = await this.strategyManager.translateWithFallback(request);

    if (result.success) {
      try {
        const parsedResponse = JSON.parse(result.translatedContent);
        const finalResults: Record<string, string | null> = {};

        for (const locale of targetLocales) {
          if (
            parsedResponse[locale] &&
            typeof parsedResponse[locale] === 'object'
          ) {
            finalResults[locale] = JSON.stringify(
              parsedResponse[locale],
              null,
              2
            );
          } else {
            finalResults[locale] = null;
          }
        }

        return finalResults;
      } catch (error) {
        this.logger.warn(`Error parsing multi-language response: ${error}`);
        return {};
      }
    } else {
      this.logger.warn(`Multi-language translation failed: ${result.error}`);
      return {};
    }
  }
}

// Keep existing utility interfaces and functions
interface TranslatableStringItem {
  pathSegments: string[];
  originalValue: string;
}

// Initialize configuration
const logger = createLogger({ name: 'ENHANCED_AI_TRANSLATION' });

function loadConfiguration(): TranslationConfig {
  const envFilePath = PATHS.packageEnv;
  dotenv.config({ path: envFilePath, override: true });

  logger.info(
    `Loading .env from: ${envFilePath}${existsSync(envFilePath) ? ' - Loaded.' : ' - Not found.'}`
  );

  const config: TranslationConfig = {
    provider: process.env.TRANSLATION_AI_PROVIDER || 'gemini',
    apiKey: process.env.TRANSLATION_AI_API_KEY || '',
    modelName:
      process.env.TRANSLATION_AI_MODEL_NAME ||
      getDefaultModel(process.env.TRANSLATION_AI_PROVIDER || 'gemini'),
    temperature: Number.parseFloat(
      process.env.TRANSLATION_AI_TEMPERATURE || '0.3'
    ),
    sourceLangDir: path.join(PATHS.publicLocales, FALLBACK_LNG),
    allLocalesRootDir: PATHS.publicLocales,
    apiCallDelayMs: Math.max(
      50,
      Number.parseInt(process.env.TRANSLATION_API_CALL_DELAY_MS || '500', 10)
    ),
    wholeJsonMaxSizeKB:
      Number.parseInt(
        process.env.TRANSLATION_WHOLE_JSON_MAX_SIZE_KB || '5',
        10
      ) * 1024,
    maxStringsPerBatch: Number.parseInt(
      process.env.TRANSLATION_MAX_STRINGS_PER_BATCH || '20',
      10
    ),
    maxCharsPerStringBatch: Number.parseInt(
      process.env.TRANSLATION_MAX_CHARS_PER_STRING_BATCH || '4000',
      10
    ),
    enableNamespaceMultiLangBatch:
      process.env.ENABLE_NAMESPACE_MULTI_LANG_BATCH === 'true',
    maxTargetLangsPerNamespaceBatch: Number.parseInt(
      process.env.MAX_TARGET_LANGS_PER_NAMESPACE_BATCH || '3',
      10
    ),
    overwritePolicy: parseOverwritePolicy(),
    retryAttempts: Number.parseInt(
      process.env.TRANSLATION_RETRY_ATTEMPTS || '3',
      10
    ),
    fallbackProviders: (process.env.TRANSLATION_FALLBACK_PROVIDERS || '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean),
  };

  if (!config.apiKey) {
    logger.error('FATAL: TRANSLATION_AI_API_KEY is required.');
    process.exit(1);
  }

  return config;
}

function getDefaultModel(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'gemini':
      return 'gemini-1.5-flash-latest';
    case 'openai':
      return 'gpt-4o-mini';
    case 'anthropic':
      return 'claude-3-haiku-20240307';
    default:
      return 'gemini-1.5-flash-latest'; // default model
  }
}

function parseOverwritePolicy(): OverwritePolicy {
  const input = process.env.OVERWRITE_TRANSLATIONS?.toLowerCase() || 'false';
  if (input === 'true' || input === 'all') return { type: 'all' };
  if (input === 'false' || input === 'none') return { type: 'none' };
  const locales = input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return { type: 'specific', locales };
}

// Main execution with enhanced error handling and metrics
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
async function main() {
  const startTime = Date.now();
  logger.info('🚀 Starting Enhanced AI Translation Script');

  const config = loadConfiguration();
  logger.info(
    `Using AI Provider: ${config.provider} with model: ${config.modelName}`
  );

  validateTranslationConfig(config);

  const engine = new EnhancedTranslationEngine(config, logger);

  try {
    await fs.access(config.sourceLangDir);
  } catch {
    logger.error(`FATAL: Source directory not found: ${config.sourceLangDir}`);
    process.exit(1);
  }

  const sourceNamespaceFiles = glob.sync('*.json', {
    cwd: config.sourceLangDir,
    absolute: false,
  });

  if (sourceNamespaceFiles.length === 0) {
    logger.warn('No JSON files found in source directory. Exiting.');
    return;
  }

  const allTargetLocales = LANGUAGES.filter(
    (l) => l.toLowerCase() !== FALLBACK_LNG.toLowerCase()
  );

  if (allTargetLocales.length === 0) {
    logger.warn('No target locales configured. Exiting.');
    return;
  }

  logger.info(
    `Processing ${sourceNamespaceFiles.length} namespaces for ${allTargetLocales.length} target locales`
  );

  let totalTranslations = 0;
  let successfulTranslations = 0;

  // Process each namespace
  for (const nsFile of sourceNamespaceFiles) {
    const nsName = path.basename(nsFile, '.json');
    logger.info(`\n--- Processing Namespace: "${nsName}" ---`);

    const sourceFilePath = path.join(config.sourceLangDir, nsFile);
    let sourceContentRaw: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let sourceJson: any;

    try {
      sourceContentRaw = await fs.readFile(sourceFilePath, 'utf-8');
      sourceJson = JSON.parse(sourceContentRaw);
    } catch (error) {
      logger.error(`Failed to read/parse ${sourceFilePath}:`, error);
      continue;
    }

    const fileSize = Buffer.byteLength(sourceContentRaw, 'utf8');
    logger.info(`Source file size: ${(fileSize / 1024).toFixed(2)}KB`);

    // Process each target locale
    for (const targetLocale of allTargetLocales) {
      totalTranslations++;

      const targetDir = path.join(config.allLocalesRootDir, targetLocale);
      const targetFilePath = path.join(targetDir, nsFile);

      // Check overwrite policy
      const shouldSkip = await shouldSkipTranslation(
        targetFilePath,
        targetLocale,
        config
      );
      if (shouldSkip) {
        logger.info(
          `  SKIPPING ${targetLocale}: File exists and overwrite policy prevents modification`
        );
        continue;
      }

      let translatedContent: string | null = null;

      // Strategy 1: Whole JSON (for small files)
      if (fileSize <= config.wholeJsonMaxSizeKB) {
        translatedContent = await engine.translateWholeJson(
          sourceContentRaw,
          FALLBACK_LNG,
          targetLocale
        );
      }

      // Strategy 2: Batched strings (fallback)
      if (!translatedContent) {
        translatedContent = await translateNamespaceByBatchedStrings(
          sourceJson,
          FALLBACK_LNG,
          targetLocale,
          engine
        );
      }

      // Save the translated file
      if (translatedContent) {
        try {
          await fs.mkdir(targetDir, { recursive: true });
          await fs.writeFile(targetFilePath, translatedContent, 'utf-8');
          logger.info(`  ✅ Saved: ${targetLocale}/${nsFile}`);
          successfulTranslations++;
        } catch (error) {
          logger.error(`  ❌ Failed to save ${targetFilePath}:`, error);
        }
      } else {
        logger.warn(`  ⚠️ All strategies failed for ${targetLocale}/${nsFile}`);
      }
    }
  }

  const duration = Date.now() - startTime;
  logger.info(`\n🏁 Translation completed in ${(duration / 1000).toFixed(2)}s`);
  logger.info(
    `📊 Success rate: ${successfulTranslations}/${totalTranslations} (${((successfulTranslations / totalTranslations) * 100).toFixed(1)}%)`
  );
}

// Helper functions (keep existing logic but integrate with new engine)
async function shouldSkipTranslation(
  targetFilePath: string,
  targetLocale: string,
  config: TranslationConfig
): Promise<boolean> {
  try {
    await fs.access(targetFilePath);
    const policy = config.overwritePolicy;

    if (policy.type === 'none') return true;
    if (policy.type === 'all') return false;
    if (policy.type === 'specific' && policy.locales) {
      return !policy.locales.includes(targetLocale.toLowerCase());
    }
    return false;
  } catch {
    return false; // File doesn't exist, proceed with translation
  }
}

async function translateNamespaceByBatchedStrings(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  sourceJson: any,
  sourceLocale: string,
  targetLocale: string,
  engine: EnhancedTranslationEngine
): Promise<string | null> {
  const collectedStrings: TranslatableStringItem[] = [];

  // Collect translatable strings
  collectStringsRecursive(sourceJson, [], collectedStrings);

  if (collectedStrings.length === 0) {
    return JSON.stringify(sourceJson, null, 2);
  }

  logger.info(
    `  Collected ${collectedStrings.length} strings for batched translation`
  );

  // Process in batches
  const translationResults = new Map<string, string>();
  const batchSize = 20; // You can make this configurable

  for (let i = 0; i < collectedStrings.length; i += batchSize) {
    const batch = collectedStrings.slice(i, i + batchSize);
    const batchResults = await engine.translateStringBatch(
      batch,
      sourceLocale,
      targetLocale
    );

    for (const [path, translation] of batchResults) {
      translationResults.set(path, translation);
    }
  }

  // Apply translations to create final JSON
  const translatedJson = applyTranslations(sourceJson, translationResults);
  return JSON.stringify(translatedJson, null, 2);
}

function collectStringsRecursive(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  node: any,
  currentPath: string[],
  collected: TranslatableStringItem[]
): void {
  if (typeof node === 'string') {
    const trimmed = node.trim();
    if (trimmed && !isPlaceholderOrTag(trimmed)) {
      collected.push({
        pathSegments: [...currentPath],
        originalValue: node,
      });
    }
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      collectStringsRecursive(item, [...currentPath, String(i)], collected);
    });
  } else if (typeof node === 'object' && node !== null) {
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        collectStringsRecursive(node[key], [...currentPath, key], collected);
      }
    }
  }
}

function isPlaceholderOrTag(value: string): boolean {
  return (
    /^\{\{.*\}\}$/.test(value) ||
    /^<[^>/]+(\s*\/)?>$/.test(value) ||
    (/^<[^>]+>.*<\/[^>]+>$/.test(value) && !value.match(/[a-zA-Z]{2,}/))
  );
}

function applyTranslations(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  sourceJson: any,
  translations: Map<string, string>
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): any {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  function applyRecursive(node: any, currentPath: string[] = []): any {
    if (typeof node === 'string') {
      const pathKey = currentPath.join('.');
      return translations.get(pathKey) || node;
    }

    if (Array.isArray(node)) {
      return node.map((item, i) =>
        applyRecursive(item, [...currentPath, String(i)])
      );
    }

    if (typeof node === 'object' && node !== null) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const result: any = {};
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
          result[key] = applyRecursive(node[key], [...currentPath, key]);
        }
      }
      return result;
    }

    return node;
  }

  return applyRecursive(sourceJson);
}

// Script entry point
(async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    logger.error('💥 UNHANDLED CRITICAL ERROR:', error);
    process.exit(1);
  }
})();
