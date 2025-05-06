import { PGliteWorker } from '@electric-sql/pglite/worker';

import type { InitMeta } from './type';

export const initPgliteWorker = async (meta: InitMeta) => {
  const worker = await PGliteWorker.create(
    new Worker(new URL('pglite.worker.ts', import.meta.url)),
    { meta }
  );

  worker.onLeaderChange(() => {});

  return worker as PGliteWorker;
};
