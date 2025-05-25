'use client';
import { resetPasswordAction } from '@authjs/core/actions/forgot-password';
import { ResetPasswordSchema } from '@authjs/core/schema';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { FormFeedback } from '@repo/ui/components/form-feedback';
import { LoaderButton } from '@repo/ui/components/loader-button';
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
import { useState } from 'react';
export default function ResetPasswordForm({
  token,
  onErrorIgnore,
}: {
  token: string;
  onErrorIgnore: (error: unknown) => boolean;
}) {
  const [isPasswordShow, setPasswordShow] = useState(false);
  const { form, isPending, message, onSubmit } = useFormAction({
    schema: ResetPasswordSchema,
    onSubmitAction: (data) => resetPasswordAction(data, token),
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
    onErrorIgnore,
  });
  return (
    <>
      <h2 className="mb-2 font-bold text-2xl">Reset Your Password</h2>
      <Form {...form}>
        <form action={''} onSubmit={onSubmit}>
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
                      placeholder="********"
                      type={isPasswordShow ? 'text' : 'password'}
                      {...field}
                    />
                    <button
                      type="button"
                      onKeyUp={(e) => e.key === 'Enter' && onSubmit()}
                      className={cn(
                        'absolute top-2 right-2 z-50 cursor-pointer hover:text-sky-500'
                      )}
                      onClick={() => setPasswordShow(!isPasswordShow)}
                    >
                      {isPasswordShow ? (
                        <EyeClosedIcon className="h-5 w-5" />
                      ) : (
                        <EyeOpenIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormFeedback
                  type="error"
                  message={form.formState.errors.password?.message}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'confirmPassword'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={isPending}
                      placeholder="********"
                      type={isPasswordShow ? 'text' : 'password'}
                      {...field}
                    />
                    <button
                      type="button"
                      onKeyUp={(e) => e.key === 'Enter' && onSubmit()}
                      className={cn(
                        'absolute top-2 right-2 z-50 cursor-pointer hover:text-sky-500'
                      )}
                      onClick={() => setPasswordShow(!isPasswordShow)}
                    >
                      {isPasswordShow ? (
                        <EyeOpenIcon className="h-5 w-5" />
                      ) : (
                        <EyeClosedIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormFeedback
                  type="error"
                  message={form.formState.errors.confirmPassword?.message}
                />
              </FormItem>
            )}
          />
          {message && (
            <FormFeedback type={message.type} message={message.message} />
          )}
          <LoaderButton
            isLoading={isPending}
            type="submit"
            className="mt-2 w-full "
          >
            Change Password
          </LoaderButton>
        </form>
      </Form>
    </>
  );
}
