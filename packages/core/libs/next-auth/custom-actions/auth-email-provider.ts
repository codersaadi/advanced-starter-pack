import { getEmailEnv } from "@repo/env/email";
import type { EmailConfig, EmailUserConfig } from "next-auth/providers";
import Resend from "next-auth/providers/resend";
import { sendVerificationRequest } from "./send-request";
const emailEnv = getEmailEnv();
export const authEmailProvider = (config?: EmailUserConfig): EmailConfig =>
  Resend({
    ...config,
    apiKey: emailEnv.RESEND_KEY,
    from: emailEnv.EMAIL_FROM,
    sendVerificationRequest: sendVerificationRequest,
  });
