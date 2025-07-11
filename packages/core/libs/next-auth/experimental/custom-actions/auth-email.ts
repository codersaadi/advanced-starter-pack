import { sendEmail } from "@repo/email";
import { AuthEmailTemplate } from "@repo/email/templates/auth-email";
import env from "@repo/env/app";
import { getEmailEnv } from "@repo/env/email";
type SendAuthEmailType = "reset" | "verify" | "confirmation";

const getAuthLinks = (token: string) => {
  return {
    reset: {
      subject: "Resetting Password",
      link: `${env.NEXT_PUBLIC_HOST}/auth/new-password?token=${token}`,
    },
    verify: {
      subject: "Email Verification",
      link: `${env.NEXT_PUBLIC_HOST}/auth/email_verify?token=${token}`,
    },
    confirmation: {
      subject: "Confirming Email Address",
      link: `${env.NEXT_PUBLIC_HOST}/auth/email_confirmation?token=${token}`,
    },
  };
};

export const authEmail = async (
  email: string,
  name: SendAuthEmailType,
  type: {
    case: "token" | "url";
    value: string;
  },
  username?: string
): ReturnType<typeof sendEmail> => {
  const authLinks = getAuthLinks(type.value)[name];
  const response = await sendEmail({
    from: getEmailEnv().EMAIL_FROM || "Acme <onboarding@resend.dev>", // ensure a real fallback
    to: [email],
    subject: authLinks.subject,
    react: AuthEmailTemplate({
      link: type.case === "url" ? type.value : authLinks.link,
      type: name,
      username,
    }),
  });
  return response;
};
