import { Table, Model, Column, BeforeSave } from 'sequelize-typescript';
import { v4 } from 'uuid';
import { defaultHasher } from '@/user/utils/hashers';

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
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      // OWASP recommendation
      if (instance.password.length > 64 || instance.password.length < 8) {
        throw new Error('Password must be between 8 and 64 characters long');
      }

      instance.password = await defaultHasher.hash(instance.password);
    }
  }

  override toJSON() {
    // Omit the password when serializing to JSON
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}
