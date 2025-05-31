import { GoogleAnalytics as GA } from '@next/third-parties/google';
import { analyticsEnv } from '@repo/env/analytics';

const GoogleAnalytics = () => (
  <GA gaId={analyticsEnv.GOOGLE_ANALYTICS_MEASUREMENT_ID as string} />
);

export default GoogleAnalytics;
