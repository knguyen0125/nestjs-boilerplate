import { BasePasswordHasher, IPasswordHasher } from './password.interface';

export class DelegatingHasher
  extends BasePasswordHasher
  implements IPasswordHasher
{
  override id = 'delegating';

  constructor(private readonly enabledHashers: IPasswordHasher[]) {
    super();
  }

  override async encode(plaintext: string) {
    const computed = await this.enabledHashers[0].encode(plaintext);
    return `{${this.enabledHashers[0].id}}${computed}`;
  }

  override async verify(plaintext: string, hash: string) {
    const hasher = this.enabledHashers.find((h) =>
      hash.startsWith(`{${h.id}}`),
    );
    if (!hasher) {
      throw new Error('Unknown hasher');
    }

    return hasher.verify(plaintext, hash.slice(`{${hasher.id}}`.length));
  }

  override async needsUpgrade(hash: string) {
    const hasher = this.enabledHashers.find((h) =>
      hash.startsWith(`{${h.id}}`),
    );

    if (!hasher) {
      throw new Error('Unknown hasher');
    }

    // Needs upgrade if hasher is not the first one
    const isNotFirst = hasher.id !== this.enabledHashers[0].id;
    const needsUpgrade = await hasher.needsUpgrade(
      hash.slice(`{${hasher.id}}`.length),
    );

    return isNotFirst || needsUpgrade;
  }

  override async hardenRuntime(plaintext: string, hash: string) {
    const hasher = this.enabledHashers.find((h) =>
      hash.startsWith(`{${h.id}}`),
    );

    if (!hasher) {
      throw new Error('Unknown hasher');
    }

    return hasher.hardenRuntime(plaintext, hash.slice(`{${hasher.id}}`.length));
  }
}
