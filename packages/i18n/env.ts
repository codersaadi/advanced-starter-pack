// packages/i18n/src/env.ts

// Augment ProcessEnv for type safety with your specific env vars
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  // biome-ignore lint/style/noNamespace:
  namespace NodeJS {
    interface ProcessEnv {
      /** Controls general i18next debug output (client and server if not overridden) */
      NEXT_PUBLIC_I18N_DEBUG?: "true" | "false";
      /** Controls i18next debug output specifically for the browser */
      NEXT_PUBLIC_I18N_DEBUG_BROWSER?: "true" | "false";
      /** Controls i18next debug output specifically for the server */
      NEXT_PUBLIC_I18N_DEBUG_SERVER?: "true" | "false";
      /** Send missing translation keys to the configured saveMissingHandler (development only) */
      NEXT_PUBLIC_I18N_SAVE_MISSING?: "true" | "false";

      TRANSLATION_AI_API_KEY?: string;
    }
  }
}

const isBrowser = typeof window !== "undefined";

function getBooleanEnv(
  key: keyof NodeJS.ProcessEnv,
  defaultValue = false
): boolean {
  const value = process.env[key];
  if (value === undefined || value === "") return defaultValue;
  return value === "true";
}

export const i18nEnvConfig = {
  /** General i18next debug mode. Overridden by browser/server specific flags if they are set. */
  TRANSLATION_AI_API: process.env.TRANSLATION_AI_API_KEY,
  DEBUG_GENERAL: getBooleanEnv("NEXT_PUBLIC_I18N_DEBUG"),
  /** Browser-specific i18next debug mode. */
  DEBUG_BROWSER: getBooleanEnv("NEXT_PUBLIC_I18N_DEBUG_BROWSER"),
  /** Server-specific i18next debug mode. */
  DEBUG_SERVER: getBooleanEnv("NEXT_PUBLIC_I18N_DEBUG_SERVER"),
  /** Whether to send missing keys to the backend during development */
  SAVE_MISSING_KEYS:
    getBooleanEnv("NEXT_PUBLIC_I18N_SAVE_MISSING") &&
    process.env.NODE_ENV === "development",

  IS_DEV: process.env.NODE_ENV === "development",
  /**
   * Determines if debugging should be active based on environment.
   * Browser/Server specific flags take precedence over the general flag.
   */
  get isDebugActive(): boolean {
    if (isBrowser) {
      return this.DEBUG_BROWSER !== undefined
        ? this.DEBUG_BROWSER
        : this.DEBUG_GENERAL;
    }
    // Server-side
    return this.DEBUG_SERVER !== undefined
      ? this.DEBUG_SERVER
      : this.DEBUG_GENERAL;
  },
};

export const isDev = i18nEnvConfig.IS_DEV;

export const isOnServerSide = typeof window === "undefined";
