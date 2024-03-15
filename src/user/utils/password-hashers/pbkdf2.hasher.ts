import crypto from 'node:crypto';
import { promisify } from 'util';
import { BasePasswordHasher, IPasswordHasher } from './password.interface';

const asyncPbkdf2 = promisify(crypto.pbkdf2);

export class Pbkdf2Hasher
  extends BasePasswordHasher
  implements IPasswordHasher
{
  override id: string;

  constructor(
    /**
     * PBKDF2 Algorithm.
     *
     * Available choices includes:
     *
     * * sha1 - not recommended because of insecurity
     * * sha256 (default)
     * * sha512
     *
     * @default sha256
     */
    readonly algorithm: string = 'sha256',
    /**
     * Number of iterations.
     *
     * OWASP recommends
     * * 1_300_000 for SHA1
     * * 600_000 for SHA256
     * * 210_000 for SHA512
     *
     * @default 600000
     */
    readonly iterations: number = 600_000,
    /**
     * Derived Key Length in bytes.
     *
     * Should be no more than maximum output of algorithm:
     *
     * * 20 for SHA1
     * * 32 for SHA256
     * * 64 for SHA512
     *
     * @default 32
     */
    readonly keyLength: number = 32,
    /**
     * Salt length in byte
     */
    readonly saltLength: number = 16,
  ) {
    super();
    this.id = `pbkdf2-${algorithm}`;
  }

  private formatHash(salt: string, derivedKey: Buffer) {
    return `$pbkdf2-${this.algorithm}$i=${this.iterations},l=${this.keyLength}$${salt}$${derivedKey.toString(
      'hex',
    )}`;
  }

  private parseHash(hash: string) {
    // $pbkdf2-sha256$i=600000$l=64$<salt>$<derivedKey>

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, algorithm, options, salt, originalHash] = hash.split('$');

    return {
      algorithm: algorithm.split('-')[1],
      iterations: parseInt(
        options
          .split(',')
          .find((o) => o.startsWith('i='))
          ?.split('=')[1],
      ),
      keyLength: parseInt(
        options
          .split(',')
          .find((o) => o.startsWith('l='))
          ?.split('=')[1],
      ),
      salt,
      originalHash,
    };
  }

  override async encode(
    plaintext: string,
    salt: string = crypto.randomBytes(this.saltLength).toString('hex'),
    iterations: number = this.iterations,
    keyLength: number = this.keyLength,
    algorithm: string = this.algorithm,
  ) {
    const hash = await asyncPbkdf2(
      plaintext,
      salt,
      iterations,
      keyLength,
      algorithm,
    );

    return this.formatHash(salt, hash);
  }

  override async verify(plaintext: string, hash: string) {
    const { salt, keyLength, originalHash, iterations, algorithm } =
      this.parseHash(hash);

    const derivedKey = await asyncPbkdf2(
      plaintext,
      salt,
      iterations,
      keyLength,
      algorithm,
    );

    return crypto.timingSafeEqual(
      Buffer.from(derivedKey.toString('hex')),
      Buffer.from(originalHash),
    );
  }

  override async needsUpgrade(hash: string) {
    const { iterations } = this.parseHash(hash);
    return iterations < this.iterations;
  }

  override async hardenRuntime(plaintext: string, hash: string) {
    const { salt, iterations, keyLength, algorithm } = this.parseHash(hash);
    const extraIterations = this.iterations - iterations;

    if (extraIterations > 0) {
      await this.encode(plaintext, salt, extraIterations, keyLength, algorithm);
    }
  }
}
