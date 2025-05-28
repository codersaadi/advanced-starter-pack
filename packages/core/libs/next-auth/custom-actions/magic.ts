"use server";
import { UserModel } from "@repo/core/database/models/user";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

interface MagicLinkRequestData {
  email: string;
}

export async function requestMagicLink(data: MagicLinkRequestData) {
  const { email } = data;

  if (!email) {
    return { success: false, message: "Email is required." };
  }

  // Resolve the NextAuth instance if NextAuthNode is an async function
  try {
    const getServerDB = (await import("@repo/core/database/server"))
      .getServerDB;
    const db = await getServerDB();
    const existingUser = await UserModel.findByEmail(db, email);

    if (!existingUser) {
      console.log(
        `[MagicLinkRequest] User not found: ${email}. Redirecting to signup/error.`
      );
      // Redirect to your sign-in page with an error or a specific prompt
      redirect(
        `/next-auth/signin?error=EmailNotFound&email=${encodeURIComponent(email)}` // More specific error
      );
    }

    console.log(
      `[MagicLinkRequest] User ${email} found. Attempting to send magic link.`
    );

    // This will trigger the email sending flow via your "resend" provider
    // and then attempt to redirect to the verifyRequest page.
    const signin = (await import("../index")).nextAuthNodeSignIn;
    await signin("resend", {
      email,
      redirect: true, // This will throw a NEXT_REDIRECT error if successful
      // callbackUrl: '/', // Optional: Where user lands after clicking link AND successful auth
    });

    // This line should ideally not be reached if signIn successfully throws a redirect error.
    // It's a defensive measure.
    console.warn(
      "[MagicLinkRequest] signIn for 'resend' completed without throwing a redirect error. This is unexpected."
    );
    return {
      success: true,
      message:
        "Magic link process was initiated but did not redirect as expected.",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      // This is the expected behavior for a successful signIn initiation that leads to a redirect.
      // Re-throw to let Next.js handle the redirect.
      console.log(
        "[MagicLinkRequest] Caught NEXT_REDIRECT. Re-throwing to perform redirect."
      );
      throw error;
    }

    // Handle other unexpected errors
    console.error("[MagicLinkRequest] An unexpected error occurred:", error);
    let errorMessage =
      "An unexpected error occurred while requesting the magic link.";
    if (
      error instanceof Error &&
      error.message &&
      !error.message.includes("NEXT_REDIRECT")
    ) {
      // Avoid showing NEXT_REDIRECT as user error
      errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
}
