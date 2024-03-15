export interface IPasswordHasher {
  id: string;
  encode: (plaintext: string) => Promise<string>;
  verify: (plaintext: string, hash: string) => Promise<boolean>;
  needsUpgrade: (hash: string) => Promise<boolean>;
  hardenRuntime: (plaintext: string, hash: string) => Promise<void>;
}

export abstract class BasePasswordHasher implements IPasswordHasher {
  abstract id: string;

  abstract encode(plaintext: string): Promise<string>;

  abstract verify(plaintext: string, hash: string): Promise<boolean>;

  abstract needsUpgrade(hash: string): Promise<boolean>;

  abstract hardenRuntime(plaintext: string, hash: string): Promise<void>;
}
