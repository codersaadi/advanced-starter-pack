import { isDesktopApp } from '@repo/core/const/version';
import { ClientService } from './client';
import { ServerService } from './server';

function getClientService(): ClientService {
  if (process.env.NEXT_PUBLIC_CLIENT_DB !== 'pglite') {
    throw new Error(
      'client service not enabled , make sure to add NEXT_PUBLIC_CLIENT_DB as pglite in enviroment'
    );
  }
  return new ClientService();
}

const clientService = getClientService();

export const userService =
  process.env.NEXT_PUBLIC_SERVICE_MODE === 'server' || isDesktopApp
    ? new ServerService()
    : clientService;

export const userClientService = clientService;
