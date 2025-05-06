'use client';
import { emailVerifyAction } from '@authjs/core/actions/email-verify';
import { FormFeedback } from '@repo/ui/components/form-feedback';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function EmailVerifyForm({
  token,
}: {
  token?: string;
}) {
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  }>();
  const onSubmit = useCallback(async () => {
    const res = await emailVerifyAction(token);
    setMessage({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
  }, [token]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    onSubmit();
  }, [token]);

  return (
    <div className="">
      {!message && (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border border-gray-600 border-t-foreground border-r-foreground transition-all duration-800" />
          <p className="mt-2 animate-pulse font-bold font-sans text-emerald-500">
            Processing your email verification request
          </p>
        </>
      )}
      <FormFeedback {...message} />
      {message && message.type === 'success' && (
        <p className="text-gray-400 dark:text-gray-600">
          you may close this page and signin to continue
        </p>
      )}
      <Link href={'/auth/signin'}>
        <Button variant={'link'}>Go Back to Signin</Button>
      </Link>
    </div>
  );
}
