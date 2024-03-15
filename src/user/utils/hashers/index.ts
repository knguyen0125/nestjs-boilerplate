import { Argon2Hasher } from './argon2.hasher';
import { BcryptHasher } from './bcrypt.hasher';
import { Pbkdf2Hasher } from './pbkdf2.hasher';
import { DelegatingHasher } from './delegating.hasher';

export { Argon2Hasher, BcryptHasher, Pbkdf2Hasher, DelegatingHasher };

export const defaultHasher = new DelegatingHasher([
  new Argon2Hasher(),
  new BcryptHasher(),
  new Pbkdf2Hasher(),
]);
