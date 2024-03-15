import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@/user/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { defaultHasher } from '@/user/utils/password-hashers';
import { Op } from 'sequelize';

class UserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

@Controller('users')
export class UserController {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}
  @Get()
  async getAll() {
    return this.userModel.findAll();
  }

  @Post()
  async create(@Body() payload: UserDto) {
    // @ts-ignore
    return this.userModel.create(payload);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() payload: UserDto) {
    const user = await this.userModel.findOne({
      where: {
        email: {
          [Op.iLike]: payload.email,
        },
      },
    });

    // Generate a fake hash so that we returns in mostly constant time
    // To prevent timing attack
    const fakeHash = await defaultHasher.encode('fake');

    if (!user) {
      await defaultHasher.verify('fake', fakeHash);
      // Prevent enumeration attack
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await user.checkPassword(payload.password);
    if (!isPasswordValid) {
      // Prevent enumeration attack
      throw new UnauthorizedException('Invalid email or password');
    }
    return { message: 'Welcome' };
  }
}
