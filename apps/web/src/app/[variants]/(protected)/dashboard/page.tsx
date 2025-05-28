import SignOutButton, { ClerkSignOutButton } from '@/components/nextauth/signout';
import { enableClerk } from '@repo/core/config/auth';
import { clerkAuth } from '@repo/core/libs/clerk-auth';
import NextAuthEdge from '@repo/core/libs/next-auth/edge';
import { SyntaxHighlighter } from '@repo/ui/components/Highlighter';

async function ClerkDashboardPage() {
  const result = await clerkAuth.getAuth()
  return (
    <>
      <SyntaxHighlighter language="json"  >
        {JSON.stringify(result, null, 2)}
      </SyntaxHighlighter>
      <ClerkSignOutButton />

    </>
  );

}

export default async function DashboardPage() {
  if (enableClerk) {
    return ClerkDashboardPage();
  }
  return NextAuthDashboardPage()
}



async function NextAuthDashboardPage() {
  const session = await NextAuthEdge.auth();
  if (!session)
    return (
      <p className="text-destructive">
        unauthorized! you are not authorize to view this content
      </p>
    );

  const image = session?.user?.image
    ? `${session.user.image.slice(0, 14)}...`
    : null;
  return (
    <div className="mx-auto flex h-screen w-full max-w-sm flex-col items-center justify-center">
      <pre>{JSON.stringify({ ...session.user, image }, null, 2)}</pre>
      <SignOutButton />
    </div>
  );
}
