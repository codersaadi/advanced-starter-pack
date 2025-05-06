import { EmailVerifyForm } from '@authjs/client';
interface EmailVerifyProps {
  searchParams: Promise<{
    token?: string;
  }>;
}
export default async function page({ searchParams }: EmailVerifyProps) {
  const { token } = await searchParams;
  return <EmailVerifyForm token={token} />;
}
