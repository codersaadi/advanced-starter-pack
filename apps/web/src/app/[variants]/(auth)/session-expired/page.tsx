import { SessionExpiredClient } from './_client';
interface SessionExpiredPageProps {
  searchParams?: Promise<{
    error?: string;
    session_error?: string;
    hl?: string;
    locale?: string;
  }>;
}

const SessionExpiredPage = async ({
  searchParams: promiseSessionParams,
}: SessionExpiredPageProps) => {
  const searchParams = await promiseSessionParams;
  // Get session error from URL params
  const sessionError = searchParams?.error || searchParams?.session_error;
  return <SessionExpiredClient sessionError={sessionError} />;
};

export default SessionExpiredPage;
