'use client';

import { signInAction } from '@authjs/core/actions/signin';
import { LoginSchema } from '@authjs/core/schema';
import { AvatarIcon, EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { FormFeedback } from '@repo/ui/components/form-feedback';
import { LoaderButton } from '@repo/ui/components/loader-button';
import { Button } from '@repo/ui/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { useFormAction } from '@repo/ui/hooks/use-form';
import { cn } from '@repo/ui/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
export default function SignInForm({
  className,
  onErrorIgnore,
}: {
  className?: string;
  onErrorIgnore: (error: unknown) => boolean;
}) {
  const [isPasswordShow, setPasswordShow] = useState(false);
  const { form, message, isPending, onSubmit } = useFormAction({
    schema: LoginSchema,
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmitAction: signInAction,
    onErrorIgnore,
  });

  return (
    <>
      <h2 className="pb-1 font-semibold text-3xl text-gray-700 tracking-tight dark:text-gray-200 ">
        Sign In to Continue
      </h2>
      <p className="text-gray-700/70 dark:text-gray-400/70">
        Enter you credentials to continue
      </p>
      <Form {...form}>
        <form
          action={''}
          className={cn('flex flex-col gap-3', className)}
          onSubmit={onSubmit}
        >
          <FormField
            control={form.control}
            name={'email'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={isPending}
                      placeholder="Email"
                      type="email"
                      {...field}
                      className=""
                    />
                    <AvatarIcon
                      className={cn('absolute top-2 right-2 h-5 w-5')}
                    />
                  </div>
                </FormControl>
                <FormFeedback
                  type="error"
                  message={form.formState.errors.email?.message}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'password'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={isPending}
                      className=""
                      placeholder="*********"
                      type={isPasswordShow ? 'text' : 'password'}
                      {...field}
                    />
                    <span
                      onKeyUp={(e) => {
                        e.key === 'Enter' && onSubmit(e);
                      }}
                      className={cn(
                        'absolute top-2 right-2 cursor-pointer hover:text-sky-500'
                      )}
                      onClick={() => setPasswordShow(!isPasswordShow)}
                    >
                      {isPasswordShow ? (
                        <EyeOpenIcon className="h-5 w-5" />
                      ) : (
                        <EyeClosedIcon className="h-5 w-5" />
                      )}
                    </span>
                  </div>
                </FormControl>
                <FormFeedback
                  type="error"
                  message={form.formState.errors.password?.message}
                />
              </FormItem>
            )}
          />
          {message && (
            <FormFeedback type={message.type} message={message.message} />
          )}

          <Link
            className=" text-red-600 hover:underline dark:text-red-500"
            href={'/auth/forgot-password'}
          >
            Forgot Password?
          </Link>
          <LoaderButton isLoading={isPending} variant={'default'} type="submit">
            Sign In
          </LoaderButton>
        </form>
        <SignInFooter>
          <Link href="/auth/signin-email">
            <Button className="mx-auto mt-4 w-full text-md" variant={'link'}>
              Sign In with Email
            </Button>
          </Link>
        </SignInFooter>
      </Form>
    </>
  );
}

export const SignInFooter = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <p className="pt-3 text-center">
        <Link href={'/auth/signup'} className="px-2 font-medium text-link">
          Create an account!
        </Link>
        if you don't have one
      </p>
    </>
  );
};
