'use server';
import fs from 'node:fs/promises';
import path, { resolve } from 'node:path';
import { get } from 'lodash-es';
import {
  type AppNamespaces,
  FALLBACK_LNG,
  type SupportedLocales,
} from '../config/client';
import type { InterpolationValues, Paths, ValueAtPath } from '../types/common';
import type { Resources } from '../types/generated';
import { normalizeLocale } from '../utils';
import { i18nEnvConfig } from '../utils/env';
import { translationCache } from './helpers';

const { IS_DEV } = i18nEnvConfig;

// Solution 1: Use process.cwd() (for Next.js)
const getFilePath = (lng: SupportedLocales, ns: string) => {
  // In Next.js, process.cwd() returns the app root directory
  // Need to go up one level to reach monorepo root
  // THIS APPROACH May have limitations ,
  //  currently it is working when using it from nextjs ,
  // because process.cwd() returns the working directory from where
  // we have initialized things
  const MONOREPO_ROOT = resolve(process.cwd(), '../../');
  const filePath = path.join(
    MONOREPO_ROOT,
    'packages',
    'locales',
    lng,
    `${ns}.json`
  );

  return filePath;
};
// Helper to generate cache key
const getCacheKey = (locale: SupportedLocales, namespace: string): string =>
  `${locale}:${namespace}`;

export const getLocale = async (hl?: string): Promise<SupportedLocales> => {
  return await normalizeLocale(hl || FALLBACK_LNG);
};

export type ServerTFunction<
  TNamespace extends AppNamespaces,
  TResources extends Resources = Resources,
> = <
  TKey extends Paths<TResources[TNamespace]>,
  TValue extends string = ValueAtPath<
    TResources[TNamespace],
    TKey
  > extends string
    ? ValueAtPath<TResources[TNamespace], TKey>
    : string,
  TOptions extends InterpolationValues<TValue> = InterpolationValues<TValue>,
>(
  key: TKey,
  options?: TOptions
) => string;

/**
 * Loads translation data from file system or cache
 */
const loadTranslationData = async (
  locale: SupportedLocales,
  namespace: string
): Promise<Record<string, unknown>> => {
  const cacheKey = getCacheKey(locale, namespace);

  // Return cached version if available (in production)
  if (!IS_DEV && translationCache.has(cacheKey)) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return translationCache.get(cacheKey)!;
  }

  let translationData: Record<string, unknown> = {};

  try {
    if (IS_DEV && locale === FALLBACK_LNG) {
      // Load from TypeScript default files in development
      const module = await import(`../default/${namespace}.ts`);
      translationData = module.default;
    } else {
      // Load from JSON files
      const filePath = getFilePath(locale, namespace);

      // Check if file exists before reading
      await fs.access(filePath, fs.constants.F_OK);

      const fileContent = await fs.readFile(filePath, 'utf-8');
      translationData = JSON.parse(fileContent);
    }

    // Cache the result (only in production to avoid stale data in dev)
    if (!IS_DEV) {
      translationCache.set(cacheKey, translationData);
    }
  } catch (error) {
    const err = error as Error & { code?: string; path?: string };

    // More specific error handling
    if (err.code === 'ENOENT') {
      console.warn(
        `[Server Translation] Translation file not found for namespace '${namespace}', locale '${locale}'. Path: ${err.path || 'unknown'}`
      );
    } else if (err instanceof SyntaxError) {
      console.error(
        `[Server Translation] Invalid JSON in translation file for namespace '${namespace}', locale '${locale}':`,
        err.message
      );
    } else {
      console.error(
        `[Server Translation] Error loading translation file for namespace '${namespace}', locale '${locale}':`,
        err.message
      );
    }

    // Try to load fallback if we're not already using it
    if (locale !== FALLBACK_LNG) {
      console.log(
        `[Server Translation] Attempting to load fallback locale '${FALLBACK_LNG}'`
      );
      return loadTranslationData(FALLBACK_LNG, namespace);
    }
  }

  return translationData;
};

/**
 * Interpolates variables in translation strings
 */
const interpolateString = (
  template: string,
  values: Record<string, unknown>
): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });
};

/**
 * Creates a translation function for server-side use
 */
export const translation = async <TNamespace extends AppNamespaces>(
  namespace: TNamespace,
  hl?: string
) => {
  const locale = await getLocale(hl);
  const translationData = await loadTranslationData(locale, String(namespace));

  const tFunction: ServerTFunction<TNamespace> = (key, options) => {
    // Return key as fallback if no translations loaded
    if (Object.keys(translationData).length === 0) {
      return String(key);
    }

    // Get the translation value using lodash.get for nested keys
    const content = get(translationData, key as string);

    // Handle missing translation
    if (content === undefined || content === null) {
      if (IS_DEV) {
        console.warn(
          `[Server Translation] Missing translation key '${String(key)}' in namespace '${namespace}' for locale '${locale}'`
        );
      }
      return String(key);
    }

    // Handle non-string values
    if (typeof content !== 'string') {
      if (IS_DEV) {
        console.warn(
          `[Server Translation] Translation value for key '${String(key)}' is not a string in namespace '${namespace}' for locale '${locale}'`
        );
      }
      return String(content);
    }

    // Apply interpolation if options provided
    if (options && Object.keys(options).length > 0) {
      return interpolateString(content, options);
    }

    return content;
  };

  return {
    locale,
    t: tFunction,
    // Additional utility methods
    hasTranslation: (key: string) => get(translationData, key) !== undefined,
    getTranslationKeys: () => Object.keys(translationData),
  };
};

/**
 * Utility function to preload translations (useful for SSR)
 */
export const preloadTranslations = async (
  namespaces: AppNamespaces[],
  locale?: string
): Promise<void> => {
  const resolvedLocale = await getLocale(locale);

  await Promise.all(
    namespaces.map((namespace) =>
      loadTranslationData(resolvedLocale, String(namespace))
    )
  );
};
