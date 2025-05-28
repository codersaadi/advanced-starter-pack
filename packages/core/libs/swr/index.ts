import useSWR, { type SWRHook } from "swr";

/**
 * This type of request method is for relatively flexible data and will be triggered when requested.
 *
 * Refresh rules have two types:
 *
 * - When the user refocuses, it will refresh if more than 5 minutes have passed.
 * - It can be combined with refreshXXX methods to refresh data.
 *
 * Suitable for messages, topics, sessions, and other interactive client-side data.
 */
// @ts-ignore
export const useClientDataSWR: SWRHook = (key, fetch, config) =>
  useSWR(key, fetch, {
    // Default is 2000ms, which causes quick user switches to malfunction.
    // We need to set it to 0.
    dedupingInterval: 0,
    focusThrottleInterval: 5 * 60 * 1000,
    refreshWhenOffline: false,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    ...config,
  });

/**
 * This type of request method is a relatively "static" request mode and will only be triggered once.
 * It is suitable for first-time requests, such as `initUserState`.
 */
// @ts-ignore
export const useOnlyFetchOnceSWR: SWRHook = (key, fetch, config) =>
  useSWR(key, fetch, {
    refreshWhenOffline: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    ...config,
  });

/**
 * This type of request method is used for action-triggered requests, which must be triggered using `mutate`.
 * The benefit is that it comes with built-in loading/error states.
 *
 * This makes handling loading/error states simple, and requests with the same SWR key will automatically
 * share the loading state (e.g., a create button and the top-right `+` button).
 *
 * This is especially useful for creation operations.
 */
// @ts-ignore
export const useActionSWR: SWRHook = (key, fetch, config) =>
  useSWR(key, fetch, {
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    ...config,
  });

// biome-ignore lint/suspicious/noExplicitAny: args are any , not known or expected
export interface SWRRefreshParams<T, A = (...args: any[]) => any> {
  action: A;
  optimisticData?: (data: T | undefined) => T;
}

// biome-ignore lint/suspicious/noExplicitAny: args are any , not known or expected
export type SWRefreshMethod<T> = <A extends (...args: any[]) => Promise<any>>(
  params?: SWRRefreshParams<T, A>
) => ReturnType<A>;
