import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) { }

  hassPassword = (inputPassword: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(inputPassword, salt);
    return hash
  }

  async create(createUserData: CreateUserDto, userAuthInfo: IUser) {
    const checkEmail = await this.userModel.findOne({ email: createUserData.email })
    if (checkEmail) {
      throw new BadRequestException(`Email: ${createUserData.email} đã tồn tại !`);
    }
    const hassPassword = this.hassPassword(createUserData.password)
    const userData = await this.userModel.create({
      email: createUserData.email,
      password: hassPassword,
      name: createUserData.name,
      age: createUserData.age,
      gender: createUserData.gender,
      address: createUserData.address,
      role: createUserData.role,
      company: createUserData.company,
      createdBy: {
        _id: userAuthInfo._id,
        email: userAuthInfo.email
      }
    })
    return userData
  }

  async register(registerUserInfo: RegisterUserDto) {
    const checkEmail = await this.userModel.findOne({ email: registerUserInfo.email })
    if (checkEmail) {
      throw new BadRequestException(`Email: ${registerUserInfo.email} đã tồn tại !`);
    }
    const hassPassword = this.hassPassword(registerUserInfo.password)
    const userRole = await this.roleModel.findOne({ name: USER_ROLE })
    const userData = await this.userModel.create({
      name: registerUserInfo.name,
      email: registerUserInfo.email,
      password: hassPassword,
      age: registerUserInfo.age,
      gender: registerUserInfo.gender,
      address: registerUserInfo.address,
      role: userRole?._id
    })
    return userData;
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, projection, sort, population } = aqp(queryString);
    delete filter.current
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    // if (isEmpty(sort)) {
    //   // @ts-ignore: Unreachable code error
    //   sort = "-updatedAt"
    // }
    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select('-password')
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "User not found !"
    }
    return this.userModel.findOne({ _id: id }).select('-password')
      .populate({ path: "role", select: { _id: 1, name: 1 } })
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username })
      .populate({ path: "role", select: { name: 1 } })
  }

  checkUserPassword(password: string, hashPass: string) {
    return compareSync(password, hashPass)
  }

  async update(updateUserData: UpdateUserDto, userAuthInfo: IUser) {
    return await this.userModel.updateOne({ _id: updateUserData._id },
      {
        ...updateUserData,
        updatedBy: {
          _id: userAuthInfo._id,
          email: userAuthInfo.email
        }
      });
  }

  async remove(id: string, userAuthInfo: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "User not found !"
    }
    // check xem có phải admin không ? nếu là admin thì không cho xoá
    const checkAdmin = await this.userModel.findOne({ _id: id })
    if (checkAdmin && checkAdmin.email === "admin@gmail.com") {
      throw new BadRequestException(
        `Bạn không được xoá tài khoản admin !`
      );
    }
    await this.userModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: userAuthInfo._id,
        email: userAuthInfo.email
      }
    });
    return this.userModel.softDelete({ _id: id })
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken })
      .populate({ path: "role", select: { name: 1 } })
  }
}
