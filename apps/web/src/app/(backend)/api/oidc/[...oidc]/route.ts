import { URL } from 'node:url';
import debug from 'debug';
import { type NextRequest, NextResponse } from 'next/server';

import { getServerDB } from '@repo/core/database/server';
import {
  createNodeRequest,
  createNodeResponse,
} from '@repo/core/libs/oidc-provider/http-adapter';
import { getOIDCProvider } from '@repo/core/server/services/oidc/oidcProvider';
import { oidcEnv } from '@repo/env/oidc';

const log = debug('org-oidc:route'); // Create a debug instance with a namespace

const handler = async (req: NextRequest) => {
  const requestUrl = new URL(req.url);
  log(
    `Received ${req.method.toUpperCase()} request: %s %s`,
    req.method,
    req.url
  );
  log('Path: %s, Pathname: %s', requestUrl.pathname, requestUrl.pathname);

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  // biome-ignore lint/suspicious/noEvolvingTypes: <explanation>
  let responseCollector;

  try {
    if (!oidcEnv.ENABLE_OIDC) {
      log('OIDC is not enabled');
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }
    const serverDB = await getServerDB();

    const provider = await getOIDCProvider(serverDB);

    log(`Calling provider.callback() for ${req.method}`); // Log the method
    await new Promise<void>((resolve, reject) => {
      // <-- Make promise callback async
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let middleware: any;
      try {
        log('Attempting to get middleware from provider.callback()');
        middleware = provider.callback();
        log('Successfully obtained middleware function.');
      } catch (syncError) {
        log('SYNC ERROR during provider.callback() call itself: %O', syncError);
        reject(syncError);
        return;
      }

      responseCollector = createNodeResponse(resolve);
      const nodeResponse = responseCollector.nodeResponse;

      createNodeRequest(req).then((nodeRequest) => {
        log('Calling the obtained middleware...');
        middleware(nodeRequest, nodeResponse, (error?: Error) => {
          log('Middleware callback function HAS BEEN EXECUTED.');
          if (error) {
            log('Middleware error reported via callback: %O', error);
            reject(error);
          } else {
            log(
              'Middleware completed successfully via callback (may be redundant if .end() was called).'
            );
            resolve();
          }
        });
        log(
          'Middleware call initiated, waiting for its callback OR nodeResponse.end()...'
        );
      });
    });

    log('Promise surrounding middleware call resolved.');

    if (!responseCollector) {
      throw new Error('ResponseCollector was not initialized.');
    }

    const {
      responseStatus: finalStatus,
      responseBody: finalBody,
      responseHeaders: finalHeaders,
    } = responseCollector;

    log('Final Response Status: %d', finalStatus);
    log('Final Response Headers: %O', finalHeaders);

    return new NextResponse(finalBody, {
      // eslint-disable-next-line no-undef
      headers: finalHeaders as HeadersInit,
      status: finalStatus,
    });
  } catch (error) {
    log(`Error handling OIDC ${req.method} request: %O`, error); // Log method in error
    return new NextResponse(
      `Internal Server Error: ${(error as Error).message}`,
      { status: 500 }
    );
  }
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
