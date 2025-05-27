import * as z from 'zod';
const EmailAddressError = 'Please enter a valid email address';
const emailSchema = z.string().email({
  message: EmailAddressError,
});

export const MagicSignInSchema = z.object({
  email: emailSchema,
});
export type MagicSignInType = z.infer<typeof MagicSignInSchema>;
