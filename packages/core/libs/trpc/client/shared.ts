import type { HTTPBatchLinkOptions } from '@trpc/client';
import { transformer } from '../transformer';

export const shared = {
  maxURLLength: 2083,
  transformer: transformer,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
} satisfies Partial<HTTPBatchLinkOptions<any>>;
