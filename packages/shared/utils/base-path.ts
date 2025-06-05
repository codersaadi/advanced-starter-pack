import { env } from '@repo/env/app';

export const withBasePath = (path: string) => env.NEXT_PUBLIC_BASE_PATH + path;
