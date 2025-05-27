import { analyticsEnv } from '@repo/env/analytics';
import { Analytics } from '@vercel/analytics/react';
import { memo } from 'react';

const VercelAnalytics = memo(() => (
  <Analytics debug={analyticsEnv.DEBUG_VERCEL_ANALYTICS} />
));

export default VercelAnalytics;
