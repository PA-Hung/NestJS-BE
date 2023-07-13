import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {

  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>
  ) { }

  async create(createRoleDto: CreateRoleDto, userInfo: IUser) {
    const checkGroup = await this.roleModel.findOne({
      name: createRoleDto.name
    })
    if (checkGroup) {
      throw new BadRequestException(
        `Roles có group name : ${createRoleDto.name} đã tồn tại !`
      );
    }
    const res = await this.roleModel.create({
      ...createRoleDto,
      createdBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    })
    return {
      _id: res._id,
      createdAt: res.createdAt

    }
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, projection, sort, population } = aqp(queryString);
    delete filter.current
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.roleModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found role !')
    }
    return (await this.roleModel.findById(id))
      .populate({ path: "permissions", select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 } })
    // câu lệnh này là lấy thêm trường permission của role
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, userInfo: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found resume !')
    }
    return await this.roleModel.updateOne({ _id: id }, {
      ...updateRoleDto,
      updatedBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    })
  }

  async remove(id: string, userInfo: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Role not found !"
    }
    const checkRole = await this.roleModel.findOne({ _id: id })
    if (checkRole.name === ADMIN_ROLE) {
      throw new BadRequestException(
        `Bạn không được role admin !`
      );
    }
    await this.roleModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    });
    return this.roleModel.softDelete({ _id: id })
  }

}
