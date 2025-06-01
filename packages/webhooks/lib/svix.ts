import "server-only";
import { webhooksEnv } from "@repo/env/webhooks";
import { Svix } from "svix";
const svixToken = webhooksEnv().SVIX_TOKEN;

export const send = async (
  eventType: string,
  payload: object,
  orgId: string
) => {
  if (!svixToken) {
    throw new Error("SVIX_TOKEN is not set");
  }
  if (!orgId) {
    return;
  }
  const svix = new Svix(svixToken);

  return svix.message.create(orgId, {
    eventType,
    payload: {
      eventType,
      ...payload,
    },
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};

export const getAppPortal = async (orgId: string) => {
  if (!svixToken) {
    throw new Error("SVIX_TOKEN is not set");
  }

  if (!orgId) {
    return;
  }
  const svix = new Svix(svixToken);

  return svix.authentication.appPortalAccess(orgId, {
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};
