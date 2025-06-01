// packages/env/email.ts or wherever this file is located
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export const getEmailEnv = () => {
  const env = createEnv({
    server: {
      // Common
      EMAIL_PROVIDER: z
        .enum(["resend", "nodemailer", "ses", "custom"])
        .default("resend")
        .describe(
          "The email provider to use: resend, nodemailer (for generic SMTP), ses (AWS), or custom."
        ),
      EMAIL_FROM: z
        .string()
        .email()
        .describe(
          "The 'From' address for outgoing emails. Must be a verified identity in the chosen provider (e.g., a verified domain/email in AWS SES)."
        ),

      // Resend specific
      RESEND_KEY: z
        .string()
        .optional()
        .describe("Required if EMAIL_PROVIDER is 'resend'"),
      RESEND_AUDIENCE_ID: z
        .string()
        .optional()
        .describe("Optional: Resend audience ID for adding contacts."),

      // Nodemailer (SMTP) specific
      SMTP_HOST: z
        .string()
        .optional()
        .describe("Required if EMAIL_PROVIDER is 'nodemailer'"),
      SMTP_PORT: z.coerce
        .number()
        .optional()
        .describe("Required if EMAIL_PROVIDER is 'nodemailer'"),
      SMTP_USER: z
        .string()
        .optional()
        .describe("Required if EMAIL_PROVIDER is 'nodemailer'"),
      SMTP_PASS: z
        .string()
        .optional()
        .describe("Required if EMAIL_PROVIDER is 'nodemailer'"),
      SMTP_SECURE: z.coerce
        .boolean()
        .default(true)
        .optional()
        .describe(
          "Use TLS for SMTP. Defaults to true. Port 465 typically uses true, port 587 typically uses false (with STARTTLS)."
        ),

      // AWS SES specific
      AWS_SES_REGION: z
        .string()
        .optional()
        .describe("Required if EMAIL_PROVIDER is 'ses'. E.g., 'us-east-1'."),
      AWS_SES_ACCESS_KEY_ID: z
        .string()
        .optional()
        .describe(
          "AWS Access Key ID for SES. Required if EMAIL_PROVIDER is 'ses' and not using IAM roles."
        ),
      AWS_SES_SECRET_ACCESS_KEY: z
        .string()
        .optional()
        .describe(
          "AWS Secret Access Key for SES. Required if EMAIL_PROVIDER is 'ses' and not using IAM roles."
        ),
      AWS_SES_CONFIGURATION_SET_NAME: z
        .string()
        .optional()
        .describe(
          "Optional: AWS SES Configuration Set name for advanced tracking and deliverability features."
        ),
      AWS_SES_FROM_ARN: z // <<< ADDED HERE
        .string()
        .optional()
        .describe(
          "Optional: The ARN of the identity that is associated with the sending authorization policy. Used for cross-account sending or specific identity authorization."
        ),
    },
    runtimeEnv: {
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
      EMAIL_FROM: process.env.EMAIL_FROM,

      RESEND_KEY: process.env.RESEND_KEY,
      RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID,

      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_SECURE: process.env.SMTP_SECURE,

      AWS_SES_REGION: process.env.AWS_SES_REGION,
      AWS_SES_ACCESS_KEY_ID: process.env.AWS_SES_ACCESS_KEY_ID,
      AWS_SES_SECRET_ACCESS_KEY: process.env.AWS_SES_SECRET_ACCESS_KEY,
      AWS_SES_CONFIGURATION_SET_NAME:
        process.env.AWS_SES_CONFIGURATION_SET_NAME,
      AWS_SES_FROM_ARN: process.env.AWS_SES_FROM_ARN, // <<< ADDED HERE
    },
    emptyStringAsUndefined: true,
  });

  // --- This custom validation block can be replaced by Zod's .superRefine() ---
  const errors: string[] = [];

  if (env.EMAIL_PROVIDER === "resend" && !env.RESEND_KEY) {
    errors.push("RESEND_KEY is required when EMAIL_PROVIDER is 'resend'.");
  }

  if (env.EMAIL_PROVIDER === "nodemailer") {
    if (!env.SMTP_HOST) errors.push("SMTP_HOST is required for nodemailer.");
    if (!env.SMTP_PORT) errors.push("SMTP_PORT is required for nodemailer.");
    if (!env.SMTP_USER) errors.push("SMTP_USER is required for nodemailer.");
    if (!env.SMTP_PASS) errors.push("SMTP_PASS is required for nodemailer.");
  }

  if (env.EMAIL_PROVIDER === "ses") {
    if (!env.AWS_SES_REGION) {
      errors.push("AWS_SES_REGION is required when EMAIL_PROVIDER is 'ses'.");
    }
    if (
      !env.AWS_SES_ACCESS_KEY_ID &&
      !process.env.AWS_LAMBDA_FUNCTION_NAME &&
      !process.env.ECS_CONTAINER_METADATA_URI &&
      !process.env.EC2_INSTANCE_ID
    ) {
      // Basic check if not in common AWS compute envs
      // This check is imperfect for IAM roles outside these common services, but a general guide.
      // A more robust check would involve attempting to get credentials via the SDK's default provider chain.
      // For simplicity in env validation, explicit keys are often preferred unless a clear IAM role context is established.
      errors.push(
        "AWS_SES_ACCESS_KEY_ID is required for SES if not using assumed IAM roles in a recognized AWS compute environment."
      );
    }
    if (
      !env.AWS_SES_SECRET_ACCESS_KEY &&
      !process.env.AWS_LAMBDA_FUNCTION_NAME &&
      !process.env.ECS_CONTAINER_METADATA_URI &&
      !process.env.EC2_INSTANCE_ID
    ) {
      errors.push(
        "AWS_SES_SECRET_ACCESS_KEY is required for SES if not using assumed IAM roles in a recognized AWS compute environment."
      );
    }
    // AWS_SES_FROM_ARN is optional, so no validation needed here unless it has dependencies.
  }

  if (errors.length > 0) {
    // biome-ignore lint/suspicious/noConsole: Intended for startup error visibility
    console.error(
      `\n❌ Email Environment Validation Failed:\n${errors.map((e) => `  - ${e}`).join("\n")}\n`
    );
    throw new Error(
      "Email environment validation failed. Check console for details."
    );
  }
  // --- End of custom validation block ---

  return env;
};

export const mailEnv = getEmailEnv();
