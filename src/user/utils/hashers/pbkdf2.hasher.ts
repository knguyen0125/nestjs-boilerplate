import crypto from 'node:crypto';
import { BasePasswordHasher, IPasswordHasher } from './password.interface';

export class Pbkdf2Hasher
  extends BasePasswordHasher
  implements IPasswordHasher
{
  override id: string;

  constructor(
    private readonly algorithm: string = 'sha256',
    private readonly iterations: number = 600_000,
    private readonly keyLength: number = 64,
    private readonly saltLength: number = 16,
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

  override async hash(plaintext: string) {
    return new Promise<string>((resolve, reject) => {
      const salt = crypto.randomBytes(this.saltLength).toString('hex');

      crypto.pbkdf2(
        plaintext,
        salt,
        this.iterations,
        this.keyLength,
        'sha256',
        (err, derivedKey) => {
          if (err) {
            reject(err);
          } else {
            resolve(this.formatHash(salt, derivedKey));
          }
        },
      );
    });
  }

  override async compare(plaintext: string, hash: string) {
    return new Promise<boolean>((resolve, reject) => {
      const { salt, keyLength, originalHash, iterations, algorithm } =
        this.parseHash(hash);

      crypto.pbkdf2(
        plaintext,
        salt,
        iterations,
        keyLength,
        algorithm,
        (err, derivedKey) => {
          if (err) {
            reject(err);
          } else {
            resolve(
              crypto.timingSafeEqual(
                Buffer.from(derivedKey.toString('hex')),
                Buffer.from(originalHash),
              ),
            );
          }
        },
      );
    });
  }

  override async needsUpgrade(hash: string) {
    const { iterations } = this.parseHash(hash);
    return iterations < this.iterations;
  }
}
