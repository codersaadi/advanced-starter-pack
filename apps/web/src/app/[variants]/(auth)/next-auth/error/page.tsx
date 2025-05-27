import { Suspense } from 'react';

import AuthErrorPage from './AuthErrorPage';

export default () => (
  <Suspense fallback={<>Loading...</>}>
    <AuthErrorPage />
  </Suspense>
);
