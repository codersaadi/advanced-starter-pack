import { createStore, delMany, getMany, setMany } from 'idb-keyval';
import type { StorageValue } from 'zustand/middleware';

export const createIndexedDB = <State>(dbName = 'indexedDB') => ({
  getItem: async <T extends State>(
    name: string
  ): Promise<StorageValue<T> | undefined> => {
    const [version, state] = await getMany(
      ['version', 'state'],
      createStore(dbName, name)
    );

    if (!state) return undefined;

    return { state, version };
  },
  removeItem: async (name: string) => {
    await delMany(['version', 'state'], createStore(dbName, name));
  },
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  setItem: async (name: string, state: any, version: number | undefined) => {
    const store = createStore(dbName, name);

    await setMany(
      [
        ['version', version],
        ['state', state],
      ],
      store
    );
  },
});
