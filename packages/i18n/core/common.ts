import type { InitOptions } from 'i18next';
import {
  type AppNamespaces,
  DEBUG_MODE,
  DEFAULT_NAMESPACE,
  FALLBACK_LNG,
  LANGUAGES,
} from '../config/client';

export function getBaseInitOptions(
  lng: string = FALLBACK_LNG,
  ns: AppNamespaces | readonly AppNamespaces[] = DEFAULT_NAMESPACE
): InitOptions {
  return {
    debug: DEBUG_MODE,
    supportedLngs: [...LANGUAGES],
    fallbackLng: FALLBACK_LNG,
    lng,
    ns: Array.isArray(ns) ? [...ns] : [ns],
    defaultNS: DEFAULT_NAMESPACE,
    fallbackNS: DEFAULT_NAMESPACE,
    interpolation: {
      escapeValue: false, // React already escapes
    },
  };
}
