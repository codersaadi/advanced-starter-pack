export type ErrorType = Error & {
  digest?: string;
};
export const sentryCaptureException = async (error: unknown) => {
  const { captureException } = await import("@sentry/nextjs");
  return captureException(error);
};
