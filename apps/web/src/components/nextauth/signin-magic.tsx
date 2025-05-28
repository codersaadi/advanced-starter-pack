'use client';
import { useAppLocale } from '@/i18n/components/Locale';
import { AvatarIcon } from '@radix-ui/react-icons';
import { MagicSignInSchema } from '@repo/core/libs/next-auth/custom-actions/schema';
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
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export default function MagicSignInForm({
  onSubmitAction,
}: {
  onSubmitAction: (data: { email: string }) => Promise<{
    success: boolean;
    message: string;
  }>;
}) {
  const { form, message, isPending, onSubmit } = useFormAction({
    onSubmitAction: async (data) => {
      return onSubmitAction(data);
    },
    schema: MagicSignInSchema,
    defaultValues: {
      email: '',
    },
    onErrorIgnore: isRedirectError,
  });

  const localeContext = useAppLocale();
  const isRtl = localeContext.isRtl;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name={'email'}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="font-semibold text-foreground text-sm">
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="group relative">
                    {/* Background glow effect */}
                    <div className="-inset-0.5 absolute rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 blur transition-all duration-500 group-focus-within:opacity-100 group-hover:opacity-100" />

                    {/* Input container */}
                    <div className="relative">
                      <Input
                        disabled={isPending}
                        placeholder="Enter your email address"
                        type="email"
                        {...field}
                        className={cn(
                          'h-14 rounded-xl border border-border/50 bg-background/60 px-5 py-4 text-base backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/10 focus:ring-offset-0 disabled:opacity-60',
                          isRtl ? 'pr-5 pl-14 text-right' : 'pr-14 pl-5'
                        )}
                      />

                      {/* Avatar icon with proper RTL positioning */}
                      <div
                        className={cn(
                          '-translate-y-1/2 absolute top-1/2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-300 group-focus-within:scale-110 group-focus-within:from-primary/20 group-focus-within:to-primary/10',
                          isRtl ? 'left-2' : 'right-2'
                        )}
                      >
                        <AvatarIcon className="h-5 w-5 text-primary/70 transition-colors duration-300 group-focus-within:text-primary" />
                      </div>

                      {/* Loading spinner overlay */}
                      {isPending && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        </div>
                      )}

                      {/* Animated bottom border */}
                      <div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transition-all duration-500 group-focus-within:w-full" />
                    </div>
                  </div>
                </FormControl>

                {/* Error feedback */}
                <FormFeedback
                  type="error"
                  message={form.formState.errors.email?.message}
                />
              </FormItem>
            )}
          />

          {/* Enhanced submit button */}
          <LoaderButton
            className="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/90 font-semibold text-base text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/30 hover:shadow-xl focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98] disabled:hover:scale-100"
            type="submit"
            isLoading={isPending}
          >
            {/* Button shimmer effect */}
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />

            {/* Button content */}
            <div className="relative flex items-center justify-center space-x-2">
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Sign In With Email</span>
            </div>
          </LoaderButton>
        </form>

        {/* Enhanced feedback message */}
        {message && (
          <div className="space-y-3">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <FormFeedback message={message.message} type={message.type} />
            </div>
          </div>
        )}
      </Form>

      {/* Enhanced visual elements */}
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes loading-wave {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        .loading-wave {
          animation: loading-wave 2s ease-in-out infinite;
        }

        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        
        /* Enhanced focus styles */
        .group:focus-within .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(45deg, hsl(var(--primary)), transparent, hsl(var(--primary)));
          z-index: -1;
          animation: pulse-ring 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
