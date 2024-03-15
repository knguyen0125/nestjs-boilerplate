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

  override async hash(plaintext: string) {
    return await bcrypt.hash(plaintext, this.rounds);
  }

  override async compare(plaintext: string, hash: string) {
    return await bcrypt.compare(plaintext, hash);
  }

  override async needsUpgrade(hash: string) {
    return bcrypt.getRounds(hash) < this.rounds;
  }
}
