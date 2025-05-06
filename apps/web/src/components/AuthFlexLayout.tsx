import type React from 'react';
import AuthLayoutImage from './auth-image';
const AuthFlexLayout = ({
  children,
}: { readonly children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full items-center justify-center ">
      <div className="relative mt-2 flex w-full flex-1 flex-col items-center px-2 py-2 md:mt-0 ">
        <div className="relative mx-auto h-full w-full max-w-md rounded-lg border bg-gray-50 p-4 backdrop-blur-lg lg:border-transparent lg:bg-transparent lg:backdrop-blur-0 dark:bg-gray-800/30 dark:lg:bg-transparent ">
          {children}
        </div>
      </div>
      <AuthLayoutImage />
    </div>
  );
};

export default AuthFlexLayout;
