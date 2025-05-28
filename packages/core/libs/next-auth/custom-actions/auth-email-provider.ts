import { generatePrefixedId } from "@repo/core/database/utils/id-generator";
import { getEmailEnv } from "@repo/env/email";
import type { EmailConfig, EmailUserConfig } from "next-auth/providers";
// import { hasAdapterOnNode } from "..";
import { sendVerificationRequest } from "./send-request";
const emailEnv = getEmailEnv();

// experimental, needs logic  on adapter , edge and callback
// issue
// [auth][error] MissingAdapter: Email login requires an adapter. Read more at https://errors.authjs.dev#missingadapter
export const authEmailProvider = async (
  config?: EmailUserConfig
): Promise<EmailConfig> => {
  const Resend = (await import("next-auth/providers/resend")).default;
  return Resend({
    ...config,
    generateVerificationToken: async () => {
      return generatePrefixedId("verify", 16);
    },
    apiKey: emailEnv.RESEND_KEY,
    from: emailEnv.EMAIL_FROM,
    sendVerificationRequest: sendVerificationRequest,
  });
};
