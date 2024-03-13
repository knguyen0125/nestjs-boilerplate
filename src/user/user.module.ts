import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@/user/models/user.model';
import { UserController } from './user.controller';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UserController],
})
export class UserModule {}
