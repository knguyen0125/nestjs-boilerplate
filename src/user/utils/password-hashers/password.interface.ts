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

export class BasePasswordHasher implements IPasswordHasher {
  id = 'base';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async hash(plaintext: string): Promise<string> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async compare(plaintext: string, hash: string): Promise<boolean> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async needsUpgrade(hash: string): Promise<boolean> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async hardenRuntime(plaintext: string, hash: string) {
    // Do nothing by default
  }

  async compareAndUpgrade(plaintext: string, hash: string) {
    const isValid = await this.compare(plaintext, hash);
    const needsUpgrade = await this.needsUpgrade(hash);
    const newHash = await this.hash(plaintext);
    return { isValid, needsUpgrade, hash: newHash };
  }
}
