import { Pbkdf2Hasher } from './pbkdf2.hasher';

describe('#hash', () => {
  let hasher: Pbkdf2Hasher;
  beforeEach(() => {
    hasher = new Pbkdf2Hasher();
  });
  it('should hash the plaintext', async () => {
    expect(await hasher.hash('password')).not.toEqual('password');
  });

  it('should return true if the plaintext matches the hash', async () => {
    const hash = await hasher.hash('password');
    expect(await hasher.compare('password', hash)).toBe(true);
  });

  it('should return false if the plaintext does not match the hash', async () => {
    const hash = await hasher.hash('password');
    expect(await hasher.compare('wrong', hash)).toBe(false);
  });
});

describe('#needsUpgrade', () => {
  it('should return true if the hash needs upgrade (# of iterations increase)', async () => {
    const oldHasher = new Pbkdf2Hasher('sha256', 600_000);
    const newHasher = new Pbkdf2Hasher('sha256', 1_000_000);
    const hash = await oldHasher.hash('password');
    expect(await newHasher.needsUpgrade(hash)).toBe(true);
  });

  it('should return false if the hash do not needs upgrade (# of iterations of new hasher is less than old hasher)', async () => {
    const oldHasher = new Pbkdf2Hasher('sha256', 1_000_000);
    const newHasher = new Pbkdf2Hasher('sha256', 600_000);
    const hash = await oldHasher.hash('password');
    expect(await newHasher.needsUpgrade(hash)).toBe(false);
  });
});
