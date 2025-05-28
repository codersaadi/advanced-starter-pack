'use client';
import { enableClerk } from '@repo/core/config/auth';
import { Button } from '@repo/ui/components/ui/button';
import { cn } from '@repo/ui/lib/utils';
export {
  SignOutButton as ClerkSignOutButton
} from "@clerk/nextjs"
import { signOut } from 'next-auth/react';
export default function SignOutButton({ callback }: { callback?: () => void }) {
  return (
    <Button
      className={cn(
        'z-40 w-full rounded-full bg-destructive/15 text-red-500 hover:bg-red-600 hover:bg-opacity-50 hover:text-white'
      )}
      onClick={async () => {
        if (enableClerk) {
          // If using Clerk, sign out via Clerk's method
          return
        }
        await signOut()
        if (callback) callback();
      }}
    >
      Sign Out
    </Button>
  );
}
