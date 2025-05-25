// @repo/i18n/rtl.ts
import { isRtlLang as checkIsRtl } from 'rtl-detect'; // Install: pnpm add rtl-detect

const rtlLanguages = ['ar', 'he', 'fa', 'ur']; // Add more as needed

/**
 * Checks if a given language code is an RTL language.
 * Uses rtl-detect and a supplementary list for broader coverage.
 * @param lang The language code (e.g., 'en', 'ar-SA')
 * @returns True if the language is RTL, false otherwise.
 */
export function isRtl(lang?: string): boolean {
  if (!lang) return false;
  const baseLang = lang.split('-')[0]?.toLowerCase(); // Get base language e.g. 'en' from 'en-US'
  return (
    checkIsRtl(baseLang as string) || rtlLanguages.includes(baseLang as string)
  );
}

/**
 * Updates the HTML document's `dir` attribute based on the language.
 * Should only be called on the client-side.
 * @param lang The current language code.
 */
export function updateDocumentDirection(lang?: string): void {
  if (typeof window === 'undefined' || !lang) return;

  const direction = isRtl(lang) ? 'rtl' : 'ltr';
  document.documentElement.dir = direction;
  // Optional: Add/remove body classes for CSS styling if preferred
  // document.body.classList.remove('ltr', 'rtl');
  // document.body.classList.add(direction);
}
