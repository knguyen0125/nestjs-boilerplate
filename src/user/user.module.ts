import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@/user/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User])],
})
export class UserModule {}
