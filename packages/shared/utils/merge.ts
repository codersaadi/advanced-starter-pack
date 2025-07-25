import { type merge as _merge, isEmpty, mergeWith } from 'lodash-es';

/**
 * @param target
 * @param source
 */
export const merge: typeof _merge = <T = object>(target: T, source: T) =>
  mergeWith({}, target, source, (obj, src) => {
    if (Array.isArray(obj)) return src;
  });

type MergeableItem = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
  id: string;
};

/**
 * Merge two arrays based on id, preserving metadata from default items
 * @param defaultItems Items with default configuration and metadata
 * @param userItems User-defined items with higher priority
 */
export const mergeArrayById = <T extends MergeableItem>(
  defaultItems: T[],
  userItems: T[]
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
): T[] => {
  // Create a map of default items for faster lookup
  const defaultItemsMap = new Map(defaultItems.map((item) => [item.id, item]));

  // 使用 Map 存储合并结果，这样重复 ID 的后项会自然覆盖前项
  const mergedItemsMap = new Map<string, T>();

  // Process user items with default metadata
  for (const userItem of userItems) {
    const defaultItem = defaultItemsMap.get(userItem.id);
    if (!defaultItem) {
      mergedItemsMap.set(userItem.id, userItem);
      continue;
    }

    const mergedItem: T = { ...defaultItem };
    for (const [key, value] of Object.entries(userItem)) {
      if (
        value !== null &&
        value !== undefined &&
        !(typeof value === 'object' && isEmpty(value))
      ) {
        // @ts-expect-error
        mergedItem[key] = value;
      }

      if (typeof value === 'object' && !isEmpty(value)) {
        // @ts-expect-error
        mergedItem[key] = merge(defaultItem[key], value);
      }
    }

    mergedItemsMap.set(userItem.id, mergedItem);
  }

  for (const item of defaultItems) {
    if (!mergedItemsMap.has(item.id)) {
      mergedItemsMap.set(item.id, item);
    }
  }

  return Array.from(mergedItemsMap.values());
};
