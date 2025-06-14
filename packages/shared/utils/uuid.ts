// generate('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 16); //=> "4f90d13a42"
// NOTE : this version is not cryptographically secure. It's optimized for speed, not for unpredictability.
// You should not use nanoid/non-secure for anything security-related, such as:
// Verification tokens
// Password reset links
// Session IDs
// API keys
import { customAlphabet } from 'nanoid/non-secure';

export const createNanoId = (size = 8) =>
  customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    size
  );

export const nanoid = createNanoId();

export { v4 as uuid } from 'uuid';
