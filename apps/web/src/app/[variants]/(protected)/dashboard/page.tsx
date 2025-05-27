import SignOutButton from '@/components/nextauth/signout';
import NextAuthEdge from '@repo/core/libs/next-auth/edge';
export default async function page() {
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
