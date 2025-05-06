import { SignOutButton } from '@authjs/client';
import { auth } from '@authjs/core';

export default async function page() {
  const session = await auth();
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
