import { env } from '@repo/env';

export const withBasePath = (path: string) => env.NEXT_PUBLIC_BASE_PATH + path;
