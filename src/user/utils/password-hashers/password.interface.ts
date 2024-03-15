export interface IPasswordHasher {
  id: string;
  hash: (plaintext: string) => Promise<string>;
  compare: (plaintext: string, hash: string) => Promise<boolean>;
  needsUpgrade?: (hash: string) => Promise<boolean>;
  compareAndUpgrade: (
    plaintext: string,
    hash: string,
  ) => Promise<{
    isValid: boolean;
    needsUpgrade: boolean;
    hash: string;
  }>;
  hardenRuntime: (plaintext: string, hash: string) => Promise<void>;
}

export abstract class BasePasswordHasher implements IPasswordHasher {
  abstract id: string;

  abstract hash(plaintext: string): Promise<string>;

  abstract compare(plaintext: string, hash: string): Promise<boolean>;

  abstract needsUpgrade(hash: string): Promise<boolean>;

  abstract hardenRuntime(plaintext: string, hash: string): Promise<void>;

  async compareAndUpgrade(plaintext: string, hash: string) {
    const isValid = await this.compare(plaintext, hash);
    const needsUpgrade = await this.needsUpgrade(hash);
    const newHash = await this.hash(plaintext);
    return { isValid, needsUpgrade, hash: newHash };
  }
}
