import { subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import type { StateCreator } from "zustand/vanilla";

import { createDevtools } from "../middleware/createDevtools";
import { type GlobalClientDBAction, clientDBSlice } from "./actions/client-db";
import {
  type GlobalGeneralAction,
  generalActionSlice,
} from "./actions/general";

import { type GlobalState, initialState } from "./initial-state";

//  ===============   createStoreFn ============ //

export interface GlobalStore
  extends GlobalState,
    GlobalClientDBAction,
    GlobalGeneralAction {
  /* empty */
}

const createStore: StateCreator<GlobalStore, [["zustand/devtools", never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...clientDBSlice(...parameters),
  ...generalActionSlice(...parameters),
});

//  ===============   useStore ============ //

const devtools = createDevtools("global");

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  subscribeWithSelector(devtools(createStore)),
  shallow
);
