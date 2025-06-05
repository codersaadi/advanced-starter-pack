import { isRtlLang as checkIsRtlExternal } from 'rtl-detect';
import { LOCALE_OPTIONS } from '../config/client'; // Updated import
import { normalizeLocale } from './parse-locale'; // Import from sibling util

const RTL_LANG_CODES_FROM_OPTIONS = LOCALE_OPTIONS.filter(
  (opt) => opt.dir === 'rtl'
).map((opt) => opt.value.split('-')[0]); // Use base lang for broader matching

export function isRtl(lang?: string): boolean {
  if (!lang) return false;
  const normalized = normalizeLocale(lang);
  const baseLang = normalized.split('-')[0]?.toLowerCase();

  const option = LOCALE_OPTIONS.find(
    (opt) => opt.value === normalized || opt.value.startsWith(`${baseLang}-`)
  );
  if (option) return option.dir === 'rtl';

  return (
    checkIsRtlExternal(baseLang as string) ||
    RTL_LANG_CODES_FROM_OPTIONS.includes(baseLang)
  );
}

export function updateDocumentDirection(lang?: string): void {
  if (typeof window === 'undefined' || !lang) return;
  const direction = isRtl(lang) ? 'rtl' : 'ltr';
  document.documentElement.dir = direction;
}
