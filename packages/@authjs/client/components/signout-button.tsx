'use client';
import { Button } from '@repo/ui/components/ui/button';
import { cn } from '@repo/ui/lib/utils';
import { signOut } from 'next-auth/react';
export default function SignOutButton({ callback }: { callback?: () => void }) {
  return (
    <Button
      variant={'default'}
      size={'sm'}
      className={cn(
        'z-40 w-full rounded-full bg-destructive/15 text-red-500 hover:bg-red-600 hover:bg-opacity-50 hover:text-white'
      )}
      onClick={async () => {
        await signOut();
        if (callback) callback();
      }}
    >
      Sign Out
    </Button>
  );
}
