"use server";

interface MagicLinkRequestData {
  email: string;
}

export async function requestMagicLink(data: MagicLinkRequestData) {
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log({ emailRecieved: data.email });

  return {
    success: false,
    message: "Method Not Implemented! Implement Securely as per your needs",
  };
}
