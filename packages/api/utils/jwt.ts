import { importJWK, jwtVerify } from 'jose';

import {
  type JWTPayload,
  JWT_SECRET_KEY,
  NON_HTTP_PREFIX,
} from '../config/auth';

export const getJWTPayload = async (token: string): Promise<JWTPayload> => {
  if (token.startsWith(NON_HTTP_PREFIX)) {
    const jwtParts = token.split('.');

    const payload = jwtParts[1];

    return JSON.parse(atob(payload as string));
  }

  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(JWT_SECRET_KEY)
  );

  const jwkSecretKey = await importJWK(
    { k: Buffer.from(secretKey).toString('base64'), kty: 'oct' },
    'HS256'
  );

  const { payload } = await jwtVerify(token, jwkSecretKey);

  return payload as JWTPayload;
};
