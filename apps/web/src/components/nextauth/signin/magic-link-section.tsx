'use client';

import MagicSignInForm from '@/components/nextauth/signin-magic'; // Ensure path
import { requestMagicLink } from '@repo/core/libs/next-auth/experimental/custom-actions/magic'; // Ensure path
import { memo } from 'react';

export const MagicLinkSection = memo(() => {
  return (
    <MagicSignInForm
      onSubmitAction={(data) => {
        return requestMagicLink(data);
      }}
    />
  );
});
MagicLinkSection.displayName = 'MagicLinkSection';
