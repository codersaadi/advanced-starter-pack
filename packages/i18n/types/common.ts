// Helper type to generate dot-notation paths from a nested object
// This is a common utility type for i18n key typing.
export type Paths<
  T,
  Prev extends string | number | symbol = never,
> = T extends object
  ?
      | {
          [K in keyof T]-?: K extends string | number
            ? [Prev] extends [never] // Is this the first level?
              ? Paths<T[K], K> // No prefix
              : Paths<T[K], `${Prev & string}.${K & string}`> // Prefix with parent path
            : never;
        }[keyof T]
      | Prev // Include the current level prefix itself if it's a valid key
  : Prev; // Leaf node

// Helper type to get the value type at a given path
export type ValueAtPath<
  T,
  P extends string,
> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? ValueAtPath<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

// Type for i18next-compatible interpolation values for a given string
// Extracts {{varName}} placeholders
export type InterpolationKeys<S extends string> =
  S extends `${string}{{${infer Var}}}${infer Rest}`
    ? Var | InterpolationKeys<Rest>
    : never;

export type InterpolationValues<S extends string> = string extends S // If S is just 'string', allow any record (less type safe but common fallback)
  ? Record<string, string | number>
  : InterpolationKeys<S> extends never // No interpolation needed
    ? undefined // Or Record<string, never> if options should always be an object
    : { [K in InterpolationKeys<S>]: string | number }; // Options must contain all interpolation keys
