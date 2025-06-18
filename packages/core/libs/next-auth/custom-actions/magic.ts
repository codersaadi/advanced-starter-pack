"use server";
import { MagicSignInSchema } from "./schema";
interface MagicLinkRequestData {
  email: string;
}

export async function requestMagicLink(data: MagicLinkRequestData) {
  const input = await MagicSignInSchema.parseAsync(data);
  // const provider = await authEmailProvider();
  // await NextAuthNode.signIn(provider.id, { email: input.email });
  console.log({ message: `email recieved successfully ${input.email}` });

  return {
    success: false,
    message: "Method Not Implemented! Implement Securely as per your needs",
  };
}
