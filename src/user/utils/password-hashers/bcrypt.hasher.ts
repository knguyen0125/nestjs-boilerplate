import bcrypt from 'bcrypt';
import { BasePasswordHasher, IPasswordHasher } from './password.interface';

export class BcryptHasher
  extends BasePasswordHasher
  implements IPasswordHasher
{
  override id = 'bcrypt';

  constructor(private readonly rounds: number = 10) {
    super();
  }

  override async hash(plaintext: string, rounds: number = this.rounds) {
    return await bcrypt.hash(plaintext, rounds);
  }

  override async compare(plaintext: string, hash: string) {
    return await bcrypt.compare(plaintext, hash);
  }

  override async needsUpgrade(hash: string) {
    return bcrypt.getRounds(hash) < this.rounds;
  }

  override async hardenRuntime(plaintext: string, hash: string) {
    const extraIterations = this.rounds - bcrypt.getRounds(hash);

    if (extraIterations > 0) {
      await this.hash(plaintext, extraIterations);
    }
  }
}
