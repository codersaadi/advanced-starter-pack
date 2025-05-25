import { db } from '@repo/api/database/server';
import { trpc } from '../init';

export const serverDatabase = trpc.middleware(async (opts) => {
  return opts.next({
    ctx: { db },
  });
});
