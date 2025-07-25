import type * as schema from './schemas';
type Omit = <T extends object, K extends [...(keyof T)[]]>(
  obj: T,
  ...keys: K
) => {
  [K2 in Exclude<keyof T, K[number]>]: T[K2];
};

export const omit: Omit = (obj, ...keys) => {
  const ret = {} as {
    [K in keyof typeof obj]: (typeof obj)[K];
  };
  let key: keyof typeof obj;
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
};

import crypto from 'node:crypto';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import { getServerDB } from './server';
export async function generateRandomToken(length: number) {
  const buf = await new Promise<Buffer>((resolve, reject) => {
    crypto.randomBytes(Math.ceil(length / 2), (err, buf) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(buf);
      }
    });
  });

  return buf.toString('hex').slice(0, length);
}

export async function createTransaction<T>(
  cb: (
    trx: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >
  ) => Promise<T>
): Promise<T> {
  const db = await getServerDB();
  return db.transaction(async (trx) => {
    return cb(trx); // Return the result of the callback
  });
}
