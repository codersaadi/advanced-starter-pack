"use server";
import { UserModel } from "@repo/core/database/models/user";
import { getServerDB } from "@repo/core/database/server";
import NextAuthNode from "@repo/core/libs/next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { authEmailProvider } from "./auth-email-provider";

interface MagicLinkRequestData {
  email: string;
}

export async function requestMagicLink(data: MagicLinkRequestData) {
  const { email } = data;

  if (!email) {
    return { success: false, message: "Email is required." };
  }

  try {
    const db = await getServerDB();
    const existingUser = await UserModel.findByEmail(db, email);

    if (!existingUser) {
      console.log(
        `[MagicLinkRequest] User not found: ${email}. Redirecting to signup.`
      );
      redirect(
        `/next-auth/signin?error=USER_NOT_FOUND_REQUEST&email=${encodeURIComponent(email)}`
      );
    }

    // User exists, proceed to send the magic link via NextAuth's signIn.
    console.log(
      `[MagicLinkRequest] User found: ${email}. Initiating magic link.`
    );
    await NextAuthNode.signIn(authEmailProvider().id, {
      email,
      redirect: true,
    });

    // `signIn` with `redirect: true` will throw a RedirectError if successful,
    // leading to the "verify request" page (e.g., /auth/check-email).
    // This part of the code (returning a success message) should not be reached
    // if the signIn call successfully initiates the redirect.
    // It's a fallback for an unexpected scenario where signIn doesn't redirect.
    return { success: true, message: "Magic link process initiated." };
  } catch (error) {
    if (isRedirectError(error)) {
      // This is the expected path if signIn successfully starts the email flow.
      // Re-throw the error so Next.js handles the actual redirection.
      throw error;
    }

    // Handle other errors (e.g., database connection, unexpected signIn issues)
    console.error("[MagicLinkRequest] Error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}
