// Cache for loaded translations to avoid repeated file system operations
export const translationCache = new Map<string, Record<string, unknown>>();

/**
 * Clear translation cache (useful for development/testing)
 */
export const clearTranslationCache = (): void => {
  translationCache.clear();
};

/**
 * Get cache statistics (useful for debugging)
 */
export const getCacheStats = () => ({
  size: translationCache.size,
  keys: Array.from(translationCache.keys()),
});
