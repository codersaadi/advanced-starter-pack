import slugify from 'slugify';

/**
 * Generates a URL-friendly slug from a string using the 'slugify' library
 * and appends a short random suffix to reduce collision probability.
 *
 * @param text The string to slugify.
 * @param suffixLength Length of the random alphanumeric suffix to append.
 * @returns The generated slug string (e.g., 'my-topic-title-a8b3f1'), or an empty string if input is empty or slugification fails.
 */
export function generateSlugWithSuffix(
  text: string | null | undefined,
  suffixLength = 6
): string {
  if (!text) {
    return ''; // Return empty for empty input
  }

  const baseSlug = slugify(text, {
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    remove: undefined, // E.g., /[*+~.()'"!:@]/g - remove characters that match regex, defaults to `undefined`
    locale: 'en', // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });

  // If slugify results in an empty string (e.g., input was "---" or symbols only)
  if (!baseSlug) {
    // Generate a purely random slug in this edge case? Or return empty?
    // Returning empty might be safer if the slug field isn't strictly required.
    // If it IS required, the schema validation will catch it later.
    // For now, let's return empty. You might want to throw an error here if needed.
    return '';
  }

  // Generate a short random alphanumeric string (lowercase)
  const randomSuffix = Math.random()
    .toString(36) // Base 36 uses 0-9 and a-z
    .substring(2, 2 + suffixLength); // Get part after "0." and take required length

  return `${baseSlug}-${randomSuffix}`;
}
