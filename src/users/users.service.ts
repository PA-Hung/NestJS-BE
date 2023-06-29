import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name)
  private userModel: SoftDeleteModel<UserDocument>) { }

  hassPassword = (inputPassword: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(inputPassword, salt);
    return hash
  }

  async create(createUserDto: CreateUserDto) {
    const hassPassword = this.hassPassword(createUserDto.password)
    let userData = await this.userModel.create({ email: createUserDto.email, password: hassPassword, name: createUserDto.name })
    return userData;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "User not found !"
    }
    return this.userModel.findOne({ _id: id })
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username })
  }

  checkUserPassword(password: string, hashPass: string) {
    return compareSync(password, hashPass)
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({ _id: updateUserDto._id }, { ...updateUserDto });
  }


  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "User not found !"
    }
    return this.userModel.softDelete({ _id: id })
  }
}
