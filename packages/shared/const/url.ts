import urlJoin from 'url-join';

import pkg from '../../../package.json';
import { withBasePath } from '../utils/base-path';

export const UTM_SOURCE = '';

export const OFFICIAL_PREVIEW_URL = '';
export const OFFICIAL_SITE = '';

export const OG_URL = '/og/cover.png?v=1';

export const GITHUB = pkg.homepage;
export const GITHUB_ISSUES = urlJoin(GITHUB, 'issues/new/choose');
// export const CHANGELOG = "";
// export const DOCKER_IMAGE = "https://hub.docker.com/r/";

export const DOCUMENTS = urlJoin(OFFICIAL_SITE, '/docs');
export const USAGE_DOCUMENTS = urlJoin(DOCUMENTS, '/usage');
export const SELF_HOSTING_DOCUMENTS = urlJoin(DOCUMENTS, '/self-hosting');
export const WEBRTC_SYNC_DOCUMENTS = urlJoin(
  SELF_HOSTING_DOCUMENTS,
  '/advanced/webrtc'
);
export const DATABASE_SELF_HOSTING_URL = urlJoin(
  SELF_HOSTING_DOCUMENTS,
  '/server-database'
);

// use this for the link
export const DOCUMENTS_REFER_URL = `${DOCUMENTS}?utm_source=${UTM_SOURCE}`;

export const WIKI = urlJoin(GITHUB, 'wiki');
export const WIKI_PLUGIN_GUIDE = urlJoin(
  USAGE_DOCUMENTS,
  '/plugins/development'
);
export const MANUAL_UPGRADE_URL = urlJoin(
  SELF_HOSTING_DOCUMENTS,
  '/advanced/upstream-sync'
);

export const BLOG = urlJoin(OFFICIAL_SITE, 'blog');

export const ABOUT = OFFICIAL_SITE;
export const FEEDBACK = pkg.bugs.url;
export const DISCORD = '';
export const PRIVACY_URL = urlJoin(OFFICIAL_SITE, '/privacy');
export const TERMS_URL = urlJoin(OFFICIAL_SITE, '/terms');

export const imageUrl = (filename: string) =>
  withBasePath(`/images/${filename}`);

export const EMAIL_SUPPORT = '';
export const EMAIL_BUSINESS = '';

export const X = '';
export const RELEASES_URL = urlJoin(GITHUB, 'releases');

export const mailTo = (email: string) => `mailto:${email}`;

export const BASE_PROVIDER_DOC_URL = '';
export const SITEMAP_BASE_URL =
  process.env.NODE_ENV === 'development' ? '/sitemap.xml/' : 'sitemap';
export const CHANGELOG_URL = urlJoin(OFFICIAL_SITE, 'changelog/versions');
