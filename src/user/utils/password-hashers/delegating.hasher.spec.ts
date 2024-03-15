import { DelegatingHasher } from './delegating.hasher';
import { Argon2Hasher } from './argon2.hasher';
import { BcryptHasher } from './bcrypt.hasher';
import { Pbkdf2Hasher } from './pbkdf2.hasher';

describe('#hash', () => {
  let delegatingHasher: DelegatingHasher;
  let argon2Hasher: Argon2Hasher;
  let bcryptHasher: BcryptHasher;
  let pbkd2Sha256Hasher: Pbkdf2Hasher;

  beforeEach(() => {
    argon2Hasher = new Argon2Hasher();
    bcryptHasher = new BcryptHasher();
    pbkd2Sha256Hasher = new Pbkdf2Hasher();
    delegatingHasher = new DelegatingHasher([argon2Hasher, bcryptHasher]);
  });

  it('should hash the plaintext', async () => {
    expect(await delegatingHasher.encode('password')).not.toEqual('password');
  });

  it('should return true if the plaintext matches the hash', async () => {
    const hash = await delegatingHasher.encode('password');
    expect(await delegatingHasher.verify('password', hash)).toBe(true);
  });

  it('should return true if it receives a hash from a different hasher within its list of enabled hashers - argon2', async () => {
    const hash = await argon2Hasher.encode('password');
    expect(
      await delegatingHasher.verify('password', `{${argon2Hasher.id}}${hash}`),
    ).toBe(true);
  });

  it('should return true if it receives a hash from a different hasher within its list of enabled hashers - bcrypt', async () => {
    const hash = await bcryptHasher.encode('password');
    expect(
      await delegatingHasher.verify('password', `{${bcryptHasher.id}}${hash}`),
    ).toBe(true);
  });

  it('should return true if it receives a hash from a different hasher within its list of enabled hashers - pbkdf2-sha256', async () => {
    const hash = await pbkd2Sha256Hasher.encode('password');
    await expect(
      delegatingHasher.verify('password', `{${pbkd2Sha256Hasher.id}}${hash}`),
    ).rejects.toThrow('Unknown hasher');
  });

  it('should return false if the plaintext does not match the hash', async () => {
    const hash = await delegatingHasher.encode('password');
    expect(await delegatingHasher.verify('wrong', hash)).toBe(false);
  });

  it('should throw an error if the hash is from an unknown hasher', async () => {
    await expect(
      delegatingHasher.verify('password', `{unknown}hash`),
    ).rejects.toThrow('Unknown hasher');
  });
});

describe('#needsUpgrade', () => {
  it('should return true if the password is not hashed using the first hasher', async () => {
    const argon2Hasher = new Argon2Hasher();
    const bcryptHasher = new BcryptHasher();

    const oldDelegatingHasher = new DelegatingHasher([bcryptHasher]);
    const newDelegatingHasher = new DelegatingHasher([
      argon2Hasher,
      bcryptHasher,
    ]);

    const oldHash = await oldDelegatingHasher.encode('password');
    await expect(newDelegatingHasher.needsUpgrade(oldHash)).resolves.toBe(true);
  });

  it('should return true if the password is hashed using first hasher and the underlying hasher determines that it needs upgrade', async () => {
    const argon2Hasher = new Argon2Hasher();
    const newArgon2Hasher = new Argon2Hasher(2 ** 16);
    const bcryptHasher = new BcryptHasher();

    const oldDelegatingHasher = new DelegatingHasher([
      argon2Hasher,
      bcryptHasher,
    ]);
    const newDelegatingHasher = new DelegatingHasher([
      newArgon2Hasher,
      bcryptHasher,
    ]);

    const oldHash = await oldDelegatingHasher.encode('password');
    await expect(newDelegatingHasher.needsUpgrade(oldHash)).resolves.toBe(true);
  });

  it('should return false if the password is hashed using first hasher and the underlying hasher determines that it do not needs upgrade', async () => {
    const bcryptHasher = new BcryptHasher(10);
    const newBcryptHasher = new BcryptHasher(5);

    const oldDelegatingHasher = new DelegatingHasher([bcryptHasher]);
    const newDelegatingHasher = new DelegatingHasher([newBcryptHasher]);

    const oldHash = await oldDelegatingHasher.encode('password');
    await expect(newDelegatingHasher.needsUpgrade(oldHash)).resolves.toBe(
      false,
    );
  });
});
