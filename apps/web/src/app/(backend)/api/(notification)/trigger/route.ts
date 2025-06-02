import EdgeConfig from "@repo/core/libs/next-auth/edge";
import { welcomeOnboardingEmail } from "@repo/notification/novu/workflows";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await EdgeConfig.auth();
    const userId = session?.user.id;
    if (!userId) {
      return NextResponse.json(
        {
          message: "user must be logged in to perform this action ",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }
    await welcomeOnboardingEmail.trigger({
      to: userId,
      payload: {},
    });

    return NextResponse.json({
      message: "Notification triggered successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    // biome-ignore lint/suspicious/noConsole:
    console.error("Error triggering notification:", errorMessage);

    return NextResponse.json(
      { message: "Error triggering notification", error: errorMessage },
      { status: 500 }
    );
  }
}
