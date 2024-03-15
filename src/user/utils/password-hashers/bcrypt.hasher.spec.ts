import { BcryptHasher } from './bcrypt.hasher';

describe('#hash', () => {
  let hasher: BcryptHasher;
  beforeEach(() => {
    hasher = new BcryptHasher();
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
  it('should return true if the hash needs upgrade (# of rounds increases)', async () => {
    const oldHasher = new BcryptHasher(10);
    const newHasher = new BcryptHasher(12);
    const hash = await oldHasher.encode('password');
    expect(await newHasher.needsUpgrade(hash)).toBe(true);
  });

  it('should return false if the hash do not need upgrade (# of rounds decreases)', async () => {
    const oldHasher = new BcryptHasher(12);
    const hasher = new BcryptHasher(10);
    const hash = await oldHasher.encode('password');
    expect(await hasher.needsUpgrade(hash)).toBe(false);
  });
});
