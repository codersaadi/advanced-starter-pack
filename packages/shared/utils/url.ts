import urlJoin from 'url-join';
import { OFFICIAL_SITE } from '../const/url';

const isVercelPreview =
  process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production';

const vercelPreviewUrl = `https://${process.env.VERCEL_URL}`;

const siteUrl = isVercelPreview ? vercelPreviewUrl : OFFICIAL_SITE;

export const getCanonicalUrl = (...paths: string[]) =>
  urlJoin(siteUrl, ...paths);
