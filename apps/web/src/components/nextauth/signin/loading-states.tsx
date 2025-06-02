'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@repo/ui/components/ui/card';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { memo } from 'react';
import { CARD_CONTENT_CLASSNAME } from './constants';

export const AuthButtonListLoading = memo(() => {
  return (
    <div className="space-y-4">
      {[...new Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex h-20 animate-pulse items-center space-x-4 rounded-xl border border-border/30 bg-card/50 p-5 backdrop-blur-sm"
        >
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
});

AuthButtonListLoading.displayName = 'AuthButtonListLoading';

export const SignInPageSkeleton = memo(() => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/5 px-4 py-12 md:py-16">
      <div className="w-full max-w-md">
        {/* Skeleton for Logo and Welcome Header */}
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-6 h-20 w-20 rounded-3xl md:h-24 md:w-24" />
          <Skeleton className="mx-auto mb-3 h-7 w-3/4 rounded-lg md:h-8" />
          <Skeleton className="mx-auto h-4 w-1/2 rounded-md md:h-5" />
        </div>

        <Card className="border border-border/50 bg-card/50 shadow-2xl backdrop-blur-sm">
          <CardHeader className="px-6 pt-6 pb-4 text-center">
            <Skeleton className="mx-auto mb-2 h-6 w-1/2 rounded-lg md:h-7" />
            <Skeleton className="mx-auto h-4 w-3/4 rounded-md md:h-5" />
          </CardHeader>
          <SignInFormSkeleton />
          <CardFooter className="flex flex-col items-center justify-center space-y-4 p-4 pt-4 md:space-y-6 md:p-6 md:pt-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <div className="w-full space-y-1 text-center">
              <Skeleton className="mx-auto h-3 w-3/4 rounded-md" />
              <Skeleton className="mx-auto h-3 w-1/2 rounded-md" />
            </div>
          </CardFooter>
        </Card>

        {/* Skeleton for Page Footer Help Link */}
        <div className="mt-6 text-center">
          <Skeleton className="mx-auto h-4 w-2/3 rounded-md" />
        </div>
      </div>
    </div>
  );
});
SignInPageSkeleton.displayName = 'SignInPageSkeleton';

export const SignInFormSkeleton = memo(() => {
  return (
    <CardContent className={CARD_CONTENT_CLASSNAME}>
      <AuthButtonListLoading />
    </CardContent>
  );
});

SignInFormSkeleton.displayName = 'SignInFormSkeleton';
