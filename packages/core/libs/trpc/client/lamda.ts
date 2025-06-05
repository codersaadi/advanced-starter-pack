import type { LambdaRouter } from '@repo/core/server/routers/lambda';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
type ErrorResponse = ErrorItem[];

export interface ErrorItem {
  error: {
    json: {
      code: number;
      data: Data;
      message: string;
    };
  };
}

export interface Data {
  code: string;
  httpStatus: number;
  path: string;
  stack: string;
}

const links = [
  httpBatchLink({
    fetch: async (input, init) => {
      const response = await fetch(input, init);
      if (response.ok) return response;

      const errorRes: ErrorResponse = await response.clone().json();

      const { fetchErrorNotification, loginRequiredNotification } =
        // avoiding circular imports - this is experimental,
        // currently we are using this piece of code in the same app which have been referenced here
        await import(
          '../../../../../apps/web/src/components/Error/fetchNotification'
        );

      // biome-ignore lint/complexity/noForEach: <explanation>
      errorRes.forEach((item) => {
        const errorData = item.error.json;

        const status = errorData.data.httpStatus;

        switch (status) {
          case 401: {
            loginRequiredNotification.redirect();
            break;
          }
          default: {
            fetchErrorNotification.error({
              errorMessage: errorData.message,
              status,
            });
          }
        }
      });

      return response;
    },
    // headers: async () => {
    //   // dynamic import to avoid circular dependency
    //   const { createHeaderWithAuth } = await import('');
    // },
    maxURLLength: 2083,
    transformer: superjson,
    url: '/trpc/lambda',
  }),
];

export const lambdaClient = createTRPCClient<LambdaRouter>({
  links,
});
export const lambdaQuery = createTRPCReact<LambdaRouter>();

export const lambdaQueryClient = lambdaQuery.createClient({ links });
