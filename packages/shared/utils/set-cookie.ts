import dayjs from 'dayjs';

import { COOKIE_CACHE_DAYS } from '@repo/shared/const/settings';

export const setCookie = (
  key: string,
  value: string | undefined,
  expireDays = COOKIE_CACHE_DAYS
) => {
  if (typeof value === 'undefined') {
    // Set the expiration time to yesterday (expire immediately)
    const expiredDate = new Date(0).toUTCString(); // 1970-01-01T00:00:00Z

    // eslint-disable-next-line unicorn/no-document-cookie
    // biome-ignore lint/nursery/noDocumentCookie: <explanation>
    document.cookie = `${key}=; expires=${expiredDate}; path=/;`;
  } else {
    const expires = dayjs().add(expireDays, 'day').toDate().toUTCString();

    // eslint-disable-next-line unicorn/no-document-cookie
    // biome-ignore lint/nursery/noDocumentCookie: <explanation>
    document.cookie = `${key}=${value};expires=${expires};path=/;`;
  }
};
