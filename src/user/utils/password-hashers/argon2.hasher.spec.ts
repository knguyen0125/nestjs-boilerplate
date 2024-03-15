import { Argon2Hasher } from './argon2.hasher';

describe('#hash', () => {
  let hasher: Argon2Hasher;
  beforeEach(() => {
    hasher = new Argon2Hasher();
  });

  it('should hash the plaintext', async () => {
    expect(await hasher.encode('password')).not.toEqual('password');
  });

  it('should return true if the plaintext matches the hash', async () => {
    const hash = await hasher.encode('password');
    expect(await hasher.verify('password', hash)).toBe(true);
  });

  it('should return false if the plaintext does not match the hash', async () => {
    const hash = await hasher.encode('password');
    expect(await hasher.verify('wrong', hash)).toBe(false);
  });
});

describe('#needsUpgrade', () => {
  it('should return true if the hash needs upgrade', async () => {
    const oldHasher = new Argon2Hasher(2 ** 12, 3, 1);
    const newHasher = new Argon2Hasher(2 ** 14, 3, 1);
    const hash = await oldHasher.encode('password');
    expect(await newHasher.needsUpgrade(hash)).toBe(true);
  });

  it('should return true if the hash needs upgrade', async () => {
    // const insecureHasher = new Argon2Hasher(2 ** 12, 3, 1);
    const hasher = new Argon2Hasher(2 ** 14, 3, 1);
    const hash = await hasher.encode('password');
    expect(await hasher.needsUpgrade(hash)).toBe(false);
  });
});
