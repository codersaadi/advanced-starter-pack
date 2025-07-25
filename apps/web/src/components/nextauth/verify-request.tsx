import { BRANDING_LOGO_URL, BRANDING_NAME } from '@repo/shared/const/branding';
import { ProductLogo } from '@repo/ui/components/Branding/ProductLogo';
import Link from 'next/link';
const VerifyRequest = async ({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}) => {
  const { email } = await searchParams;

  return (
    <div className=" flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex w-full justify-center rounded-md bg-white/80 p-4 text-center">
            <ProductLogo
              className="text-white"
              size={150}
              brandingText={BRANDING_NAME}
              brandingImage={BRANDING_LOGO_URL}
            />
          </div>
          <h2 className="mt-6 text-center font-extrabold text-3xl ">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm ">
            We have sent a sign-in link to your email address.{' '}
            {email && (
              <span className="px-3 font-semibold text-lg text-sky-600">
                {email}
              </span>
            )}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <Link
                href={'/auth/signin'}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyRequest;
