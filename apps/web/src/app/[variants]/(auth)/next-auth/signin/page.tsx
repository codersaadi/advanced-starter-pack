import { Suspense } from 'react';

import AuthSignInBox from './AuthSignInBox';

export default () => (
  <Suspense fallback={<>Loading...</>}>
    <AuthSignInBox />
  </Suspense>
);
