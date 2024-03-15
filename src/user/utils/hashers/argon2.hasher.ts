import argon2 from 'argon2';
import { BasePasswordHasher, IPasswordHasher } from './password.interface';

export class Argon2Hasher
  extends BasePasswordHasher
  implements IPasswordHasher
{
  override id = 'argon2';
  options: argon2.Options;

  constructor(
    private readonly memoryCost: number = 2 ** 12,
    private readonly timeCost: number = 3,
    private readonly parallelism: number = 1,
  ) {
    super();
    this.options = {
      memoryCost: this.memoryCost,
      timeCost: this.timeCost,
      parallelism: this.parallelism,
    };
  }

  override async hash(plaintext: string) {
    return await argon2.hash(plaintext, {
      type: argon2.argon2id,
      // OWASP recommendation: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
      ...this.options,
    });
  }

  override async compare(plaintext: string, hash: string) {
    return await argon2.verify(hash, plaintext);
  }

  override async needsUpgrade(hash: string) {
    return argon2.needsRehash(hash, this.options);
  }
}
