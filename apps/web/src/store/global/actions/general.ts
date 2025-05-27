import { setNamespace } from '@/utils/store-debug';
import { useOnlyFetchOnceSWR } from '@repo/core/libs/swr';
import { switchLang } from '@repo/core/utils/client/switchLang';
import { merge } from '@repo/core/utils/merge';
import type { SupportedLocales } from '@repo/i18n';
import { isEqual } from 'lodash-es';
import type { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';
import type { SystemStatus } from '../initialState';
import type { GlobalStore } from '../store';
const n = setNamespace('g');
export interface GlobalGeneralAction {
  switchLocale: (locale: SupportedLocales) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  updateSystemStatus: (status: Partial<SystemStatus>, action?: any) => void;
  useInitSystemStatus: () => SWRResponse;
}

export const generalActionSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  GlobalGeneralAction
> = (set, get) => ({
  switchLocale: (locale) => {
    get().updateSystemStatus({ language: locale });

    switchLang(locale);
  },
  updateSystemStatus: (status, action) => {
    if (!get().isStatusInit) return;

    const nextStatus = merge(get().status, status);

    if (isEqual(get().status, nextStatus)) return;

    set({ status: nextStatus }, false, action || n('updateSystemStatus'));
    get().statusStorage.saveToLocalStorage(nextStatus);
  },

  useInitSystemStatus: () =>
    useOnlyFetchOnceSWR<SystemStatus>(
      'initSystemStatus',
      () => get().statusStorage.getFromLocalStorage(),
      {
        onSuccess: (status) => {
          set({ isStatusInit: true }, false, 'setStatusInit');

          get().updateSystemStatus(status, 'initSystemStatus');
        },
      }
    ),
});
