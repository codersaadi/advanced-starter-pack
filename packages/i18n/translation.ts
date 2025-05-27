'use server'; // Mark as Server Action or server-only module

import { get } from 'lodash-es'; // Keep for runtime key access
import { isDev } from '../env'; // Adjust path if needed
import {
  type NS, // Use the more specific NS type
  type SupportedLocales,
  fallbackLng,
  normalizeLocalePath,
} from './settings';
import type { InterpolationValues, Paths, ValueAtPath } from './types/common'; // Import helper types
import type { Resources } from './types/generated'; // Import your main Resources type

export const getLocale = async (hl?: string): Promise<SupportedLocales> => {
  if (hl) return normalizeLocalePath(hl) as SupportedLocales;
  return fallbackLng as SupportedLocales; // fallbackLng should also be SupportedLocales
};

// Define a TFunction type that will be returned
// TNamespace is the specific namespace string (e.g., "common", "error")
// TResources is your global Resources type
export type ServerTFunction<
  TNamespace extends NS,
  TResources extends Resources = Resources,
> = <
  // TKey is a valid dot-notation path within the given TNamespace
  TKey extends Paths<TResources[TNamespace]>,
  // TValue is the type of the string at that path
  TValue extends string = ValueAtPath<
    TResources[TNamespace],
    TKey
  > extends string
    ? ValueAtPath<TResources[TNamespace], TKey>
    : string, // Fallback to string if type inference fails
  // TOptions are the interpolation values required by TValue
  TOptions extends InterpolationValues<TValue> = InterpolationValues<TValue>,
>(
  key: TKey,
  // Options are optional if no interpolation is needed for TValue
  options?: TOptions
) => string; // Always returns a string after interpolation

export const translation = async <TNamespace extends NS>(
  ns: TNamespace, // Generic type for the namespace
  hl?: string // Optional language, defaults to fallback
) => {
  let i18ns: TNamespace extends keyof Resources
    ? Resources[TNamespace]
    : object = {} as TNamespace extends keyof Resources
    ? Resources[TNamespace]
    : object; // Type translations based on ns
  const lng = await getLocale(hl);

  try {
    const nsString = ns as string; // For dynamic import paths
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let loadedModule: any;
    if (isDev && lng === fallbackLng) {
      // Path for dev fallback: @/locales/default/common.json
      // Adjust path if your server functions are not in `src` or if `@/` maps differently
      loadedModule = await import(`./default/${nsString}.json`);
    } else {
      // Path for production: @/../locales/en-US/common.json
      // This path `../../../locales/` from `packages/i18n/src/server/`
      // should resolve to `apps/web/public/locales/`
      // Or, if your locales are in packages/i18n/locales directly for server use:
      // loadedModule = await import(`../locales/${normalizeLocalePath(lng)}/${nsString}.json`);
      // Current assumption based on your factory:
      loadedModule = await import(
        `../../../apps/web/public/locales/${normalizeLocalePath(lng)}/${nsString}.json`
      );
    }
    // biome-ignore lint/suspicious/noExplicitAny: Module default export
    i18ns = loadedModule.default || (loadedModule as any);
  } catch (e) {
    console.error(
      `[Server Translation] Error loading translation file for ns='${String(ns)}', lang='${lng}':`,
      e
    );
    // Return a t function that always returns the key on error, or throw
  }

  const tFunction: ServerTFunction<TNamespace> = (key, options) => {
    if (Object.keys(i18ns).length === 0) return String(key); // Return key if translations failed to load

    // `get` from lodash is fine for runtime, TypeScript handles type safety at compile time
    let content: string | undefined = get(i18ns, key as string); // Cast key to string for lodash

    if (content === undefined) {
      // Check for undefined specifically, as empty string is a valid translation
      console.warn(
        `[Server Translation] Key '${String(key)}' not found in namespace '${String(ns)}' for lang '${lng}'.`
      );
      return String(key); // Return the key itself if not found
    }

    if (options && typeof content === 'string') {
      // biome-ignore lint/complexity/noForEach: Simple loop
      Object.entries(options).forEach(([optKey, optValue]) => {
        content = (content as string).replace(
          `{{${optKey}}}`,
          String(optValue)
        );
      });
    }
    return content as string; // Ensure it's a string
  };

  return {
    locale: lng,
    t: tFunction,
  };
};
