// import { db } from "@repo/core/database/server";
import { getServerDB } from '@repo/core/database/server';
import { trpc } from '../init';

export const serverDatabase = trpc.middleware(async (opts) => {
  return opts.next({
    // ctx: { db },
    ctx: { db: await getServerDB() },
  });
});
