// This is a server-side utility
interface RecaptchaVerificationResponse {
  success: boolean;
  challenge_ts?: string; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname?: string; // the hostname of the site where the reCAPTCHA was solved
  score?: number; // for v3
  action?: string; // for v3
  "error-codes"?: string[];
}

interface VerifyTokenOptions {
  /** The reCAPTCHA token received from the client. */
  token: string;
  /** The reCAPTCHA secret key for your site. */
  secretKey: string;
  /** Optional: The expected action name for reCAPTCHA v3. */
  expectedAction?: string;
  /** Optional: The minimum score threshold for reCAPTCHA v3 (default: 0.5). */
  scoreThreshold?: number;
  /** Optional: The user's IP address. Can improve verification. */
  remoteIp?: string;
}

export async function verifyRecaptchaToken({
  token,
  secretKey,
  expectedAction,
  scoreThreshold = 0.5,
  remoteIp,
}: VerifyTokenOptions): Promise<{
  success: boolean;
  message: string;
  score?: number;
  action?: string;
  errorCodes?: string[];
}> {
  if (!token) {
    return { success: false, message: "reCAPTCHA token is missing." };
  }
  if (!secretKey) {
    return { success: false, message: "Server reCAPTCHA configuration error." };
  }

  const params = new URLSearchParams();
  params.append("secret", secretKey);
  params.append("response", token);
  if (remoteIp) {
    params.append("remoteip", remoteIp);
  }

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?${params.toString()}`;

  try {
    const response = await fetch(verificationUrl, { method: "POST" });
    if (!response.ok) {
      const errorText = await response.text();
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(
        `verifyRecaptchaToken: Google API request failed with status ${response.status}: ${errorText}`
      );
      return {
        success: false,
        message: `reCAPTCHA server communication error: ${response.status}`,
      };
    }
    const data = (await response.json()) as RecaptchaVerificationResponse;

    if (!data.success) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.warn(
        "verifyRecaptchaToken: Verification failed.",
        data["error-codes"]
      );
      return {
        success: false,
        message: "reCAPTCHA verification failed.",
        errorCodes: data["error-codes"],
      };
    }

    // For reCAPTCHA v3, check score and action
    if (data.score !== undefined) {
      // Indicates v3 response
      if (data.score < scoreThreshold) {
        return {
          success: false,
          message: `reCAPTCHA score ${data.score} below threshold ${scoreThreshold}.`,
          score: data.score,
          action: data.action,
        };
      }
      if (expectedAction && data.action !== expectedAction) {
        return {
          success: false,
          message: `reCAPTCHA action mismatch. Expected '${expectedAction}', got '${data.action}'.`,
          score: data.score,
          action: data.action,
        };
      }
    }

    return {
      success: true,
      message: "reCAPTCHA verified successfully.",
      score: data.score,
      action: data.action,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(
      "verifyRecaptchaToken: Error during verification request:",
      error
    );
    return {
      success: false,
      message: "An unexpected error occurred during reCAPTCHA verification.",
    };
  }
}
