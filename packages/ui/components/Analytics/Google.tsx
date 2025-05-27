import { GoogleAnalytics as GA } from '@next/third-parties/google';
import { analyticsEnv } from '@repo/env/analytics';

const GoogleAnalytics = () => (
  <GA gaId={analyticsEnv.GOOGLE_ANALYTICS_MEASUREMENT_ID} />
);

export default GoogleAnalytics;
