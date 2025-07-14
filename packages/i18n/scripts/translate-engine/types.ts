export interface TranslationMetrics {
  totalTranslations: number;
  successfulTranslations: number;
  failedTranslations: number;
  tokensUsed: number;
  estimatedCost: number;
  averageLatency: number;
  providerStats: Map<string, ProviderStats>;
}

export interface ProviderStats {
  successCount: number;
  failureCount: number;
  averageLatency: number;
  tokensUsed: number;
  rateLimitHits: number;
}

export interface TranslationProgress {
  currentNamespace: string;
  completedNamespaces: string[];
  currentLocale: string;
  completedLocales: string[];
  startTime: number;
  estimatedCompletion?: number;
}

export interface QualityCheck {
  hasValidJson: boolean;
  placeholdersPreserved: boolean;
  noUntranslatedContent: boolean;
  structureIntact: boolean;
  score: number;
}

export interface TranslationConfig {
  provider: string;
  apiKey: string;
  modelName: string;
  temperature: number;
  sourceLangDir: string;
  allLocalesRootDir: string;
  apiCallDelayMs: number;
  wholeJsonMaxSizeKB: number;
  maxStringsPerBatch: number;
  maxCharsPerStringBatch: number;
  enableNamespaceMultiLangBatch: boolean;
  maxTargetLangsPerNamespaceBatch: number;
  overwritePolicy: OverwritePolicy;
  retryAttempts: number;
  fallbackProviders: string[];
}

export interface OverwritePolicy {
  type: 'all' | 'none' | 'specific';
  locales?: string[];
}

export interface TranslationRequest {
  content: string;
  sourceLocale: string;
  targetLocale: string;
  context?: string;
  format: 'json' | 'text' | 'array';
}

export interface TranslationResponse {
  translatedContent: string;
  success: boolean;
  error?: string;
  tokensUsed?: number;
}

export interface AIProvider {
  name: string;
  translate(request: TranslationRequest): Promise<TranslationResponse>;
}

export interface TranslatableStringItem {
  pathSegments: string[];
  originalValue: string;
}
