'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// biome-ignore lint/nursery/noEnum: can be used here,using enum at server is bad, can use at client
enum AppError {
  Configuration = 'Configuration',
  AccessDenied = 'AccessDenied',
  Verification = 'Verification',
  Default = 'Default',
}

const errorMap = {
  [AppError.Configuration]: (
    <p>
      There was a problem when trying to authenticate. Please contact us if this
      error persists. Unique error code:{' '}
      <code className="rounded bg-yellow-100 p-1 text-xs text-yellow-800">
        Configuration
      </code>
    </p>
  ),
  [AppError.AccessDenied]: (
    <p>
      Access was denied. If you believe this is an error, please contact
      support. Unique error code:{' '}
      <code className="rounded bg-red-100 p-1 text-red-800 text-xs">
        AccessDenied
      </code>
    </p>
  ),
  [AppError.Verification]: (
    <p>
      The verification link has expired or was already used. Please request a
      new one. Unique error code:{' '}
      <code className="rounded bg-blue-100 p-1 text-blue-800 text-xs">
        Verification
      </code>
    </p>
  ),
  [AppError.Default]: (
    <p>
      An unexpected error occurred. Please try again later or contact support.
      Unique error code:{' '}
      <code className="rounded bg-gray-100 p-1 text-gray-800 text-xs">
        Default
      </code>
    </p>
  ),
};

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthError />
    </Suspense>
  );
}

function AuthError() {
  const searchParams = useSearchParams();
  const error = (searchParams.get('error') as AppError) || null;
  if (!error) {
    return null;
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 p-4 dark:bg-transparent">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-4 font-bold text-2xl text-gray-900 dark:text-white">
          Oops! Something went wrong
        </h1>
        <div className="mb-6 text-gray-700 dark:text-gray-400">
          {errorMap[error] || errorMap[AppError.Default]}
        </div>
        <a
          href="/"
          className="inline-block rounded-full bg-blue-600 px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-blue-700"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
}
