import { ClientService } from './client';
import { ServerService } from './server';
const isServiceMode = process.env.NEXT_PUBLIC_SERVICE_MODE === 'server';

const clientService = new ClientService();

export const userService = isServiceMode ? new ServerService() : clientService;

export const userClientService = clientService;
