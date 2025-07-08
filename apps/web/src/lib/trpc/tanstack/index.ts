import type { LambdaRouter } from "@repo/core/server/routers/lambda";
import { createTRPCContext } from "@trpc/tanstack-react-query";

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

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<LambdaRouter>();
