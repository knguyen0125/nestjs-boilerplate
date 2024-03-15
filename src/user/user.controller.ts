import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
  Logger,
  Req,
} from '@nestjs/common';
import { User } from '@/user/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { defaultHasher } from '@/user/utils/password-hashers';
import { Op } from 'sequelize';
import { Request } from 'express';

class UserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

@Controller('users')
export class UserController {
  logger = new Logger(UserController.name);

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
    this.logger.log(`Login attempt for ${payload.email} - inside controller`);
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

  @Get('sess-set')
  async sessSet(@Req() req: Request) {
    // @ts-ignore
    req.session.test = req.session.test ? req.session.test + 1 : 1;
  }

  @Get('sess-get')
  async sessGet(@Req() req: Request) {
    // @ts-ignore
    return req.session;
  }
}
