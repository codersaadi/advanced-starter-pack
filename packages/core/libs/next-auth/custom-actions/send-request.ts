import type { EmailConfig } from "next-auth/providers";
import { authEmail } from "./auth-email";

interface Theme {
  brandColor?: string;
  buttonText?: string;
  logoUrl?: string;
  companyName?: string;
}

interface SendVerificationParams {
  identifier: string;
  provider: EmailConfig;
  url: string;
  theme: Theme;
}

export async function sendVerificationRequest(params: SendVerificationParams) {
  const { identifier: to, url } = params;
  return await authEmail(to, "verify", { case: "url", value: url });
}
