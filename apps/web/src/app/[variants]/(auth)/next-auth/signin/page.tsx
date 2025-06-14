import { DEFAULT_CALLBACK_URL } from '@/components/nextauth/signin/constants';
import EdgeAuth from '@repo/core/libs/next-auth/edge';
import { Card, CardContent, CardHeader } from '@repo/ui/components/ui/card';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import AuthSignInBox from './AuthSignInBox';
// Enhanced loading fallback with better visual design
const SignInLoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
    <div className="w-full max-w-md">
      {/* Header skeleton */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-muted/50">
          <div className="h-8 w-8 rounded-lg bg-muted" />
        </div>
        <Skeleton className="mx-auto mb-2 h-8 w-3/4" />
        <Skeleton className="mx-auto h-4 w-1/2" />
      </div>

      {/* Card skeleton */}
      <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-6 text-center">
          <Skeleton className="mx-auto mb-2 h-6 w-2/3" />
          <Skeleton className="mx-auto h-4 w-4/5" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Provider buttons skeleton */}
          <div className="space-y-3">
            {[...new Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center space-x-4 rounded-lg border p-4"
              >
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Footer skeleton */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-6 pb-6">
          <div className="flex items-center justify-center space-x-2">
            {[...new Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-16 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-3 w-3/4" />
        </div>
      </Card>

      {/* Help text skeleton */}
      <div className="mt-6 text-center">
        <Skeleton className="mx-auto h-4 w-32" />
      </div>
    </div>
  </div>
);

// Main export with enhanced error handling and loading states
export default async function EnhancedSignInWrapper() {
  const isSignedIn = await EdgeAuth.auth();
  if (isSignedIn) {
    return redirect(DEFAULT_CALLBACK_URL);
  }
  return (
    <Suspense fallback={<SignInLoadingFallback />}>
      <AuthSignInBox />
    </Suspense>
  );
}
