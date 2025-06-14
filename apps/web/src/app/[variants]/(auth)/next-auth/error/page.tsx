import { Suspense } from 'react';

import AuthErrorPage from './auth-error-page';

export default () => (
  <Suspense fallback={<>Loading...</>}>
    <AuthErrorPage />
  </Suspense>
);
