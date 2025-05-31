import resources from "../default";
import { i18nEnvConfig, isOnServerSide } from "../utils/env";
// --- Core Language & Namespace Configuration ---
export const FALLBACK_LNG = "en-US" as const;
export const LANGUAGES = [FALLBACK_LNG, "ar"] as const;
export type SupportedLocales = (typeof LANGUAGES)[number];

// Deriving NS from the structure of default resources
type DefaultAppResources = typeof resources;
export type AppNamespaces = keyof DefaultAppResources;
export const DEFAULT_NAMESPACE = "error" as const; // Ensure 'error' is a valid AppNamespace

// --- Cookie & Header Configuration ---
export const COOKIE_NAME = "i18n-org-locale";
export const ORG_LOCALE_HEADER = "ORG_LOCALE";

// --- Debug Mode ---
const { DEBUG_GENERAL, DEBUG_BROWSER, DEBUG_SERVER } = i18nEnvConfig;
export const DEBUG_MODE =
  (DEBUG_GENERAL ?? isOnServerSide) ? DEBUG_SERVER : DEBUG_BROWSER;

// --- Validation ---
if (!(DEFAULT_NAMESPACE in resources)) {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.warn(
    `[I18N_CONFIG_WARN] DEFAULT_NAMESPACE "${String(DEFAULT_NAMESPACE)}" does not exist in default resources. Available namespaces: ${Object.keys(resources).join(", ")}. Please check your default translations and settings.config.ts.`
  );
}

export type LocaleOption = {
  label: string;
  translatedLabel?: string;
  value: SupportedLocales;
  dir: "ltr" | "rtl";
};

export const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { label: "English", value: "en-US", dir: "ltr" },
  { label: "العربية", value: "ar", dir: "rtl" },
] as const;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
// biome-ignore lint/complexity/noForEach: <explanation>
LANGUAGES.forEach((lang: any) => {
  if (!LOCALE_OPTIONS.find((opt) => opt.value === lang)) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.warn(
      `[LOCALE_CONFIG_WARN] Language "${lang}" is defined in LANGUAGES but missing from LOCALE_OPTIONS. Direction information might be incomplete.`
    );
  }
});
