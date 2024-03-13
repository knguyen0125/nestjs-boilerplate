import {
  Table,
  Model,
  Column,
  BeforeSave,
  IsEmail,
  NotNull,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

@Table
export class User extends Model {
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

  @Column({ defaultValue: true })
  isActive: boolean;

  @BeforeSave
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const hash = await bcrypt.hash(instance.password, 10);
      instance.password = `{bcrypt}${hash}`;
    }
  }

  toJSON() {
    // Omit the password when returning a user
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}
