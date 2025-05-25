import { SignJWT, importJWK } from 'jose';
import { JWT_SECRET_KEY, NON_HTTP_PREFIX } from '../config/auth';

export const createJWT = async <T>(payload: T) => {
  const now = Math.floor(Date.now() / 1000);
  const duration = 100; // 100s

  const encoder = new TextEncoder();

  // fix the issue that crypto.subtle is not available in non-HTTPS environment
  // refs: https://github.com/lobehub/lobe-chat/pull/1238
  if (!crypto.subtle) {
    const buffer = encoder.encode(JSON.stringify(payload));

    return `${NON_HTTP_PREFIX}.${Buffer.from(buffer).toString('base64')}`;
  }

  // create a secret key
  const secretKey = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(JWT_SECRET_KEY)
  );

  // get the JWK from the secret key
  const jwkSecretKey = await importJWK(
    {
      k: Buffer.from(secretKey).toString('base64'),
      kty: 'oct',
    },
    'HS256'
  );

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return new SignJWT(payload as Record<string, any>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + duration)
    .sign(jwkSecretKey);
};
