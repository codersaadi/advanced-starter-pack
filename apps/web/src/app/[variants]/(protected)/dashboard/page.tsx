import { clerkAuth } from '@repo/core/libs/clerk-auth';
import NextAuthEdge from '@repo/core/libs/next-auth/edge';
import { enableClerk } from '@repo/shared/config/auth';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { Shield } from 'lucide-react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { redirect } from 'next/navigation';
import { UserProfile } from './UserProfile';

async function ClerkDashboardPage() {
  try {
    const result = await clerkAuth.getCurrentUser();

    // Extract user info from Clerk result

    return (
      <UserProfile
        user={{
          name:
            `${result?.firstName || ''} ${result?.lastName || ''}`.trim() ||
            null,
          email: result?.emailAddresses?.[0]?.emailAddress || null,
          image: result?.imageUrl || null,
          id: result?.id || '',
        }}
        authProvider="clerk"
      />
    );
  } catch (_error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h2 className="mb-2 font-semibold text-gray-900 text-xl dark:text-gray-100">
                Authentication Error
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Unable to retrieve authentication data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

async function NextAuthDashboardPage() {
  try {
    const session = await NextAuthEdge.auth();
    if (!session?.user || !session.user.id) {
      return redirect('/session-expired');
    }
    return (
      <UserProfile
        user={session.user}
        authProvider="nextauth"
        sessionCreatedAt={
          session.expires ? new Date(session.expires) : undefined
        }
      />
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h2 className="mb-2 font-semibold text-gray-900 text-xl dark:text-gray-100">
                Authentication Error
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Unable to retrieve session data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default function DashboardPage() {
  if (enableClerk) {
    return <ClerkDashboardPage />;
  }
  return <NextAuthDashboardPage />;
}
