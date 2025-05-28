import { isDesktopApp } from "@repo/core/const/version";
import { ClientService } from "./client";
import { ServerService } from "./server";
const isServiceMode =
  process.env.NEXT_PUBLIC_SERVICE_MODE === "server" || isDesktopApp;
function getClientService(): ClientService | null {
  if (isServiceMode) {
    // biome-ignore lint/suspicious/noConsoleLog:
    // biome-ignore lint/suspicious/noConsole:
    console.log(
      "not in server mode as well as  client service is null , server or client at least one should not be null "
    );

    return null;
  }
  if (process.env.NEXT_PUBLIC_CLIENT_DB !== "pglite") {
    throw new Error(
      "client service not enabled , make sure to add NEXT_PUBLIC_CLIENT_DB as pglite in enviroment"
    );
  }
  return new ClientService();
}

const clientService = getClientService();

export const userService = (
  isServiceMode ? new ServerService() : clientService
) as ServerService | ClientService;

export const userClientService = clientService;
