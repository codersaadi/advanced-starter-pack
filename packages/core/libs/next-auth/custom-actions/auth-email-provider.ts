import { getEmailEnv } from "@repo/env/email";
import type { EmailConfig, EmailUserConfig } from "next-auth/providers";
// import { hasAdapterOnNode } from "..";
import { sendVerificationRequest } from "./send-request";
const emailEnv = getEmailEnv();
import Resend from "next-auth/providers/resend";
// experimental, needs logic  on adapter , edge and callback
// we have to provide complete layer , with AWS SES ,Nodemailer , rather than just relying on AWS SES.
// issue
// [auth][error] MissingAdapter: Email login requires an adapter. Read more at https://errors.authjs.dev#missingadapter
export const authEmailProvider = async (
  config?: EmailUserConfig
): Promise<EmailConfig> => {
  const apiKey = emailEnv.RESEND_KEY;
  if (!apiKey || !emailEnv.EMAIL_FROM) {
    console.log({ error: "add emailEnv to use authEmailProvider" });

    throw new Error("AUTH EMAIL ENV MISSING");
  }
  return Resend({
    ...config,
    // crypto is node specific , we want edge compatible (by default this is)
    generateVerificationToken: () => crypto.randomUUID(),
    apiKey: apiKey,
    from: emailEnv.EMAIL_FROM,
    sendVerificationRequest: sendVerificationRequest,
  });
};
