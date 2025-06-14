import { isServerMode, isUsePgliteDB } from '@repo/shared/const/version';
import { DatabaseLoadingState } from '@repo/shared/types/client-db';
import type { GlobalState } from '../initial-state';
export const systemStatus = (s: GlobalState) => s.status;

const language = (s: GlobalState) => s.status.language || 'auto';

const isPgliteNotEnabled = (s: GlobalState) =>
  isUsePgliteDB && !isServerMode && s.isStatusInit && !s.status.isEnablePglite;

const isPgliteNotInited = (s: GlobalState) =>
  isUsePgliteDB &&
  s.isStatusInit &&
  s.status.isEnablePglite &&
  s.initClientDBStage !== DatabaseLoadingState.Ready;

const isPgliteInited = (s: GlobalState): boolean =>
  (s.isStatusInit &&
    s.status.isEnablePglite &&
    s.initClientDBStage === DatabaseLoadingState.Ready) ||
  false;

const isDBInited = (s: GlobalState): boolean =>
  isUsePgliteDB ? isPgliteInited(s) : true;

export const systemStatusSelectors = {
  isDBInited,
  isPgliteInited,
  isPgliteNotEnabled,
  isPgliteNotInited,
  language,
  systemStatus,
};
