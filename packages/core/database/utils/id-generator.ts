import { createMapEnum } from '@repo/core/utils/enum-helper';
import { generate as generateRandomWords } from 'random-words';
import { createNanoId } from '../../utils/uuid'; // Assuming './uuid' exports createNanoId and its type

// --- Prefixed ID Generation ---

/**
 * Defines the standard prefixes for various entity IDs.
 * Using 'as const' provides better type inference than a plain object.
 */
export const ID_PREFIXES_MAP_ENUM = createMapEnum({
  // Core
  org: 'org', // Organization
  user: 'user', // User
  webhook: 'webhook', // Webhook Event
  audit: 'audit', // Audit Log entry
  // Add other prefixes as needed
} as const);

// Type representing valid ID prefixes (keys of the const object)
export type IdPrefix = keyof typeof ID_PREFIXES_MAP_ENUM.map;

// Type representing the actual prefix values
export type IdPrefixValue = (typeof ID_PREFIXES_MAP_ENUM.values)[number];

// Mapped type for generating specific prefixed ID string types
// e.g., PrefixedId<'user'> results in type 'user_${string}'
export type PrefixedId<T extends IdPrefix> =
  `${(typeof ID_PREFIXES_MAP_ENUM.map)[T]}_${string}`;

/**
 * Generates a unique ID with a specified namespace prefix using NanoID.
 * Provides strong type safety for the generated ID format.
 *
 * @param namespace - The key from ID_PREFIXES defining the prefix.
 * @param size - The desired length of the random part of the ID (default: 16).
 * @returns A prefixed unique ID string, typed according to the namespace (e.g., `user_${string}`).
 * @throws Error if the provided namespace is invalid.
 */
export function generatePrefixedId<T extends IdPrefix>(
  namespace: T,
  size = 16 // Increased default size for better collision resistance
): PrefixedId<T> {
  const prefixValue = ID_PREFIXES_MAP_ENUM.map[namespace];

  if (!prefixValue) {
    throw new Error(
      `Invalid ID namespace: ${namespace}. Check ID_PREFIXES definition.`
    );
  }

  // Create a NanoID generator instance *once* per call, if size is dynamic
  // If size were fixed, you could potentially memoize the generator
  const nanoIdGenerator = createNanoId(size);
  const randomPart = nanoIdGenerator();

  return `${prefixValue}_${randomPart}` as PrefixedId<T>; // Assert type based on input namespace
}

// --- Slug Generation ---

/**
 * Generates a random, URL-friendly slug using hyphen-separated words.
 * Uses the 'random-words' library.
 *
 * @param wordCount - The number of random words to include in the slug (default: 2).
 * @returns A hyphen-separated string slug (e.g., "random-slug").
 */
export function generateRandomSlug(wordCount = 2): string {
  if (wordCount <= 0) {
    return '';
  }
  // Use the library's built-in join feature for cleaner code and type safety
  const slug = generateRandomWords({ exactly: wordCount, join: '-' });

  // The library should return a string, but add a fallback just in case.
  return typeof slug === 'string' ? slug : '';
}
