import { Table, Model, Column, BeforeSave } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';

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
      const hash = await bcrypt.hash(instance.password, 10);
      instance.password = `{bcrypt}${hash}`;
    }
  }

  override toJSON() {
    // Omit the password when serializing to JSON
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}