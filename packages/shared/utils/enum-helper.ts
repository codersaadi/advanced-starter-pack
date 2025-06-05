export function createMapEnum<
  T extends Record<string, string>,
  K extends keyof T = keyof T,
  V extends T[K] = T[K],
>(
  definition: Readonly<T>
): {
  readonly map: Readonly<T>;
  readonly keys: readonly K[];
  readonly values: readonly V[];
  readonly valueSet: ReadonlySet<V>;
  readonly reverseMap: Readonly<Record<V, K>>;
  readonly is: (value: unknown) => value is V;
  readonly fromValue: (value: V) => K | undefined;
} {
  const keys = Object.keys(definition) as K[];
  const values = Object.values(definition) as V[];

  const valueSet = new Set<V>();
  const reverseMap = {} as Record<V, K>;

  for (const key of keys) {
    const value = definition[key] as V;
    if (valueSet.has(value)) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.warn(
        `createEnum: Duplicate value "${value}" for key "${String(key)}".`
      );
    } else {
      valueSet.add(value);
      reverseMap[value] = key;
    }
  }

  return {
    map: definition,
    keys,
    values,
    valueSet,
    reverseMap,
    is: (val: unknown): val is V => valueSet.has(val as V),
    fromValue: (val: V): K | undefined => reverseMap[val],
  };
}
