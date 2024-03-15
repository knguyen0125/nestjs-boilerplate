import { Table, Model, Column, BeforeSave } from 'sequelize-typescript';
import { v4 } from 'uuid';
import { defaultHasher } from '@/user/utils/password-hashers';
import { pinoLogger } from '@/utils/pino';

@Table
export class User extends Model {
  @Column({
    primaryKey: true,
    defaultValue: () => v4(),
  })
  override id: string;

  @Column({
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Invalid email address' },
      notNull: { msg: 'Email is required' },
    },
  })
  email: string;

  @Column({
    allowNull: false,
    validate: {
      notNull: { msg: 'Password is required' },
    },
  })
  password: string;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({
    defaultValue: false,
  })
  emailVerified: boolean;

  @BeforeSave
  static async encodePassword(instance: User) {
    if (instance.changed('email')) {
      instance.email = instance.email.toLowerCase();
    }

    if (instance.changed('password')) {
      instance.password = await defaultHasher.encode(instance.password);
    }
  }

  /**
   * Verify the password. This function do not upgrade the hash.
   *
   * @param plaintext
   */
  private async verifyPassword(plaintext: string) {
    const isVerified = await defaultHasher.verify(plaintext, this.password);
    const mustUpgrade = await defaultHasher.needsUpgrade(this.password);

    // In case the hash is not verified, but the stored hash is outdated, we need to harden
    // the runtime to reduce risk of timing attack
    if (!isVerified && mustUpgrade) {
      await defaultHasher.hardenRuntime(plaintext, this.password);
    }

    return { isVerified, mustUpgrade };
  }

  /**
   * Check the password. This function will upgrade the hash if needed.
   *
   * @param plaintext
   */
  async checkPassword(plaintext: string) {
    const { isVerified, mustUpgrade } = await this.verifyPassword(plaintext);

    if (isVerified && mustUpgrade) {
      pinoLogger.info(`Upgrading the password hash for user ${this.email}`);
      this.password = plaintext;
      await this.save();
    }

    return isVerified;
  }

  override toJSON() {
    // Omit the password when serializing to JSON
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}
