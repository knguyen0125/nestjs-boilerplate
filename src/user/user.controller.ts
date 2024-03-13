import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from '@/user/models/user.model';
import { InjectModel } from '@nestjs/sequelize';

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
}
